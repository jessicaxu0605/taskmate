from django.contrib import admin
from . import models

class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')

class Calendar2UserInline(admin.TabularInline):
    model = models.Calendar2User

class CalendarAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    inlines=[Calendar2UserInline]

admin.site.register(models.Task, TaskAdmin)
admin.site.register(models.Calendar, CalendarAdmin)
admin.site.register(models.Calendar2User)
# admin.site.register(models.User)
