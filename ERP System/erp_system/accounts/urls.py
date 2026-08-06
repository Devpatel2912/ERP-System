from django.urls import path
from .views import login_api
from .views import register_api, reset_employee_password, forgot_password_api

urlpatterns = [
    path('login/', login_api),
    path('register/', register_api),
    path('reset-password/', reset_employee_password),
    path('forgot-password/', forgot_password_api),
]