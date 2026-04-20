from django.urls import path
from .views import add_product, list_products, update_product, delete_product

urlpatterns = [
    path('add-product/', add_product),
    path('products/', list_products),
    path('update-product/<int:id>/', update_product),
    path('delete-product/<int:id>/', delete_product),
]