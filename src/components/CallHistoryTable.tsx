"use client";

import React from "react";
import { History, Download, Trash2, CheckCircle2, PhoneCall } from "lucide-react";

export interface CallRecord {
  id: string;
  number: string;
  type: string;
  script: string;
  duration: string;
  status: string;
  timestamp: string;
  cost: string;
}

interface Props {
  records: CallRecord[];
  onClear: () => void;
}

export default function CallHistoryTable({ records, onClear }: Props) {
  const downloadCSV = () => {
    if (records.length === 0) return;
    const headers = ["Timestamp", "Number", "Type", "Status", "Duration", "Cost", "Script"];
    const rows = records.map((r) => [
      `"${r.timestamp}"`,
      `"${r.number}"`,
      `"${r.type}"`,
      `"${r.status}"`,
      `"${r.duration}"`,
      `"${r.cost}"`,
      `"${r.script.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `calling_agent_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Call Disposition Logs</h3>
            <p className="text-xs text-zinc-400">Real-time status of triggered voice calls</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {records.length > 0 && (
            <>
              <button
                type="button"
                onClick={downloadCSV}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 rounded-lg flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button
                type="button"
                onClick={onClear}
                className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                title="Clear Logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {records.length === 0 ? (
        <div className="py-12 text-center text-zinc-400 text-xs space-y-2">
          <PhoneCall className="w-8 h-8 text-zinc-600 mx-auto stroke-1" />
          <p>No calls placed yet. Start a single call or run the simulator above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                <th className="pb-2 font-medium">Time</th>
                <th className="pb-2 font-medium">Recipient</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Duration</th>
                <th className="pb-2 font-medium">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-2.5 font-mono text-zinc-400">{rec.timestamp}</td>
                  <td className="py-2.5 font-mono font-medium text-white">{rec.number}</td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        rec.type.includes("Simulated")
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {rec.type}
                    </span>
                  </td>
                  <td className="py-2.5 text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{rec.status}</span>
                  </td>
                  <td className="py-2.5 font-mono text-zinc-300">{rec.duration}</td>
                  <td className="py-2.5 font-mono text-emerald-400 font-semibold">{rec.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
