# from django.db import models

# class Room(models.Model):
#     room_name = models.CharField(max_length=255)
    
#     def return_room_messages(self):
#         return Message.objects.filter(room=self)
    
#     def create_new_room_message(self, sender, message):

#         new_message = Message(room=self, sender=sender, message=message)
#         new_message.save() 

#     def __str__(self):
#         return self.room_name
# class Message(models.Model):
#     room = models.ForeignKey(Room, on_delete=models.CASCADE)
#     sender = models.CharField(max_length=255)
#     message = models.TextField()

#     def __str__(self):
#         return str(self.room)

# class Users(models.Model):
#     name = models.CharField(max_length=255)
#     score = models.IntegerField(default=0)
#     room = models.CharField(max_length=255,default='123')
#     game_start = models.IntegerField
    
#     def __str__(self):
#         return str(self.name)
    
# class Game_users(models.Model):
#     name = models.CharField(max_length=255)
#     score = models.IntegerField(default=0)
#     room = models.CharField(max_length=255,default='123')
#     game_start = models.IntegerField
    
#     def __str__(self):
#         return str(self.name)
