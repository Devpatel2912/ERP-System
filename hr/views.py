from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.permissions import IsAdmin
from .models import Employee
from .serializers import EmployeeSerializer
from django.utils import timezone
from .models import Attendance
from .serializers import AttendanceSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
User = get_user_model() 
from datetime import time
from datetime import datetime
from .models import Timesheet
from .serializers import TimesheetSerializer
from .models import Task
from .serializers import TaskSerializer, LeaveSerializer
from .models import Leave
from datetime import timedelta
from calendar import monthrange
from django.db.models import Count
from .models import Payroll
from .serializers import PayrollSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def add_employee(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = User.objects.create_user(
        username=username,
        password=password,
        role='employee'
    )

    employee = Employee.objects.create(
        user=user,
        department=request.data.get('department'),
        salary=request.data.get('salary'),
        join_date=request.data.get('join_date'),
        photo=request.FILES.get('photo')   # 🔥 important
    )

    return Response({
        'message': 'Employee created',
        'username': username
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_employees(request):
    employees = Employee.objects.all()
    serializer = EmployeeSerializer(employees, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_employee(request, id):
    employee = Employee.objects.get(id=id)
    serializer = EmployeeSerializer(employee)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_profile(request):
    employee = get_object_or_404(Employee, user=request.user)

    serializer = EmployeeSerializer(employee)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_employee(request, id=None):

    user = request.user

    # 👑 Admin → update any employee
    if user.role == 'admin':
        employee = get_object_or_404(Employee, id=id)

    # 👨‍💼 Employee → only self
    else:
        employee = get_object_or_404(Employee, user=user)

    # 🔥 Update data
    employee.department = request.data.get('department', employee.department)
    employee.salary = request.data.get('salary', employee.salary)
    employee.join_date = request.data.get('join_date', employee.join_date)

    # 🖼️ Update photo
    if request.FILES.get('photo'):
        employee.photo = request.FILES.get('photo')

    employee.save()

    return Response({'message': 'Profile updated successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    employee = get_object_or_404(Employee, user=request.user)
    serializer = EmployeeSerializer(employee)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_employee(request, id):
    employee = Employee.objects.get(id=id)
    employee.delete()
    return Response({'message': 'Employee deleted'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_attendance(request):
    user = request.user

    if user.role == 'admin':
        employee_id = request.data.get('employee')
        employee = get_object_or_404(Employee, id=employee_id)
    else:
        employee = get_object_or_404(Employee, user=user)

    today = timezone.now().date()
    now_time = timezone.now().time()

    attendance, created = Attendance.objects.get_or_create(
        employee=employee,
        date=today
    )

    if attendance.check_in:
        return Response({'message': 'Already checked in'})

    attendance.check_in = now_time

    # 🔥 Late Logic
    if now_time > time(9, 30):
        attendance.status = 'Late'
    else:
        attendance.status = 'Present'

    attendance.save()

    return Response({'message': 'Check-in successful', 'status': attendance.status})

# ✅ Check-out
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout_attendance(request):
    user = request.user

    if user.role == 'admin':
        employee_id = request.data.get('employee')
        employee = get_object_or_404(Employee, id=employee_id)
    else:
        employee = get_object_or_404(Employee, user=user)

    today = timezone.now().date()

    attendance = get_object_or_404(Attendance, employee=employee, date=today)

    if attendance.check_out:
        return Response({'message': 'Already checked out'})

    now_time = timezone.now().time()
    attendance.check_out = now_time

    # 🔥 Calculate Working Hours
    check_in_datetime = datetime.combine(today, attendance.check_in)
    check_out_datetime = datetime.combine(today, now_time)

    total_seconds = (check_out_datetime - check_in_datetime).total_seconds()
    hours = total_seconds / 3600

    attendance.working_hours = round(hours, 2)

    # 🔥 Half-Day Logic
    if hours < 4:
        attendance.status = 'Half-day'
    elif attendance.status == 'Late':
        attendance.status = 'Late'
    else:
        attendance.status = 'Present'

    attendance.save()

    return Response({
        'message': 'Check-out successful',
        'working_hours': attendance.working_hours,
        'status': attendance.status
    })

# ✅ Get My Attendance
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_attendance(request):
    user = request.user
    employee = get_object_or_404(Employee, user=user)

    records = Attendance.objects.filter(employee=employee)
    serializer = AttendanceSerializer(records, many=True)

    return Response(serializer.data)


# ✅ Admin: View All Attendance
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_attendance(request):
    records = Attendance.objects.all()
    serializer = AttendanceSerializer(records, many=True)

    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def today_attendance(request):
    today = timezone.now().date()
    user = request.user

    # 🔹 Admin → can filter by employee (optional)
    if user.role == 'admin':
        employee_id = request.GET.get('employee')

        if employee_id:
            records = Attendance.objects.filter(date=today, employee_id=employee_id)
        else:
            records = Attendance.objects.filter(date=today)

    # 🔹 Employee → only own
    else:
        employee = get_object_or_404(Employee, user=user)
        records = Attendance.objects.filter(date=today, employee=employee)

    serializer = AttendanceSerializer(records, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_attendance(request):
    user = request.user

    month = request.GET.get('month')  # e.g. 04
    year = request.GET.get('year')    # e.g. 2026

    if not month or not year:
        return Response({'error': 'month and year required'}, status=400)

    # 🔹 Admin
    if user.role == 'admin':
        employee_id = request.GET.get('employee')

        if employee_id:
            records = Attendance.objects.filter(
                date__month=month,
                date__year=year,
                employee_id=employee_id
            )
        else:
            records = Attendance.objects.filter(
                date__month=month,
                date__year=year
            )

    # 🔹 Employee
    else:
        employee = get_object_or_404(Employee, user=user)

        records = Attendance.objects.filter(
            date__month=month,
            date__year=year,
            employee=employee
        )

    serializer = AttendanceSerializer(records, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_timesheet(request):
    user = request.user

    # 👨‍💼 Employee → own timesheet
    if user.role == 'employee':
        employee = get_object_or_404(Employee, user=user)

    # 👑 Admin → can add for any employee
    elif user.role == 'admin':
        employee_id = request.data.get('employee')
        employee = get_object_or_404(Employee, id=employee_id)

    else:
        return Response({'error': 'Not allowed'}, status=403)

    Timesheet.objects.create(
        employee=employee,
        date=request.data.get('date'),
        hours=request.data.get('hours'),
        task=request.data.get('task')
    )

    return Response({'message': 'Timesheet added successfully'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_timesheet(request):
    employee = get_object_or_404(Employee, user=request.user)

    records = Timesheet.objects.filter(employee=employee)
    serializer = TimesheetSerializer(records, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def all_timesheets(request):
    records = Timesheet.objects.all()
    serializer = TimesheetSerializer(records, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_timesheet(request):
    employee = get_object_or_404(Employee, user=request.user)

    month = request.GET.get('month')
    year = request.GET.get('year')

    records = Timesheet.objects.filter(
        employee=employee,
        date__month=month,
        date__year=year
    )

    serializer = TimesheetSerializer(records, many=True)
    return Response(serializer.data)

#assignment task admin
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def assign_task(request):
    employee_id = request.data.get('employee')

    employee = get_object_or_404(Employee, id=employee_id)

    Task.objects.create(
        employee=employee,
        title=request.data.get('title'),
        description=request.data.get('description')
    )

    return Response({'message': 'Task assigned successfully'})


#employee view task
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_tasks(request):
    employee = get_object_or_404(Employee, user=request.user)

    tasks = Task.objects.filter(employee=employee)
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)

#mark task complete
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_task(request, id):
    employee = get_object_or_404(Employee, user=request.user)

    task = get_object_or_404(Task, id=id, employee=employee)

    task.status = 'Completed'
    task.completed_date = timezone.now().date()
    task.save()

    return Response({'message': 'Task completed'})

#admin view all tasks
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def all_tasks(request):
    tasks = Task.objects.all()
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)

#aplly for leave
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_leave(request):
    employee = get_object_or_404(Employee, user=request.user)

    Leave.objects.create(
        employee=employee,
        start_date=request.data.get('start_date'),
        end_date=request.data.get('end_date'),
        reason=request.data.get('reason')
    )

    return Response({'message': 'Leave applied'})

#admin view all leave applications
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def all_leaves(request):
    leaves = Leave.objects.all()
    serializer = LeaveSerializer(leaves, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def approve_leave(request, id):
    leave = get_object_or_404(Leave, id=id)

    # ✅ Update status
    leave.status = 'Approved'
    leave.save()

    # ✅ Mark attendance as absent
    current_date = leave.start_date

    while current_date <= leave.end_date:
        Attendance.objects.get_or_create(
            employee=leave.employee,
            date=current_date,
            defaults={'status': 'Absent'}
        )
        current_date += timedelta(days=1)

    return Response({'message': 'Leave approved and attendance marked'})

#admin reject leave
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def reject_leave(request, id):
    leave = get_object_or_404(Leave, id=id)

    leave.status = 'Rejected'
    leave.save()

    return Response({'message': 'Leave rejected'})

#my leave applications
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_leaves(request):
    employee = get_object_or_404(Employee, user=request.user)

    leaves = Leave.objects.filter(employee=employee)
    serializer = LeaveSerializer(leaves, many=True)
    return Response(serializer.data)


#playroll salary calculation logic
from calendar import monthrange

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def generate_payroll(request):

    employee_id = request.data.get('employee')
    month = request.data.get('month')
    year = request.data.get('year')

    # ✅ validation FIRST
    if not employee_id or not month or not year:
        return Response({'error': 'employee, month, year required'}, status=400)

    # ✅ convert AFTER validation
    month = int(month)
    year = int(year)

    employee = get_object_or_404(Employee, id=employee_id)

    total_days = monthrange(year, month)[1]

    attendance = Attendance.objects.filter(
        employee=employee,
        date__month=month,
        date__year=year
    )

    present_days = attendance.filter(status='Present').count()
    half_days = attendance.filter(status='Half-day').count()
    absent_days = attendance.filter(status='Absent').count()
    leave_days = attendance.filter(status='Leave').count()

    base_salary = employee.salary
    per_day_salary = base_salary / total_days

    # 🔥 Salary Calculation
    final_salary = (
        (present_days * per_day_salary) +
        (half_days * per_day_salary * 0.5)
    )

    Payroll.objects.update_or_create(
        employee=employee,
        month=month,
        year=year,
        defaults={
            'total_days': total_days,
            'present_days': present_days,
            'half_days': half_days,
            'absent_days': absent_days,
            'leave_days': leave_days,
            'base_salary': base_salary,
            'final_salary': round(final_salary, 2)
        }
    )

    return Response({
        "employee": employee.id,
        "final_salary": round(final_salary, 2)
    })

#view payroll
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_payroll(request):
    employee = get_object_or_404(Employee, user=request.user)

    records = Payroll.objects.filter(employee=employee)
    serializer = PayrollSerializer(records, many=True)
    return Response(serializer.data)

