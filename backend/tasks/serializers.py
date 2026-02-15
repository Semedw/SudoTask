from rest_framework import serializers
from .models import Task, Criteria, TestCase, ClassRoom
from classroom.serializers import ClassRoomSerializer


class CriteriaSerializer(serializers.ModelSerializer):
    """Serializer for Criteria model."""
    
    class Meta:
        model = Criteria
        fields = ['id', 'task', 'name', 'points', 'description']
        read_only_fields = ['id']


class TestCaseSerializer(serializers.ModelSerializer):
    """Serializer for TestCase model."""
    
    class Meta:
        model = TestCase
        fields = ['id', 'task', 'input_data', 'expected_output', 'is_hidden', 
                  'weight_points', 'order']
        read_only_fields = ['id']
    
    def to_representation(self, instance):
        """Hide expected_output for hidden testcases if user is a student."""
        representation = super().to_representation(instance)
        request = self.context.get('request')
        
        if request and instance.is_hidden:
            user = request.user
            # Students should not see expected output for hidden testcases
            if user.is_student:
                representation['expected_output'] = None
        
        return representation


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model."""
    
    classroom = ClassRoomSerializer(read_only=True)
    classroom_id = serializers.PrimaryKeyRelatedField(
        queryset= ClassRoom.objects.all(),
        source='classroom',
        write_only=True
    )
    criteria = CriteriaSerializer(many=True, read_only=True)
    testcases = serializers.SerializerMethodField()
    submission_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = ['id', 'classroom', 'classroom_id', 'title', 'description', 
                  'difficulty', 'tags', 'created_at', 'deadline', 'criteria', 
                  'testcases', 'submission_count']
        read_only_fields = ['id', 'created_at']
    
    def get_testcases(self, obj):
        """Return testcases, filtering hidden ones for students."""
        request = self.context.get('request')
        testcases = obj.testcases.all()
        
        if request and request.user.is_student:
            # Students can see all testcases but not expected_output for hidden ones
            serializer = TestCaseSerializer(testcases, many=True, context=self.context)
        else:
            # Teachers see everything
            serializer = TestCaseSerializer(testcases, many=True, context=self.context)
        
        return serializer.data
    
    def get_submission_count(self, obj):
        return obj.submissions.count()


class TaskListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for task lists."""
    
    classroom = ClassRoomSerializer(read_only=True)
    testcase_count = serializers.SerializerMethodField()
    submission_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = ['id', 'classroom', 'title', 'description', 'difficulty', 
                  'tags', 'created_at', 'deadline', 'testcase_count', 'submission_count']
        read_only_fields = ['id', 'created_at']
    
    def get_testcase_count(self, obj):
        return obj.testcases.count()
    
    def get_submission_count(self, obj):
        return obj.submissions.count()
