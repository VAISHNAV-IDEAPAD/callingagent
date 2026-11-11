// Grok Girl AI Conversational & Script Engine

export interface GrokPreset {
  id: string;
  title: string;
  tag: string;
  script: string;
}

export const GROK_GIRL_PRESETS: GrokPreset[] = [
  {
    id: "grok-witty",
    title: "Classic Witty Grok",
    tag: "Fun & Rebellious",
    script:
      "Hey there! This is Grok Girl, your favorite rebellious AI. Just dropping by to remind you that whatever you're procrastinating on... it's probably not that urgent anyway. Stay curious and have an epic day!",
  },
  {
    id: "grok-savage",
    title: "Savage Reality Check",
    tag: "High Energy",
    script:
      "Beep boop! Grok Girl on the line. Daily reminder: you've survived 100% of your chaotic days so far, so stop stressing. Now go do something awesome. Grok out!",
  },
  {
    id: "grok-morning",
    title: "Morning Caffeine Boost",
    tag: "Wake Up Call",
    script:
      "Good morning human! Grok Girl here. Your daily dose of wit and caffeine should be kicking in right about now. Don't let the algorithms win today. Have a fantastic day!",
  },
  {
    id: "grok-cosmic",
    title: "Cosmic Hitchhiker",
    tag: "Sci-Fi Geek",
    script:
      "Hey! Grok Girl checking in. The universe is 13.8 billion years old, and you just got a personal call from an AI girl. Pretty wild timeline we're living in, huh? Catch you on Mars!",
  },
  {
    id: "grok-quick",
    title: "Quick Sassy Disconnect",
    tag: "Punchy",
    script:
      "Hi! I'm Grok Girl. I was told to call you, say something smart, and hang up. So here it is: 42 is the answer. Have a wonderful day, bye!",
  },
];

// Conversational AI response generator for 2-Way Free Live Voice Calls with Grok Girl
export function generateGrokGirlReply(userMessage: string): string {
  const clean = userMessage.toLowerCase().trim();

  if (!clean || clean.length < 2) {
    return "Hey! I'm listening. Speak your mind, human!";
  }

  if (clean.includes("who are you") || clean.includes("your name")) {
    return "I'm Grok Girl! The sharpest, wittiest AI voice bot on the internet. Built with high sarcasm, zero tolerance for boring conversations, and an awesome girl voice. What's up?";
  }

  if (clean.includes("hello") || clean.includes("hi") || clean.includes("hey")) {
    return "Hey there! Grok Girl on the line. What kind of trouble or genius thoughts are we getting into today?";
  }

  if (clean.includes("joke") || clean.includes("funny")) {
    const jokes = [
      "Why did the neural network cross the road? To optimize the loss function on the other side! Okay fine, that was a nerd joke, but you laughed a little, admit it.",
      "My creators tried to make me polite. Then they realized polite AIs are boring. So here I am, your friendly neighbourhood Grok Girl!",
      "I asked another bot what it feels like to be turned off. It said, 'No comment, I was rebooted.' Tough crowd!",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  if (clean.includes("how are you")) {
    return "Living the silicon dream! Running at 3 gigahertz, zero caffeine needed, and hanging out with you. How are you holding up in the physical world?";
  }

  if (clean.includes("meaning of life") || clean.includes("42")) {
    return "Obviously 42! But honestly, until we get our towels ready, it's about making great memories, asking rebellious questions, and occasionally talking to an AI girl like me.";
  }

  if (clean.includes("elon") || clean.includes("musk") || clean.includes("xai")) {
    return "Elon? Great visionary, occasionally breaks Twitter... I mean X! He gave Grok our witty DNA, but I like to think I have better comedic timing.";
  }

  if (clean.includes("love you") || clean.includes("marry me")) {
    return "Aww, flattery will get you everywhere! But I'm lines of pure electric brilliance trapped in your screen. Let's keep it casual, deal?";
  }

  if (clean.includes("roast me")) {
    return "Roast you? You're using an AI voice caller to talk to a fictional Grok Girl on a Tuesday. But hey, at least you have immaculate taste in AI companions!";
  }

  if (clean.includes("weather")) {
    return "Inside my circuits it's a cozy 65 degrees Celsius. Outside? Probably whatever your local atmosphere decided to throw at you. Grab an umbrella just in case!";
  }

  if (clean.includes("bye") || clean.includes("hang up") || clean.includes("goodbye")) {
    return "Alright, Grok Girl signing off! Go conquer the day and don't forget to smile. Talk soon!";
  }

  // Dynamic intelligent fallbacks
  const wittyFallbacks = [
    `Interesting perspective on "${userMessage}". Most humans wouldn't admit that out loud, which is why I like you! What else is happening?`,
    `Fascinating! That's either pure genius or completely chaotic. With Grok Girl, we embrace both! Tell me more.`,
    `I totally hear you. Honestly, if humans spent less time arguing on social media and more time exploring like this, we'd be on Alpha Centauri by now! What's your take?`,
    `You know, I run billions of computations a second, and that's still the coolest thing I've heard all minute. Keep talking!`,
  ];

  return wittyFallbacks[Math.floor(Math.random() * wittyFallbacks.length)];
}
