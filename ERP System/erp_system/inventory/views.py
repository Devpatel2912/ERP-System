from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Product, Category, Supplier, StockMovement
from .serializers import ProductSerializer, CategorySerializer, SupplierSerializer, StockMovementSerializer
from accounts.permissions import IsAdmin

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def categories_list(request):
    if request.method == 'GET':
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        if request.user.role not in ['admin', 'inventory']:
            return Response({'error': 'Unauthorized'}, status=403)
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def suppliers_list(request):
    if request.method == 'GET':
        suppliers = Supplier.objects.all()
        serializer = SupplierSerializer(suppliers, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        if request.user.role not in ['admin', 'inventory', 'finance']:
            return Response({'error': 'Unauthorized'}, status=403)
        serializer = SupplierSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_product(request):
    if request.user.role not in ['admin', 'inventory']:
        return Response({'error': 'Unauthorized'}, status=403)
    # We might receive category or supplier IDs
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        category_id = request.data.get('category')
        supplier_id = request.data.get('supplier')
        serializer.save(category_id=category_id, supplier_id=supplier_id)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_products(request):
    products = Product.objects.select_related('category', 'supplier').all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_product(request, id):
    if request.user.role not in ['admin', 'inventory']:
        return Response({'error': 'Unauthorized'}, status=403)
    try:
        product = Product.objects.get(id=id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)
        
    serializer = ProductSerializer(product, data=request.data, partial=True)
    if serializer.is_valid():
        category_id = request.data.get('category')
        supplier_id = request.data.get('supplier')
        serializer.save(category_id=category_id, supplier_id=supplier_id)
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_product(request, id):
    if request.user.role not in ['admin']:
        return Response({'error': 'Unauthorized'}, status=403)
    try:
        product = Product.objects.get(id=id)
        product.delete()
        return Response({'message': 'Deleted successfully'})
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def stock_movements(request):
    if request.method == 'GET':
        movements = StockMovement.objects.select_related('product', 'user').all().order_by('-date')
        serializer = StockMovementSerializer(movements, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        if request.user.role not in ['admin', 'inventory']:
            return Response({'error': 'Unauthorized'}, status=403)
        
        product_id = request.data.get('product')
        movement_type = request.data.get('movement_type')
        quantity = int(request.data.get('quantity', 0))
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)
            
        # Update product quantity
        if movement_type == 'IN':
            product.quantity += quantity
        elif movement_type == 'OUT':
            if product.quantity < quantity:
                return Response({'error': 'Insufficient stock'}, status=400)
            product.quantity -= quantity
        elif movement_type == 'ADJ':
            product.quantity = quantity # Exact count
            
        product.save()
        
        # Save movement record
        movement = StockMovement.objects.create(
            product=product,
            movement_type=movement_type,
            quantity=quantity,
            reference=request.data.get('reference', ''),
            notes=request.data.get('notes', ''),
            user=request.user
        )
        
        serializer = StockMovementSerializer(movement)
        return Response(serializer.data, status=201)