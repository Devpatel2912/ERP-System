from django.db import models
from accounts.models import User
from django.utils import timezone

class Department(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Designation(models.Model):
    name = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='designations')
    
    def __str__(self):
        return self.name
class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    designation = models.ForeignKey(Designation, on_delete=models.SET_NULL, null=True, blank=True)
    salary = models.FloatField(default=0.0)
    join_date = models.DateField()
    photo = models.ImageField(upload_to='employee_photos/', null=True, blank=True)

class Attendance(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    working_hours = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, default='Present')

class Timesheet(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()
    hours = models.FloatField()
    task = models.TextField()

class Task(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, default='Pending')  # Pending / Completed
    assigned_date = models.DateField(auto_now_add=True)
    completed_date = models.DateField(null=True, blank=True)

class Leave(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()

    status = models.CharField(max_length=20, default='Pending')  # Pending / Approved / Rejected
    applied_at = models.DateTimeField(auto_now_add=True)

class Payroll(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    month = models.IntegerField()
    year = models.IntegerField()

    total_days = models.IntegerField()
    present_days = models.IntegerField()
    half_days = models.IntegerField()
    absent_days = models.IntegerField()
    leave_days = models.IntegerField()

    base_salary = models.FloatField()
    final_salary = models.FloatField()

    created_at = models.DateTimeField(auto_now_add=True)

