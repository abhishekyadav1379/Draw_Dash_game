import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from ChatApp.models import Room, Message
from django.shortcuts import render, redirect
# from . import sql_code
# from .sql_code import Sql_codes

from asgiref.sync import async_to_sync
from .Global_variable import *
from .Words import *
import random


class Room_Consumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        return super().disconnect(close_code)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        data = text_data_json
        room = data['room_id']
        username = data['user_name']
        print(data)
        # self.create_room(room, username)
        event = {
            'type': 'send_notification',
            'room': room,
            'username': username
        }
        # await self.channel_layer.group_send(room, event)

    async def send_notification(self, event):
        username = event['username']

    async def create_room(self, room, username):
        query = f'select * from Chatapp_room where room_name = "{room}"'
        check_room = sql_code.select_data(query, 'db.sqlite3')
        if len(check_room) == 0:
            new_room = Room(room_name=room)
            new_room.save()
        query = f"select * from Chatapp_users where room = '{room}'"
        value = sql_code.select_data(query, 'db.sqlite3')
        query = f"insert into Chatapp_users values('{username}','{room}',0,0,0)"
        sql_code.insert_data(query, 'db.sqlite3')
        print('the value is ', value, room, username)
        if len(value) < 3:
            return redirect('room', room_name=room, username=username)
        else:
            return redirect('room', room_name=room, username=username)


