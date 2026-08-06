from django.urls import path
from .views import (
    add_product, list_products, update_product, delete_product,
    categories_list, category_detail, suppliers_list, supplier_detail, stock_movements
)

urlpatterns = [
    path('add-product/', add_product),
    path('products/', list_products),
    path('update-product/<int:id>/', update_product),
    path('delete-product/<int:id>/', delete_product),
    path('categories/', categories_list),
    path('categories/<int:pk>/', category_detail),
    path('suppliers/', suppliers_list),
    path('suppliers/<int:pk>/', supplier_detail),
    path('stock-movements/', stock_movements),
]