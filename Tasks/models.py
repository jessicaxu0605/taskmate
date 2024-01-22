from django.db import models
from django.utils import timezone
from Users.models import User

class Calendar(models.Model):
    
    owner = models.ForeignKey(User, on_delete=models.PROTECT)
    sharedUsers = models.ManyToManyField(User, through='Calendar2User', related_name='ownedCalendars')
    name = models.CharField(max_length=100)

class Calendar2User(models.Model):
    calendar = models.ForeignKey(Calendar, on_delete=models.PROTECT)
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    permissions = models.CharField(max_length=10, choices=[('edit', 'Can Edit'), ('view', 'Can View Only')])

class Task(models.Model):
    # mandatory
    calendarID = models.ForeignKey(Calendar, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    dateCreated = models.DateTimeField(auto_now_add=True)                       # auto
    dueDate = models.DateField(default=timezone.now)
    dueTime = models.TimeField(default='23:59:59')                              # default exists
    duration = models.DurationField()                      # HH:MM:SS format

    # add later
    startDate = models.DateField(null=True, blank=True)
    startTime = models.TimeField(null=True, blank=True)
    endTime = models.TimeField(null=True, blank=True)

    # optional
    eventTypeID = models.IntegerField(null=True, blank=True)
    properties = models.JSONField(null=True, blank=True)    # for tags, notes, etc.

