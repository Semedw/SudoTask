"""
Seed script for demo data.
Run with: python manage.py shell < seed_data.py
Or: python manage.py shell, then paste this code
"""
from accounts.models import User
from classroom.models import ClassRoom, ClassMembership
from tasks.models import Task, TestCase, Criteria
from django.utils import timezone
from datetime import timedelta

# Create demo users
print("Creating demo users...")

teacher = User.objects.create_user(
    email='teacher@example.com',
    username='teacher',
    password='teacher123',
    role=User.Role.TEACHER,
    first_name='Demo',
    last_name='Teacher'
)

student1 = User.objects.create_user(
    email='student1@example.com',
    username='student1',
    password='student123',
    role=User.Role.STUDENT,
    first_name='Alice',
    last_name='Student'
)

student2 = User.objects.create_user(
    email='student2@example.com',
    username='student2',
    password='student123',
    role=User.Role.STUDENT,
    first_name='Bob',
    last_name='Student'
)

print(f"Created users: {teacher.email}, {student1.email}, {student2.email}")

# Create demo class
print("Creating demo class...")

classroom = ClassRoom.objects.create(
    teacher=teacher,
    name='Introduction to Python',
    description='Learn Python programming fundamentals'
)

print(f"Created class: {classroom.name} (Code: {classroom.class_code})")

# Add students to class
ClassMembership.objects.create(classroom=classroom, student=student1)
ClassMembership.objects.create(classroom=classroom, student=student2)

print("Added students to class")

# Create demo task
print("Creating demo task...")

task = Task.objects.create(
    classroom=classroom,
    title='Sum Two Numbers',
    description='Write a function that takes two integers as input and returns their sum.',
    difficulty=Task.Difficulty.EASY,
    tags=['python', 'functions', 'basics'],
    deadline=timezone.now() + timedelta(days=7)
)

# Create test cases
testcase1 = TestCase.objects.create(
    task=task,
    input_data='5\n10',
    expected_output='15',
    is_hidden=False,
    weight_points=10,
    order=1
)

testcase2 = TestCase.objects.create(
    task=task,
    input_data='-3\n7',
    expected_output='4',
    is_hidden=False,
    weight_points=10,
    order=2
)

testcase3 = TestCase.objects.create(
    task=task,
    input_data='0\n0',
    expected_output='0',
    is_hidden=True,
    weight_points=20,
    order=3
)

# Create criteria
Criteria.objects.create(
    task=task,
    name='Correctness',
    points=30,
    description='Code produces correct output for all test cases'
)

Criteria.objects.create(
    task=task,
    name='Code Quality',
    points=10,
    description='Code is clean and readable'
)

print(f"Created task: {task.title}")
print(f"Created {task.testcases.count()} test cases")
print(f"Created {task.criteria.count()} criteria")

print("\nDemo data created successfully!")
print(f"\nLogin credentials:")
print(f"Teacher: {teacher.email} / teacher123")
print(f"Student 1: {student1.email} / student123")
print(f"Student 2: {student2.email} / student123")
print(f"\nClass Code: {classroom.class_code}")
