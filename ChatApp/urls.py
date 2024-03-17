from . import views
from django.urls import path

urlpatterns = [
    path('', views.CreateRoom, name='create-room'),
    path('<str:room_name>/<str:username>/', views.MessageView, name='room'),
    path('waiting_room/<str:room_name>/<str:username>/', views.WaitingRoom, name='waiting_room'),
]