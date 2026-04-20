from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
User = get_user_model()
from accounts.permissions import IsAdmin

@api_view(['POST'])
def login_api(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        })
    else:
        return Response({'error': 'Invalid credentials'}, status=400)
    
User = get_user_model()

@api_view(['POST'])
def register_api(request):
    username = request.data.get('username')
    password = request.data.get('password')
    role = request.data.get('role')

    if User.objects.filter(username=username).exists():
        return Response({'error': 'User already exists'}, status=400)

    user = User.objects.create_user(
        username=username,
        password=password,
        role=role
    )

    return Response({'message': 'User created successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_api(request):
    user = request.user
    return Response({
        'username': user.username,
        'role': user.role
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def reset_employee_password(request):
    user_id = request.data.get('user_id')
    new_password = request.data.get('new_password')

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    user.set_password(new_password)   # 🔐 important
    user.save()

    return Response({'message': 'Password reset successfully'})