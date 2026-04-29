import pytest
from accounts.permissions import IsTeacher, IsStudent, IsTeacherOrReadOnly
from tasks.permissions import IsTaskOwner, IsTaskClassMember
from classroom.permissions import IsClassOwner, IsClassMember
from submissions.permissions import IsSubmissionOwner, CanSubmitCode

pytestmark = pytest.mark.django_db


class TestAccountPermissions:
    def test_is_teacher_permission_teacher(self, teacher, api_client):
        permission = IsTeacher()
        class MockView:
            pass
        request = api_client.post('/').wsgi_request
        request.user = teacher
        assert permission.has_permission(request, MockView()) is True

    def test_is_teacher_permission_student(self, student, api_client):
        permission = IsTeacher()
        class MockView:
            pass
        request = api_client.post('/').wsgi_request
        request.user = student
        assert permission.has_permission(request, MockView()) is False

    def test_is_student_permission(self, student, api_client):
        permission = IsStudent()
        class MockView:
            pass
        request = api_client.post('/').wsgi_request
        request.user = student
        assert permission.has_permission(request, MockView()) is True

    def test_is_teacher_or_read_only_get(self, student, api_client):
        permission = IsTeacherOrReadOnly()
        class MockView:
            method_names = ['get']
        request = api_client.get('/').wsgi_request
        request.user = student
        assert permission.has_permission(request, MockView()) is True

    def test_is_teacher_or_read_only_post(self, student, api_client):
        permission = IsTeacherOrReadOnly()
        class MockView:
            method_names = ['post']
        request = api_client.post('/').wsgi_request
        request.user = student
        assert permission.has_permission(request, MockView()) is False


class TestTaskPermissions:
    def test_is_task_owner_teacher(self, task, teacher, api_client):
        permission = IsTaskOwner()
        class MockView:
            pass
        request = api_client.post('/').wsgi_request
        request.user = teacher
        assert permission.has_object_permission(request, MockView(), task) is True

    def test_is_task_owner_student(self, task, student, api_client):
        permission = IsTaskOwner()
        class MockView:
            pass
        request = api_client.post('/').wsgi_request
        request.user = student
        assert permission.has_object_permission(request, MockView(), task) is False

    def test_is_task_class_member_teacher(self, task, teacher, api_client):
        permission = IsTaskClassMember()
        class MockView:
            pass
        request = api_client.post('/').wsgi_request
        request.user = teacher
        assert permission.has_object_permission(request, MockView(), task) is True

    def test_is_task_class_member_student_member(self, task, student, membership, api_client):
        permission = IsTaskClassMember()
        class MockView:
            pass
        request = api_client.post('/').wsgi_request
        request.user = student
        assert permission.has_object_permission(request, MockView(), task) is True

    def test_is_task_class_member_student_non_member(self, task, student, api_client):
        permission = IsTaskClassMember()
        class MockView:
            pass
        request = api_client.post('/').wsgi_request
        request.user = student
        assert permission.has_object_permission(request, MockView(), task) is False


class TestClassRoomPermissions:
    def test_is_class_owner_true(self, classroom, teacher, api_client):
        permission = IsClassOwner()
        class MockView:
            pass
        request = api_client.post('/').wsgi_request
        request.user = teacher
        assert permission.has_object_permission(request, MockView(), classroom) is True

    def test_is_class_owner_false(self, classroom, student, api_client):
        permission = IsClassOwner()
        class MockView:
            pass
        request = api_client.post('/').wsgi_request
        request.user = student
        assert permission.has_object_permission(request, MockView(), classroom) is False

    def test_is_class_member_teacher(self, classroom, teacher, api_client):
        permission = IsClassMember()
        class MockView:
            pass
        request = api_client.post('/').wsgi_request
        request.user = teacher
        assert permission.has_object_permission(request, MockView(), classroom) is True

    def test_is_class_member_student_member(self, classroom, student, membership, api_client):
        permission = IsClassMember()
        class MockView:
            pass
        request = api_client.post('/').wsgi_request
        request.user = student
        assert permission.has_object_permission(request, MockView(), classroom) is True

    def test_is_class_member_student_non_member(self, classroom, student, api_client):
        permission = IsClassMember()
        class MockView:
            pass
        request = api_client.post('/').wsgi_request
        request.user = student
        assert permission.has_object_permission(request, MockView(), classroom) is False


class TestSubmissionPermissions:
    def test_is_submission_owner_student(self, submission, student, api_client):
        permission = IsSubmissionOwner()
        class MockView:
            pass
        request = api_client.post('/').wsgi_request
        request.user = student
        assert permission.has_object_permission(request, MockView(), submission) is True

    def test_is_submission_owner_teacher(self, submission, teacher, api_client):
        permission = IsSubmissionOwner()
        class MockView:
            pass
        request = api_client.post('/').wsgi_request
        request.user = teacher
        assert permission.has_object_permission(request, MockView(), submission) is True

    def test_is_submission_owner_other_student(self, submission, student2, api_client):
        permission = IsSubmissionOwner()
        class MockView:
            pass
        request = api_client.post('/').wsgi_request
        request.user = student2
        assert permission.has_object_permission(request, MockView(), submission) is False

    def test_can_submit_code_student(self, student, api_client):
        permission = CanSubmitCode()
        class MockView:
            pass
        request = api_client.post('/').wsgi_request
        request.user = student
        assert permission.has_permission(request, MockView()) is True

    def test_can_submit_code_teacher(self, teacher, api_client):
        permission = CanSubmitCode()
        class MockView:
            pass
        request = api_client.post('/').wsgi_request
        request.user = teacher
        assert permission.has_permission(request, MockView()) is False
