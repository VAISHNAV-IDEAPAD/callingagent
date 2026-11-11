"use client";

import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  Volume2,
  Sparkles,
  Settings,
  HelpCircle,
  Globe,
  CheckCircle,
  RotateCcw,
  AlertTriangle,
  PhoneOff,
  Zap,
  Mic,
  MessageSquare,
} from "lucide-react";
import ComplianceBanner from "@/components/ComplianceBanner";
import FreeFacilityGuideModal from "@/components/FreeFacilityGuideModal";
import PhoneSimulatorModal from "@/components/PhoneSimulatorModal";
import GrokLiveCallModal from "@/components/GrokLiveCallModal";
import SettingsModal, { CallingSettings } from "@/components/SettingsModal";
import BatchDialer from "@/components/BatchDialer";
import CallHistoryTable, { CallRecord } from "@/components/CallHistoryTable";
import VercelDeployGuide from "@/components/VercelDeployGuide";
import { validateIndianMobile } from "@/lib/phone";
import { telephonyAudio, VoicePersona } from "@/lib/audio";
import { GROK_GIRL_PRESETS } from "@/lib/grokBrain";

const DEFAULT_GROK_SCRIPT = GROK_GIRL_PRESETS[0].script;
const DEFAULT_HEERA_SCRIPT = "Hello, my name is Heera. Have a nice day!";

