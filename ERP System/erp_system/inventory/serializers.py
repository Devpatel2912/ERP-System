from rest_framework import serializers
from .models import Product, Category, Supplier, StockMovement

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)
    supplier_details = SupplierSerializer(source='supplier', read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'

class StockMovementSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = '__all__'