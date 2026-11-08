# Student Management System

> **Practical Assignment:** Database Integration and Full-Stack Development  
> **Technologies:** HTML5, CSS3, JavaScript (ES6+), PHP 8+, MySQL / MariaDB

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Database Schema (student_db)](#-database-schema-student_db)
- [Core Features & Assignment Requirements](#-core-features--assignment-requirements)
- [Project File Structure](#-project-file-structure)
- [Setup & Installation Guide (XAMPP / WAMP / LAMP)](#-setup--installation-guide-xampp--wamp--lamp)
- [Input Validation & Security Architecture](#-input-validation--security-architecture)
- [CRUD Operations Guide](#-crud-operations-guide)

---

## 🎯 Project Overview

This application is a complete, full-stack **Student Management System** developed in accordance with the university practical assignment on database integration and web development.

It implements a normalized MySQL database (`student_db`), a dynamic registration form, PDO database connectivity, parameterized CRUD (Create, Read, Update, Delete) operations, and rigorous dual-tier input validation.

---

## 🗄️ Database Schema (`student_db`)

### 1. Database Creation
```sql
CREATE DATABASE IF NOT EXISTS student_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE student_db;
```

### 2. Table Definition (`students`)
```sql
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  reg_no VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL,
  course VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Data Dictionary
| Field | Data Type | Null | Key | Default | Description |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | `INT(11)` | NO | **PRI** | `AUTO_INCREMENT` | Unique identifier for each student |
| `name` | `VARCHAR(100)` | NO | | `NULL` | Full student name |
| `reg_no` | `VARCHAR(50)` | NO | **UNI** | `NULL` | Institutional registration number (Unique) |
| `email` | `VARCHAR(100)` | NO | | `NULL` | Valid institutional/personal email address |
| `course` | `VARCHAR(100)` | NO | | `NULL` | Enrolled academic program |
| `created_at` | `TIMESTAMP` | NO | | `CURRENT_TIMESTAMP` | Date and time the record was registered |

---

## 🚀 Core Features & Assignment Requirements

| # | Requirement | Implementation Details |
| :-: | :--- | :--- |
| **1** | **Create MySQL Database & Table** | Creates `student_db` and table `students` with InnoDB engine and UTF-8 encoding (`schema.sql`). |
| **2** | **Student Registration Form** | Captures Name, Reg No, Email, and Course with clear labels and input focus indicators (`create.php`). |
| **3** | **PHP-MySQL Connection** | Secure PDO connection with `PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION` and charset `utf8mb4` (`config/db_connect.php`). |
| **4** | **Save Student Records** | Saves records using parameterized prepared queries (`INSERT INTO students ...`) preventing SQL injection. |
| **5** | **Display Students in a Table** | HTML5 table rendering ID, Name, Reg No, Email, Course, and Date with responsive overflow and action buttons (`index.php`). |
| **6** | **Full CRUD Operations** | **Create** (`create.php`), **Read / List** (`index.php`), **View Profile** (`view.php`), **Update** (`update.php`), and **Delete** (`delete.php`). |
| **7** | **User Input Validation** | Checks required fields are not empty + validates email format via client-side JS regex and PHP `filter_var(..., FILTER_VALIDATE_EMAIL)`. |

---

## 📁 Project File Structure

```text
student_management_system/
│
├── config/
│   └── db_connect.php     # PHP PDO MySQL database connection
│
├── database/
│   └── schema.sql         # SQL script to create database, table, and seed data
│
├── index.php              # Displays all registered students in a formatted table
├── create.php             # Registration form and database insertion handler
├── view.php               # Detailed profile view for an individual student
├── update.php             # Form to edit and update existing student records
├── delete.php             # Handler to safely delete student records
├── style.css              # Responsive, modern CSS styling
├── script.js              # Client-side input validation and confirm dialogs
└── README.md              # Documentation and setup instructions
```

---

## 💻 Setup & Installation Guide (XAMPP / WAMP / LAMP)

### Prerequisites
- [XAMPP](https://www.apachefriends.org/) (or WampServer / LAMP stack) with Apache and MySQL enabled.
- PHP 7.4 or PHP 8.x.
- Web browser (Chrome, Firefox, Safari, Edge).

### Step-by-Step Installation

#### 1. Copy Files to the Web Root
1. Open your XAMPP installation folder:
   - **Windows:** `C:\xampp\htdocs\`
   - **macOS:** `/Applications/XAMPP/xamppfiles/htdocs/`
   - **Linux:** `/opt/lampp/htdocs/`
2. Create a new directory named `student_management`.
3. Extract or copy all project files (`index.php`, `create.php`, `config/`, etc.) into `htdocs/student_management/`.

#### 2. Start Services
1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **Apache**.
3. Click **Start** next to **MySQL**.

#### 3. Import the Database into MySQL
1. Open your web browser and go to:
   ```
   http://localhost/phpmyadmin/
   ```
2. Click the **Import** tab in the top navigation bar.
3. Click **Choose File** and select `database/schema.sql` (or `schema.sql`).
4. Scroll to the bottom and click **Go**.
5. The `student_db` database and `students` table will be created and populated with sample records.

#### 4. Configure Database Credentials (if needed)
The default configuration in `config/db_connect.php` is:
```php
$host     = 'localhost';
$dbname   = 'student_db';
$username = 'root';
$password = ''; // Default XAMPP password is blank
```
*Note: If your MySQL server has a root password, update `$password` in `config/db_connect.php`.*

#### 5. Launch the Application
Open your browser and navigate to:
```
http://localhost/student_management/index.php
```

---

## 🛡️ Input Validation & Security Architecture

### 1. Client-Side JavaScript Validation (`script.js`)
Prevents form submission if fields are empty or invalid:
```javascript
// Validate email with regular expression
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(emailVal)) {
    showError(emailInput, 'Please enter a valid email address.');
    hasError = true;
}
```

### 2. Server-Side PHP Validation (`create.php` & `update.php`)
Even if client-side validation is bypassed, PHP enforces strict validation:
```php
// Check for empty fields
if (empty($name))   { $errors['name']   = 'Student name is required.'; }
if (empty($reg_no)) { $errors['reg_no'] = 'Registration number is required.'; }
if (empty($course)) { $errors['course'] = 'Course selection is required.'; }

// Validate email format using PHP filter
if (empty($email)) {
    $errors['email'] = 'Email address is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please provide a valid email address.';
}

// Check for duplicate registration numbers
$stmt = $pdo->prepare("SELECT id FROM students WHERE reg_no = :reg_no");
$stmt->execute(['reg_no' => $reg_no]);
if ($stmt->fetch()) {
    $errors['reg_no'] = 'Registration number already exists.';
}
```

### 3. SQL Injection Prevention (PDO Prepared Statements)
All database interactions use parameterized queries:
```php
$stmt = $pdo->prepare("
    INSERT INTO students (name, reg_no, email, course, created_at)
    VALUES (:name, :reg_no, :email, :course, NOW())
");
$stmt->execute([
    'name'   => $name,
    'reg_no' => $reg_no,
    'email'  => $email,
    'course' => $course
]);
```

### 4. Cross-Site Scripting (XSS) Prevention
All output rendered to HTML is sanitized using `htmlspecialchars()`:
```php
<td><?= htmlspecialchars($student['name']) ?></td>
<td><code><?= htmlspecialchars($student['reg_no']) ?></code></td>
<td><?= htmlspecialchars($student['email']) ?></td>
```

---

## 🔄 CRUD Operations Guide

- **Create (`create.php`)**: Click "+ Register New Student" on the main page. Fill out the four required fields and click "Save Student Record".
- **Read (`index.php`)**: View all registered records in the responsive table. Use the search bar to filter by name, registration number, or email, or use the course dropdown.
- **View (`view.php?id=X`)**: Click the **View** button next to any student to view their complete profile card and database metadata.
- **Update (`update.php?id=X`)**: Click the **Edit** button to pre-fill the update form with current student data, modify fields, and submit changes.
- **Delete (`delete.php?id=X`)**: Click the **Delete** button. A JavaScript confirmation prompt will appear before executing the prepared deletion query.

---

## 📄 License & Attribution
This project was designed and built as a solution for the **Practical Assignment: Database Integration and Full-Stack Development**. Free to use for educational and academic evaluation purposes.
