"use client";

import React, { useState } from "react";
import { Users, Play, Square, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { validateIndianMobile, parseBatchNumbers } from "@/lib/phone";
import { CallRecord } from "./CallHistoryTable";

interface BatchCallItem {
  id: string;
  raw: string;
  formatted: string;
  e164: string;
  valid: boolean;
  status: "pending" | "calling" | "completed" | "failed";
  error?: string;
}

interface Props {
  script: string;
  isSimulated: boolean;
  onCallLogged: (call: CallRecord) => void;
  onTriggerSingleCall: (number: string) => Promise<boolean>;
}

export default function BatchDialer({
  isSimulated,
  onTriggerSingleCall,
}: Props) {
  const [rawInput, setRawInput] = useState(
    "9876543210\n9812345678\n8765432109\n7012345678"
  );
  const [queue, setQueue] = useState<BatchCallItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [delaySeconds, setDelaySeconds] = useState(4);
  const [stopRequested, setStopRequested] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const handleParse = () => {
    const numbers = parseBatchNumbers(rawInput);
    const parsed: BatchCallItem[] = numbers.map((num, i) => {
      const v = validateIndianMobile(num);
      return {
        id: `batch-${i}-${Date.now()}`,
        raw: num,
        formatted: v.formatted || num,
        e164: v.e164,
        valid: v.valid,
        status: "pending",
        error: v.error,
      };
    });
    setQueue(parsed);
  };

  const startBatchExecution = async () => {
    if (queue.length === 0) {
      handleParse();
    }

    const currentQueue = queue.length > 0 ? queue : parseBatchNumbers(rawInput).map((num, i) => {
      const v = validateIndianMobile(num);
      return {
        id: `batch-${i}-${Date.now()}`,
        raw: num,
        formatted: v.formatted || num,
        e164: v.e164,
        valid: v.valid,
        status: "pending" as const,
        error: v.error,
      };
    });

    setQueue(currentQueue);
    setIsRunning(true);
    setStopRequested(false);

    for (let i = 0; i < currentQueue.length; i++) {
      if (stopRequested) break;
      const item = currentQueue[i];

      if (!item.valid) {
        currentQueue[i].status = "failed";
        setQueue([...currentQueue]);
        continue;
      }

      setCurrentIndex(i);
      currentQueue[i].status = "calling";
      setQueue([...currentQueue]);

      try {
        const success = await onTriggerSingleCall(item.e164);
        currentQueue[i].status = success ? "completed" : "failed";
      } catch (err: unknown) {
        currentQueue[i].status = "failed";
        currentQueue[i].error = err instanceof Error ? err.message : "Call failed";
      }

      setQueue([...currentQueue]);

      // Delay between calls
      if (i < currentQueue.length - 1 && !stopRequested) {
        await new Promise((r) => setTimeout(r, delaySeconds * 1000));
      }
    }

    setIsRunning(false);
    setCurrentIndex(-1);
  };

  const handleStop = () => {
    setStopRequested(true);
    setIsRunning(false);
  };

  const validCount = queue.filter((q) => q.valid).length;
  const completedCount = queue.filter((q) => q.status === "completed").length;
  const failedCount = queue.filter((q) => q.status === "failed").length;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Batch Outbound Queue</h3>
            <p className="text-xs text-zinc-400">Dial a list of Indian mobile numbers sequentially</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Delay between calls:</span>
          <select
            value={delaySeconds}
            onChange={(e) => setDelaySeconds(Number(e.target.value))}
            disabled={isRunning}
            className="bg-zinc-800 text-xs text-white rounded-lg px-2.5 py-1.5 border border-zinc-700"
          >
            <option value={2}>2 seconds</option>
            <option value={4}>4 seconds (Recommended)</option>
            <option value={8}>8 seconds</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono text-zinc-300 mb-1.5">
          Enter / Paste Indian Mobile Numbers (One per line or comma-separated)
        </label>
        <textarea
          rows={4}
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          disabled={isRunning}
          placeholder="+919876543210&#10;9812345678&#10;8765432109"
          className="w-full bg-zinc-950 border border-zinc-750 rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-zinc-400">
            Valid Indian prefixes: 6, 7, 8, 9 (10-digits)
          </span>
          <button
            type="button"
            onClick={handleParse}
            disabled={isRunning}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Validate &amp; Refresh Queue
          </button>
        </div>
      </div>

      {/* Queue Stats */}
      {queue.length > 0 && (
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-zinc-400 block text-[10px]">Total</span>
            <span className="font-bold text-white text-sm">{queue.length}</span>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-emerald-400 block text-[10px]">Valid</span>
            <span className="font-bold text-emerald-400 text-sm">{validCount}</span>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-sky-400 block text-[10px]">Completed</span>
            <span className="font-bold text-sky-400 text-sm">{completedCount}</span>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-rose-400 block text-[10px]">Failed/Invalid</span>
            <span className="font-bold text-rose-400 text-sm">{failedCount}</span>
          </div>
        </div>
      )}

      {/* Progress & Queue List */}
      {queue.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
          {queue.map((item, idx) => (
            <div
              key={item.id}
              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${
                idx === currentIndex
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/30"
                  : item.status === "completed"
                  ? "bg-zinc-950/60 border-zinc-800/80 text-zinc-300"
                  : item.status === "failed"
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  : "bg-zinc-950/40 border-zinc-800/40 text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400">#{idx + 1}</span>
                <span className="font-mono font-medium">{item.formatted}</span>
                {!item.valid && (
                  <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                    {item.error || "Invalid"}
                  </span>
                )}
              </div>

              <div>
                {item.status === "calling" && (
                  <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-medium animate-pulse">
                    Calling...
                  </span>
                )}
                {item.status === "completed" && (
                  <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5" /> Disconnected
                  </span>
                )}
                {item.status === "failed" && (
                  <span className="text-rose-400 flex items-center gap-1 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5" /> Error
                  </span>
                )}
                {item.status === "pending" && (
                  <span className="text-zinc-400 text-[11px]">Queued</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        {!isRunning ? (
          <button
            type="button"
            onClick={startBatchExecution}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Batch Calling ({isSimulated ? "Free Simulator" : "Live Outbound"})
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStop}
            className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition"
          >
            <Square className="w-4 h-4 fill-current" />
            Stop Batch Execution
          </button>
        )}
      </div>
    </div>
  );
}
