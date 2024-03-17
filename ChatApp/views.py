from django.shortcuts import render, redirect
from .models import Room, Message
# from .sql_code import Sql_codes
from .Global_variable import *

def CreateRoom(request):

    if request.method == 'POST':
        # print("room det ",request.POST)
        username = request.POST['username']
        room = str(request.POST['room'])
        print("njdnsjfa", username,room)
        if room not in exist_rooms:
            print("japan se aya")
            exist_rooms.add(room)
        return redirect('room', room_name=room, username=username)
        
        # create_room(room, username)
        # try:
        #     get_room = Room.objects.get(room_name=room)
        #     print('ho createroom running')
        #     return redirect('room', room_name=room, username=username)
        # except Room.DoesNotExist:
        #     new_room = Room(room_name = room)
        #     new_room.save()
        #     return redirect('room', room_name=room, username=username)
        # query = f'select * from Chatapp_room where room_name = "{room}"'
        # check_room = Sql_codes.select_data(query,'db.sqlite3')
        # if len(check_room) == 0:
        #     new_room = Room(room_name = room)
        #     new_room.save()
        # query = f"select * from Chatapp_users where room = '{room}'"
        # value = Sql_codes.select_data(query,'db.sqlite3')
        # query = "insert into Chatapp_users (name, score, room,game_start) values(?,?,?,?)"
        # query_data = (username,0,room,0)
        # Sql_codes.insert_data(query, query_data,'db.sqlite3')
        
        # if len(value) <50:
        #     # return render(request, 'wating_room.html', {'users_details':users_details})
        #     return redirect('room', room_name=room, username=username)
        # else:
        #     return redirect('room', room_name=room, username=username)

    return render(request, 'Entry.html')


def  MessageView(request, room_name, username):
    
    get_room = Room.objects.get(room_name=room_name)

    if request.method == 'POST':
        message = request.POST['message']

        print(message)

        new_message = Message(room=get_room, sender=username, message=message)
        new_message.save()

    get_messages= Message.objects.filter(room=get_room)
    
    context = {
        "messages": get_messages,
        "user": username,
        "room_name": room_name,
    }
    # return render(request, 'message.html', context)
    return render(request, 'game_window.html', context)

def WaitingRoom(request,room_name, username):
    if request.method == 'POST':
        pass
    # query = f"select * from Chatapp_users where room = '{room_name}'"
    # users_details = Sql_codes.select_data(query,'db.sqlite3')
    # print(users_details)
    return render(request, 'wating_room.html', {'room_name':room_name, 'username':username})