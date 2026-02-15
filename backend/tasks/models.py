from django.db import models
from django.contrib.postgres.fields import ArrayField
from classroom.models import ClassRoom


class Task(models.Model):
    """Task model for programming assignments."""
    
    class Difficulty(models.TextChoices):
        EASY = 'EASY', 'Easy'
        MEDIUM = 'MEDIUM', 'Medium'
        HARD = 'HARD', 'Hard'
    
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField()
    difficulty = models.CharField(max_length=10, choices=Difficulty.choices, default=Difficulty.EASY)
    tags = ArrayField(models.CharField(max_length=50), default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.classroom.name})"


class Criteria(models.Model):
    """Scoring criteria for tasks."""
    
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='criteria')
    name = models.CharField(max_length=100)
    points = models.IntegerField(default=0)
    description = models.TextField(blank=True)
    
    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Criteria'
    
    def __str__(self):
        return f"{self.name} ({self.points} pts) - {self.task.title}"


class TestCase(models.Model):
    """Test case model for task validation."""
    
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='testcases')
    input_data = models.TextField()
    expected_output = models.TextField()
    is_hidden = models.BooleanField(default=False)
    weight_points = models.IntegerField(default=1)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'id']
        unique_together = [['task', 'order']]
    
    def __str__(self):
        visibility = "Hidden" if self.is_hidden else "Public"
        return f"Test {self.order} ({visibility}) - {self.task.title}"
