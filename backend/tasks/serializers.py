from rest_framework import serializers
from django.db import transaction
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
    __test__ = False
    
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


class TaskCriteriaCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    points = serializers.IntegerField(default=0)
    description = serializers.CharField(required=False, allow_blank=True, default='')


class TaskTestCaseCreateSerializer(serializers.Serializer):
    input_data = serializers.CharField()
    expected_output = serializers.CharField()
    is_hidden = serializers.BooleanField(default=False)
    weight_points = serializers.IntegerField(default=1)
    order = serializers.IntegerField(required=False, min_value=0)


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
    criteria_items = TaskCriteriaCreateSerializer(many=True, write_only=True, required=False)
    testcases_items = TaskTestCaseCreateSerializer(many=True, write_only=True, required=False)
    submission_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = ['id', 'classroom', 'classroom_id', 'title', 'description', 
                  'difficulty', 'tags', 'created_at', 'deadline', 'criteria', 
                  'testcases', 'criteria_items', 'testcases_items', 'submission_count']
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

    def validate_testcases_items(self, value):
        seen_orders = set()
        for idx, testcase in enumerate(value, start=1):
            order = testcase.get('order', idx)
            if order in seen_orders:
                raise serializers.ValidationError("Test case order values must be unique.")
            seen_orders.add(order)
        return value

    def create(self, validated_data):
        criteria_items = validated_data.pop('criteria_items', [])
        testcases_items = validated_data.pop('testcases_items', [])

        with transaction.atomic():
            task = Task.objects.create(**validated_data)

            if criteria_items:
                Criteria.objects.bulk_create(
                    [Criteria(task=task, **criteria) for criteria in criteria_items]
                )

            if testcases_items:
                testcases = []
                for idx, testcase in enumerate(testcases_items, start=1):
                    order = testcase.get('order', idx)
                    testcase_payload = {**testcase, 'order': order}
                    testcases.append(TestCase(task=task, **testcase_payload))
                TestCase.objects.bulk_create(testcases)

        return task


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
