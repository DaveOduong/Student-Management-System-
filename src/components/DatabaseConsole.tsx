import React, { useState } from 'react';
import { Database, Play, Terminal, History, RotateCcw, Table, CheckCircle2, AlertCircle } from 'lucide-react';
import { DatabaseEngine } from '../services/dbEngine';
import { SQLExecutionLog } from '../types/student';

interface DatabaseConsoleProps {
  logs: SQLExecutionLog[];
  onClearLogs: () => void;
  onResetDB: () => void;
}

export const DatabaseConsole: React.FC<DatabaseConsoleProps> = ({
  logs,
  onClearLogs,
  onResetDB
}) => {
  const [queryInput, setQueryInput] = useState('SELECT * FROM students ORDER BY id DESC LIMIT 10;');
  const [queryResult, setQueryResult] = useState<{
    columns: string[];
    rows: (string | number)[][];
    message?: string;
    error?: string;
  } | null>(null);

  const db = DatabaseEngine.getInstance();

  const handleRunQuery = (customSql?: string) => {
    const sqlToRun = customSql || queryInput;
    const result = db.runQuery(sqlToRun);
    setQueryResult(result);
  };

  const sampleQueries = [
    { label: 'All Students', query: 'SELECT * FROM students ORDER BY id DESC;' },
    { label: 'Group by Course', query: 'SELECT course, COUNT(*) FROM students GROUP BY course;' },
    { label: 'Count Records', query: 'SELECT COUNT(*) FROM students;' },
    { label: 'Describe Table', query: 'DESCRIBE students;' },
    { label: 'Show Tables', query: 'SHOW TABLES;' },
    { label: 'Show Databases', query: 'SHOW DATABASES;' }
  ];

  return (
    <div className="space-y-6">
      {/* DB Overview Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                MySQL Database Inspector &amp; Query Console
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Database: <span className="font-mono text-slate-800 font-semibold">student_db</span>
                <span className="mx-2">&middot;</span>
                Active Table: <span className="font-mono text-slate-800 font-semibold">students</span>
                <span className="mx-2">&middot;</span>
                Host: <span className="font-mono text-slate-600">localhost:3306</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetDB}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset to Seed Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Schema Architecture */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Table Schema: <code className="font-mono text-indigo-600">students</code>
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">ENGINE=InnoDB DEFAULT CHARSET=utf8mb4</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Field</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Null</th>
                <th className="py-2.5 px-4">Key</th>
                <th className="py-2.5 px-4">Default</th>
                <th className="py-2.5 px-4">Extra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/60">
                <td className="py-2 px-4 font-bold text-indigo-600">id</td>
                <td className="py-2 px-4">INT(11)</td>
                <td className="py-2 px-4 text-red-500">NO</td>
                <td className="py-2 px-4 text-amber-600 font-bold">PRI</td>
                <td className="py-2 px-4 text-slate-400">NULL</td>
                <td className="py-2 px-4 text-slate-500">AUTO_INCREMENT</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2 px-4 font-bold text-slate-800">name</td>
                <td className="py-2 px-4">VARCHAR(100)</td>
                <td className="py-2 px-4 text-red-500">NO</td>
                <td className="py-2 px-4 text-slate-400">-</td>
                <td className="py-2 px-4 text-slate-400">NULL</td>
                <td className="py-2 px-4 text-slate-400">-</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2 px-4 font-bold text-slate-800">reg_no</td>
                <td className="py-2 px-4">VARCHAR(50)</td>
                <td className="py-2 px-4 text-red-500">NO</td>
                <td className="py-2 px-4 text-sky-600 font-bold">UNI</td>
                <td className="py-2 px-4 text-slate-400">NULL</td>
                <td className="py-2 px-4 text-slate-400">-</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2 px-4 font-bold text-slate-800">email</td>
                <td className="py-2 px-4">VARCHAR(100)</td>
                <td className="py-2 px-4 text-red-500">NO</td>
                <td className="py-2 px-4 text-slate-400">-</td>
                <td className="py-2 px-4 text-slate-400">NULL</td>
                <td className="py-2 px-4 text-slate-400">-</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2 px-4 font-bold text-slate-800">course</td>
                <td className="py-2 px-4">VARCHAR(100)</td>
                <td className="py-2 px-4 text-red-500">NO</td>
                <td className="py-2 px-4 text-slate-400">-</td>
                <td className="py-2 px-4 text-slate-400">NULL</td>
                <td className="py-2 px-4 text-slate-400">-</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2 px-4 font-bold text-slate-800">created_at</td>
                <td className="py-2 px-4">TIMESTAMP</td>
                <td className="py-2 px-4 text-red-500">NO</td>
                <td className="py-2 px-4 text-slate-400">-</td>
                <td className="py-2 px-4 text-slate-600">CURRENT_TIMESTAMP</td>
                <td className="py-2 px-4 text-slate-400">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SQL Query Runner */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Interactive SQL Query Runner</h3>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium">Quick Queries:</span>
            {sampleQueries.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQueryInput(item.query);
                  handleRunQuery(item.query);
                }}
                className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-mono rounded transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="relative">
            <textarea
              value={queryInput}
              onChange={e => setQueryInput(e.target.value)}
              rows={3}
              placeholder="Enter SQL statement (e.g. SELECT * FROM students;)"
              className="w-full font-mono text-xs p-3 bg-slate-900 text-emerald-400 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              Executes against current <code className="font-mono text-slate-600">student_db</code> in-memory instance.
            </p>
            <button
              onClick={() => handleRunQuery()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Execute SQL</span>
            </button>
          </div>

          {/* Query Output Display */}
          {queryResult && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              {queryResult.error ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Query Error</p>
                    <p className="font-mono mt-0.5">{queryResult.error}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Query executed successfully
                    </span>
                    {queryResult.message && (
                      <span className="font-mono">{queryResult.message}</span>
                    )}
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                          {queryResult.columns.map((col, idx) => (
                            <th key={idx} className="py-2 px-3 font-semibold">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {queryResult.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/60">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="py-1.5 px-3 whitespace-nowrap">
                                {cell === null ? (
                                  <span className="text-slate-400 italic">NULL</span>
                                ) : (
                                  String(cell)
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Real-time SQL Query Activity Feed */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Live SQL Activity Log (CRUD Prepared Statements)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {logs.length} logged queries
            </span>
            {logs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {logs.length > 0 ? (
            logs.map(log => (
              <div key={log.id} className="p-3 hover:bg-slate-50/80 transition-colors text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        log.type === 'SELECT'
                          ? 'bg-blue-100 text-blue-700'
                          : log.type === 'INSERT'
                          ? 'bg-emerald-100 text-emerald-700'
                          : log.type === 'UPDATE'
                          ? 'bg-amber-100 text-amber-700'
                          : log.type === 'DELETE'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {log.type}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px] tabular-nums">
                      {log.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 tabular-nums">
                    <span>{log.durationMs}ms</span>
                    {log.affectedRows !== undefined && (
                      <span>&bull; {log.affectedRows} row{log.affectedRows === 1 ? '' : 's'}</span>
                    )}
                  </div>
                </div>

                <div className="font-mono text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 break-all select-all text-[11px]">
                  {log.query}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No queries logged yet. Perform CRUD actions on the Dashboard to see real-time SQL execution!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
