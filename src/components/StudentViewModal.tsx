import React from 'react';
import { X, Edit3, Trash2, Mail, BookOpen, Hash, Calendar, Copy, Check } from 'lucide-react';
import { Student } from '../types/student';

interface StudentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export const StudentViewModal: React.FC<StudentViewModalProps> = ({
  isOpen,
  onClose,
  student,
  onEdit,
  onDelete
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !student) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `Name: ${student.name}\nReg No: ${student.reg_no}\nEmail: ${student.email}\nCourse: ${student.course}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-slate-500">
              Record #{student.id}
            </span>
            <span aria-hidden="true" className="text-slate-300">&middot;</span>
            <span className="text-xs text-slate-500">MySQL: student_db</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl uppercase shadow-xs shrink-0">
              {student.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900 truncate">
                {student.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                  {student.reg_no}
                </span>
                <button
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Copy student record"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 divide-y divide-slate-200/60 text-xs">
            <div className="py-2.5 flex items-center justify-between first:pt-0">
              <div className="flex items-center gap-2 text-slate-500">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>Email Address</span>
              </div>
              <a
                href={`mailto:${student.email}`}
                className="font-medium text-indigo-600 hover:underline truncate max-w-[200px]"
              >
                {student.email}
              </a>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>Academic Course</span>
              </div>
              <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
                {student.course}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Hash className="w-4 h-4 text-slate-400" />
                <span>Database Primary Key</span>
              </div>
              <span className="font-mono tabular-nums text-slate-700 font-semibold">
                id = {student.id}
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between last:pb-0">
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Registration Date</span>
              </div>
              <span className="font-mono tabular-nums text-slate-700">
                {student.created_at}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                onClose();
                onDelete(student);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Record</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  onEdit(student);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Student</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
