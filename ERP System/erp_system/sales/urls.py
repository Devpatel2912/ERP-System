from django.urls import path
from .views import create_order, list_orders, customers_list, customer_detail, list_invoices

urlpatterns = [
    path('customers/', customers_list),
    path('customers/<int:pk>/', customer_detail),
    path('create-order/', create_order),
    path('orders/', list_orders),
    path('invoices/', list_invoices),
]