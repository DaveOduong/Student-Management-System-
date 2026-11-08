import { Student } from '../types/student';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 1,
    name: 'David Omondi',
    reg_no: 'REG/2026/001',
    email: 'david.omondi@university.edu',
    course: 'Computer Science',
    created_at: '2026-09-10 09:15:22'
  },
  {
    id: 2,
    name: 'Amina Hassan',
    reg_no: 'REG/2026/004',
    email: 'amina.hassan@university.edu',
    course: 'Software Engineering',
    created_at: '2026-09-11 11:24:08'
  },
  {
    id: 3,
    name: 'Carlos Mendez',
    reg_no: 'REG/2026/012',
    email: 'carlos.mendez@university.edu',
    course: 'Information Technology',
    created_at: '2026-09-14 14:02:45'
  },
  {
    id: 4,
    name: 'Sarah Jenkins',
    reg_no: 'REG/2026/018',
    email: 'sarah.jenkins@university.edu',
    course: 'Data Science',
    created_at: '2026-09-18 10:45:19'
  },
  {
    id: 5,
    name: 'Kelvin Kiprop',
    reg_no: 'REG/2026/025',
    email: 'kelvin.k@university.edu',
    course: 'Business Information Technology',
    created_at: '2026-09-22 16:30:00'
  },
  {
    id: 6,
    name: 'Emily Chen',
    reg_no: 'REG/2026/031',
    email: 'emily.chen@university.edu',
    course: 'Computer Science',
    created_at: '2026-09-28 08:50:12'
  }
];

export const POPULAR_COURSES = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Data Science',
  'Business Information Technology',
  'Cybersecurity & Networks',
  'Electrical & Electronics Engineering'
];