export default function Home() {
  const [persona, setPersona] = useState<VoicePersona>("grok_girl");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [script, setScript] = useState(DEFAULT_GROK_SCRIPT);
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single");
  const [callMode, setCallMode] = useState<"simulate" | "real">("simulate");

  // Status & Loaders
  const [isCalling, setIsCalling] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);
  const [callSuccessMsg, setCallSuccessMsg] = useState<string | null>(null);
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false);

  // Modals
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDeployGuide, setShowDeployGuide] = useState(false);
  const [showPhoneSimulator, setShowPhoneSimulator] = useState(false);
  const [showGrokLiveCall, setShowGrokLiveCall] = useState(false);

  // Settings
  const [settings, setSettings] = useState<CallingSettings>({
    accountSid: "",
    authToken: "",
    phoneNumber: "",
    voice: "Polly.Joanna-Neural",
    autoDisconnectDelay: 1,
  });

  // History
  const [history, setHistory] = useState<CallRecord[]>([]);

  // Load saved settings & history from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedSettings = localStorage.getItem("calling_agent_settings");
        if (savedSettings) setSettings(JSON.parse(savedSettings));

        const savedHistory = localStorage.getItem("calling_agent_history");
        if (savedHistory) setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load local storage:", e);
      }
    }
  }, []);

  // When persona changes, update default script if untouched
  const handleSelectPersona = (newPersona: VoicePersona) => {
    setPersona(newPersona);
    if (newPersona === "grok_girl") {
      setScript(DEFAULT_GROK_SCRIPT);
    } else {
      setScript(DEFAULT_HEERA_SCRIPT);
    }
  };

  const handleSaveSettings = (newSettings: CallingSettings) => {
    setSettings(newSettings);
    if (typeof window !== "undefined") {
      localStorage.setItem("calling_agent_settings", JSON.stringify(newSettings));
    }
  };

  const handleLogCall = (record: CallRecord) => {
    setHistory((prev) => {
      const updated = [record, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("calling_agent_history", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("calling_agent_history");
    }
  };

  const validation = validateIndianMobile(phoneNumber);

  // Audio Preview for Voice
  const handlePlayPreview = async () => {
    if (isPlayingAudioPreview) {
      telephonyAudio.stop();
      setIsPlayingAudioPreview(false);
      return;
    }
    setIsPlayingAudioPreview(true);
    await telephonyAudio.speakScript(
      script,
      persona,
      () => setIsPlayingAudioPreview(true),
      () => setIsPlayingAudioPreview(false)
    );
  };

  // Place Single Call
  const handleSingleCall = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCallError(null);
    setCallSuccessMsg(null);

    if (!validation.valid) {
      setCallError(validation.error || "Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (callMode === "simulate") {
      setShowPhoneSimulator(true);
      return;
    }

    // Real Outbound Call via Next.js API
    setIsCalling(true);
    try {
      const res = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: validation.e164,
          script,
          persona,
          mode: "real",
          clientCredentials: {
            accountSid: settings.accountSid || undefined,
            authToken: settings.authToken || undefined,
            phoneNumber: settings.phoneNumber || undefined,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setCallError(data.error || "Failed to initiate call.");
        if (data.missingConfig) {
          setShowSettingsModal(true);
        }
        return;
      }

      setCallSuccessMsg(
        `Call initiated! SID: ${data.callSid}. ${persona === "grok_girl" ? "Grok Girl" : "Heera"} will deliver the script in girl voice and disconnect.`
      );
      handleLogCall({
        id: data.callSid || String(Date.now()),
        number: validation.formatted,
        type: persona === "grok_girl" ? "Grok Girl Carrier Call" : "Heera Carrier Call",
        script,
        duration: "In Progress",
        status: "Initiated",
        timestamp: new Date().toLocaleTimeString(),
        cost: "Trial Credit / Carrier",
      });
    } catch (err: unknown) {
      setCallError(err instanceof Error ? err.message : "Network error while connecting to call gateway.");
    } finally {
      setIsCalling(false);
    }
  };

  // Function passed to BatchDialer
  const handleTriggerFromBatch = async (formattedNumber: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: formattedNumber,
          script,
          persona,
          mode: callMode,
          clientCredentials: {
            accountSid: settings.accountSid || undefined,
            authToken: settings.authToken || undefined,
            phoneNumber: settings.phoneNumber || undefined,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        handleLogCall({
          id: data.callSid || String(Date.now()),
          number: formattedNumber,
          type: callMode === "simulate" ? `${persona === "grok_girl" ? "Grok Girl" : "Heera"} Sim` : "Carrier Call",
          script,
          duration: "4s",
          status: "Delivered & Disconnected",
          timestamp: new Date().toLocaleTimeString(),
          cost: callMode === "simulate" ? "₹0.00 (Free)" : "Trial Balance",
        });
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-purple-500 selection:text-black">
      {/* Top Navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 flex items-center justify-center text-black font-black shadow-lg shadow-purple-500/20">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base md:text-lg tracking-tight text-white">CallingAgent</h1>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Grok Bot • Girl Voice
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">AI Voice Calling &amp; Two-Way Conversational Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live 2-Way Free Grok Call Button */}
            <button
              onClick={() => setShowGrokLiveCall(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center gap-1.5 transition transform hover:scale-105"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Talk to Grok Girl (Live Free)</span>
            </button>

            <button
              onClick={() => setShowGuideModal(true)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 border border-zinc-800 flex items-center gap-1.5 transition hidden sm:flex"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Free Info</span>
            </button>

            <button
              onClick={() => setShowDeployGuide(true)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 border border-zinc-800 flex items-center gap-1.5 transition hidden md:flex"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>Vercel</span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition"
              title="Settings & Twilio Keys"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Compliance Warning Banner */}
        <ComplianceBanner />

        {/* Persona Switcher Banner */}
        <div className="bg-gradient-to-r from-purple-950/40 via-zinc-900 to-zinc-950 border border-purple-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 border border-purple-500/40 rounded-xl text-purple-400">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="font-bold text-white text-sm md:text-base flex items-center gap-2">
                Choose Voice Calling Persona
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono">
                  Girl Voice Enabled
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Switch between the rebellious, witty Grok Girl or the classic Heera outbound bot.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-xl border border-zinc-800 shrink-0">
            <button
              onClick={() => handleSelectPersona("grok_girl")}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
                persona === "grok_girl"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Grok Girl (Witty AI)
            </button>
            <button
              onClick={() => handleSelectPersona("heera")}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
                persona === "heera"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Heera (Classic)
            </button>
          </div>
        </div>

        {/* Script & Voice Persona Card */}
        <div
          className={`border rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all ${
            persona === "grok_girl"
              ? "bg-gradient-to-br from-zinc-950 via-purple-950/20 to-zinc-950 border-purple-500/40 shadow-purple-950/30"
              : "bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border-zinc-800"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  persona === "grok_girl"
                    ? "bg-purple-500/20 border border-purple-500/40 text-purple-400 shadow-inner"
                    : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                }`}
              >
                {persona === "grok_girl" ? <Zap className="w-6 h-6 fill-current" /> : <Sparkles className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">
                    {persona === "grok_girl" ? "Grok Girl (Witty Voice Bot)" : "Heera (Classic Bot)"}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      persona === "grok_girl"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-emerald-500/20 text-emerald-300 font-mono"
                    }`}
                  >
                    {persona === "grok_girl" ? "Expressive Girl Voice • Witty Tone" : "en-IN Voice • Auto-Disconnect"}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  {persona === "grok_girl"
                    ? "Speaks with personality, humor, and lively girl voice cadence before automatically hanging up."
                    : "Delivers the spoken message clearly, pauses 1s, and terminates the telephony call automatically."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePlayPreview}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                  isPlayingAudioPreview
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 animate-pulse"
                    : persona === "grok_girl"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/30"
                    : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20"
                }`}
              >
                <Volume2 className="w-4 h-4" />
                {isPlayingAudioPreview ? "Speaking in Girl Voice..." : "Preview Girl Voice"}
              </button>

              <button
                type="button"
                onClick={() => setIsEditingScript(!isEditingScript)}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition"
              >
                {isEditingScript ? "Save Script" : "Edit Script"}
              </button>
            </div>
          </div>

          {/* Grok Presets (when Grok Girl is chosen) */}
          {persona === "grok_girl" && (
            <div className="pt-3 pb-1 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-purple-400 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Grok Presets:
              </span>
              {GROK_GIRL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setScript(preset.script)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                    script === preset.script
                      ? "bg-purple-600/30 border-purple-500 text-purple-200 font-medium"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  {preset.title}
                </button>
              ))}
            </div>
          )}

          {/* Script Display / Editor */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] uppercase tracking-wider font-mono text-zinc-400 flex items-center gap-1.5">
                Active Spoken Message
              </label>
              <button
                type="button"
                onClick={() =>
                  setScript(persona === "grok_girl" ? DEFAULT_GROK_SCRIPT : DEFAULT_HEERA_SCRIPT)
                }
                className="text-[10px] text-zinc-400 hover:text-purple-400 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset default
              </button>
            </div>

            {isEditingScript ? (
              <textarea
                rows={3}
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="w-full bg-zinc-950 border border-purple-500/50 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            ) : (
              <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 flex items-center justify-between">
                <span className="text-sm md:text-base font-medium text-purple-200 italic">
                  &ldquo;{script}&rdquo;
                </span>
                <div className="shrink-0 ml-3 flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                  <PhoneOff className="w-3 h-3 text-red-400" /> &rarr; &lt;Hangup/&gt;
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Calling Mode Switcher & Tab Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800/80 p-2 rounded-2xl">
          {/* Dialer Tabs */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab("single")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === "single"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Single Number Dialer
            </button>
            <button
              onClick={() => setActiveTab("batch")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === "batch"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Batch Outbound List
            </button>
          </div>

          {/* Engine Mode: Simulator vs Live PSTN */}
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 rounded-xl border border-zinc-800">
            <span className="text-xs text-zinc-400">Mode:</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-zinc-300">
              <input
                type="radio"
                name="callMode"
                checked={callMode === "simulate"}
                onChange={() => setCallMode("simulate")}
                className="accent-purple-500"
              />
              <span className={callMode === "simulate" ? "text-purple-400 font-medium" : ""}>
                Free Simulator (Zero Cost)
              </span>
            </label>
            <span className="text-zinc-700">|</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-zinc-300">
              <input
                type="radio"
                name="callMode"
                checked={callMode === "real"}
                onChange={() => setCallMode("real")}
                className="accent-purple-500"
              />
              <span className={callMode === "real" ? "text-sky-400 font-medium" : ""}>
                Live Twilio Gateway
              </span>
            </label>
          </div>
        </div>

        {/* Tab 1: Single Number Dialer */}
        {activeTab === "single" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="pb-3 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Outbound Dialing Console</h3>
                <p className="text-xs text-zinc-400">
                  Call any Indian mobile number with {persona === "grok_girl" ? "Grok Girl" : "Heera"}
                </p>
              </div>

              <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20">
                Voice: {persona === "grok_girl" ? "Girl Voice (Grok)" : "Indian Voice (Heera)"}
              </span>
            </div>

            <form onSubmit={handleSingleCall} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                  Recipient Mobile Number (India)
                </label>

                <div className="relative flex items-center">
                  {/* Country Flag & Code Prefix */}
                  <div className="absolute left-3 flex items-center gap-1.5 text-zinc-300 border-r border-zinc-750 pr-3 pointer-events-none">
                    <span className="text-base">🇮🇳</span>
                    <span className="text-xs font-mono font-bold text-purple-400">+91</span>
                  </div>

                  <input
                    type="tel"
                    placeholder="98765 43210 (10 digits starting with 6-9)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-750 rounded-xl pl-24 pr-4 py-3 text-sm md:text-base font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                {/* Validation Feedback */}
                <div className="mt-2 flex items-center justify-between text-xs font-mono">
                  {phoneNumber.length > 0 && (
                    <>
                      {validation.valid ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Valid: {validation.formatted} ({validation.operatorHint})
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {validation.error}
                        </span>
                      )}
                    </>
                  )}
                  <span className="text-[11px] text-zinc-400 ml-auto">
                    Destination: Telecom India Mobile
                  </span>
                </div>
              </div>

              {/* Call Error / Success Messages */}
              {callError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <div className="font-semibold text-rose-200">Call Execution Error</div>
                    <div>{callError}</div>
                  </div>
                </div>
              )}

              {callSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-emerald-200">Success</div>
                    <div>{callSuccessMsg}</div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCalling}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm md:text-base flex items-center justify-center gap-2.5 transition shadow-lg ${
                    callMode === "simulate"
                      ? "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 text-white shadow-purple-500/20"
                      : "bg-sky-500 hover:bg-sky-400 text-zinc-950 shadow-sky-500/20"
                  }`}
                >
                  <PhoneCall className="w-5 h-5 fill-current" />
                  {isCalling
                    ? "Dispatching Outbound Call..."
                    : callMode === "simulate"
                    ? `Simulate Free Call (${persona === "grok_girl" ? "Grok Girl Voice" : "Heera Voice"})`
                    : "Call Mobile via Live Twilio Carrier"}
                </button>
              </div>

              <div className="text-center">
                <p className="text-[11px] text-zinc-400">
                  {callMode === "simulate" ? (
                    <span>
                      💡 <strong>Simulator is 100% Free</strong>: Opens an interactive virtual phone screen and speaks {persona === "grok_girl" ? "Grok Girl's" : "Heera's"} script in girl voice with audio.
                    </span>
                  ) : (
                    <span>
                      ⚡ <strong>Live Call</strong>: Uses Twilio REST API to place a physical call to {validation.e164 || "+91 Mobile"}.
                    </span>
                  )}
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Batch Calling Queue */}
        {activeTab === "batch" && (
          <BatchDialer
            script={script}
            isSimulated={callMode === "simulate"}
            onCallLogged={handleLogCall}
            onTriggerSingleCall={handleTriggerFromBatch}
          />
        )}

        {/* Call Logs & History */}
        <CallHistoryTable records={history} onClear={handleClearHistory} />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 bg-zinc-950 py-6 mt-12 text-xs text-zinc-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-200">CallingAgent</span>
            <span>•</span>
            <span className="text-purple-400 font-semibold">Grok Bot Girl Voice</span>
            <span>•</span>
            <span>Indian Telecom Voice AI</span>
            <span>•</span>
            <span className="text-emerald-400">Vercel Ready</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <button
              onClick={() => setShowGrokLiveCall(true)}
              className="text-purple-400 hover:text-purple-300 font-semibold transition"
            >
              Talk to Grok Girl
            </button>
            <button
              onClick={() => setShowGuideModal(true)}
              className="hover:text-zinc-200 transition"
            >
              Free Facility Guide
            </button>
            <button
              onClick={() => setShowDeployGuide(true)}
              className="hover:text-zinc-200 transition"
            >
              Vercel Deployment
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="hover:text-zinc-200 transition"
            >
              Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Phone Call Simulator Modal */}
      <PhoneSimulatorModal
        isOpen={showPhoneSimulator}
        phoneNumber={validation.formatted || phoneNumber}
        script={script}
        persona={persona}
        onClose={() => setShowPhoneSimulator(false)}
        onCallComplete={handleLogCall}
      />

      {/* Grok Girl Live 2-Way Voice Call Modal */}
      <GrokLiveCallModal
        isOpen={showGrokLiveCall}
        onClose={() => setShowGrokLiveCall(false)}
        onCallLogged={handleLogCall}
      />

      {/* Free Facility Info Modal */}
      <FreeFacilityGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Vercel Deploy Guide Modal */}
      <VercelDeployGuide
        isOpen={showDeployGuide}
        onClose={() => setShowDeployGuide(false)}
      />
    </div>
  );
}
