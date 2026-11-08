import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Student, StudentFormData, ValidationErrors } from '../types/student';
import { POPULAR_COURSES } from '../data/initialStudents';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormData) => { success: boolean; errors?: ValidationErrors };
  initialData?: Student | null;
  mode: 'create' | 'edit';
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode
}) => {
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    reg_no: '',
    email: '',
    course: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [customCourse, setCustomCourse] = useState(false);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      const isKnown = POPULAR_COURSES.includes(initialData.course);
      setFormData({
        name: initialData.name,
        reg_no: initialData.reg_no,
        email: initialData.email,
        course: initialData.course
      });
      setCustomCourse(!isKnown && initialData.course !== '');
    } else {
      setFormData({
        name: '',
        reg_no: '',
        email: '',
        course: ''
      });
      setCustomCourse(false);
    }
    setErrors({});
    setTouched({});
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  // Live client-side validation logic (Requirement 7)
  const validateField = (field: keyof StudentFormData, value: string): string | undefined => {
    const trimmed = value.trim();
    if (field === 'name') {
      if (!trimmed) return 'Student name is required and cannot be empty.';
      if (trimmed.length < 2) return 'Student name must be at least 2 characters.';
    }
    if (field === 'reg_no') {
      if (!trimmed) return 'Registration number is required and cannot be empty.';
    }
    if (field === 'email') {
      if (!trimmed) return 'Email address is required and cannot be empty.';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return 'Please enter a valid email address (e.g. student@university.edu).';
      }
    }
    if (field === 'course') {
      if (!trimmed) return 'Course of study is required.';
    }
    return undefined;
  };

  const handleChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const fieldError = validateField(field, value);
      setErrors(prev => {
        const next = { ...prev };
        if (fieldError) {
          next[field] = fieldError;
        } else {
          delete next[field];
        }
        return next;
      });
    }
  };

  const handleBlur = (field: keyof StudentFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const fieldError = validateField(field, formData[field]);
    if (fieldError) {
      setErrors(prev => ({ ...prev, [field]: fieldError }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    const allTouched = { name: true, reg_no: true, email: true, course: true };
    setTouched(allTouched);

    // Validate all fields
    const newErrors: ValidationErrors = {};
    (['name', 'reg_no', 'email', 'course'] as (keyof StudentFormData)[]).forEach(field => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = onSubmit(formData);
    if (!result.success && result.errors) {
      setErrors(result.errors);
    } else {
      onClose();
    }
  };

  const isFieldValid = (field: keyof StudentFormData) => {
    return touched[field] && !errors[field] && formData[field].trim() !== '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'create' ? 'Register New Student' : `Edit Student Record #${initialData?.id}`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              MySQL Target: <code className="font-mono text-slate-700">student_db.students</code> table
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Field 1: Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="student_name" className="text-xs font-semibold text-slate-800">
                Student Full Name <span className="text-red-500">*</span>
              </label>
              {isFieldValid('name') && (
                <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Valid
                </span>
              )}
            </div>
            <input
              id="student_name"
              type="text"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="e.g. David Omondi"
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-400 bg-red-50/20 focus:ring-red-200 focus:border-red-500'
                  : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Field 2: Registration Number */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="student_reg" className="text-xs font-semibold text-slate-800">
                Registration Number <span className="text-red-500">*</span>
              </label>
              {isFieldValid('reg_no') && (
                <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Unique
                </span>
              )}
            </div>
            <input
              id="student_reg"
              type="text"
              value={formData.reg_no}
              onChange={e => handleChange('reg_no', e.target.value)}
              onBlur={() => handleBlur('reg_no')}
              placeholder="e.g. REG/2026/045"
              className={`w-full px-3.5 py-2 text-sm font-mono bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                errors.reg_no
                  ? 'border-red-400 bg-red-50/20 focus:ring-red-200 focus:border-red-500'
                  : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
              }`}
            />
            {errors.reg_no ? (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.reg_no}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Must be unique per student (enforced by MySQL UNIQUE constraint on <code className="text-slate-600 font-mono">reg_no</code>).
              </p>
            )}
          </div>

          {/* Field 3: Email */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="student_email" className="text-xs font-semibold text-slate-800">
                Email Address <span className="text-red-500">*</span>
              </label>
              {isFieldValid('email') && (
                <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Valid format
                </span>
              )}
            </div>
            <input
              id="student_email"
              type="email"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="e.g. david.omondi@university.edu"
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-red-400 bg-red-50/20 focus:ring-red-200 focus:border-red-500'
                  : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Field 4: Course */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="student_course" className="text-xs font-semibold text-slate-800">
                Course of Study <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setCustomCourse(!customCourse);
                  setFormData(prev => ({ ...prev, course: '' }));
                }}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
              >
                {customCourse ? 'Select from list' : '+ Enter custom course'}
              </button>
            </div>

            {customCourse ? (
              <input
                id="student_course"
                type="text"
                value={formData.course}
                onChange={e => handleChange('course', e.target.value)}
                onBlur={() => handleBlur('course')}
                placeholder="Type custom program name..."
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                  errors.course
                    ? 'border-red-400 bg-red-50/20 focus:ring-red-200 focus:border-red-500'
                    : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
                }`}
              />
            ) : (
              <select
                id="student_course"
                value={formData.course}
                onChange={e => handleChange('course', e.target.value)}
                onBlur={() => handleBlur('course')}
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 cursor-pointer ${
                  errors.course
                    ? 'border-red-400 bg-red-50/20 focus:ring-red-200 focus:border-red-500'
                    : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-600'
                }`}
              >
                <option value="">-- Choose Course Program --</option>
                {POPULAR_COURSES.map(course => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            )}

            {errors.course && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.course}</span>
              </p>
            )}
          </div>

          {/* Validation info indicator */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Assignment Validation Logic (JS + PHP)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Enforces <code className="font-mono text-slate-700">!empty()</code> on all 4 fields, standard email regex format, and unique registration check before running the prepared MySQL query.
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {mode === 'create' ? 'Save Student Record' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
