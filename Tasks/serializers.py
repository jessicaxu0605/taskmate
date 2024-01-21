from rest_framework.serializers import ModelSerializer
from . import models


class TaskSerializer(ModelSerializer):
    class Meta:
        model = models.Task
        fields = '__all__'


class CalendarSerializer(ModelSerializer):
    class Meta:
        model = models.Calendar
        fields = '__all__'

        