class Waiting_room(AsyncWebsocketConsumer):
    async def connect(self):
        # Accept the connection
        # print('hi')
        await self.accept()
        self.user_name = self.scope['url_route']['kwargs']['username']
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.waiting_grp = f"waiting_room_group_{self.scope['url_route']['kwargs']['room_name']}"
        await self.channel_layer.group_add(self.waiting_grp, self.channel_name)

        query = f"select * from Chatapp_users where room = '{self.room_name}'"
        users_details = Sql_codes.select_data(query, 'db.sqlite3')
        # Broadcast a message to all clients that someone has connected
        await self.channel_layer.group_send(
            self.waiting_grp,
            {
                'type': 'send_message',
                'message': users_details
            }
        )

    async def disconnect(self, close_code):
        # Remove the user from the database
        # await self.channel_layer.group_discard(self.waiting_grp, self.channel_name)
        query = f"delete from Chatapp_users where name = '{self.user_name}'"
        Sql_codes.delete_record(query, 'db.sqlite3')
        return super().disconnect(close_code)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        data = text_data_json
        print(data)
        # Broadcast a message to all clients to redirect
        await self.channel_layer.group_send(
            self.waiting_grp,
            {
                'type': 'redirect_message',
                'redirect_url': "nothing"
            }
        )

    async def redirect_message(self, event):
        redirect_url = event['redirect_url']
        # query = f"insert into Game_room_details values(?,?,?,?,?)"
        # value = (self.room_name, 0,1,"","")
        # Sql_codes.insert_data(query,value,'db.sqlite3')
        # Send a message to all clients to redirect
        await self.send(text_data=json.dumps({'redirect_url': redirect_url}))

    async def send_message(self, event):
        await self.send(text_data=json.dumps({'message': event['message']}))

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract user name and room name from URL route
        self.user_name = self.scope['url_route']['kwargs']['username']
        self.room_name = f"{self.scope['url_route']['kwargs']['room_name']}"
        print("room det",self.room_name, self.user_name)
        print(exist_rooms)
        # Add the channel to the group associated with the room
        await self.channel_layer.group_add(self.room_name, self.channel_name)

        # Check if the room exists or create a new one
        if self.room_name not in active_rooms:
            await self.create_room()
        else:
            await self.join_existing_room()
        print("activer_user", active_rooms[self.room_name].active_user)
        

    async def create_room(self):
        # Code to create a new room and initialize its data
        print("Room created")
        active_rooms[self.room_name] = Store_rooms(self.room_name, True, 5, self.user_name)
        ar = active_rooms[self.room_name]
        ar.all_users.append(self.user_name)
        ar.users_score[self.user_name] = 0
        ar.drawing_started = 1
        ar.game_owner = self.user_name

        # Notify users to choose a word
        # await self.channel_layer.group_send(
        #     self.room_name, {
        #         'type': 'send_choose_a_word'
        #     }
        # )

        # Accept the connection
        await self.accept()

    async def join_existing_room(self):
        # Code to join an existing room
        ar = active_rooms[self.room_name]

        if ar.cur_round != 0 and ar.game_start == True:
            ar.waiting_users.append(self.user_name)
        else:
            ar.all_users.append(self.user_name)

        # Handle reconnection of disconnected users
        if self.user_name in ar.disconnected_users:
            ar.users_score[self.user_name] = ar.disconnected_users[self.user_name]
            ar.disconnected_users.pop(self.user_name)
        else:
            ar.users_score[self.user_name] = 0

        # Store room details
        self.room_details = ar
        self.game_start = self.room_details.game_start
        self.rounds = self.room_details.rounds
        self.active_user = self.room_details.active_user
        self.all_users = self.room_details.all_users
        self.cur_word = self.room_details.cur_word
        self.counter = self.room_details.counter
        self.drawing_started = self.room_details.drawing_started

        # Send user details and score board to all users in the room
        await self.channel_layer.group_send(
            self.room_name, {
                'type': 'new_user_coming',
                'sender': self.user_name,
                'time': active_rooms[self.room_name].current_time,
                'word': active_rooms[self.room_name].cur_word,
                'coordinates': ar.coordinates,
                'game_start': ar.game_start,
                'game_owner': ar.game_owner,
                'draw_pattern': ar.draw_pattern,
                'cur_round': ar.cur_round
            }
        )
        await self.channel_layer.group_send(
            self.room_name, {
                'type': 'score_board',
                'users_score': active_rooms[self.room_name].users_score,
                'who_guessed': active_rooms[self.room_name].who_guessed
            }
        )

        # Accept the connection
        await self.accept()

    async def disconnect(self, close_code):
        # Handle disconnection of users
        self.user_name = self.scope['url_route']['kwargs']['username']
        self.room_name = f"{self.scope['url_route']['kwargs']['room_name']}"
        ar = active_rooms[self.room_name]

        ar.disconnected_users[self.user_name] = ar.users_score[self.user_name]
        ar.all_users.remove(self.user_name)
        ar.users_score.pop(self.user_name)

        print(ar.all_users, ar.waiting_users, len(ar.all_users))
        if len(ar.all_users) == 0:
            print(exist_rooms)
            exist_rooms.discard(str(self.room_name))
            return
        
        if len(ar.all_users) == 1:
            print("i m inside")
            event = {
                'type': 'game_over_fn',
            }

            await self.channel_layer.group_send(self.room_name, event)
            await self.channel_layer.group_discard(self.room_name, self.channel_name)
            return
            
        if ar.active_user == self.user_name and ar.game_start == True:
            ar.counter -= 1
            sender_name = self.user_name
            ar.owner = ar.all_users[0]
            self.timesup() 
            event = {
                'type': 'send_choose_a_word',
            }
            await self.channel_layer.group_send(self.room_name, event)
        else:
            event = {
                'type': 'score_board',
                'users_score': active_rooms[self.room_name].users_score,
                'who_guessed': ar.who_guessed
            }
            await self.channel_layer.group_send(self.room_name, event)
        
        # Remove the channel from the group associated with the room
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive(self, text_data):
        # Handle receiving data from the client
        data = json.loads(text_data)
        print(data)
        ar = active_rooms[self.room_name]

        if data['type'] == 'chat_message':
            event = {
                'type': 'send_message',
                'message': data,
            }
            await self.channel_layer.group_send(self.room_name, event)
        elif data['type'] == 'word_choosed':
            await self.handle_word_choosed(data)
        elif data['type'] == "coordinate_values":
            await self.handle_coordinate_values(data)
        elif data['type'] == "timer":
            await self.handle_timer(data)
        elif  data['type'] == "timesup":
            await self.handle_timesup(data)
        elif data['type'] == "word_guessed":
            await self.handle_word_guessed(data)
        elif data['type'] == "color_fill":
            await self.handle_color_fill(data)
        elif data['type'] == "undo_op":
            await self.handle_undo_op(data)
        elif data['type'] == "clear_all":
            await self.handle_clear_all(data)
        elif data['type'] == "like_dislike":
            await self.handle_like_dislike(data)
        elif data['type'] == "to_start_game":
            await self.handle_to_start_game(data)
            event = {
                'type': 'send_choose_a_word',
            }
            await self.channel_layer.group_send(self.room_name, event)

    async def game_over_fn(self,data):
        ar = active_rooms[self.room_name]
        ar.game_start = False
        event = {
            'type': 'game_over',
            'users_score': active_rooms[self.room_name].users_score
        }
        await self.send(text_data=json.dumps(event))
        
    async def handle_like_dislike(self, data):
        ar = active_rooms[self.room_name]
        user = data['sender']
        method = data['method']
        if method == 'like':
            ar.users_score[user] += 5
            ar.users_score[ar.active_user] += 10
        else:
            ar.users_score[user] -= 5
            ar.users_score[ar.active_user] -= 10
            
        event = {
            'type': 'send_message',
            'method': method,
            'sender':user,
            'message': '',
        }
        # await self.send(text_data=json.dumps({'message': event}))
        await self.channel_layer.group_send(self.room_name, event)
    
    async def handle_to_start_game(self, data):
        ar = active_rooms[self.room_name]
        if 'restart' in data:
            # ar.game_start = False
            ar.drawing_started = False
            ar.cur_round = 0
            ar.who_guessed = {}
            ar.coordinates = []
            ar.draw_pattern = []
            ar.counter = 0
            ar.disconnected_users = {}
            for user  in ar.users_score:
                ar.users_score[user] = 0
            # event = {
            #     'type': 'to_start_game',
            # }
            # await self.channel_layer.group_send(self.room_name, event)
        ar.game_start = True
        ar.rounds = data['selected_round']
        ar.round_time = data['selected_time']
        ar.no_of_words = data['selected_words']
        # event = {
        #     'type': 'to_start_game',
        # }
        await self.channel_layer.group_send(
            self.room_name, {
                'type': 'score_board',
                'users_score': ar.users_score,
                'who_guessed': ar.who_guessed
            }
        )
        await self.channel_layer.group_send(self.room_name, data)
                
    async def handle_clear_all(self, data):
        ar = active_rooms[self.room_name]
        ar.draw_pattern.append(data)
        event = {
            'type': 'clear_all',
        }
        await self.channel_layer.group_send(self.room_name, event)
            
            
    async def handle_undo_op(self, data):
        ar = active_rooms[self.room_name]
        ar.draw_pattern.pop()
        event = {
            'type': 'undo_op',
            'draw_pattern': ar.draw_pattern
        }
        await self.channel_layer.group_send(self.room_name, event)
            
            
    async def handle_color_fill(self, data):
        ar = active_rooms[self.room_name]
        pointer_size = data['pointer_size']
        pointer_color = data['pointer_color']
        cord = data['cor']
        print('color coordinates', cord)
        event = {
            'type': 'color_fill',
            'pointer_color': data['pointer_color'],
            'pointer_size': data['pointer_size'],
            'cord': cord,
            'sender': data['sender']
        }
        ar.draw_pattern.append(event)
        await self.channel_layer.group_send(self.room_name, event)

    async def handle_word_choosed(self, data):
        # Handle word selection by a user
        word = data['word_name']
        sender_name = data['sender']
        ar = active_rooms[self.room_name]
        # ar.canvas_width = data['canvas_width']
        # ar.canvas_height = data['canvas_height']

        event = {
            'type': 'word_choosed',
            'word_name': word,
            'sender': sender_name,
            'word_hint': data['word_hint'],
            # 'canvas_width': ar.canvas_width,
            # 'canvas_height': ar.canvas_height
        }
        active_rooms[self.room_name].cur_word = word
        active_rooms[self.room_name].drawing_started = 1
        self.drawing_started = 1
        await self.channel_layer.group_send(self.room_name, event)

    async def handle_coordinate_values(self, data):
        # Handle receiving coordinate values from the client
        cor = json.loads(data['cor'])
        pointer_size = data['pointer_size']
        pointer_color = data['pointer_color']
        sender_name = data['sender']
        ar = active_rooms[self.room_name]
        ar.coordinates.append(cor)
        event = {
            'type': 'coordinate_values',
            'pointer_color': pointer_color,
            'pointer_size': pointer_size,
            'cor': cor,
            'sender': sender_name
        }
        ar.draw_pattern.append(event)
        await self.channel_layer.group_send(self.room_name, event)

    async def handle_timer(self, data):
        # Handle timer event
        time = data['time']
        sender_name = data['sender']
        active_rooms[self.room_name].current_time = time
        event = {
            'type': 'timer',
            'time': time,
            'sender': sender_name
        }
        await self.channel_layer.group_send(self.room_name, event)

    async def handle_timesup(self, data):
        # Handle times up event
        sender_name = data['sender']
        self.timesup()
        event = {
            'type': 'send_choose_a_word',
        }
        await self.channel_layer.group_send(self.room_name, event)

    async def handle_word_guessed(self, data):
        # Handle word guessed event
        ar = active_rooms[self.room_name]
        sender = data['sender']
        if self.word_guessed(sender) == 1:
            self.timesup()
            event = {
                'type': 'send_choose_a_word',
            }
            await self.channel_layer.group_send(self.room_name, event)
            
        event = {
            'type': 'score_board',
            'users_score': active_rooms[self.room_name].users_score,
            'who_guessed': active_rooms[self.room_name].who_guessed
        }
        print(ar.who_guessed)
        await self.channel_layer.group_send(self.room_name, event)
        
        
    async def color_fill(self, event):
        await self.send(text_data=json.dumps(event))
        
    async def clear_all(self, event):
        await self.send(text_data=json.dumps(event))

    def word_guessed(self, sender):
        # Handle word guessed logic
        ar = active_rooms[self.room_name]
        ar.who_guessed[sender] = 1
        ar.users_score[sender] += ar.current_time * 5

        if (len(ar.all_users)-1 == len(ar.who_guessed)):
            ar.users_score[ar.active_user] += ar.current_time * 4
            ar.who_guessed = {}
            return 1
            self.timesup()
            event = {
                'type': 'send_choose_a_word',
            }
            self.channel_layer.group_send(self.room_name, event)
        return 0

    async def undo_op(self, event):
        await self.send(text_data=json.dumps(event))
        
    async def score_board(self, event):
        # Send updated score board to all users in the room
        # event['who_guessed'] = active_rooms[self.room_name].who_guessed
        await self.send(text_data=json.dumps(event))

    def timesup(self):
        # Handle times up event
        ar = active_rooms[self.room_name]
        ar.current_time = ar.round_time
        ar.counter += 1
        ar.drawing_started = 0
        cnt = ar.counter
        total_rounds = ar.rounds
        current_users = ar.all_users
        self.rounds = ar.rounds

        if cnt >= len(current_users):
            ar.all_users.extend(ar.waiting_users)
            ar.waiting_users = []
            ar.cur_round += 1
            ar.counter = 0
            cnt = 0
            ar.active_user = ar.all_users[cnt]
            self.active_user = ar.active_user
        else:
            ar.active_user = ar.all_users[cnt]
            self.active_user = ar.active_user

    async def new_user_coming(self, event):
        # Notify users about a new user joining the room
        time = active_rooms[self.room_name].current_time
        await self.send(text_data=json.dumps(event))

    async def timer(self, event):
        # Send timer event to all users in the room
        await self.send(text_data=json.dumps(event))

    async def send_message(self, event):
        # Send a message to all users in the room
        if 'method' in event:
            await self.send(text_data=json.dumps({'message': event}))
            return
        data = event['message']
        response_data = {
            'sender': data['sender'],
            'message': data['message']
        }
        if 'ini_type' in data:
            response_data['ini_type'] = data['ini_type']
        await self.send(text_data=json.dumps({'message': response_data}))

    async def send_choose_a_word(self, event):
        # Send word choices to all users in the room
        ar = active_rooms[self.room_name]
        ar.coordiantes = []
        ar.draw_pattern = []
        cur_round = ar.cur_round
        tot_round = ar.rounds
        print("current and total ",cur_round, tot_round)
        if str(cur_round) == str(tot_round):
            print("ha mai andar hun")
            ar.game_start = False
            context = {
                'type': 'game_over',
                'users_score' : ar.users_score
            }
            await self.send(text_data=json.dumps(context))
            return
        
        words = random.sample(word_hints, int(ar.no_of_words))
        context = {
            'type': 'choose_a_word',
            'words': words,
            'user': active_rooms[self.room_name].active_user,
            'cur_round': active_rooms[self.room_name].cur_round,
            'time': ar.round_time
        }
        if 'time' in event:
            context['time'] = event['time']
        await self.send(text_data=json.dumps(context))

    async def to_start_game(self, event):
        await self.send(text_data=json.dumps(event))
        
    async def word_choosed(self, event):
        # Notify users about the selected word
        await self.send(text_data=json.dumps(event))

    async def coordinate_values(self, event):
        # Send coordinate values to all users in the room
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def create_message(self, data):
        # Create a new message
        get_room_by_name = Room.objects.get(room_name=data['room_name'])

        if not Message.objects.filter(message=data['message']).exists():
            new_message = Message(
                room=get_room_by_name, sender=data['sender'], message=data['message'])
            new_message.save()
