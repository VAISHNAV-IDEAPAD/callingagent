"use client";

import React, { useState } from "react";
import { X, Globe, Terminal, Copy, Check, ExternalLink, Sparkles } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function VercelDeployGuide({ isOpen, onClose }: Props) {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-zinc-100">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white text-black rounded-lg">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Deploy to Live Vercel as &quot;CallingAgent&quot;</h2>
              <p className="text-xs text-zinc-400">Step-by-step instructions to get your live URL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-xs md:text-sm text-zinc-300">
          {/* Method 1: Instant Vercel CLI */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" /> Method 1: Deploy with Vercel CLI (Fastest - 1 Minute)
              </span>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded font-mono">
                Command Line
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Run this in your terminal inside the project directory:
            </p>
            <div className="bg-black/90 p-3 rounded-lg border border-zinc-800 flex items-center justify-between font-mono text-xs text-emerald-400">
              <code>npx vercel --prod</code>
              <button
                onClick={() => copyText("npx vercel --prod", "cli1")}
                className="p-1 hover:text-white text-zinc-400"
              >
                {copiedCmd === "cli1" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <ul className="text-xs text-zinc-400 list-disc list-inside space-y-1">
              <li>When prompted: <code className="text-white">What&apos;s your project&apos;s name?</code> &rarr; Enter: <strong className="text-emerald-400">CallingAgent</strong></li>
              <li>Vercel builds and deploys your site to <code className="text-emerald-400 font-mono">https://callingagent.vercel.app</code>!</li>
            </ul>
          </div>

          {/* Method 2: GitHub + Vercel Web Dashboard */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" /> Method 2: Deploy via GitHub &amp; Vercel Dashboard
              </span>
              <span className="px-2 py-0.5 text-[10px] bg-sky-500/20 text-sky-300 rounded font-mono">
                Web GUI
              </span>
            </div>
            <ol className="text-xs text-zinc-300 list-decimal list-inside space-y-2">
              <li>Push this project folder to your GitHub repository.</li>
              <li>Go to <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-emerald-400 underline">vercel.com/new</a> and click <strong>Import</strong> on your repository.</li>
              <li>In the <strong>Project Name</strong> field, set: <strong className="text-emerald-400 font-mono">CallingAgent</strong>.</li>
              <li>Click <strong>Deploy</strong>. Vercel automatically detects Next.js!</li>
            </ol>
          </div>

          {/* Environment Variables on Vercel */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Vercel Environment Variables (Optional for Live Carrier Calls)
            </div>
            <p className="text-xs text-zinc-400">
              In your Vercel Project Settings &gt; Environment Variables, you can configure:
            </p>
            <div className="bg-black/80 p-2.5 rounded-lg font-mono text-[11px] text-zinc-300 space-y-1">
              <div><span className="text-emerald-400">TWILIO_ACCOUNT_SID</span>=your_account_sid</div>
              <div><span className="text-emerald-400">TWILIO_AUTH_TOKEN</span>=your_auth_token</div>
              <div><span className="text-emerald-400">TWILIO_PHONE_NUMBER</span>=+1234567890</div>
            </div>
            <p className="text-[11px] text-zinc-400">
              If not added in Vercel settings, users can still test using the built-in <strong>Free Simulator</strong> or add credentials directly in the in-app Settings modal!
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center">
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
          >
            Open Vercel Dashboard <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl text-xs md:text-sm transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
