import string
import random
from django.db import models
from django.core.exceptions import ValidationError
from accounts.models import User


def generate_class_code():
    """Generate a unique 6-10 character class code."""
    length = random.randint(6, 10)
    characters = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(random.choice(characters) for _ in range(length))
        if not ClassRoom.objects.filter(class_code=code).exists():
            return code


class ClassRoom(models.Model):
    """Classroom model owned by a teacher."""
    
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_classes')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    class_code = models.CharField(max_length=10, unique=True, default=generate_class_code, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Classroom'
        verbose_name_plural = 'Classrooms'
    
    def __str__(self):
        return f"{self.name} ({self.class_code})"
    
    def regenerate_code(self):
        """Regenerate a new unique class code."""
        self.class_code = generate_class_code()
        self.save()
        return self.class_code


class ClassMembership(models.Model):
    """Membership model for students joining classes."""
    
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='memberships')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='class_memberships')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = [['classroom', 'student']]
        ordering = ['-joined_at']
    
    def __str__(self):
        return f"{self.student.email} in {self.classroom.name}"
    
    def clean(self):
        if self.student.role != User.Role.STUDENT:
            raise ValidationError("Only students can join classes.")
        if self.classroom.teacher == self.student:
            raise ValidationError("Teacher cannot join their own class as a student.")
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
