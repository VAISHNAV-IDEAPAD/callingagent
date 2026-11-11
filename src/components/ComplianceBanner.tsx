"use client";

import React, { useState } from "react";
import { AlertTriangle, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

export default function ComplianceBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-300 text-sm md:text-base">
                TRAI &amp; Indian Telecom Regulation Notice (TCCCPR 2018)
              </span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-400/20 text-amber-300 font-mono">
                Mandatory Compliance
              </span>
            </div>
            <p className="text-xs md:text-sm text-zinc-300 mt-1 leading-relaxed">
              Automated cold-calling to arbitrary Indian mobile numbers without registration or consent is prohibited by TRAI regulations.
              Please test using our <strong>Free Interactive Simulator</strong> or <strong>Twilio Verified Sandbox</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition"
        >
          {expanded ? "Less Info" : "Rules & Legal Details"}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-amber-500/20 text-xs text-zinc-300 space-y-2.5 animate-fadeIn">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-black/30 p-3 rounded-lg border border-amber-500/10">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 1. DLT Registration Required
              </div>
              <p className="text-zinc-400">
                Any automated outbound commercial call in India requires Principal Entity registration on carrier DLT platforms (Jio, Airtel, Vi, BSNL).
              </p>
            </div>
            <div className="bg-black/30 p-3 rounded-lg border border-amber-500/10">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 2. National DND Scrubbing
              </div>
              <p className="text-zinc-400">
                Calling numbers registered under Do Not Disturb (DND / NCPR) without explicit opt-in can trigger carrier disconnection and statutory penalties.
              </p>
            </div>
            <div className="bg-black/30 p-3 rounded-lg border border-amber-500/10">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 3. 140-Series Headers
              </div>
              <p className="text-zinc-400">
                Promotional outbound voice broadcasts must use official 140-series virtual CLI numbers assigned by Indian telecom providers.
              </p>
            </div>
          </div>
          <p className="text-zinc-400 text-[11px] pt-1">
            * CallingAgent is equipped with a Sandbox Simulator for testing speech synthesis scripts without triggering PSTN carrier penalties.
          </p>
        </div>
      )}
    </div>
  );
}
