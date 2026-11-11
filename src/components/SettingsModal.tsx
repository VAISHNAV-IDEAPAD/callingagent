"use client";

import React, { useState, useEffect } from "react";
import { X, Key, Volume2, Shield, CheckCircle, ExternalLink, RefreshCw } from "lucide-react";

export interface CallingSettings {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  voice: string;
  autoDisconnectDelay: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: CallingSettings;
  onSave: (settings: CallingSettings) => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onSave }: Props) {
  const [formData, setFormData] = useState<CallingSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [hostUrl, setHostUrl] = useState("");

  useEffect(() => {
    setFormData(settings);
    if (typeof window !== "undefined") {
      setHostUrl(window.location.origin);
    }
  }, [settings, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-zinc-100">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">CallingAgent Settings</h2>
              <p className="text-xs text-zinc-400">Configure Twilio free trial credentials &amp; Indian AI voice</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
          {/* Twilio Free Sandbox Section */}
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Twilio API Configuration
              </span>
              <a
                href="https://www.twilio.com/try-twilio"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline underline-offset-2"
              >
                Get $15.50 Free Balance <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-zinc-400">
              Optional if you only want to use the Free Simulator. Required for real phone calls to real Indian mobile handsets.
            </p>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                TWILIO_ACCOUNT_SID
              </label>
              <input
                type="text"
                placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                value={formData.accountSid}
                onChange={(e) => setFormData({ ...formData, accountSid: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-750 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                TWILIO_AUTH_TOKEN
              </label>
              <input
                type="password"
                placeholder="Your Twilio Secret Auth Token"
                value={formData.authToken}
                onChange={(e) => setFormData({ ...formData, authToken: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-750 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 mb-1">
                TWILIO_PHONE_NUMBER (Caller ID)
              </label>
              <input
                type="text"
                placeholder="+1234567890 or Indian virtual CLI"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-750 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Voice Model Selection */}
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 space-y-3">
            <span className="font-semibold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-purple-400" /> AI Girl Voice Persona &amp; Engine
            </span>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                TTS Voice Engine (Girl Voice Enabled)
              </label>
              <select
                value={formData.voice}
                onChange={(e) => setFormData({ ...formData, voice: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-750 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Polly.Joanna-Neural">Amazon Polly Joanna-Neural (Grok Girl - Sassy &amp; Clear)</option>
                <option value="Polly.Salli-Neural">Amazon Polly Salli-Neural (Grok Girl - Youthful &amp; Energetic)</option>
                <option value="Polly.Kajal">Amazon Polly Kajal (Expressive Neural Female)</option>
                <option value="Polly.Aditi">Amazon Polly Aditi (Natural Indian Female)</option>
                <option value="Polly.Raveena">Amazon Polly Raveena (Standard Indian English)</option>
              </select>
            </div>
          </div>

          {/* Live Webhook Endpoints */}
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 space-y-2">
            <span className="font-semibold text-xs text-zinc-300">Vercel Webhook Endpoint:</span>
            <div className="p-2.5 bg-zinc-900 rounded-lg font-mono text-[11px] text-emerald-400 break-all select-all">
              {hostUrl ? `${hostUrl}/api/twiml` : "https://your-site.vercel.app/api/twiml"}
            </div>
            <p className="text-[11px] text-zinc-400">
              Twilio automatically requests this endpoint during a live call to deliver Heera&apos;s speech and trigger the &lt;Hangup/&gt; action.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  accountSid: "",
                  authToken: "",
                  phoneNumber: "",
                  voice: "Polly.Aditi",
                  autoDisconnectDelay: 1,
                });
              }}
              className="text-xs text-zinc-400 hover:text-red-400 flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs rounded-xl flex items-center gap-1.5 transition"
              >
                {isSaved ? <CheckCircle className="w-4 h-4" /> : null}
                {isSaved ? "Saved!" : "Save Configuration"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
