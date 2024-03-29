from django.shortcuts import render
from django.db import IntegrityError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import date, datetime, timedelta
from . import models, serializers
from Users.models import User


class AllTasks(APIView):
    # permission_classes = [IsAuthenticated]
    def get(self, request):
        calendarID = request.query_params.get('calendar', None)     # /all-tasks/?calendar=<value>
        try:
            # check calendar actually exists
            models.Calendar.objects.get(id=calendarID)

            tasks = models.Task.objects.filter(calendarID=calendarID)
            serializer = serializers.TaskSerializer(tasks, many=True)
            return Response(serializer.data, status=200)
        except models.Calendar.DoesNotExist:
            return Response({'Error: Calendar does not exist'}, status=404)


class AllUnscheduledTasks(APIView):
    def get(self, request):
        calendarID = request.query_params.get('calendar', None)     # /all-unscheduled-tasks/?calendar=<value>
        try:
            models.Calendar.objects.get(id=calendarID)
            tasks = models.Task.objects.filter(calendarID=calendarID, startTime__isnull=True).order_by('dueDate')
            serializer = serializers.TaskSerializer(tasks, many=True)
            return Response(serializer.data, status=200)
        except:
            return Response({'Error: Calendar does not exist'}, status=404)


class AllScheduledTasks(APIView):
    def get(self, request):
        calendarID = request.query_params.get('calendar', None)
        try:
            models.Calendar.objects.get(id=calendarID)
            tasks = models.Task.objects.filter(calendarID=calendarID, startTime__isnull=False).order_by('startTime')
            serializer = serializers.TaskSerializer(tasks, many=True)
            return Response(serializer.data, status=200)
        except:
            return Response({'Error: Calendar does not exist'}, status=404)

class ScheduledTasksByWeek(APIView):
    def get(self, request):
        calendarID = request.query_params.get('calendar', None)
        startOfWeekParam = request.query_params.get('startofweek', None)
        startOfWeekParts = startOfWeekParam.split('-')
        startOfWeek = date(int(startOfWeekParts[0]), int(startOfWeekParts[1]), int(startOfWeekParts[2]))
        endOfWeek = startOfWeek + timedelta(days=7)

        try:
            models.Calendar.objects.get(id=calendarID)
            tasks = models.Task.objects.filter(calendarID=calendarID, startDate__isnull=False, startDate__range=[startOfWeek, endOfWeek]).order_by('scheduledDateTime')
            serializer = serializers.TaskSerializer(tasks, many=True)
            return Response(serializer.data, status=200)
        except:
            return Response({'Error: Calendar does not exist'}, status=404)


class OneTask(APIView):
    # permission_classes = [IsAuthenticated]
    def get(self, request):
        taskID = request.query_params.get('task', None)             # /all-tasks/?task=<value>

        try:
            task = models.Task.objects.get(id=taskID)
            serializer = serializers.TaskSerializer(task)
            return Response(serializer.data, status=200)
        except models.Task.DoesNotExist:
            return Response({'Error: Task does not exist'}, status=404)
        

    def post(self, request):
        data = request.data

        data['dueTime'] = datetime.strptime(data.get('dueTime'), '%H:%M:%S').time()
        data['dueDate'] = datetime.strptime(data.get('dueDate'), '%Y-%m-%d').date()
        duration_parts = data.get('duration').split(':')
        data['duration'] = timedelta(hours=int(duration_parts[0]), minutes=int(duration_parts[1]), seconds=int(duration_parts[2]))

        serializer = serializers.TaskSerializer(data=data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response({'Success'}, status=201)
            except IntegrityError:
                return Response({'Error: Overlapping Scheduled Tasks'}, status=409)
            
        else:
            return Response(serializer.errors, status=400)


    def delete(self, request):
        taskID = request.query_params.get('task', None)
        try:
            task = models.Task.objects.get(id=taskID)
            task.delete()
            return Response({'Success'}, status=200)
        except models.Task.DoesNotExist:
            return Response({'Error: Task does not exist'}, status=404)

    def put(self, request):
        taskID = request.data.get('taskID')
        newCalendarID = request.data.get('newCalendar')           #foreign key
        newData = request.data.get('newData')


        try:
            task = models.Task.objects.get(id=taskID)
            # if changing calendar, check calendarID is valid, then 
            if newCalendarID is not None:
                setattr(task, 'calendarID', models.Calendar.objects.get(id=newCalendarID))
            for field, value in newData.items():
                if value is not None:
                    if value == 'null':
                        setattr(task, field, None)
                    else:
                        # fix formatting for certain fields
                        if field in ['dueTime', 'startTime']:
                            value = datetime.strptime(value, '%H:%M:%S').time()
                        elif field in ['dueDate', 'startDate']:
                            value = datetime.strptime(value, '%Y-%m-%d').date()
                        elif field == 'duration':
                            duration_parts = value.split(':')
                            value = timedelta(hours=int(duration_parts[0]), minutes=int(duration_parts[1]), seconds=int(duration_parts[2]))
                        setattr(task, field, value)
            task.save()
            return Response({'Success'}, status=200)
        except models.Calendar.DoesNotExist:
            return Response({'Error: Selected calendar does not exist'}, status=404)
        except models.Task.DoesNotExist:
            return Response({'Error: Task does not exist'}, status=404)
        except IntegrityError:
            return Response({'Error: Overlapping Scheduled Tasks'}, status=409)

class UsersCalendars(APIView):
    def get(self, request):
        userEmail = request.query_params.get('user', None)
        try:
            user = User.objects.get(email=userEmail)
            ownedCalendars = models.Calendar.objects.filter(owner=user)
            serializer = serializers.CalendarSerializer(ownedCalendars, many=True)
            return Response(serializer.data, status=200)
        except:
            return Response({'Error: no existing user is logged in'}, status=401)
        
class NewCalendar(APIView):
    # permission_classes = [IsAuthenticated]
    def post(self, request):
        requestData = request.data
        ownerEmail = requestData["ownerEmail"]
        owner = User.objects.get(email=ownerEmail)
        data = {
            "owner": owner.id,
            "name": requestData["name"],
            "sharedUsers": []
        }
        # user = request.user
        serializer = serializers.CalendarSerializer(data=data)
        if (serializer.is_valid()):
            newCalendar = serializer.save()
            calendarID = newCalendar.id
            return Response({'calendarID': calendarID}, status=201)
        else:
            return Response(serializer.errors, status=400)

