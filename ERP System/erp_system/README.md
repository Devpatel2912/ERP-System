# 🏢 ERP System (Django + PostgreSQL)

A complete **Enterprise Resource Planning (ERP) backend system** built using **Django, Django REST Framework, and PostgreSQL**.

This system manages:

* Employees 👨‍💼
* Attendance 🕒
* Timesheets 📄
* Tasks 📋
* Leave Management 📅
* Inventory 📦
* Sales 💰
* Payroll 💵
* Dashboard Analytics 📊

---

# 🚀 Features

## 🔐 Authentication

* JWT Login / Register
* Role-based access (Admin, Employee, HR)

## 👨‍💼 Employee Management

* Add / Update / Delete employee
* Employee profile with photo upload

## 🕒 Attendance System

* Check-in / Check-out
* Late / Half-day calculation
* Daily & Monthly tracking

## 📄 Timesheet

* Employee logs daily work hours
* Admin can view all timesheets

## 📋 Task Management

* Admin assigns tasks
* Employee marks task as completed
* Admin tracks progress

## 📅 Leave Management

* Employee applies leave
* Admin approves/rejects
* Auto attendance update

## 📦 Inventory

* Add / Update / Delete products

## 💰 Sales

* Create orders
* Track total sales

## 💵 Payroll

* Salary based on attendance + leave
* Monthly payroll generation

## 📊 Dashboard

* Total employees
* Total sales
* Payroll summary
* Attendance analytics

---

# 🛠️ Tech Stack

* Backend: Django, Django REST Framework
* Database: PostgreSQL
* Authentication: JWT (SimpleJWT)
* API Testing: Postman

---

# ⚙️ Installation

## 1️⃣ Clone Project

```bash
git clone https://github.com/your-username/erp-system.git
cd erp-system
```

---

## 2️⃣ Create Virtual Environment

```bash
python -m venv env
env\Scripts\activate
```

---

## 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4️⃣ Configure Database (PostgreSQL)

Update `settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'erp_db',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

---

## 5️⃣ Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## 6️⃣ Create Superuser

```bash
python manage.py createsuperuser
```

---

## 7️⃣ Run Server

```bash
python manage.py runserver
```

---

# 🔗 API Endpoints

## 🔐 Auth

* POST `/api/register/`
* POST `/api/login/`

## 👨‍💼 Employee

* POST `/api/add-employee/`
* GET `/api/profile/`

## 🕒 Attendance

* POST `/api/mark-attendance/`
* POST `/api/checkout/`

## 📄 Timesheet

* POST `/api/add-timesheet/`
* GET `/api/my-timesheet/`

## 📋 Task

* POST `/api/assign-task/`
* GET `/api/my-tasks/`
* POST `/api/complete-task/<id>/`

## 📅 Leave

* POST `/api/apply-leave/`
* POST `/api/approve-leave/<id>/`

## 💰 Payroll

* POST `/api/generate-payroll/`
* GET `/api/my-payroll/`

## 📊 Dashboard

* GET `/api/payroll-dashboard/`

---

# 🧪 API Testing

Import Postman collection:

```text
erp_postman_collection.json
```

---

# 📂 Project Structure

```text
erp_system/
│
├── accounts/
├── hr/
├── inventory/
├── sales/
├── dashboard/
├── manage.py
```

---

# 🔐 Authorization

All protected APIs require:

```text
Authorization: Bearer YOUR_TOKEN
```

---

# 🚀 Future Improvements

* Salary Slip PDF generation
* Email notifications
* Frontend (Angular / Flutter)
* Graph dashboards
* Leave balance system

---

# 👨‍💻 Author

Dev Patel

---

# ⭐ Conclusion

This project is a **complete mini ERP backend system** covering real-world business modules like HR, payroll, and inventory.

---
