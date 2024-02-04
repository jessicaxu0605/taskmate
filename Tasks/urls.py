from django.urls import path
from . import views

urlpatterns = [
    # tasks:
    path('all-tasks/', views.AllTasks.as_view()),
    path('all-unscheduled-tasks/', views.AllUnscheduledTasks.as_view()),
    path('all-scheduled-tasks/', views.AllScheduledTasks.as_view()),
    path('scheduled-tasks-by-week/', views.ScheduledTasksByWeek.as_view()),
    path('task/', views.OneTask.as_view()),
    # calendars:
    path('new-calendar/', views.NewCalendar.as_view()),
    path('user-calendars/', views.UsersCalendars.as_view())
]