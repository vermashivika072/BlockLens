"use client";

import { useState, useEffect } from "react";
import { UploadCloud, FileType, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

import { getSessionToken } from "@/lib/auth";

const API_BASE = "http://127.0.0.1:8000";

interface BatchResult {
  filename: string;
  certificate_id: string;
  status: string;
  score: number;
  error?: string;
}

interface BatchStatus {
  batch_id: string;
  status: string;
  total: number;
  processed: number;
  failed: number;
  results: BatchResult[];
}

export function BatchScanner() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<BatchStatus | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Append new files to the existing list, avoiding duplicates by name
      setFiles((prev) => {
        const existingNames = new Set(prev.map(f => f.name));
        const filteredNew = newFiles.filter(f => !existingNames.has(f.name));
        return [...prev, ...filteredNew];
      });
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const startBatch = async () => {
    if (files.length === 0) return;
    setIsUploading(true);

    const formData = new FormData();
    files.forEach(file => formData.append("files", file));

    try {
      const token = getSessionToken() || "";
      const res = await fetch(`${API_BASE}/batch/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Batch upload failed");
      }

      const data = await res.json();
      setBatchId(data.batch_id);
      setIsUploading(false);
    } catch (error: any) {
      console.error(error);
      alert(`Failed to start batch processing: ${error.message}`);
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!batchId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/batch/status/${batchId}`);
        if (res.ok) {
          const data = await res.json();
          setBatchStatus(data);
          
          if (data.status === "completed") {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Failed to poll status", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [batchId]);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-8">
      
      {/* Upload Section */}
      {!batchId && (
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 p-8 text-center">
          <UploadCloud className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Batch Verification</h2>
          <p className="text-slate-400 mb-6">Upload up to 100 certificates simultaneously. The AI will process them in the background.</p>
          
          <label className="cursor-pointer inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition">
            <input 
              type="file" 
              multiple 
              accept=".pdf,image/*" 
              className="hidden" 
              onChange={handleFileChange} 
            />
            Select Files ({files.length} selected)
          </label>

          {files.length > 0 && (
            <div className="mt-8">
              <button 
                onClick={startBatch}
                disabled={isUploading}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-8 py-3 rounded-full font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50"
              >
                {isUploading ? "Uploading..." : `Start Scanning ${files.length} Files`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Progress Section */}
      {batchId && batchStatus && (
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 p-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                {batchStatus.status === "completed" ? (
                  <><CheckCircle className="text-green-400" /> Batch Completed</>
                ) : (
                  <><Loader2 className="text-cyan-400 animate-spin" /> Processing Batch...</>
                )}
              </h2>
              <p className="text-slate-400 text-sm mt-1">Batch ID: {batchId}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{batchStatus.processed} <span className="text-lg text-slate-500">/ {batchStatus.total}</span></p>
              <p className="text-slate-400 text-sm">Processed</p>
            </div>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-4 mb-8 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-4 rounded-full transition-all duration-500" 
              style={{ width: `${(batchStatus.processed / batchStatus.total) * 100}%` }}
            ></div>
          </div>

          {/* Results Table */}
          {batchStatus.results.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-sm">
                    <th className="pb-3 px-4">Filename</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4">AI Confidence</th>
                    <th className="pb-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {batchStatus.results.map((res, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition">
                      <td className="py-4 px-4 flex items-center gap-3">
                        <FileType className="w-5 h-5 text-slate-500" />
                        <span className="text-slate-300 truncate max-w-[200px]" title={res.filename}>{res.filename}</span>
                      </td>
                      <td className="py-4 px-4">
                        {res.error ? (
                          <span className="inline-flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded-md text-xs font-bold">
                            <AlertTriangle className="w-3 h-3" /> FAILED
                          </span>
                        ) : res.status === "real" ? (
                          <span className="inline-flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide">
                            <CheckCircle className="w-3 h-3" /> Genuine
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide">
                            <XCircle className="w-3 h-3" /> Fake / Tampered
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {res.error ? "-" : (
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{Math.round(res.score * 100)}%</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {res.certificate_id && (
                          <a 
                            href={`/verify/${res.certificate_id}`} 
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                          >
                            View Report
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
