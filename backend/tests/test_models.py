import pytest
from django.core.exceptions import ValidationError
from accounts.models import User
from classroom.models import ClassRoom, ClassMembership
from tasks.models import Task, Criteria, TestCase
from submissions.models import Submission, SubmissionTestResult


class TestUserModel:
    def test_user_creation(self, teacher):
        assert teacher.email == 'teacher@test.com'
        assert teacher.role == User.Role.TEACHER
        assert teacher.is_teacher is True
        assert teacher.is_student is False

    def test_user_str(self, teacher):
        assert str(teacher) == 'teacher@test.com (TEACHER)'

    def test_student_properties(self, student):
        assert student.is_student is True
        assert student.is_teacher is False

    def test_default_role_is_student(self):
        user = User.objects.create_user(
            email='default@test.com',
            username='defaultuser',
            password='testpass123'
        )
        assert user.role == User.Role.STUDENT


class TestClassRoomModel:
    def test_classroom_creation(self, classroom, teacher):
        assert classroom.teacher == teacher
        assert classroom.name == 'Test Classroom'
        assert len(classroom.class_code) >= 6
        assert len(classroom.class_code) <= 10

    def test_classroom_str(self, classroom):
        assert str(classroom) == f'Test Classroom ({classroom.class_code})'

    def test_regenerate_code(self, classroom):
        old_code = classroom.class_code
        new_code = classroom.regenerate_code()
        assert new_code != old_code
        assert len(new_code) >= 6

    def test_unique_class_code(self, teacher):
        codes = set()
        for _ in range(10):
            cr = ClassRoom.objects.create(teacher=teacher, name='Test')
            codes.add(cr.class_code)
        assert len(codes) == 10


class TestClassMembershipModel:
    def test_membership_creation(self, membership, classroom, student):
        assert membership.classroom == classroom
        assert membership.student == student

    def test_membership_str(self, membership):
        assert 'test@test.com' in str(membership)
        assert 'Test Classroom' in str(membership)

    def test_teacher_cannot_join_own_class(self, classroom, teacher):
        from classroom.models import ClassMembership
        membership = ClassMembership(classroom=classroom, student=teacher)
        with pytest.raises(ValidationError):
            membership.save()

    def test_duplicate_membership_raises_error(self, classroom, student, membership):
        duplicate = ClassMembership(classroom=classroom, student=student)
        with pytest.raises(ValidationError):
            duplicate.save()


class TestTaskModel:
    def test_task_creation(self, task, classroom):
        assert task.classroom == classroom
        assert task.title == 'Test Task'
        assert task.difficulty == Task.Difficulty.MEDIUM
        assert task.tags == ['python', 'basics']

    def test_task_str(self, task):
        assert 'Test Task' in str(task)
        assert 'Test Classroom' in str(task)

    def test_task_ordering(self, classroom, teacher):
        t1 = Task.objects.create(classroom=classroom, title='First', description='d')
        t2 = Task.objects.create(classroom=classroom, title='Second', description='d')
        tasks = list(Task.objects.all())
        assert tasks[0] == t2
        assert tasks[1] == t1


class TestCriteriaModel:
    def test_criteria_creation(self, criteria, task):
        assert criteria.task == task
        assert criteria.name == 'Correctness'
        assert criteria.points == 50

    def test_criteria_str(self, criteria):
        assert 'Correctness' in str(criteria)
        assert '50 pts' in str(criteria)

    def test_criteria_ordering(self, task):
        c1 = Criteria.objects.create(task=task, name='Z Criteria', points=10)
        c2 = Criteria.objects.create(task=task, name='A Criteria', points=20)
        ordered = list(Criteria.objects.filter(task=task))
        assert ordered[0].name == 'A Criteria'
        assert ordered[1].name == 'Z Criteria'


class TestTestCaseModel:
    def test_testcase_creation(self, testcase, task):
        assert testcase.task == task
        assert testcase.input_data == '5'
        assert testcase.expected_output == '25'
        assert testcase.is_hidden is False

    def test_testcase_str_public(self, testcase):
        assert 'Public' in str(testcase)

    def test_testcase_str_hidden(self, testcase2):
        assert 'Hidden' in str(testcase2)

    def test_testcase_ordering(self, task):
        tc1 = TestCase.objects.create(task=task, input_data='1', expected_output='1', order=2)
        tc2 = TestCase.objects.create(task=task, input_data='2', expected_output='2', order=1)
        ordered = list(TestCase.objects.filter(task=task))
        assert ordered[0].order == 1
        assert ordered[1].order == 2


class TestSubmissionModel:
    def test_submission_creation(self, submission, task, student):
        assert submission.task == task
        assert submission.student == student
        assert submission.status == Submission.Status.PASSED
        assert submission.score == 100

    def test_submission_str(self, submission):
        assert 'test@test.com' in str(submission)
        assert 'Test Task' in str(submission)
        assert 'passed' in str(submission)

    def test_submission_ordering(self, task, student, student2):
        s1 = Submission.objects.create(task=task, student=student, code='print(1)')
        s2 = Submission.objects.create(task=task, student=student2, code='print(2)')
        ordered = list(Submission.objects.all())
        assert ordered[0] == s2
        assert ordered[1] == s1


class TestSubmissionTestResultModel:
    def test_test_result_creation(self, testcase, submission):
        result = SubmissionTestResult.objects.create(
            submission=submission,
            testcase=testcase,
            passed=True,
            student_output='25',
            runtime_ms=100
        )
        assert result.passed is True
        assert result.student_output == '25'

    def test_test_result_str_passed(self, testcase, submission):
        result = SubmissionTestResult.objects.create(
            submission=submission,
            testcase=testcase,
            passed=True
        )
        assert 'PASS' in str(result)

    def test_test_result_str_failed(self, testcase, submission):
        result = SubmissionTestResult.objects.create(
            submission=submission,
            testcase=testcase,
            passed=False
        )
        assert 'FAIL' in str(result)