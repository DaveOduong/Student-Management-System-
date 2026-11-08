import { Student, StudentFormData, ValidationErrors, SQLExecutionLog } from '../types/student';
import { INITIAL_STUDENTS } from '../data/initialStudents';

const STORAGE_KEY = 'student_db_students_v1';
const LOGS_KEY = 'student_db_sql_logs_v1';

export class DatabaseEngine {
  private static instance: DatabaseEngine;
  private students: Student[] = [];
  private logs: SQLExecutionLog[] = [];
  private listeners: (() => void)[] = [];

  private constructor() {
    this.loadState();
  }

  public static getInstance(): DatabaseEngine {
    if (!DatabaseEngine.instance) {
      DatabaseEngine.instance = new DatabaseEngine();
    }
    return DatabaseEngine.instance;
  }

  private loadState(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.students = JSON.parse(saved);
      } else {
        this.students = [...INITIAL_STUDENTS];
        this.saveStudents();
        this.logQuery('CREATE DATABASE IF NOT EXISTS student_db;', 'DDL', 0, 1.2);
        this.logQuery(
          'CREATE TABLE IF NOT EXISTS students (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), reg_no VARCHAR(50) UNIQUE, email VARCHAR(100), course VARCHAR(100), created_at TIMESTAMP);',
          'DDL',
          0,
          2.4
        );
        this.logQuery(`INSERT INTO students VALUES (... ${this.students.length} seed rows ...);`, 'INSERT', this.students.length, 3.1);
      }

