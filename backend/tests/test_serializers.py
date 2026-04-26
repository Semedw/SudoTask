import pytest
from accounts.serializers import RegisterSerializer, UserSerializer, UserProfileSerializer
from classroom.serializers import ClassRoomSerializer, ClassMembershipSerializer, JoinClassSerializer
from tasks.serializers import TaskSerializer, TaskListSerializer, CriteriaSerializer, TestCaseSerializer
from submissions.serializers import SubmissionSerializer, SubmitCodeSerializer


class TestUserSerializers:
    def test_register_serializer_valid(self):
        data = {
            'email': 'new@test.com',
            'username': 'newuser',
            'password': 'StrongPass123!',
            'password2': 'StrongPass123!',
            'role': 'STUDENT'
        }
        serializer = RegisterSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_register_serializer_password_mismatch(self):
        data = {
            'email': 'new@test.com',
            'username': 'newuser',
            'password': 'StrongPass123!',
            'password2': 'DifferentPass123!'
        }
        serializer = RegisterSerializer(data=data)
        assert not serializer.is_valid()
        assert 'password' in serializer.errors

    def test_register_serializer_weak_password(self):
        data = {
            'email': 'new@test.com',
            'username': 'newuser',
            'password': '123',
            'password2': '123'
        }
        serializer = RegisterSerializer(data=data)
        assert not serializer.is_valid()
        assert 'password' in serializer.errors

    def test_user_serializer_fields(self, teacher):
        serializer = UserSerializer(teacher)
        assert 'id' in serializer.data
        assert 'email' in serializer.data
        assert 'role' in serializer.data
        assert 'username' in serializer.data

    def test_user_profile_serializer_read_only_fields(self, teacher):
        data = {'role': 'TEACHER'}
        serializer = UserProfileSerializer(teacher, data=data, partial=True)
        assert serializer.is_valid()
        serializer.save()
        teacher.refresh_from_db()
        assert teacher.role == 'STUDENT'


class TestClassRoomSerializers:
    def test_classroom_serializer_create(self, teacher):
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post('/')
        request.user = teacher
        data = {'name': 'New Classroom', 'description': 'Test'}
        serializer = ClassRoomSerializer(data=data, context={'request': request})
        assert serializer.is_valid(), serializer.errors
        classroom = serializer.save()
        assert classroom.teacher == teacher

    def test_classroom_serializer_read(self, classroom):
        serializer = ClassRoomSerializer(classroom)
        assert 'name' in serializer.data
        assert 'class_code' in serializer.data
        assert 'teacher' in serializer.data
        assert 'student_count' in serializer.data

    def test_join_class_serializer_valid(self, classroom, student):
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post('/')
        request.user = student
        data = {'class_code': classroom.class_code}
        serializer = JoinClassSerializer(data=data, context={'request': request})
        assert serializer.is_valid(), serializer.errors

    def test_join_class_serializer_invalid_code(self, student):
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post('/')
        request.user = student
        data = {'class_code': 'INVALID'}
        serializer = JoinClassSerializer(data=data, context={'request': request})
        assert not serializer.is_valid()


class TestTaskSerializers:
    def test_task_serializer_create(self, teacher, classroom):
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.post('/')
        request.user = teacher
        data = {
            'classroom_id': classroom.id,
            'title': 'New Task',
            'description': 'Test description',
            'difficulty': 'EASY',
            'tags': ['test']
        }
        serializer = TaskSerializer(data=data, context={'request': request})
        assert serializer.is_valid(), serializer.errors
        task = serializer.save()
        assert task.title == 'New Task'

    def test_task_list_serializer_fields(self, task):
        serializer = TaskListSerializer(task)
        assert 'title' in serializer.data
        assert 'testcase_count' in serializer.data
        assert 'submission_count' in serializer.data

    def test_criteria_serializer(self, criteria):
        serializer = CriteriaSerializer(criteria)
        assert serializer.data['name'] == 'Correctness'
        assert serializer.data['points'] == 50

    def test_testcase_serializer_hidden_hidden_for_student(self, testcase2, student):
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.get('/')
        request.user = student
        serializer = TestCaseSerializer(testcase2, context={'request': request})
        assert serializer.data['is_hidden'] is True
        assert serializer.data['expected_output'] is None

    def test_testcase_serializer_hidden_visible_for_teacher(self, testcase2, teacher):
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        request = factory.get('/')
        request.user = teacher
        serializer = TestCaseSerializer(testcase2, context={'request': request})
        assert serializer.data['is_hidden'] is True
        assert serializer.data['expected_output'] == '100'


class TestSubmissionSerializers:
    def test_submit_code_serializer_valid(self):
        data = {
            'code': 'print("Hello")',
            'language': 'python'
        }
        serializer = SubmitCodeSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_submit_code_serializer_empty_code(self):
        data = {
            'code': '',
            'language': 'python'
        }
        serializer = SubmitCodeSerializer(data=data)
        assert not serializer.is_valid()

    def test_submit_code_serializer_whitespace_code(self):
        data = {
            'code': '   ',
            'language': 'python'
        }
        serializer = SubmitCodeSerializer(data=data)
        assert not serializer.is_valid()

    def test_submit_code_serializer_invalid_language(self):
        data = {
            'code': 'print("Hello")',
            'language': 'invalid'
        }
        serializer = SubmitCodeSerializer(data=data)
        assert not serializer.is_valid()

    def test_submission_serializer_fields(self, submission):
        serializer = SubmissionSerializer(submission)
        assert 'task' in serializer.data
        assert 'student' in serializer.data
        assert 'status' in serializer.data
        assert 'code' in serializer.data
        assert 'test_results' in serializer.data