import React from 'react';
import { Users, GraduationCap, Database, FileSpreadsheet, Download, RefreshCw } from 'lucide-react';
import { Student } from '../types/student';

interface StatsCardsProps {
  students: Student[];
  onExportSQL: () => void;
  onExportCSV: () => void;
  onResetDB: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  students,
  onExportSQL,
  onExportCSV,
  onResetDB
}) => {
  const distinctCourses = new Set(students.map(s => s.course)).size;
  const latestStudent = students[0];

  return (
    <div className="space-y-4 mb-6">
      {/* Top Banner with clean info & export actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Management System
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Database: <span className="font-mono text-slate-700 font-semibold">student_db</span>
            <span className="mx-2" aria-hidden="true">&middot;</span>
            Table: <span className="font-mono text-slate-700 font-semibold">students</span>
            <span className="mx-2" aria-hidden="true">&middot;</span>
            Engine: <span className="text-slate-600">MySQL / PHP PDO</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onExportSQL}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            title="Download full SQL dump ready for phpMyAdmin"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export student_db.sql</span>
          </button>

          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            title="Export records to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onResetDB}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            title="Reset database to initial seed data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset DB</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">Total Enrolled</p>
            <p className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {students.length}
            </p>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              Active student records
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">Academic Courses</p>
            <p className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {distinctCourses}
            </p>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              Distinct study programs
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">MySQL Connection</p>
            <p className="text-base font-bold text-slate-900 truncate font-mono">
              student_db
            </p>
            <p className="text-xs text-emerald-600 font-medium truncate mt-0.5">
              PDO Connected (port 3306)
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-violet-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">Latest Registered</p>
            <p className="text-base font-bold text-slate-900 truncate font-mono">
              {latestStudent ? latestStudent.reg_no : 'None'}
            </p>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {latestStudent ? latestStudent.name : 'No records yet'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
