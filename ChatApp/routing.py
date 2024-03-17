from django.urls import path
from .consumers import ChatConsumer, Room_Consumer, Waiting_room
websocket_urlpatterns = [
    path('ws/notification/<str:room_name>/<str:username>/', ChatConsumer.as_asgi()),
    path('ws/notification/', Room_Consumer.as_asgi()),
    path('ws/notification/waiting_room/<str:room_name>/<str:username>/', Waiting_room.as_asgi())
]