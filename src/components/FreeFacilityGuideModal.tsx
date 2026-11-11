"use client";

import React from "react";
import { X, CheckCircle, Gift, PhoneCall, Globe, AlertCircle, Sparkles } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function FreeFacilityGuideModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-zinc-100">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">How Free Calling Works with CallingAgent</h2>
              <p className="text-xs text-zinc-400">Understanding free PSTN options, trial credits, and the simulator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm text-zinc-300">
          {/* Reality Note */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3.5 text-xs text-blue-200 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-300">Telecom Industry Reality:</span> Telecom operators (Jio, Airtel, Vi, BSNL) incur physical network costs (Interconnect Usage Charge / IUC) for routing voice packets into cellular towers. Therefore, no carrier permits unlimited, free PSTN calls to random mobile numbers without payment or trial allowances.
            </div>
          </div>

          <h3 className="font-semibold text-white pt-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            3 Ways to Use CallingAgent for Free:
          </h3>

          {/* Option 1: Built-in Audio Simulator */}
          <div className="bg-zinc-800/60 border border-zinc-750 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Option 1: In-Browser AI Voice Simulator (100% Free Forever)
              </span>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded font-mono uppercase">
                Zero Cost
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              No credit card or telephony account needed. CallingAgent includes a high-fidelity telephony simulator that reproduces dial tones, ringback frequencies, and synthesizes <strong>Heera&apos;s speech</strong> in real time with an Indian English voice before automatically disconnecting.
            </p>
          </div>

          {/* Option 2: Twilio Free Developer Balance */}
          <div className="bg-zinc-800/60 border border-zinc-750 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sky-400 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-sky-400" /> Option 2: Twilio Developer Free Sandbox ($15.50 Credit)
              </span>
              <span className="px-2 py-0.5 text-[10px] bg-sky-500/20 text-sky-300 rounded font-mono uppercase">
                Real Outbound Calls
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Twilio offers approximately $15.50 (~₹1,300) in free trial credits when you create a new developer account.
            </p>
            <ol className="text-xs text-zinc-300 list-decimal list-inside space-y-1.5 pl-1">
              <li>Sign up for free at <span className="text-sky-400 font-mono">twilio.com/try-twilio</span>.</li>
              <li>Get a free trial phone number.</li>
              <li>Verify your personal Indian mobile number under <em>Verified Caller IDs</em>.</li>
              <li>Copy your Account SID and Auth Token into CallingAgent&apos;s Settings.</li>
              <li>You can now place real voice calls to your verified numbers completely free using your trial balance!</li>
            </ol>
          </div>

          {/* Option 3: Exotel India Developer Sandbox */}
          <div className="bg-zinc-800/60 border border-zinc-750 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-400 flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" /> Option 3: Exotel 15-Day Free Indian Sandbox
              </span>
              <span className="px-2 py-0.5 text-[10px] bg-purple-500/20 text-purple-300 rounded font-mono uppercase">
                India Local
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Exotel (exotel.com) is India&apos;s top cloud telephony provider and provides a 15-day free trial with ₹1,000 developer credits for outbound IVR and voice bots terminating directly inside India.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl text-sm transition"
          >
            Got it, Let&apos;s Call!
          </button>
        </div>
      </div>
    </div>
  );
}
