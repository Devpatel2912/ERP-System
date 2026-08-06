from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdmin
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum

from hr.models import Employee, Attendance
from inventory.models import Product
from sales.models import Order
from django.db.models import Sum, Avg, Max, Min
from hr.models import Payroll


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_dashboard(request):
    total_employees = Employee.objects.count()
    total_products = Product.objects.count()
    total_orders = Order.objects.count()

    total_sales = Order.objects.aggregate(total=Sum('total_price'))['total'] or 0

    today = timezone.now().date()

    today_attendance = Attendance.objects.filter(date=today).count()
    present_today = Attendance.objects.filter(date=today, status='Present').count()
    late_today = Attendance.objects.filter(date=today, status='Late').count()
    half_day_today = Attendance.objects.filter(date=today, status='Half-day').count()

    return Response({
        "total_employees": total_employees,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_sales": total_sales,

        "today_attendance": today_attendance,
        "present_today": present_today,
        "late_today": late_today,
        "half_day_today": half_day_today
    })



@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def payroll_dashboard(request):

    month = request.GET.get('month')
    year = request.GET.get('year')

    payrolls = Payroll.objects.filter(month=month, year=year)

    total_salary = payrolls.aggregate(total=Sum('final_salary'))['total'] or 0
    avg_salary = payrolls.aggregate(avg=Avg('final_salary'))['avg'] or 0
    max_salary = payrolls.aggregate(max=Max('final_salary'))['max'] or 0
    min_salary = payrolls.aggregate(min=Min('final_salary'))['min'] or 0

    return Response({
        "total_salary_paid": total_salary,
        "avg_salary": avg_salary,
        "highest_salary": max_salary,
        "lowest_salary": min_salary
    })