from django.urls import path
from . import views

urlpatterns = [
    path('all-tasks/', views.AllTasks.as_view()),
    path('task/', views.OneTask.as_view()),
    path('new-calendar/', views.NewCalendar.as_view())
]