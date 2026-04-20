from django.urls import path
from .views import create_order, list_orders

urlpatterns = [
    path('create-order/', create_order),
    path('orders/', list_orders),
    
]