from rest_framework import serializers
from accounts.models import User
from accounts.serializers import UserSerializer
from .models import ClassRoom, ClassMembership


class ClassRoomSerializer(serializers.ModelSerializer):
    """Serializer for ClassRoom model."""
    
    teacher = UserSerializer(read_only=True)
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.TEACHER),
        source='teacher',
        write_only=True,
        required=False
    )
    student_count = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ClassRoom
        fields = ['id', 'teacher', 'teacher_id', 'name', 'description', 'class_code', 
                  'created_at', 'student_count', 'task_count']
        read_only_fields = ['id', 'teacher', 'class_code', 'created_at']
    
    def get_student_count(self, obj):
        return obj.memberships.count()
    
    def get_task_count(self, obj):
        return obj.tasks.count()
    
    def create(self, validated_data):
        # Set teacher from request user
        validated_data['teacher'] = self.context['request'].user
        return super().create(validated_data)


class ClassMembershipSerializer(serializers.ModelSerializer):
    """Serializer for ClassMembership model."""
    
    student = UserSerializer(read_only=True)
    classroom = ClassRoomSerializer(read_only=True)
    classroom_id = serializers.PrimaryKeyRelatedField(
        queryset=ClassRoom.objects.all(),
        source='classroom',
        write_only=True,
        required=False
    )
    
    class Meta:
        model = ClassMembership
        fields = ['id', 'classroom', 'classroom_id', 'student', 'joined_at']
        read_only_fields = ['id', 'student', 'joined_at']


class JoinClassSerializer(serializers.Serializer):
    """Serializer for joining a class by class code."""
    
    class_code = serializers.CharField(max_length=10, required=True)
    
    def validate_class_code(self, value):
        try:
            classroom = ClassRoom.objects.get(class_code=value.upper())
        except ClassRoom.DoesNotExist:
            raise serializers.ValidationError("Invalid class code.")
        return value.upper()
    
    def create(self, validated_data):
        class_code = validated_data['class_code']
        classroom = ClassRoom.objects.get(class_code=class_code)
        student = self.context['request'].user
        
        membership, created = ClassMembership.objects.get_or_create(
            classroom=classroom,
            student=student
        )
        
        if not created:
            raise serializers.ValidationError("You are already a member of this class.")
        
        return membership
