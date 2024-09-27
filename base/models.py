from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Topic(models.Model):
    name = models.CharField(max_length=200)

    def str(self):
        return self.name


class Room(models.Model):
    name = models.CharField(max_length=200)
    room_number = models.IntegerField()
    description = models.TextField(blank=True, null=True)
    participants = models.IntegerField()
    projector_available = models.BooleanField()
    next_event = models.DateTimeField()
    
    def __str__(self):
        return self.name
    
class Post(models.Model):
    user = models.CharField(max_length=200, on_delete = models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE) # supprimer la room supprime les posts associés (CASCADE)
    text = models.TextField()
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.text