from django.test import TestCase
from rest_framework.test import APITestCase
from Users.models import User
from Tasks.models import Calendar, Task

class NewCalendar(APITestCase):

    # create a user to serve as owner of the calendar
    def setUp(self):
        self.user = User.objects.create_user(
            password='testpassword',
            email='test@test.com',
        )

    def test_new_calendar(self):
        req_body = {
            "owner": self.user.id,
            "name": "Calendar 1"
        }
        response = self.client.post('/api/new-calendar/', req_body, format='json')
        self.assertEqual(response.status_code, 201)
        self.calendar = Calendar.objects.get(id=1)
        self.assertEqual(self.calendar.owner, self.user)
        self.assertEqual(self.calendar.name, "Calendar 1")


# ALREADY TESTED BELOW W POSTMAN, WRITE UNIT TESTS WHEN I GET THE TIME
#post task with/without dueTime, post task with nonexistant calendar expect 404
#post task with missing fields expect 400
#get task, get task that does not exist expect 404
#put task, put task with nonexistant calendar expect 404, put task that does not exist, expect 404
#get all tasks, get all tasks with nonexistant calendar expect 404


# class Task(APITestCase):

#     # create a user to serve as owner of the calendar
#     def setUp(self):
#         self.user = User.objects.create_user(
#             password='testpassword',
#             email='test@test.com'
#         )
#         self.calendar = Calendar.objects.create_calendar(
#             owner=self.user,
#             name="Calendar 1"
#         )
#         self.calendar = Task.objects.create_calendar(
#             calendarID= 1,
#             name ="Task 1",
#             dueDate="2023-12-25",
#             duration="01:00:00",
#             dueTime="10:00:00"
#         )

#     def test_post_task_w_dueTime(self):
#         req_body = {
#             "calendarID": 1,
#             "name": "Task 2",
#             "dueDate": "2024-01-20",
#             "duration": "02:00:00",
#             "dueTime": "10:00:00"
#         }
#         response = self.client.post('/api/task/', req_body, format='json')
#         self.assertEqual(response.status_code, 201)
#         self.task = Task.objects.get(id=2)
#         self.assertEqual(self.task.name, "Task 1")
#         self.assertEqual(self.task.calendarID, 1)
#         self.assertEqual(self.task.dueDate, '2024-01-20')

