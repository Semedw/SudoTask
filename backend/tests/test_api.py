import pytest
from django.urls import reverse
from rest_framework import status

pytestmark = pytest.mark.django_db


class TestAuthEndpoints:
    def test_register(self, api_client):
        url = reverse('register')
        data = {
            'email': 'newuser@test.com',
            'username': 'newuser',
            'password': 'StrongPass123!',
            'password2': 'StrongPass123!',
            'role': 'STUDENT'
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert 'user' in response.data
        assert 'access' in response.cookies or 'access' in str(response.client.cookies)

    def test_register_password_mismatch(self, api_client):
        url = reverse('register')
        data = {
            'email': 'newuser@test.com',
            'username': 'newuser',
            'password': 'StrongPass123!',
            'password2': 'DifferentPass123!'
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_valid(self, api_client, student):
        url = reverse('login')
        data = {
            'email': 'student@test.com',
            'password': 'testpass123'
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert 'user' in response.data

    def test_login_invalid_credentials(self, api_client, student):
        url = reverse('login')
        data = {
            'email': 'student@test.com',
            'password': 'wrongpassword'
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_missing_fields(self, api_client):
        url = reverse('login')
        data = {'email': 'test@test.com'}
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_me_authenticated(self, authenticated_client, teacher):
        url = reverse('me')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == teacher.email

    def test_me_unauthenticated(self, api_client):
        url = reverse('me')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_profile(self, authenticated_client):
        url = reverse('update-profile')
        data = {'first_name': 'Updated', 'last_name': 'Name'}
        response = authenticated_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['first_name'] == 'Updated'

    def test_csrf_endpoint(self, api_client):
        url = reverse('csrf')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_logout(self, authenticated_client):
        url = reverse('logout')
        response = authenticated_client.post(url)
        assert response.status_code == status.HTTP_200_OK


class TestClassRoomEndpoints:
    def test_list_classrooms_teacher(self, authenticated_client, classroom):
        url = reverse('classroom-list')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1

    def test_list_classrooms_student(self, student_client, membership, classroom):
        url = reverse('classroom-list')
        response = student_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1

    def test_create_classroom(self, authenticated_client):
        url = reverse('classroom-list')
        data = {'name': 'New Test Classroom', 'description': 'Test description'}
        response = authenticated_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'New Test Classroom'

    def test_create_classroom_student_forbidden(self, student_client):
        url = reverse('classroom-list')
        data = {'name': 'New Test Classroom', 'description': 'Test'}
        response = student_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_retrieve_classroom(self, authenticated_client, classroom):
        url = reverse('classroom-detail', kwargs={'pk': classroom.pk})
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == classroom.name

    def test_update_classroom(self, authenticated_client, classroom):
        url = reverse('classroom-detail', kwargs={'pk': classroom.pk})
        data = {'name': 'Updated Classroom Name'}
        response = authenticated_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Updated Classroom Name'

    def test_delete_classroom(self, authenticated_client, classroom):
        url = reverse('classroom-detail', kwargs={'pk': classroom.pk})
        response = authenticated_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_regenerate_code(self, authenticated_client, classroom):
        url = reverse('classroom-regenerate-code', kwargs={'pk': classroom.pk})
        old_code = classroom.class_code
        response = authenticated_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['class_code'] != old_code

    def test_regenerate_code_student_forbidden(self, student_client, classroom):
        url = reverse('classroom-regenerate-code', kwargs={'pk': classroom.pk})
        response = student_client.post(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_join_class(self, student_client, classroom):
        url = reverse('join-class')
        data = {'class_code': classroom.class_code}
        response = student_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert 'classroom' in response.data

    def test_join_class_invalid_code(self, student_client):
        url = reverse('join-class')
        data = {'class_code': 'INVALID'}
        response = student_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_join_class_already_member(self, student_client, membership, classroom):
        url = reverse('join-class')
        data = {'class_code': classroom.class_code}
        response = student_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_leaderboard(self, authenticated_client, classroom, submission):
        url = reverse('classroom-leaderboard', kwargs={'pk': classroom.pk})
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'leaderboard' in response.data

    def test_leaderboard_student_member(self, student_client, membership, classroom):
        url = reverse('classroom-leaderboard', kwargs={'pk': classroom.pk})
        response = student_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_analytics(self, authenticated_client, classroom, submission):
        url = reverse('classroom-analytics', kwargs={'pk': classroom.pk})
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'total_students' in response.data
        assert 'total_tasks' in response.data


class TestTaskEndpoints:
    def test_list_tasks_teacher(self, authenticated_client, task):
        url = reverse('task-list')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_list_tasks_student(self, student_client, membership, task):
        url = reverse('task-list')
        response = student_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_list_tasks_filter_by_class(self, authenticated_client, task, classroom):
        url = f"{reverse('task-list')}?class_id={classroom.id}"
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        for item in response.data['results']:
            assert item['classroom']['id'] == classroom.id

    def test_create_task(self, authenticated_client, classroom):
        url = reverse('task-list')
        data = {
            'classroom_id': classroom.id,
            'title': 'New Test Task',
            'description': 'Test task description',
            'difficulty': 'EASY',
            'tags': ['test']
        }
        response = authenticated_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == 'New Test Task'

    def test_create_task_student_forbidden(self, student_client, classroom):
        url = reverse('task-list')
        data = {
            'classroom_id': classroom.id,
            'title': 'New Task',
            'description': 'Test'
        }
        response = student_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_retrieve_task(self, authenticated_client, task):
        url = reverse('task-detail', kwargs={'pk': task.pk})
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == task.title

    def test_update_task(self, authenticated_client, task):
        url = reverse('task-detail', kwargs={'pk': task.pk})
        data = {'title': 'Updated Task Title'}
        response = authenticated_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Updated Task Title'

    def test_delete_task(self, authenticated_client, task):
        url = reverse('task-detail', kwargs={'pk': task.pk})
        response = authenticated_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_task_analytics(self, authenticated_client, task, submission):
        url = reverse('task-analytics', kwargs={'pk': task.pk})
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'total_submissions' in response.data


class TestCriteriaEndpoints:
    def test_list_criteria(self, authenticated_client, criteria):
        url = f"{reverse('criteria-list')}?task_id={criteria.task.pk}"
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_create_criteria(self, authenticated_client, task):
        url = reverse('criteria-list')
        data = {
            'task': task.id,
            'name': 'New Criteria',
            'points': 25,
            'description': 'Test criteria'
        }
        response = authenticated_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'New Criteria'

    def test_update_criteria(self, authenticated_client, criteria):
        url = reverse('criteria-detail', kwargs={'pk': criteria.pk})
        data = {'points': 100}
        response = authenticated_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['points'] == 100

    def test_delete_criteria(self, authenticated_client, criteria):
        url = reverse('criteria-detail', kwargs={'pk': criteria.pk})
        response = authenticated_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT


class TestTestCaseEndpoints:
    def test_list_testcases(self, authenticated_client, testcase):
        url = f"{reverse('testcase-list')}?task_id={testcase.task.pk}"
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_create_testcase(self, authenticated_client, task):
        url = reverse('testcase-list')
        data = {
            'task': task.id,
            'input_data': 'input',
            'expected_output': 'output',
            'is_hidden': False,
            'weight_points': 10,
            'order': 1
        }
        response = authenticated_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['input_data'] == 'input'

    def test_update_testcase(self, authenticated_client, testcase):
        url = reverse('testcase-detail', kwargs={'pk': testcase.pk})
        data = {'expected_output': 'updated_output'}
        response = authenticated_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['expected_output'] == 'updated_output'

    def test_delete_testcase(self, authenticated_client, testcase):
        url = reverse('testcase-detail', kwargs={'pk': testcase.pk})
        response = authenticated_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_student_cannot_create_testcase(self, student_client, task):
        url = reverse('testcase-list')
        data = {
            'task': task.id,
            'input_data': 'input',
            'expected_output': 'output',
            'order': 1
        }
        response = student_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestSubmissionEndpoints:
    def test_list_submissions_teacher(self, authenticated_client, submission, submission2):
        url = reverse('submission-list')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_list_submissions_student_own(self, student_client, submission):
        url = reverse('submission-list')
        response = student_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        for item in response.data['results']:
            assert item['student']['id'] == submission.student.id

    def test_list_submissions_filter_by_task(self, authenticated_client, submission):
        url = f"{reverse('submission-list')}?task_id={submission.task.pk}"
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        for item in response.data['results']:
            assert item['task']['id'] == submission.task.id

    def test_retrieve_submission(self, student_client, submission):
        url = reverse('submission-detail', kwargs={'pk': submission.pk})
        response = student_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['code'] == submission.code

    def test_submit_code(self, student_client, task, membership, monkeypatch):
        monkeypatch.setattr('submissions.views.execute_submission.delay', lambda *_args, **_kwargs: None)
        url = f"/api/submissions/tasks/{task.id}/submit/"
        data = {
            'code': 'print("Hello World")',
            'language': 'python'
        }
        response = student_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['status'] == 'pending'

    def test_submit_code_student_not_member(self, student_client, task):
        url = f"/api/submissions/tasks/{task.id}/submit/"
        data = {
            'code': 'print("Hello")',
            'language': 'python'
        }
        response = student_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_submit_code_teacher_forbidden(self, authenticated_client, task):
        url = f"/api/submissions/tasks/{task.id}/submit/"
        data = {
            'code': 'print("Hello")',
            'language': 'python'
        }
        response = authenticated_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_submit_code_empty(self, student_client, task, membership):
        url = f"/api/submissions/tasks/{task.id}/submit/"
        data = {
            'code': '',
            'language': 'python'
        }
        response = student_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
