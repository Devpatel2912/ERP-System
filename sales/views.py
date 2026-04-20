from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer
from inventory.models import Product
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdmin
from rest_framework.response import Response
from hr.models import Employee, Attendance
from inventory.models import Product
from sales.models import Order

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    product_id = request.data.get('product')
    quantity = int(request.data.get('quantity'))

    product = Product.objects.get(id=product_id)

    if product.quantity < quantity:
        return Response({'error': 'Not enough stock'}, status=400)

    total_price = product.price * quantity

    product.quantity -= quantity
    product.save()

    order = Order.objects.create(
        product=product,
        quantity=quantity,
        total_price=total_price
    )

    serializer = OrderSerializer(order)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_orders(request):
    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