      const savedLogs = localStorage.getItem(LOGS_KEY);
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs);
      }
    } catch {
      this.students = [...INITIAL_STUDENTS];
    }
  }

  private saveStudents(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.students));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
    this.notify();
  }

  private saveLogs(): void {
    try {
      // Keep latest 100 queries
      const trimmed = this.logs.slice(0, 100);
      localStorage.setItem(LOGS_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to save logs', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }

  public getStudents(): Student[] {
    return [...this.students];
  }

  public getStudentById(id: number): Student | undefined {
    return this.students.find(s => s.id === id);
  }

  public getLogs(): SQLExecutionLog[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
    this.saveLogs();
    this.notify();
  }

  public logQuery(
    query: string,
    type: SQLExecutionLog['type'],
    affectedRows = 0,
    durationMs = 1.5,
    status: 'SUCCESS' | 'ERROR' = 'SUCCESS',
    errorMessage?: string
  ): void {
    const log: SQLExecutionLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      query: query.trim(),
      type,
      affectedRows,
      durationMs: parseFloat(durationMs.toFixed(2)),
      status,
      errorMessage
    };
    this.logs.unshift(log);
    this.saveLogs();
    this.notify();
  }

  public validate(data: StudentFormData, excludeId?: number): { isValid: boolean; errors: ValidationErrors } {
    const errors: ValidationErrors = {};

    // 1. Name validation
    if (!data.name || !data.name.trim()) {
      errors.name = 'Student name is required and cannot be empty.';
    } else if (data.name.trim().length < 2) {
      errors.name = 'Student name must contain at least 2 characters.';
    }

    // 2. Reg No validation
    if (!data.reg_no || !data.reg_no.trim()) {
      errors.reg_no = 'Registration number is required and cannot be empty.';
    } else {
      const trimmedReg = data.reg_no.trim();
      const duplicate = this.students.find(
        s => s.reg_no.toLowerCase() === trimmedReg.toLowerCase() && s.id !== excludeId
      );
      if (duplicate) {
        errors.reg_no = `Registration number '${trimmedReg}' is already registered (Student #${duplicate.id}).`;
      }
    }

    // 3. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !data.email.trim()) {
      errors.email = 'Email address is required and cannot be empty.';
    } else if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Please provide a valid email address (e.g. name@university.edu).';
    }

    // 4. Course validation
    if (!data.course || !data.course.trim()) {
      errors.course = 'Course selection is required.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  public addStudent(data: StudentFormData): { success: boolean; student?: Student; errors?: ValidationErrors } {
    const validation = this.validate(data);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const nextId = this.students.length > 0 ? Math.max(...this.students.map(s => s.id)) + 1 : 1;
    const now = new Date();
    const formattedDate = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`;

    const newStudent: Student = {
      id: nextId,
      name: data.name.trim(),
      reg_no: data.reg_no.trim(),
      email: data.email.trim(),
      course: data.course.trim(),
      created_at: formattedDate
    };

    this.students.unshift(newStudent);
    this.saveStudents();

    // Log the exact PDO prepared statement
    const sql = `INSERT INTO students (name, reg_no, email, course, created_at) VALUES ('${newStudent.name.replace(/'/g, "''")}', '${newStudent.reg_no.replace(/'/g, "''")}', '${newStudent.email.replace(/'/g, "''")}', '${newStudent.course.replace(/'/g, "''")}', NOW());`;
    this.logQuery(sql, 'INSERT', 1, 2.1);

    return { success: true, student: newStudent };
  }

  public updateStudent(id: number, data: StudentFormData): { success: boolean; student?: Student; errors?: ValidationErrors } {
    const existingIndex = this.students.findIndex(s => s.id === id);
    if (existingIndex === -1) {
      return { success: false, errors: { general: `Student #${id} not found.` } };
    }

    const validation = this.validate(data, id);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const updated: Student = {
      ...this.students[existingIndex],
      name: data.name.trim(),
      reg_no: data.reg_no.trim(),
      email: data.email.trim(),
      course: data.course.trim()
    };

    this.students[existingIndex] = updated;
    this.saveStudents();

    const sql = `UPDATE students SET name = '${updated.name.replace(/'/g, "''")}', reg_no = '${updated.reg_no.replace(/'/g, "''")}', email = '${updated.email.replace(/'/g, "''")}', course = '${updated.course.replace(/'/g, "''")}' WHERE id = ${id};`;
    this.logQuery(sql, 'UPDATE', 1, 1.8);

    return { success: true, student: updated };
  }

  public deleteStudent(id: number): { success: boolean; deletedStudent?: Student } {
    const student = this.students.find(s => s.id === id);
    if (!student) {
      return { success: false };
    }

    this.students = this.students.filter(s => s.id !== id);
    this.saveStudents();

    const sql = `DELETE FROM students WHERE id = ${id};`;
    this.logQuery(sql, 'DELETE', 1, 1.4);

    return { success: true, deletedStudent: student };
  }

  public resetDatabase(): void {
    this.students = [...INITIAL_STUDENTS];
    this.saveStudents();
    this.logQuery('DROP TABLE IF EXISTS students;', 'DDL', 0, 1.1);
    this.logQuery(
      'CREATE TABLE students (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), reg_no VARCHAR(50) UNIQUE, email VARCHAR(100), course VARCHAR(100), created_at TIMESTAMP);',
      'DDL',
      0,
      2.3
    );
    this.logQuery(`INSERT INTO students (name, reg_no, email, course, created_at) VALUES ... [${this.students.length} seed rows re-populated];`, 'INSERT', this.students.length, 3.4);
  }

  public runQuery(rawSql: string): {
    columns: string[];
    rows: (string | number)[][];
    message?: string;
    affectedRows?: number;
    error?: string;
  } {
    const startTime = performance.now();
    const query = rawSql.trim();
    const upper = query.toUpperCase();

    if (!query) {
      return { columns: [], rows: [], error: 'Query cannot be empty.' };
    }

    try {
      if (upper.startsWith('SHOW DATABASES')) {
        const duration = performance.now() - startTime;
        this.logQuery(query, 'SELECT', 1, duration);
        return {
          columns: ['Database'],
          rows: [['student_db'], ['information_schema'], ['performance_schema'], ['mysql']]
        };
      }

      if (upper.startsWith('SHOW TABLES')) {
        const duration = performance.now() - startTime;
        this.logQuery(query, 'SELECT', 1, duration);
        return {
          columns: ['Tables_in_student_db'],
          rows: [['students']]
        };
      }

      if (upper.startsWith('DESCRIBE') || upper.startsWith('DESC')) {
        const duration = performance.now() - startTime;
        this.logQuery(query, 'SELECT', 6, duration);
        return {
          columns: ['Field', 'Type', 'Null', 'Key', 'Default', 'Extra'],
          rows: [
            ['id', 'int(11)', 'NO', 'PRI', 'NULL', 'auto_increment'],
            ['name', 'varchar(100)', 'NO', '', 'NULL', ''],
            ['reg_no', 'varchar(50)', 'NO', 'UNI', 'NULL', ''],
            ['email', 'varchar(100)', 'NO', '', 'NULL', ''],
            ['course', 'varchar(100)', 'NO', '', 'NULL', ''],
            ['created_at', 'timestamp', 'NO', '', 'current_timestamp()', '']
          ]
        };
      }

      if (upper.startsWith('SELECT')) {
        let results = [...this.students];

        // Simple GROUP BY course
        if (upper.includes('GROUP BY COURSE')) {
          const map = new Map<string, number>();
          this.students.forEach(s => {
            map.set(s.course, (map.get(s.course) || 0) + 1);
          });
          const rows: (string | number)[][] = [];
          map.forEach((count, course) => {
            rows.push([course, count]);
          });
          const duration = performance.now() - startTime;
          this.logQuery(query, 'SELECT', rows.length, duration);
          return {
            columns: ['course', 'COUNT(*)'],
            rows
          };
        }

        // Simple COUNT(*)
        if (upper.includes('COUNT(*)')) {
          const duration = performance.now() - startTime;
          this.logQuery(query, 'SELECT', 1, duration);
          return {
            columns: ['COUNT(*)'],
            rows: [[this.students.length]]
          };
        }

        // Course filter in query
        const courseMatch = query.match(/course\s*=\s*['"]([^'"]+)['"]/i);
        if (courseMatch) {
          const targetCourse = courseMatch[1];
          results = results.filter(s => s.course.toLowerCase() === targetCourse.toLowerCase());
        }

        // Limit match
        const limitMatch = query.match(/LIMIT\s+(\d+)/i);
        if (limitMatch) {
          results = results.slice(0, parseInt(limitMatch[1], 10));
        }

        const columns = ['id', 'name', 'reg_no', 'email', 'course', 'created_at'];
        const rows = results.map(s => [s.id, s.name, s.reg_no, s.email, s.course, s.created_at]);

        const duration = performance.now() - startTime;
        this.logQuery(query, 'SELECT', rows.length, duration);

        return {
          columns,
          rows,
          message: `${rows.length} row(s) in set (${(duration / 1000).toFixed(3)} sec)`
        };
      }

      if (upper.startsWith('DELETE')) {
        const idMatch = query.match(/id\s*=\s*(\d+)/i);
        if (idMatch) {
          const id = parseInt(idMatch[1], 10);
          const initialLen = this.students.length;
          this.students = this.students.filter(s => s.id !== id);
          const affected = initialLen - this.students.length;
          this.saveStudents();
          const duration = performance.now() - startTime;
          this.logQuery(query, 'DELETE', affected, duration);
          return {
            columns: ['Status'],
            rows: [[`Query OK, ${affected} row affected (${(duration / 1000).toFixed(3)} sec)`]],
            affectedRows: affected
          };
        } else {
          const duration = performance.now() - startTime;
          this.logQuery(query, 'DELETE', 0, duration, 'ERROR', 'DELETE without specific ID restricted in demo');
          return {
            columns: [],
            rows: [],
            error: 'For safety, please provide WHERE id = ? in DELETE query'
          };
        }
      }

      // Default mock success for other queries
      const duration = performance.now() - startTime;
      this.logQuery(query, 'DDL', 0, duration);
      return {
        columns: ['Status'],
        rows: [[`Query OK, 0 rows affected (${(duration / 1000).toFixed(3)} sec)`]]
      };
    } catch (err: any) {
      const duration = performance.now() - startTime;
      const msg = err.message || 'SQL execution error';
      this.logQuery(query, 'SELECT', 0, duration, 'ERROR', msg);
      return { columns: [], rows: [], error: msg };
    }
  }

  public generateSQLDump(): string {
    const timestamp = new Date().toISOString();
    let sql = `-- =======================================================
-- Student Management System (student_db) Dump
-- Generation Time: ${timestamp}
-- PHP & MySQL Practical Assignment Export
-- =======================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Database: \`student_db\`
CREATE DATABASE IF NOT EXISTS \`student_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`student_db\`;

-- --------------------------------------------------------

-- Table structure for table \`students\`
DROP TABLE IF EXISTS \`students\`;
CREATE TABLE IF NOT EXISTS \`students\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(100) NOT NULL,
  \`reg_no\` varchar(50) NOT NULL,
  \`email\` varchar(100) NOT NULL,
  \`course\` varchar(100) NOT NULL,
  \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`reg_no_unique\` (\`reg_no\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Dumping data for table \`students\`
`;

    if (this.students.length > 0) {
      sql += `INSERT INTO \`students\` (\`id\`, \`name\`, \`reg_no\`, \`email\`, \`course\`, \`created_at\`) VALUES\n`;
      const rows = this.students.map(s => {
        const safeName = s.name.replace(/'/g, "''");
        const safeReg = s.reg_no.replace(/'/g, "''");
        const safeEmail = s.email.replace(/'/g, "''");
        const safeCourse = s.course.replace(/'/g, "''");
        return `(${s.id}, '${safeName}', '${safeReg}', '${safeEmail}', '${safeCourse}', '${s.created_at}')`;
      });
      sql += rows.join(',\n') + ';\n';
    }

    sql += `\nCOMMIT;\n`;
    return sql;
  }

  public generateCSV(): string {
    const header = ['ID', 'Student Name', 'Registration Number', 'Email', 'Course', 'Registered Date'];
    const rows = this.students.map(s => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.reg_no.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      `"${s.course.replace(/"/g, '""')}"`,
      `"${s.created_at}"`
    ]);
    return [header.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
