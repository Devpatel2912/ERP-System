from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('hr', 'HR'),
        ('manager', 'Manager'),
        ('employee', 'Employee'),
        ('sales', 'Sales'),
        ('inventory', 'Inventory'),
        ('finance', 'Finance')
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')


