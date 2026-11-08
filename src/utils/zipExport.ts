import JSZip from 'jszip';
import { PHP_CODE_FILES } from '../data/phpCodeFiles';

export async function downloadProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root folder in the zip
  const folder = zip.folder('student_management_system');
  if (!folder) return;

  // Add all files
  PHP_CODE_FILES.forEach(file => {
    folder.file(file.path, file.content);
    // Also add root level copies of key files for convenience
    if (file.filename === 'schema.sql') {
      folder.file('schema.sql', file.content);
    }
  });

  // Generate zip file as blob
  const content = await zip.generateAsync({ type: 'blob' });

  // Trigger download
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'student_management_system_php_mysql.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadSQLDump(sqlContent: string): void {
  const blob = new Blob([sqlContent], { type: 'application/sql' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'student_db.sql';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCSV(csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'students_export.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
