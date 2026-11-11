"use client";

import React, { useEffect, useState, useRef } from "react";
import { PhoneOff, Mic, Volume2, Sparkles, X, Zap } from "lucide-react";
import { telephonyAudio, VoicePersona } from "@/lib/audio";
import { CallRecord } from "./CallHistoryTable";

interface Props {
  isOpen: boolean;
  phoneNumber: string;
  script: string;
  persona?: VoicePersona;
  onClose: () => void;
  onCallComplete?: (record: CallRecord) => void;
}

type CallStage = "dialing" | "ringing" | "connected" | "speaking" | "disconnecting" | "ended";

export default function PhoneSimulatorModal({
  isOpen,
  phoneNumber,
  script,
  persona = "grok_girl",
  onClose,
  onCallComplete,
}: Props) {
  const [stage, setStage] = useState<CallStage>("dialing");
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const personaName = persona === "grok_girl" ? "Grok Girl" : "Heera";

  useEffect(() => {
    if (!isOpen) {
      telephonyAudio.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setStage("dialing");
      setCallDuration(0);
      return;
    }

    let isCancelled = false;

    async function runCallLifecycle() {
      // 1. Dialing
      setStage("dialing");
      await new Promise((r) => setTimeout(r, 800));
      if (isCancelled) return;

      // 2. Ringing
      setStage("ringing");
      await telephonyAudio.playRingbackTone(2500);
      if (isCancelled) return;

      // 3. Connected
      setStage("connected");
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 500);

      await new Promise((r) => setTimeout(r, 600));
      if (isCancelled) return;

      // 4. Speaking the Script in Girl Voice
      setStage("speaking");
      await telephonyAudio.speakScript(script, persona);
      if (isCancelled) return;

      // 5. Auto Disconnect (<Hangup/>)
      setStage("disconnecting");
      await new Promise((r) => setTimeout(r, 800));
      if (isCancelled) return;

      // 6. Play Disconnect Tone
      setStage("ended");
      if (timerRef.current) clearInterval(timerRef.current);
      await telephonyAudio.playDisconnectTone(1500);

      if (onCallComplete) {
        onCallComplete({
          id: "SIM_" + Math.random().toString(36).substring(2, 9),
          number: phoneNumber,
          type: `${personaName} Call`,
          script,
          duration: "4s",
          status: "Delivered & Auto-Hung up",
          timestamp: new Date().toLocaleTimeString(),
          cost: "₹0.00 (Free)",
        });
      }
    }

    runCallLifecycle();

    return () => {
      isCancelled = true;
      telephonyAudio.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, phoneNumber, script, persona, onCallComplete, personaName]);

  const handleManualHangup = () => {
    telephonyAudio.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setStage("ended");
    telephonyAudio.playDisconnectTone(1000).then(() => {
      onClose();
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden text-center flex flex-col justify-between h-[580px]">
        {/* Top Speaker / Notch */}
        <div className="w-24 h-4 bg-zinc-800/80 rounded-full mx-auto mb-4 flex items-center justify-center">
          <div className="w-10 h-1 bg-zinc-700 rounded-full"></div>
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            telephonyAudio.stop();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 text-zinc-500 hover:text-white rounded-full bg-zinc-800/40 hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Call Info Header */}
        <div className="space-y-2 mt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-[11px] text-purple-300 font-medium">
            {persona === "grok_girl" ? <Zap className="w-3.5 h-3.5 text-purple-400" /> : <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
            {persona === "grok_girl" ? "Grok Girl AI Calling Bot" : "CallingAgent Voice Bot"}
          </div>

          <h3 className="text-2xl font-bold text-white tracking-wide">{personaName}</h3>
          <p className="text-sm font-mono text-zinc-400">{phoneNumber || "+91 (Mobile)"}</p>

          {/* Call Status Badge */}
          <div className="pt-2">
            {stage === "dialing" && (
              <span className="text-xs font-mono text-zinc-400 animate-pulse">Dialing Gateway...</span>
            )}
            {stage === "ringing" && (
              <span className="text-xs font-mono text-amber-400 animate-pulse">Ringing subscriber...</span>
            )}
            {(stage === "connected" || stage === "speaking") && (
              <div className="text-xs font-mono text-emerald-400 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Connected • 00:0{callDuration}
              </div>
            )}
            {stage === "disconnecting" && (
              <span className="text-xs font-mono text-yellow-400">Executing auto-hangup script...</span>
            )}
            {stage === "ended" && (
              <span className="text-xs font-mono text-red-400 font-semibold">Call Disconnected</span>
            )}
          </div>
        </div>

        {/* Center Waveform / Avatar */}
        <div className="my-auto flex flex-col items-center justify-center">
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${
              stage === "speaking"
                ? persona === "grok_girl"
                  ? "bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 ring-8 ring-purple-500/20 scale-105"
                  : "bg-gradient-to-tr from-emerald-500 to-teal-400 ring-8 ring-emerald-500/20 scale-105"
                : stage === "ringing"
                ? "bg-amber-500/20 ring-4 ring-amber-500/20 animate-pulse"
                : stage === "ended"
                ? "bg-red-500/20 border border-red-500/40"
                : "bg-zinc-800 border border-zinc-700"
            }`}
          >
            {stage === "speaking" ? (
              <Volume2 className="w-12 h-12 text-zinc-950 animate-bounce" />
            ) : stage === "ended" ? (
              <PhoneOff className="w-12 h-12 text-red-400" />
            ) : (
              <Mic className="w-12 h-12 text-zinc-400" />
            )}
          </div>

          {/* Live Script Teleprompter */}
          <div className="mt-6 px-4 py-3 bg-zinc-950/70 border border-zinc-800 rounded-xl max-w-xs">
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block mb-1">
              {stage === "speaking" ? `${personaName} Girl Voice Output` : "Message to Deliver"}
            </span>
            <p className="text-xs text-zinc-200 italic leading-relaxed">
              &quot;{script}&quot;
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2">
          {stage !== "ended" ? (
            <button
              onClick={handleManualHangup}
              className="w-14 h-14 bg-red-600 hover:bg-red-500 text-white rounded-full mx-auto flex items-center justify-center shadow-lg shadow-red-600/30 transition transform hover:scale-105"
              title="Hang Up Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl text-sm transition"
            >
              Close Simulator
            </button>
          )}
          <p className="text-[10px] text-zinc-400 mt-3 font-mono">
            {stage === "ended"
              ? "Call terminated automatically according to script."
              : "Voice bot will automatically disconnect once finished."}
          </p>
        </div>
      </div>
    </div>
  );
}
