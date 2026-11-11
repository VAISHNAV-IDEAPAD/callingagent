"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, PhoneOff, Sparkles, Volume2, X, Zap } from "lucide-react";
import { telephonyAudio } from "@/lib/audio";
import { generateGrokGirlReply } from "@/lib/grokBrain";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCallLogged?: (record: any) => void;
}

interface Message {
  sender: "grok" | "user";
  text: string;
}

export default function GrokLiveCallModal({ isOpen, onClose, onCallLogged }: Props) {
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "grok",
      text: "Hey! Grok Girl on the line. What kind of wild thoughts or questions are we exploring today?",
    },
  ]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = false;
        reco.lang = "en-US";

        reco.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            handleUserSpoke(transcript);
          }
        };

        reco.onend = () => {
          setIsListening(false);
        };

        reco.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current = reco;
      }
    }
  }, []);

  // When call opens, start timer and speak initial greeting
  useEffect(() => {
    if (!isOpen) {
      telephonyAudio.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
      return;
    }

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Speak initial greeting
    setIsSpeaking(true);
    telephonyAudio.speakScript(
      "Hey! Grok Girl on the line. What kind of wild thoughts or questions are we exploring today?",
      "grok_girl",
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        // Start listening after speaking
        startListening();
      }
    );

    return () => {
      telephonyAudio.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [isOpen]);

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isSpeaking) {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch {
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
  };

  const handleUserSpoke = async (userText: string) => {
    stopListening();
    const newMessages: Message[] = [...messages, { sender: "user", text: userText }];
    setMessages(newMessages);

    // Grok Girl Generates Witty Response
    const grokReply = generateGrokGirlReply(userText);
    setMessages((prev) => [...prev, { sender: "grok", text: grokReply }]);

    // Grok Girl Speaks Response with girl voice
    setIsSpeaking(true);
    await telephonyAudio.speakScript(
      grokReply,
      "grok_girl",
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        startListening();
      }
    );
  };

  const handleManualSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    const text = userInput;
    setUserInput("");
    handleUserSpoke(text);
  };

  const handleHangup = () => {
    telephonyAudio.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    if (onCallLogged) {
      onCallLogged({
        id: "GROK_" + Math.random().toString(36).substring(2, 9),
        number: "Grok Girl AI (Live Bot)",
        type: "2-Way Live Voice",
        script: "Live Conversational Voice Call with Grok Girl",
        duration: `${callDuration}s`,
        status: "Call Completed",
        timestamp: new Date().toLocaleTimeString(),
        cost: "₹0.00 (100% Free)",
      });
    }

    telephonyAudio.playDisconnectTone(1000).then(() => {
      onClose();
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-zinc-950 via-zinc-900 to-black border border-purple-500/30 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden flex flex-col justify-between h-[640px] text-zinc-100">
        {/* Top Speaker & Notch */}
        <div className="w-24 h-4 bg-zinc-800/80 rounded-full mx-auto mb-3 flex items-center justify-center">
          <div className="w-10 h-1 bg-zinc-700 rounded-full"></div>
        </div>

        {/* Close / Hangup top button */}
        <button
          onClick={handleHangup}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-800/40 hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-[11px] text-purple-300 font-semibold shadow-inner">
            <Zap className="w-3.5 h-3.5 text-purple-400 fill-current" /> Grok Girl • Live Calling Bot
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            Grok Girl <Sparkles className="w-4 h-4 text-purple-400" />
          </h2>
          <div className="text-xs font-mono text-emerald-400 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Connected • {formatTime(callDuration)} • 100% Free Voice
          </div>
        </div>

        {/* Center Waveform & Avatar */}
        <div className="my-auto flex flex-col items-center">
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isSpeaking
                ? "bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 ring-8 ring-purple-500/30 scale-105"
                : isListening
                ? "bg-emerald-500/20 ring-4 ring-emerald-500/40 animate-pulse"
                : "bg-zinc-800 border border-zinc-700"
            }`}
          >
            {isSpeaking ? (
              <Volume2 className="w-12 h-12 text-black animate-bounce" />
            ) : isListening ? (
              <Mic className="w-12 h-12 text-emerald-400 animate-pulse" />
            ) : (
              <Zap className="w-12 h-12 text-purple-400" />
            )}
          </div>

          <div className="mt-3 text-xs font-mono">
            {isSpeaking && (
              <span className="text-purple-300 animate-pulse font-medium">Grok Girl is speaking...</span>
            )}
            {isListening && (
              <span className="text-emerald-400 animate-pulse font-medium">Listening to you... (Speak now)</span>
            )}
            {!isSpeaking && !isListening && (
              <span className="text-zinc-400">Click mic or type below</span>
            )}
          </div>

          {/* In-Call Live Chat / Teleprompter */}
          <div className="mt-4 w-full h-36 bg-black/60 border border-zinc-800/80 rounded-2xl p-3 overflow-y-auto space-y-2 text-xs text-left shadow-inner">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-1.5 rounded-xl text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-purple-600/30 border border-purple-500/40 text-purple-100 rounded-br-none"
                      : "bg-zinc-800/80 border border-zinc-750 text-zinc-200 rounded-bl-none"
                  }`}
                >
                  <span className="text-[10px] uppercase font-mono block opacity-60 mb-0.5">
                    {m.sender === "grok" ? "Grok Girl" : "You"}
                  </span>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Conversation Prompts */}
          <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
            {["Tell me a joke", "Roast me", "Who made you?", "Meaning of life"].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleUserSpoke(prompt)}
                className="text-[10px] px-2 py-0.5 bg-zinc-800/70 hover:bg-zinc-700 text-zinc-300 rounded-full border border-zinc-700/60 transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Actions: Mic, Input & Hang Up */}
        <div className="space-y-3 pt-2">
          {/* Quick Text Input for when mic is silent */}
          <form onSubmit={handleManualSend} className="flex gap-2">
            <input
              type="text"
              placeholder="Or type what you want to say..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold"
            >
              Send
            </button>
          </form>

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-6">
            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${
                isListening
                  ? "bg-emerald-500 text-black shadow-emerald-500/30 scale-105"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
              title={isListening ? "Mute Microphone" : "Speak to Grok Girl"}
            >
              {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            {/* Hang Up Button */}
            <button
              type="button"
              onClick={handleHangup}
              className="w-14 h-14 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-600/40 transition transform hover:scale-105"
              title="Hang Up Voice Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>

          <p className="text-[10px] text-zinc-500 text-center font-mono">
            Two-way voice powered by Grok AI girl voice synthesis • 100% Free
          </p>
        </div>
      </div>
    </div>
  );
}
