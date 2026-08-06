from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Order, OrderItem, Customer, Invoice
from .serializers import OrderSerializer, CustomerSerializer, InvoiceSerializer
from inventory.models import Product
from accounts.permissions import IsAdmin
from django.db import transaction

# --- CUSTOMER VIEWS ---
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def customers_list(request):
    if request.method == 'GET':
        customers = Customer.objects.all()
        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def customer_detail(request, pk):
    try:
        customer = Customer.objects.get(pk=pk)
    except Customer.DoesNotExist:
        return Response(status=404)

    if request.method == 'GET':
        serializer = CustomerSerializer(customer)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = CustomerSerializer(customer, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        customer.delete()
        return Response(status=204)

# --- ORDER VIEWS ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_orders(request):
    orders = Order.objects.all().order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def create_order(request):
    customer_id = request.data.get('customer')
    items_data = request.data.get('items', []) # [{"product_id": 1, "quantity": 2}, ...]

    if not customer_id:
        return Response({'error': 'Customer is required'}, status=400)
    
    if not items_data:
        return Response({'error': 'Order must contain at least one item'}, status=400)

    try:
        customer = Customer.objects.get(id=customer_id)
    except Customer.DoesNotExist:
        return Response({'error': 'Customer not found'}, status=404)

    order = Order.objects.create(
        customer=customer,
        shipping_address=request.data.get('shipping_address', ''),
    )

    total_amount = 0

    for item_data in items_data:
        product_id = item_data.get('product_id')
        quantity = int(item_data.get('quantity', 1))

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': f'Product with ID {product_id} not found'}, status=404)

        if product.quantity < quantity:
            return Response({'error': f'Not enough stock for product {product.name}'}, status=400)

        unit_price = product.price
        total_price = unit_price * quantity
        total_amount += total_price

        # Decrement stock
        product.quantity -= quantity
        product.save()

        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=quantity,
            unit_price=unit_price,
            total_price=total_price
        )

    order.total_amount = total_amount
    order.save()

    # Automatically create an invoice for the order
    Invoice.objects.create(
        order=order,
        invoice_number=f"INV-{order.id}",
        amount_paid=0.00
    )

    serializer = OrderSerializer(order)
    return Response(serializer.data, status=201)

# --- INVOICE VIEWS ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_invoices(request):
    invoices = Invoice.objects.all().order_by('-issue_date')
    serializer = InvoiceSerializer(invoices, many=True)
    return Response(serializer.data)
