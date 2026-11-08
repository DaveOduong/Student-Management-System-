import { ProjectFile } from '../types/student';

export const PHP_CODE_FILES: ProjectFile[] = [
  {
    filename: 'schema.sql',
    path: 'database/schema.sql',
    language: 'sql',
    description: 'MySQL database and table initialization script',
    content: `-- =======================================================
-- Student Management System Database Schema
-- Database: student_db
-- Table: students
-- =======================================================

-- 1. Create database named student_db if it does not exist
CREATE DATABASE IF NOT EXISTS student_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Select database
USE student_db;

-- 2. Create students table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  reg_no VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL,
  course VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional initial seed records
INSERT INTO students (name, reg_no, email, course, created_at) VALUES
('David Omondi', 'REG/2026/001', 'david.omondi@university.edu', 'Computer Science', NOW()),
('Amina Hassan', 'REG/2026/004', 'amina.hassan@university.edu', 'Software Engineering', NOW()),
('Carlos Mendez', 'REG/2026/012', 'carlos.mendez@university.edu', 'Information Technology', NOW()),
('Sarah Jenkins', 'REG/2026/018', 'sarah.jenkins@university.edu', 'Data Science', NOW()),
('Kelvin Kiprop', 'REG/2026/025', 'kelvin.k@university.edu', 'Business Information Technology', NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);
`
  },
  {
    filename: 'db_connect.php',
    path: 'config/db_connect.php',
    language: 'php',
    description: 'PHP PDO MySQL database connection configuration',
    content: `<?php
/**
 * Database Connection File (db_connect.php)
 * Connects the PHP application to the MySQL database named student_db
 */

$host     = 'localhost';
$dbname   = 'student_db';
$username = 'root';
$password = ''; // Default XAMPP password is empty
$charset  = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    // In production, log the error rather than displaying details
    die("Database connection failed: " . $e->getMessage());
}
?>
`
  },
  {
    filename: 'index.php',
    path: 'index.php',
    language: 'php',
    description: 'Main dashboard displaying registered students in a responsive table',
    content: `<?php
/**
 * Index Page (index.php)
 * Displays all registered students in a table with search & CRUD action links
 */
require_once 'config/db_connect.php';

$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$course_filter = isset($_GET['course']) ? trim($_GET['course']) : '';

try {
    $sql = "SELECT * FROM students WHERE 1=1";
    $params = [];

    if (!empty($search)) {
        $sql .= " AND (name LIKE :search OR reg_no LIKE :search OR email LIKE :search)";
        $params['search'] = "%$search%";
    }

    if (!empty($course_filter)) {
        $sql .= " AND course = :course";
        $params['course'] = $course_filter;
    }

    $sql .= " ORDER BY id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $students = $stmt->fetchAll();

    // Fetch distinct courses for filter dropdown
    $courses_stmt = $pdo->query("SELECT DISTINCT course FROM students ORDER BY course ASC");
    $all_courses = $courses_stmt->fetchAll(PDO::FETCH_COLUMN);

} catch (PDOException $e) {
    die("Query error: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Management System</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <div>
                <h1>Student Management System</h1>
                <p class="subtitle">Database Integration: MySQL (student_db) & PHP</p>
            </div>
            <a href="create.php" class="btn btn-primary">+ Register New Student</a>
        </header>

        <!-- Flash messages -->
        <?php if (isset($_GET['msg'])): ?>
            <?php if ($_GET['msg'] === 'created'): ?>
                <div class="alert alert-success">Student successfully registered into database!</div>
            <?php elseif ($_GET['msg'] === 'updated'): ?>
                <div class="alert alert-success">Student record successfully updated!</div>
            <?php elseif ($_GET['msg'] === 'deleted'): ?>
                <div class="alert alert-info">Student record successfully deleted!</div>
            <?php endif; ?>
        <?php endif; ?>

        <!-- Search & Filter Bar -->
        <div class="filter-card">
            <form method="GET" action="index.php" class="filter-form">
                <input type="text" name="search" placeholder="Search by name, reg no, or email..." 
                       value="<?= htmlspecialchars($search) ?>" class="form-control">
                
                <select name="course" class="form-control">
                    <option value="">All Courses</option>
                    <?php foreach ($all_courses as $c): ?>
                        <option value="<?= htmlspecialchars($c) ?>" <?= $course_filter === $c ? 'selected' : '' ?>>
                            <?= htmlspecialchars($c) ?>
                        </option>
                    <?php endforeach; ?>
                </select>

                <button type="submit" class="btn btn-secondary">Filter</button>
                <?php if (!empty($search) || !empty($course_filter)): ?>
                    <a href="index.php" class="btn btn-outline">Reset</a>
                <?php endif; ?>
            </form>
        </div>

        <!-- Student Table -->
        <div class="table-responsive">
            <table class="student-table">
                <thead>
                    <tr>
                        <th># ID</th>
                        <th>Student Name</th>
                        <th>Reg Number</th>
                        <th>Email Address</th>
                        <th>Course</th>
                        <th>Registered Date</th>
                        <th class="text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (count($students) > 0): ?>
                        <?php foreach ($students as $student): ?>
                            <tr>
                                <td><?= htmlspecialchars($student['id']) ?></td>
                                <td><strong><?= htmlspecialchars($student['name']) ?></strong></td>
                                <td><code><?= htmlspecialchars($student['reg_no']) ?></code></td>
                                <td><?= htmlspecialchars($student['email']) ?></td>
                                <td><span class="badge"><?= htmlspecialchars($student['course']) ?></span></td>
                                <td><?= htmlspecialchars(date('M d, Y', strtotime($student['created_at']))) ?></td>
                                <td class="actions-cell">
                                    <a href="view.php?id=<?= $student['id'] ?>" class="btn-sm btn-info">View</a>
                                    <a href="update.php?id=<?= $student['id'] ?>" class="btn-sm btn-warning">Edit</a>
                                    <a href="delete.php?id=<?= $student['id'] ?>" 
                                       class="btn-sm btn-danger" 
                                       onclick="return confirm('Are you sure you want to delete this student record?');">
                                       Delete
                                    </a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="7" class="empty-state">
                                No student records found. Click "+ Register New Student" to add records.
                            </td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>

        <footer class="footer">
            <p>Total Registered Students: <?= count($students) ?> &bull; Database: <code>student_db</code></p>
        </footer>
    </div>
    <script src="script.js"></script>
</body>
</html>
`
  },
  {
    filename: 'create.php',
    path: 'create.php',
    language: 'php',
    description: 'Student registration form with validation and database insertion',
    content: `<?php
/**
 * Create Student (create.php)
 * Handles input validation and saves records to the students table in MySQL
 */
require_once 'config/db_connect.php';

$errors = [];
$name   = '';
$reg_no = '';
$email  = '';
$course = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name   = trim($_POST['name'] ?? '');
    $reg_no = trim($_POST['reg_no'] ?? '');
    $email  = trim($_POST['email'] ?? '');
    $course = trim($_POST['course'] ?? '');

    // Requirement 7: Validate user input (empty fields & valid email)
    if (empty($name)) {
        $errors['name'] = 'Student name is required.';
    }

    if (empty($reg_no)) {
        $errors['reg_no'] = 'Registration number is required.';
    } else {
        // Check for duplicate reg_no
        $chk = $pdo->prepare("SELECT id FROM students WHERE reg_no = :reg_no");
        $chk->execute(['reg_no' => $reg_no]);
        if ($chk->fetch()) {
            $errors['reg_no'] = 'This registration number is already registered.';
        }
    }

    if (empty($email)) {
        $errors['email'] = 'Email address is required.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Please provide a valid email address (e.g. name@domain.com).';
    }

    if (empty($course)) {
        $errors['course'] = 'Course selection is required.';
    }

    // If validation passes, save into MySQL database
    if (empty($errors)) {
        try {
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

            header("Location: index.php?msg=created");
            exit;
        } catch (PDOException $e) {
            $errors['general'] = "Database error: " . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register Student - Student Management System</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container container-sm">
        <header class="header">
            <div>
                <h1>Register New Student</h1>
                <p class="subtitle">Enter student details to save into student_db</p>
            </div>
            <a href="index.php" class="btn btn-outline">&larr; Back to List</a>
        </header>

        <?php if (!empty($errors['general'])): ?>
            <div class="alert alert-danger"><?= htmlspecialchars($errors['general']) ?></div>
        <?php endif; ?>

        <div class="card">
            <form id="studentForm" method="POST" action="create.php" novalidate>
                <div class="form-group">
                    <label for="name">Full Student Name <span class="required">*</span></label>
                    <input type="text" id="name" name="name" 
                           value="<?= htmlspecialchars($name) ?>" 
                           class="form-control <?= isset($errors['name']) ? 'is-invalid' : '' ?>"
                           placeholder="e.g. David Omondi" required>
                    <?php if (isset($errors['name'])): ?>
                        <span class="error-text"><?= htmlspecialchars($errors['name']) ?></span>
                    <?php endif; ?>
                </div>

                <div class="form-group">
                    <label for="reg_no">Registration Number <span class="required">*</span></label>
                    <input type="text" id="reg_no" name="reg_no" 
                           value="<?= htmlspecialchars($reg_no) ?>" 
                           class="form-control <?= isset($errors['reg_no']) ? 'is-invalid' : '' ?>"
                           placeholder="e.g. REG/2026/045" required>
                    <?php if (isset($errors['reg_no'])): ?>
                        <span class="error-text"><?= htmlspecialchars($errors['reg_no']) ?></span>
                    <?php endif; ?>
                </div>

                <div class="form-group">
                    <label for="email">Email Address <span class="required">*</span></label>
                    <input type="email" id="email" name="email" 
                           value="<?= htmlspecialchars($email) ?>" 
                           class="form-control <?= isset($errors['email']) ? 'is-invalid' : '' ?>"
                           placeholder="e.g. david.omondi@university.edu" required>
                    <?php if (isset($errors['email'])): ?>
                        <span class="error-text"><?= htmlspecialchars($errors['email']) ?></span>
                    <?php endif; ?>
                </div>

                <div class="form-group">
                    <label for="course">Course of Study <span class="required">*</span></label>
                    <select id="course" name="course" class="form-control <?= isset($errors['course']) ? 'is-invalid' : '' ?>" required>
                        <option value="">-- Select Course --</option>
                        <option value="Computer Science" <?= $course === 'Computer Science' ? 'selected' : '' ?>>Computer Science</option>
                        <option value="Software Engineering" <?= $course === 'Software Engineering' ? 'selected' : '' ?>>Software Engineering</option>
                        <option value="Information Technology" <?= $course === 'Information Technology' ? 'selected' : '' ?>>Information Technology</option>
                        <option value="Data Science" <?= $course === 'Data Science' ? 'selected' : '' ?>>Data Science</option>
                        <option value="Business Information Technology" <?= $course === 'Business Information Technology' ? 'selected' : '' ?>>Business Information Technology</option>
                        <option value="Electrical Engineering" <?= $course === 'Electrical Engineering' ? 'selected' : '' ?>>Electrical Engineering</option>
                    </select>
                    <?php if (isset($errors['course'])): ?>
                        <span class="error-text"><?= htmlspecialchars($errors['course']) ?></span>
                    <?php endif; ?>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Save Student Record</button>
                    <a href="index.php" class="btn btn-outline">Cancel</a>
                </div>
            </form>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
`
  },
  {
    filename: 'update.php',
    path: 'update.php',
    language: 'php',
    description: 'Fetch student record and update in the MySQL database',
    content: `<?php
/**
 * Update Student Record (update.php)
 * Fetches existing record by ID and updates details with validation
 */
require_once 'config/db_connect.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    header("Location: index.php");
    exit;
}

// Fetch current record
$stmt = $pdo->prepare("SELECT * FROM students WHERE id = :id");
$stmt->execute(['id' => $id]);
$student = $stmt->fetch();

if (!$student) {
    die("Student record not found.");
}

$errors = [];
$name   = $student['name'];
$reg_no = $student['reg_no'];
$email  = $student['email'];
$course = $student['course'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name   = trim($_POST['name'] ?? '');
    $reg_no = trim($_POST['reg_no'] ?? '');
    $email  = trim($_POST['email'] ?? '');
    $course = trim($_POST['course'] ?? '');

    // Validation
    if (empty($name)) {
        $errors['name'] = 'Student name is required.';
    }

    if (empty($reg_no)) {
        $errors['reg_no'] = 'Registration number is required.';
    } else {
        // Unique check excluding current student ID
        $chk = $pdo->prepare("SELECT id FROM students WHERE reg_no = :reg_no AND id != :id");
        $chk->execute(['reg_no' => $reg_no, 'id' => $id]);
        if ($chk->fetch()) {
            $errors['reg_no'] = 'This registration number is already used by another student.';
        }
    }

    if (empty($email)) {
        $errors['email'] = 'Email address is required.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Please provide a valid email address.';
    }

    if (empty($course)) {
        $errors['course'] = 'Course is required.';
    }

    if (empty($errors)) {
        try {
            $update = $pdo->prepare("
                UPDATE students 
                SET name = :name, reg_no = :reg_no, email = :email, course = :course 
                WHERE id = :id
            ");
            $update->execute([
                'name'   => $name,
                'reg_no' => $reg_no,
                'email'  => $email,
                'course' => $course,
                'id'     => $id
            ]);

            header("Location: index.php?msg=updated");
            exit;
        } catch (PDOException $e) {
            $errors['general'] = "Update failed: " . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Student - Student Management System</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container container-sm">
        <header class="header">
            <div>
                <h1>Edit Student Record</h1>
                <p class="subtitle">Updating Student ID #<?= htmlspecialchars($id) ?></p>
            </div>
            <a href="index.php" class="btn btn-outline">&larr; Back to List</a>
        </header>

        <?php if (!empty($errors['general'])): ?>
            <div class="alert alert-danger"><?= htmlspecialchars($errors['general']) ?></div>
        <?php endif; ?>

        <div class="card">
            <form id="studentForm" method="POST" action="update.php?id=<?= $id ?>" novalidate>
                <div class="form-group">
                    <label for="name">Full Student Name <span class="required">*</span></label>
                    <input type="text" id="name" name="name" 
                           value="<?= htmlspecialchars($name) ?>" 
                           class="form-control <?= isset($errors['name']) ? 'is-invalid' : '' ?>" required>
                    <?php if (isset($errors['name'])): ?>
                        <span class="error-text"><?= htmlspecialchars($errors['name']) ?></span>
                    <?php endif; ?>
                </div>

                <div class="form-group">
                    <label for="reg_no">Registration Number <span class="required">*</span></label>
                    <input type="text" id="reg_no" name="reg_no" 
                           value="<?= htmlspecialchars($reg_no) ?>" 
                           class="form-control <?= isset($errors['reg_no']) ? 'is-invalid' : '' ?>" required>
                    <?php if (isset($errors['reg_no'])): ?>
                        <span class="error-text"><?= htmlspecialchars($errors['reg_no']) ?></span>
                    <?php endif; ?>
                </div>

                <div class="form-group">
                    <label for="email">Email Address <span class="required">*</span></label>
                    <input type="email" id="email" name="email" 
                           value="<?= htmlspecialchars($email) ?>" 
                           class="form-control <?= isset($errors['email']) ? 'is-invalid' : '' ?>" required>
                    <?php if (isset($errors['email'])): ?>
                        <span class="error-text"><?= htmlspecialchars($errors['email']) ?></span>
                    <?php endif; ?>
                </div>

                <div class="form-group">
                    <label for="course">Course of Study <span class="required">*</span></label>
                    <select id="course" name="course" class="form-control <?= isset($errors['course']) ? 'is-invalid' : '' ?>" required>
                        <option value="Computer Science" <?= $course === 'Computer Science' ? 'selected' : '' ?>>Computer Science</option>
                        <option value="Software Engineering" <?= $course === 'Software Engineering' ? 'selected' : '' ?>>Software Engineering</option>
                        <option value="Information Technology" <?= $course === 'Information Technology' ? 'selected' : '' ?>>Information Technology</option>
                        <option value="Data Science" <?= $course === 'Data Science' ? 'selected' : '' ?>>Data Science</option>
                        <option value="Business Information Technology" <?= $course === 'Business Information Technology' ? 'selected' : '' ?>>Business Information Technology</option>
                        <option value="Electrical Engineering" <?= $course === 'Electrical Engineering' ? 'selected' : '' ?>>Electrical Engineering</option>
                    </select>
                    <?php if (isset($errors['course'])): ?>
                        <span class="error-text"><?= htmlspecialchars($errors['course']) ?></span>
                    <?php endif; ?>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Update Changes</button>
                    <a href="index.php" class="btn btn-outline">Cancel</a>
                </div>
            </form>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
`
  },
  {
    filename: 'view.php',
    path: 'view.php',
    language: 'php',
    description: 'Detailed view card for a single student record',
    content: `<?php
/**
 * View Student Details (view.php)
 * Displays a single student profile from student_db
 */
require_once 'config/db_connect.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    header("Location: index.php");
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM students WHERE id = :id");
$stmt->execute(['id' => $id]);
$student = $stmt->fetch();

if (!$student) {
    die("Student not found.");
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Profile #<?= $student['id'] ?></title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container container-sm">
        <header class="header">
            <div>
                <h1>Student Profile</h1>
                <p class="subtitle">Record Details from MySQL (student_db)</p>
            </div>
            <a href="index.php" class="btn btn-outline">&larr; Back to List</a>
        </header>

        <div class="card profile-card">
            <div class="profile-header">
                <div class="profile-avatar">
                    <?= strtoupper(substr($student['name'], 0, 1)) ?>
                </div>
                <div>
                    <h2><?= htmlspecialchars($student['name']) ?></h2>
                    <p class="text-muted"><code><?= htmlspecialchars($student['reg_no']) ?></code></p>
                </div>
            </div>

            <div class="profile-details">
                <div class="detail-row">
                    <span class="detail-label">Database ID:</span>
                    <span class="detail-value">#<?= htmlspecialchars($student['id']) ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Registration Number:</span>
                    <span class="detail-value font-mono"><?= htmlspecialchars($student['reg_no']) ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email Address:</span>
                    <span class="detail-value"><a href="mailto:<?= htmlspecialchars($student['email']) ?>"><?= htmlspecialchars($student['email']) ?></a></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Enrolled Course:</span>
                    <span class="detail-value badge"><?= htmlspecialchars($student['course']) ?></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Registered At:</span>
                    <span class="detail-value"><?= htmlspecialchars($student['created_at']) ?></span>
                </div>
            </div>

            <div class="form-actions mt-4">
                <a href="update.php?id=<?= $student['id'] ?>" class="btn btn-primary">Edit Record</a>
                <a href="delete.php?id=<?= $student['id'] ?>" 
                   class="btn btn-danger" 
                   onclick="return confirm('Are you sure you want to delete this record?');">
                   Delete Record
                </a>
            </div>
        </div>
    </div>
</body>
</html>
`
  },
  {
    filename: 'delete.php',
    path: 'delete.php',
    language: 'php',
    description: 'Delete student record from the MySQL database with prepared statement',
    content: `<?php
/**
 * Delete Student (delete.php)
 * Removes a student record by ID using a prepared statement
 */
require_once 'config/db_connect.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id > 0) {
    try {
        $stmt = $pdo->prepare("DELETE FROM students WHERE id = :id");
        $stmt->execute(['id' => $id]);

        header("Location: index.php?msg=deleted");
        exit;
    } catch (PDOException $e) {
        die("Could not delete record: " . $e->getMessage());
    }
} else {
    header("Location: index.php");
    exit;
}
?>
`
  },
  {
    filename: 'style.css',
    path: 'style.css',
    language: 'css',
    description: 'Clean modern CSS stylesheet for the application',
    content: `/* Student Management System Stylesheet */
:root {
    --primary: #2563eb;
    --primary-hover: #1d4ed8;
    --surface: #ffffff;
    --background: #f8fafc;
    --text-primary: #0f172a;
    --text-muted: #64748b;
    --border: #e2e8f0;
    --danger: #dc2626;
    --danger-hover: #b91c1c;
    --success: #16a34a;
    --warning: #d97706;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--background);
    color: var(--text-primary);
    line-height: 1.5;
    padding: 2rem 1rem;
}

.container {
    max-width: 1100px;
    margin: 0 auto;
}

.container-sm {
    max-width: 600px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;
    flex-wrap: wrap;
}

h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
}

.subtitle {
    font-size: 0.875rem;
    color: var(--text-muted);
}

.card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
}

.filter-form {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.form-group {
    margin-bottom: 1.25rem;
}

label {
    display: block;
    margin-bottom: 0.35rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
}

.required {
    color: var(--danger);
}

.form-control {
    width: 100%;
    padding: 0.625rem 0.875rem;
    font-size: 0.95rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: #fff;
    outline: none;
    transition: border-color 0.15s ease;
}

.form-control:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-control.is-invalid {
    border-color: var(--danger);
    background-color: #fff8f8;
}

.error-text {
    display: block;
    font-size: 0.8rem;
    color: var(--danger);
    margin-top: 0.25rem;
}

.alert {
    padding: 0.875rem 1.25rem;
    border-radius: 6px;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
}

.alert-success {
    background-color: #ecfdf5;
    color: #065f46;
    border: 1px solid #a7f3d0;
}

.alert-info {
    background-color: #f0f9ff;
    color: #0369a1;
    border: 1px solid #bae6fd;
}

.alert-danger {
    background-color: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;
}

.table-responsive {
    overflow-x: auto;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
}

.student-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.925rem;
}

.student-table th,
.student-table td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border);
}

.student-table th {
    background: #f1f5f9;
    font-weight: 600;
    color: var(--text-muted);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.student-table tr:hover td {
    background-color: #f8fafc;
}

.badge {
    display: inline-block;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    background: #e0e7ff;
    color: #3730a3;
    font-weight: 500;
}

.btn {
    display: inline-block;
    padding: 0.55rem 1.25rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
}

.btn-primary {
    background: var(--primary);
    color: #fff;
}

.btn-primary:hover {
    background: var(--primary-hover);
}

.btn-secondary {
    background: #475569;
    color: #fff;
}

.btn-outline {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-primary);
}

.btn-outline:hover {
    background: #f1f5f9;
}

.btn-danger {
    background: var(--danger);
    color: #fff;
}

.btn-sm {
    padding: 0.25rem 0.6rem;
    font-size: 0.785rem;
    border-radius: 4px;
    text-decoration: none;
    display: inline-block;
    margin-right: 0.25rem;
}

.btn-info {
    background: #e0f2fe;
    color: #0369a1;
}

.btn-warning {
    background: #fef3c7;
    color: #92400e;
}

.actions-cell {
    white-space: nowrap;
}

.empty-state {
    text-align: center;
    padding: 2.5rem !important;
    color: var(--text-muted);
}

.form-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
}

.profile-card {
    text-align: left;
}

.profile-header {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border);
    margin-bottom: 1.5rem;
}

.profile-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    font-weight: bold;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f1f5f9;
}

.detail-label {
    color: var(--text-muted);
    font-weight: 500;
}

.detail-value {
    font-weight: 600;
}

.footer {
    margin-top: 2rem;
    text-align: center;
    font-size: 0.85rem;
    color: var(--text-muted);
}
`
  },
  {
    filename: 'script.js',
    path: 'script.js',
    language: 'javascript',
    description: 'Client-side input validation and dynamic confirmation handling',
    content: `/**
 * Student Registration Form Validation (script.js)
 * Ensures non-empty fields and valid email format before submission
 */

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('studentForm');

    if (!form) return;

    form.addEventListener('submit', function (e) {
        let hasError = false;

        // Clear previous error messages
        document.querySelectorAll('.error-text.client-error').forEach(el => el.remove());
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

        // 1. Validate Student Name
        const nameInput = document.getElementById('name');
        if (nameInput && nameInput.value.trim() === '') {
            showError(nameInput, 'Student name cannot be empty.');
            hasError = true;
        }

        // 2. Validate Registration Number
        const regInput = document.getElementById('reg_no');
        if (regInput && regInput.value.trim() === '') {
            showError(regInput, 'Registration number cannot be empty.');
            hasError = true;
        }

        // 3. Validate Email Address
        const emailInput = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput) {
            const emailVal = emailInput.value.trim();
            if (emailVal === '') {
                showError(emailInput, 'Email address cannot be empty.');
                hasError = true;
            } else if (!emailRegex.test(emailVal)) {
                showError(emailInput, 'Please enter a valid email address (e.g. user@domain.com).');
                hasError = true;
            }
        }

        // 4. Validate Course Selection
        const courseInput = document.getElementById('course');
        if (courseInput && courseInput.value.trim() === '') {
            showError(courseInput, 'Please select a course.');
            hasError = true;
        }

        if (hasError) {
            e.preventDefault();
        }
    });

    function showError(inputElement, message) {
        inputElement.classList.add('is-invalid');
        const span = document.createElement('span');
        span.className = 'error-text client-error';
        span.textContent = message;
        inputElement.parentNode.appendChild(span);
    }
});
`
  },
  {
    filename: 'README.md',
    path: 'README.md',
    language: 'markdown',
    description: 'Assignment setup guide & instructions for XAMPP / WampServer / LAMP',
    content: `# Student Management System (HTML, CSS, JavaScript, PHP, MySQL)

Practical Assignment: Database Integration and Full-Stack Development

---

## 📋 Features Checklist
1. ✅ **Database Creation**: Creates MySQL database \`student_db\` and table \`students\` with proper data types.
2. ✅ **Registration Form**: Captures student name, registration number, email, and course.
3. ✅ **PHP-MySQL Connection**: Secure PDO database connection with prepared statements (\`config/db_connect.php\`).
4. ✅ **Record Persistence**: Saves student records into MySQL \`students\` table.
5. ✅ **Table Display**: Displays registered students with formatting and responsive layout.
6. ✅ **Full CRUD Operations**:
   - **Add**: \`create.php\`
   - **View**: \`view.php\`
   - **Update**: \`update.php\`
   - **Delete**: \`delete.php\`
7. ✅ **Dual-Tier Validation**: Client-side JavaScript validation + server-side PHP validation (\`empty()\` & \`filter_var(..., FILTER_VALIDATE_EMAIL)\`).

---

## 🚀 Setup Instructions (XAMPP / WAMP / LAMP)

### Step 1: Place Files in Web Root
1. Open your XAMPP installation directory (usually \`C:\\xampp\\htdocs\` on Windows or \`/opt/lampp/htdocs\` on Linux).
2. Create a folder named \`student_management\`.
3. Copy all project files into this folder:
   - \`config/db_connect.php\`
   - \`database/schema.sql\`
   - \`index.php\`
   - \`create.php\`
   - \`view.php\`
   - \`update.php\`
   - \`delete.php\`
   - \`style.css\`
   - \`script.js\`

### Step 2: Start Apache and MySQL
1. Launch **XAMPP Control Panel**.
2. Click **Start** for both **Apache** and **MySQL**.

### Step 3: Import the Database
1. Open your browser and navigate to \`http://localhost/phpmyadmin\`.
2. Click the **Import** tab at the top.
3. Choose the \`schema.sql\` file from your project folder.
4. Click **Go** to create the \`student_db\` database and \`students\` table.

### Step 4: Run the Application
Open your browser and navigate to:
\`\`\`
http://localhost/student_management/index.php
\`\`\`
`
  }
];
