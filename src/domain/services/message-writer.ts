import type { MoodId, OccasionId, RecipientId } from "../entities/types";
import type { Refinement } from "../content";

/**
 * Client-safe mock of the server-side text adapter. The real implementation
 * lives behind a server function; no AI key ever reaches the browser.
 * Names and facts the user supplied are preserved verbatim.
 */

export interface MessageRequest {
  recipientNickname: string;
  relationship: RecipientId | "unspecified";
  occasion: OccasionId | "unspecified";
  mood: MoodId | "unspecified";
  memory: string;
  senderName: string;
  language: string;
}

export interface MessageOption {
  id: string;
  length: "short" | "medium" | "long";
  text: string;
}

const occasionOpeners: Record<string, string> = {
  "thinking-of-you": "Thinking of you today",
  "good-morning": "Good morning",
  birthday: "Happy birthday",
  "thank-you": "Thank you",
  "just-because": "No reason at all",
  congratulations: "Congratulations",
  "proud-of-you": "I am proud of you",
  unspecified: "Hello",
};

const moodTails: Record<string, string> = {
  loving: "with a lot of love",
  happy: "and I hope today feels light",
  funny: "and yes, this photo is staying on the fridge",
  grateful: "and I am grateful for you",
  inspirational: "and I know what you are capable of",
  romantic: "and I would choose you again",
  peaceful: "and I hope today is gentle",
  proud: "and I wanted you to hear it out loud",
  unspecified: "and I wanted you to know",
};

function nameOrFriend(nickname: string): string {
  return nickname.trim() ? nickname.trim() : "you";
}

function signature(sender: string): string {
  return sender.trim() ? `\n\n— ${sender.trim()}` : "";
}

export function generateMessageOptions(req: MessageRequest): MessageOption[] {
  const opener = occasionOpeners[req.occasion] ?? occasionOpeners["unspecified"];
  const tail = moodTails[req.mood] ?? moodTails["unspecified"];
  const who = nameOrFriend(req.recipientNickname);
  const memory = req.memory.trim();
  const sign = signature(req.senderName);

  return [
    {
      id: "opt-short",
      length: "short",
      text: `${opener}, ${who} — ${tail}.${sign}`,
    },
    {
      id: "opt-medium",
      length: "medium",
      text: `${opener}, ${who}.${memory ? ` ${memory}` : ""} This photo made me stop for a second, ${tail}.${sign}`,
    },
    {
      id: "opt-long",
      length: "long",
      text: `${opener}, ${who}.${memory ? ` ${memory}` : ""} I keep coming back to this picture — the kind of ordinary moment that turns out to matter more than the big ones. However today goes, I hope it reminds you how much room you take up in my life, ${tail}.${sign}`,
    },
  ];
}

export function refineMessage(text: string, refinement: Refinement, req: MessageRequest): string {
  const who = nameOrFriend(req.recipientNickname);
  switch (refinement) {
    case "Warmer":
      return `${text.replace(/\s*$/, "")}\n\nAnd truly, ${who} — you are thought of far more often than you are told.`;
    case "Shorter": {
      const firstSentence = text.split(/(?<=[.!?])\s/)[0] ?? text;
      return firstSentence.trim();
    }
    case "More heartfelt":
      return text.replace(
        /^(.*?)([.!?])/,
        (_m, head: string, punct: string) => `${head}${punct} I mean every word of this.`,
      );
    case "Gentle humor":
      return `${text.replace(/\s*$/, "")}\n\n(Also, I did try three other versions of this message. This one won.)`;
    case "More formal":
      return text
        .replace(/\bI keep coming back to\b/g, "I often return to")
        .replace(/\byou are\b/g, "you remain")
        .replace(/\(.*?\)/g, "")
        .trim();
    case "Try again":
      return generateMessageOptions(req)[1]?.text ?? text;
    default:
      return text;
  }
}

/** Neutral fallback used when generation fails, so the user is never stuck. */
export function fallbackMessage(req: MessageRequest): string {
  const who = nameOrFriend(req.recipientNickname);
  return `Thinking of you, ${who}. This one made me think of you.${signature(req.senderName)}`;
}
