import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, Edit3, Trash2, UserPlus, ArrowUpDown, X, Mail, BookOpen } from 'lucide-react';
import { Student } from '../types/student';

interface StudentListProps {
  students: Student[];
  onViewStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (student: Student) => void;
  onOpenRegister: () => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
  onOpenRegister
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [sortField, setSortField] = useState<'id' | 'name' | 'reg_no' | 'created_at'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Available courses from current students
  const availableCourses = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.course) set.add(s.course);
    });
    return Array.from(set).sort();
  }, [students]);

  // Filter & sort
  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        const matchesSearch =
          searchQuery.trim() === '' ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.reg_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.course.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCourse = selectedCourse === 'ALL' || s.course === selectedCourse;

        return matchesSearch && matchesCourse;
      })
      .sort((a, b) => {
        let valA: string | number = a[sortField];
        let valB: string | number = b[sortField];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB as string).toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [students, searchQuery, selectedCourse, sortField, sortOrder]);

  const toggleSort = (field: 'id' | 'name' | 'reg_no' | 'created_at') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'name' || field === 'reg_no' ? 'asc' : 'desc');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCourse('ALL');
  };

  const isFiltered = searchQuery !== '' || selectedCourse !== 'ALL';

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      {/* Controls & Filter Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by student name, reg number, or email..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Course:</span>
          </div>
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Courses ({students.length})</option>
            {availableCourses.map(course => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>

          {isFiltered && (
            <button
              onClick={clearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1.5 hover:bg-indigo-50 rounded-md transition-colors"
            >
              Clear Filters
            </button>
          )}

          <div className="h-4 w-px bg-slate-200 hidden sm:block mx-1" />

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-mono tabular-nums text-slate-800 font-semibold">{filteredStudents.length}</span> of <span className="font-mono tabular-nums text-slate-800 font-semibold">{students.length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4 w-16">
                <button
                  onClick={() => toggleSort('id')}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <span># ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-4 min-w-[200px]">
                <button
                  onClick={() => toggleSort('name')}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <span>Student Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-4 min-w-[140px]">
                <button
                  onClick={() => toggleSort('reg_no')}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <span>Reg Number</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-4 min-w-[190px]">Email Address</th>
              <th className="py-3 px-4 min-w-[180px]">Course Program</th>
              <th className="py-3 px-4 min-w-[130px]">
                <button
                  onClick={() => toggleSort('created_at')}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <span>Registered Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-4 text-right min-w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/75 transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-slate-500">
                    #{student.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {student.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
                      {student.reg_no}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-700 text-xs font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{student.course}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-slate-500">
                    {student.created_at.slice(0, 10)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onViewStudent(student)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                        title="View student profile"
                        aria-label="View student profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditStudent(student)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                        title="Edit student record"
                        aria-label="Edit student record"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteStudent(student)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        title="Delete student record"
                        aria-label="Delete student record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 px-4 text-center">
                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {isFiltered ? 'No matching students found' : 'No student records in database'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {isFiltered
                          ? 'Try adjusting your search criteria or clearing filters.'
                          : 'Get started by creating your first student record in student_db.'}
                      </p>
                    </div>
                    {isFiltered ? (
                      <button
                        onClick={clearFilters}
                        className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
                      >
                        Clear All Filters
                      </button>
                    ) : (
                      <button
                        onClick={onOpenRegister}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Register First Student</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count indicator */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
        <div>
          Connected to table: <code className="font-mono text-slate-700">students</code> in <code className="font-mono text-slate-700">student_db</code>
        </div>
        <div className="font-mono tabular-nums">
          Total: {filteredStudents.length} record{filteredStudents.length === 1 ? '' : 's'}
        </div>
      </div>
    </div>
  );
};
