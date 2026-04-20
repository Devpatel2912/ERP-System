from django.urls import path
from .views import add_employee, list_employees, get_employee, update_employee, delete_employee, mark_attendance, checkout_attendance, my_attendance, all_attendance
from .views import today_attendance, monthly_attendance, profile
from .views import add_timesheet, my_timesheet, all_timesheets, monthly_timesheet
from .views import assign_task, my_tasks, complete_task, all_tasks, apply_leave, my_leaves, all_leaves, approve_leave, reject_leave
from .views import generate_payroll, my_payroll



urlpatterns = [
    path('add-employee/', add_employee),
    path('employees/', list_employees),
    path('employee/<int:id>/', get_employee),
    path('update-employee/<int:id>/', update_employee),
    path('delete-employee/<int:id>/', delete_employee),
    path('mark-attendance/', mark_attendance),
    path('checkout/', checkout_attendance),
    path('my-attendance/', my_attendance),
    path('all-attendance/', all_attendance),
    path('today-attendance/', today_attendance),
    path('monthly-attendance/', monthly_attendance),
    path('profile/', profile),
    path('update-profile/', update_employee),                 # employee
path('update-employee/<int:id>/', update_employee),       # admin
path('add-timesheet/', add_timesheet),
path('my-timesheet/', my_timesheet),
path('all-timesheets/', all_timesheets),
path('monthly-timesheet/', monthly_timesheet),
path('assign-task/', assign_task),
path('my-tasks/', my_tasks),
path('complete-task/<int:id>/', complete_task),
path('all-tasks/', all_tasks),
path('apply-leave/', apply_leave),
path('my-leaves/', my_leaves),
path('all-leaves/', all_leaves),
path('approve-leave/<int:id>/', approve_leave),
path('reject-leave/<int:id>/', reject_leave),
path('generate-payroll/', generate_payroll),
path('my-payroll/', my_payroll),
]