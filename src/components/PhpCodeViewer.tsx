import React, { useState } from 'react';
import { Download, Copy, Check, FileCode, FolderArchive, Terminal, Shield, ExternalLink } from 'lucide-react';
import { PHP_CODE_FILES } from '../data/phpCodeFiles';
import { ProjectFile } from '../types/student';

interface PhpCodeViewerProps {
  onDownloadZip: () => void;
  isDownloadingZip?: boolean;
}

export const PhpCodeViewer: React.FC<PhpCodeViewerProps> = ({
  onDownloadZip,
  isDownloadingZip = false
}) => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(PHP_CODE_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Assignment Codebase &amp; Architecture (PHP 8 + MySQL)
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Standard-compliant, PDO prepared statements, input validation, and responsive vanilla styling. Ready to deploy to XAMPP, WAMP, or LAMP.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadZip}
              disabled={isDownloadingZip}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <FolderArchive className="w-4 h-4" />
              <span>{isDownloadingZip ? 'Generating ZIP...' : 'Download Project (.zip)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
        {/* Left Sidebar: File Tree */}
        <div className="lg:col-span-3 border-r border-slate-200 bg-slate-50/70 p-3 space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider px-2">
            Project Files ({PHP_CODE_FILES.length})
          </div>

          <div className="space-y-1">
            {PHP_CODE_FILES.map(file => (
              <button
                key={file.filename}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                  selectedFile.filename === file.filename
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${selectedFile.filename === file.filename ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{file.filename}</span>
                </div>
                <span className={`text-[10px] uppercase font-sans ${selectedFile.filename === file.filename ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {file.language}
                </span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 px-2 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span>Security Highlights</span>
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1">
              <li>&bull; PDO parameterized queries prevent SQL Injection.</li>
              <li>&bull; <code className="font-mono text-slate-800">htmlspecialchars()</code> prevents XSS in views.</li>
              <li>&bull; <code className="font-mono text-slate-800">filter_var()</code> validates email format on server.</li>
            </ul>
          </div>
        </div>

        {/* Right Main: Code Display */}
        <div className="lg:col-span-9 flex flex-col bg-slate-950 text-slate-100">
          {/* File Tab Header */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-indigo-400">
                {selectedFile.path}
              </span>
              <span className="text-slate-600" aria-hidden="true">&middot;</span>
              <span className="text-xs text-slate-400">
                {selectedFile.description}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code block with line numbers */}
          <div className="p-4 overflow-x-auto flex-1 font-mono text-xs leading-relaxed max-h-[600px] overflow-y-auto">
            <pre className="text-slate-300">
              <code>
                {selectedFile.content.split('\n').map((line, idx) => (
                  <div key={idx} className="table-row">
                    <span className="table-cell pr-4 text-right select-none text-slate-600 tabular-nums w-8">
                      {idx + 1}
                    </span>
                    <span className="table-cell whitespace-pre">{line || ' '}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
