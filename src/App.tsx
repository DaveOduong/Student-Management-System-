import React, { useState, useEffect } from 'react';
import { DatabaseEngine } from './services/dbEngine';
import { Student, StudentFormData, ActiveTab, SQLExecutionLog } from './types/student';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { StudentList } from './components/StudentList';
import { StudentFormModal } from './components/StudentFormModal';
import { StudentViewModal } from './components/StudentViewModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { DatabaseConsole } from './components/DatabaseConsole';
import { PhpCodeViewer } from './components/PhpCodeViewer';
import { AssignmentRubric } from './components/AssignmentRubric';
import { downloadProjectZip, downloadSQLDump, downloadCSV } from './utils/zipExport';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const db = DatabaseEngine.getInstance();
  const [students, setStudents] = useState<Student[]>(db.getStudents());
  const [logs, setLogs] = useState<SQLExecutionLog[]>(db.getLogs());
  const [activeTab, setActiveTab] = useState<ActiveTab>('system');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setStudents(db.getStudents());
      setLogs(db.getLogs());
    });
    return unsubscribe;
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // CRUD Handlers
  const handleOpenRegister = () => {
    setFormMode('create');
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setFormMode('edit');
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleOpenView = (student: Student) => {
    setViewingStudent(student);
    setIsViewOpen(true);
  };

  const handleOpenDelete = (student: Student) => {
    setDeletingStudent(student);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = (data: StudentFormData) => {
    if (formMode === 'create') {
      const res = db.addStudent(data);
      if (res.success && res.student) {
        showToast(`Student ${res.student.name} (${res.student.reg_no}) registered into student_db.`);
        return { success: true };
      }
      return { success: false, errors: res.errors };
    } else if (editingStudent) {
      const res = db.updateStudent(editingStudent.id, data);
      if (res.success && res.student) {
        showToast(`Student #${res.student.id} ${res.student.name} updated successfully.`);
        return { success: true };
      }
      return { success: false, errors: res.errors };
    }
    return { success: false };
  };

  const handleConfirmDelete = () => {
    if (!deletingStudent) return;
    const res = db.deleteStudent(deletingStudent.id);
    if (res.success && res.deletedStudent) {
      showToast(`Student ${res.deletedStudent.name} (${res.deletedStudent.reg_no}) deleted from database.`, 'info');
    }
    setIsDeleteOpen(false);
    setDeletingStudent(null);
  };

  const handleResetDB = () => {
    if (window.confirm('Reset student_db to initial sample records? This will restore seed records.')) {
      db.resetDatabase();
      showToast('Database student_db reset to initial seed state.');
    }
  };

  const handleExportSQL = () => {
    const dump = db.generateSQLDump();
    downloadSQLDump(dump);
    showToast('Downloaded student_db.sql export.');
  };

  const handleExportCSV = () => {
    const csv = db.generateCSV();
    downloadCSV(csv);
    showToast('Downloaded students_export.csv.');
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      await downloadProjectZip();
      showToast('Downloaded complete PHP & MySQL assignment project ZIP!');
    } catch (e) {
      console.error(e);
      showToast('Failed to generate ZIP archive', 'error');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenRegister={handleOpenRegister}
        onDownloadZip={handleDownloadZip}
        studentCount={students.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'system' && (
          <div className="space-y-6">
            <StatsCards
              students={students}
              onExportSQL={handleExportSQL}
              onExportCSV={handleExportCSV}
              onResetDB={handleResetDB}
            />

            <StudentList
              students={students}
              onViewStudent={handleOpenView}
              onEditStudent={handleOpenEdit}
              onDeleteStudent={handleOpenDelete}
              onOpenRegister={handleOpenRegister}
            />
          </div>
        )}

        {activeTab === 'database' && (
          <DatabaseConsole
            logs={logs}
            onClearLogs={() => db.clearLogs()}
            onResetDB={handleResetDB}
          />
        )}

        {activeTab === 'code' && (
          <PhpCodeViewer
            onDownloadZip={handleDownloadZip}
            isDownloadingZip={isDownloadingZip}
          />
        )}

        {activeTab === 'rubric' && (
          <AssignmentRubric
            students={students}
            onOpenRegister={handleOpenRegister}
            onGoToDatabase={() => setActiveTab('database')}
            onGoToCode={() => setActiveTab('code')}
            onGoToDashboard={() => setActiveTab('system')}
          />
        )}
      </main>

      {/* Modals */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingStudent}
        mode={formMode}
      />

      <StudentViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        student={viewingStudent}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingStudent(null);
        }}
        onConfirm={handleConfirmDelete}
        student={deletingStudent}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-3 max-w-md text-xs">
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="flex-1 font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-1">
          <p>
            Student Management System &bull; Database Integration Practical Assignment &bull; MySQL &amp; PHP PDO
          </p>
          <p className="text-slate-400">
            Database: <span className="font-mono text-slate-600">student_db</span> &bull; Table: <span className="font-mono text-slate-600">students</span> &bull; Validated: HTML5, CSS3, ES6 JavaScript, PHP 8+
          </p>
        </div>
      </footer>
    </div>
  );
}
