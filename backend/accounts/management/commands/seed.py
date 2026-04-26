"""
Django management command to seed demo data.
Usage: python manage.py seed
"""
from django.core.management.base import BaseCommand
from accounts.models import User
from classroom.models import ClassRoom, ClassMembership
from tasks.models import Task, TestCase, Criteria
from django.utils import timezone
from datetime import timedelta


class Command(BaseCommand):
    help = 'Seed database with demo data'

    def handle(self, *args, **options):
        self.stdout.write('Creating demo users...')

        # Create demo users
        teacher, created = User.objects.get_or_create(
            email='teacher@example.com',
            defaults={
                'username': 'teacher',
                'role': User.Role.TEACHER,
                'first_name': 'Demo',
                'last_name': 'Teacher'
            }
        )
        if created:
            teacher.set_password('teacher123')
            teacher.save()

        student1, created = User.objects.get_or_create(
            email='student1@example.com',
            defaults={
                'username': 'student1',
                'role': User.Role.STUDENT,
                'first_name': 'Alice',
                'last_name': 'Student'
            }
        )
        if created:
            student1.set_password('student123')
            student1.save()

        student2, created = User.objects.get_or_create(
            email='student2@example.com',
            defaults={
                'username': 'student2',
                'role': User.Role.STUDENT,
                'first_name': 'Bob',
                'last_name': 'Student'
            }
        )
        if created:
            student2.set_password('student123')
            student2.save()

        self.stdout.write(self.style.SUCCESS(f'Created users: {teacher.email}, {student1.email}, {student2.email}'))

        # Create demo class
        self.stdout.write('Creating demo class...')
        classroom, created = ClassRoom.objects.get_or_create(
            teacher=teacher,
            defaults={
                'name': 'Introduction to Python',
                'description': 'Learn Python programming fundamentals'
            }
        )

        self.stdout.write(self.style.SUCCESS(f'Created class: {classroom.name} (Code: {classroom.class_code})'))

        # Add students to class
        ClassMembership.objects.get_or_create(classroom=classroom, student=student1)
        ClassMembership.objects.get_or_create(classroom=classroom, student=student2)

        self.stdout.write('Added students to class')

        # Create demo task
        self.stdout.write('Creating demo task...')
        task, created = Task.objects.get_or_create(
            classroom=classroom,
            title='Sum Two Numbers',
            defaults={
                'description': 'Write a function that takes two integers as input and returns their sum.',
                'difficulty': Task.Difficulty.EASY,
                'tags': ['python', 'functions', 'basics'],
                'deadline': timezone.now() + timedelta(days=7)
            }
        )

        if created:
            # Create test cases
            TestCase.objects.create(
                task=task,
                input_data='5\n10',
                expected_output='15',
                is_hidden=False,
                weight_points=10,
                order=1
            )

            TestCase.objects.create(
                task=task,
                input_data='-3\n7',
                expected_output='4',
                is_hidden=False,
                weight_points=10,
                order=2
            )

            TestCase.objects.create(
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

        self.stdout.write(self.style.SUCCESS(f'Created task: {task.title}'))
        self.stdout.write(self.style.SUCCESS(f'Created {task.testcases.count()} test cases'))
        self.stdout.write(self.style.SUCCESS(f'Created {task.criteria.count()} criteria'))

        self.stdout.write(self.style.SUCCESS('\nDemo data created successfully!'))
        self.stdout.write(self.style.SUCCESS(f'\nLogin credentials:'))
        self.stdout.write(self.style.SUCCESS(f'Teacher: {teacher.email} / teacher123'))
        self.stdout.write(self.style.SUCCESS(f'Student 1: {student1.email} / student123'))
        self.stdout.write(self.style.SUCCESS(f'Student 2: {student2.email} / student123'))
        self.stdout.write(self.style.SUCCESS(f'\nClass Code: {classroom.class_code}'))
