import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from classroom.models import ClassRoom, ClassMembership
from tasks.models import Task, Criteria, TestCase
from submissions.models import Submission

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def teacher():
    return User.objects.create_user(
        email='teacher@test.com',
        username='teacher1',
        password='testpass123',
        role=User.Role.TEACHER,
        first_name='Test',
        last_name='Teacher'
    )


@pytest.fixture
def student():
    return User.objects.create_user(
        email='student@test.com',
        username='student1',
        password='testpass123',
        role=User.Role.STUDENT,
        first_name='Test',
        last_name='Student'
    )


@pytest.fixture
def student2():
    return User.objects.create_user(
        email='student2@test.com',
        username='student2',
        password='testpass123',
        role=User.Role.STUDENT,
        first_name='Second',
        last_name='Student'
    )


@pytest.fixture
def authenticated_client(api_client, teacher):
    token = RefreshToken.for_user(teacher)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')
    return api_client


@pytest.fixture
def student_client(api_client, student):
    token = RefreshToken.for_user(student)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')
    return api_client


@pytest.fixture
def classroom(teacher):
    return ClassRoom.objects.create(
        teacher=teacher,
        name='Test Classroom',
        description='A test classroom'
    )


@pytest.fixture
def classroom2(teacher):
    return ClassRoom.objects.create(
        teacher=teacher,
        name='Second Classroom',
        description='Another test classroom'
    )


@pytest.fixture
def membership(classroom, student):
    return ClassMembership.objects.create(
        classroom=classroom,
        student=student
    )


@pytest.fixture
def membership2(classroom2, student2):
    return ClassMembership.objects.create(
        classroom=classroom2,
        student=student2
    )


@pytest.fixture
def task(classroom):
    return Task.objects.create(
        classroom=classroom,
        title='Test Task',
        description='A test task description',
        difficulty=Task.Difficulty.MEDIUM,
        tags=['python', 'basics']
    )


@pytest.fixture
def task2(classroom2):
    return Task.objects.create(
        classroom=classroom2,
        title='Second Task',
        description='Another test task',
        difficulty=Task.Difficulty.HARD,
        tags=['algorithms']
    )


@pytest.fixture
def criteria(task):
    return Criteria.objects.create(
        task=task,
        name='Correctness',
        points=50,
        description='Code must produce correct output'
    )


@pytest.fixture
def criteria2(task):
    return Criteria.objects.create(
        task=task,
        name='Efficiency',
        points=30,
        description='Code must be efficient'
    )


@pytest.fixture
def testcase(task):
    return TestCase.objects.create(
        task=task,
        input_data='5',
        expected_output='25',
        is_hidden=False,
        weight_points=10,
        order=1
    )


@pytest.fixture
def testcase2(task):
    return TestCase.objects.create(
        task=task,
        input_data='10',
        expected_output='100',
        is_hidden=True,
        weight_points=15,
        order=2
    )


@pytest.fixture
def submission(task, student):
    return Submission.objects.create(
        task=task,
        student=student,
        language=Submission.Language.PYTHON,
        code='print(5*5)',
        status=Submission.Status.PASSED,
        score=100,
        passed_count=2,
        total_count=2
    )


@pytest.fixture
def submission2(task, student2):
    return Submission.objects.create(
        task=task,
        student=student2,
        language=Submission.Language.PYTHON,
        code='print(5 * 5)',
        status=Submission.Status.FAILED,
        score=50,
        passed_count=1,
        total_count=2
    )