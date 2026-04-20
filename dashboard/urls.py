from django.urls import path
from .views import admin_dashboard, payroll_dashboard

urlpatterns = [
    path('dashboard/', admin_dashboard),
    path('payroll-dashboard/', payroll_dashboard),
]