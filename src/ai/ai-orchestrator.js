/**
 * DEARLY AI Orchestration Layer
 * "The technology should disappear. The emotion should remain."
 *
 * Supports Gemini API with graceful fallback to built-in contextual engine.
 */

const https = require('node:https');

class AIOrchestrator {
  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY || null;
    this.useGemini = Boolean(this.geminiApiKey);
    if (this.useGemini) {
      console.log('✨ DEARLY: Gemini AI engine activated');
    } else {
      console.log('💡 DEARLY: Using built-in contextual engine (set GEMINI_API_KEY to enable Gemini)');
    }
    this.fallback = new ContextualEngineProvider();
  }

  async analyzePhoto(photoInfo) {
    return this.fallback.analyzePhoto(photoInfo);
  }

  async generateMessageCandidates(params) {
    if (this.useGemini) {
      try {
        return await this._geminiGenerateMessages(params);
      } catch (err) {
        console.warn('Gemini generation failed, using fallback:', err.message);
      }
    }
    return this.fallback.generateMessages(params);
  }

  async refineMessage(currentMessage, refinementType, context) {
    if (this.useGemini) {
      try {
        return await this._geminiRefineMessage(currentMessage, refinementType, context);
      } catch (err) {
        console.warn('Gemini refinement failed, using fallback:', err.message);
      }
    }
    return this.fallback.refineMessage(currentMessage, refinementType, context);
  }

  // --- Gemini API Integration ---

  _callGeminiAPI(prompt) {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1024,
          topP: 0.95
        }
      });

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              resolve(text);
            } else {
              reject(new Error('No text in Gemini response: ' + data));
            }
          } catch (e) {
            reject(new Error('Failed to parse Gemini response: ' + e.message));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(15000, () => {
        req.destroy();
        reject(new Error('Gemini API timeout'));
      });
      req.write(body);
      req.end();
    });
  }

  async _geminiGenerateMessages({ photoInfo, intention, recipient, mood }) {
    const photoDesc = photoInfo?.description || 'A personal photograph';
    const intentionText = intention?.trim() || 'something meaningful';
    const isUndecided = !intention?.trim() || intention.toLowerCase().includes("don't know") || intention.toLowerCase().includes("not sure");

    const prompt = `You are DEARLY, a warm and empathetic AI that helps people send heartfelt messages to loved ones.

Photo description: "${photoDesc}"
Recipient: ${recipient}
Mood: ${mood}
What the user wants to say: "${isUndecided ? 'The user is not sure — suggest something heartfelt based on the photo' : intentionText}"

Generate exactly 3 short, touching message options for a greeting card or social post. Each should feel personal, warm, and human — not generic.

Rules:
- Each message: 1-3 sentences max, conversational, no hashtags
- Style options: (1) Warm & tender, (2) Poetic & evocative, (3) Simple & heartfelt
- Use light emoji at end if it feels right (1 max per message)
- Keep messages appropriate for the recipient relationship

Respond ONLY with valid JSON array, no markdown, no explanation:
[
  {"id": "opt_1", "style": "Warm", "label": "Warm & Tender", "text": "..."},
  {"id": "opt_2", "style": "Poetic", "label": "Poetic", "text": "..."},
  {"id": "opt_3", "style": "Simple", "label": "Simple & Sweet", "text": "..."}
]`;

    const rawText = await this._callGeminiAPI(prompt);

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array in Gemini response');

    const candidates = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(candidates) || candidates.length === 0) {
      throw new Error('Invalid candidates array from Gemini');
    }
    return candidates;
  }

  async _geminiRefineMessage(currentMessage, refinementType, context) {
    const instructions = {
      warmer: 'Make it warmer, more tender and emotionally rich.',
      shorter: 'Make it shorter and more concise while keeping the emotion.',
      funnier: 'Add a gentle, warm touch of humor appropriate for the relationship.',
      different: 'Rewrite it completely in a different style while keeping the sentiment.'
    };

    const instruction = instructions[refinementType] || instructions.different;
    const prompt = `You are DEARLY, a warm AI assistant.

Current message: "${currentMessage}"
Recipient: ${context?.recipient || 'someone special'}
Mood: ${context?.mood || 'Loving'}

Task: ${instruction}

Rules: Keep it to 1-3 sentences, personal and human. No hashtags. Max 1 emoji.

Respond with ONLY the new message text, nothing else.`;

    const refined = await this._callGeminiAPI(prompt);
    return refined.trim().replace(/^["']|["']$/g, '');
  }
}

// --- Built-in Contextual Engine Fallback ---

class ContextualEngineProvider {
  async analyzePhoto(photoInfo = {}) {
    const desc = (photoInfo.description || photoInfo.title || '').toLowerCase();

    let scene = 'a peaceful moment';
    let vibe = 'warm and tender';
    let recommendedTemplate = 'Warm';

    if (desc.includes('grandchild') || desc.includes('child') || desc.includes('kid') || desc.includes('girl') || desc.includes('boy')) {
      scene = 'childhood joy';
      vibe = 'pure, loving, and joyful';
      recommendedTemplate = 'Warm';
    } else if (desc.includes('cake') || desc.includes('candle') || desc.includes('birthday') || desc.includes('party')) {
      scene = 'birthday celebration';
      vibe = 'celebratory and joyful';
      recommendedTemplate = 'Classic';
    } else if (desc.includes('coffee') || desc.includes('morning') || desc.includes('tea')) {
      scene = 'quiet morning';
      vibe = 'peaceful and refreshing';
      recommendedTemplate = 'Classic';
    } else if (desc.includes('flower') || desc.includes('bloom') || desc.includes('garden') || desc.includes('peony')) {
      scene = 'natural blooms';
      vibe = 'gentle and uplifting';
      recommendedTemplate = 'Warm';
    } else if (desc.includes('sea') || desc.includes('beach') || desc.includes('sunset') || desc.includes('anniversary')) {
      scene = 'timeless sunset';
      vibe = 'romantic and serene';
      recommendedTemplate = 'Elegant';
    } else if (desc.includes('baby') || desc.includes('newborn') || desc.includes('infant')) {
      scene = 'new arrival';
      vibe = 'pure love and wonder';
      recommendedTemplate = 'Warm';
    }
    const potentialKeywords = ['grandchild', 'child', 'kid', 'girl', 'boy', 'baby', 'cake', 'birthday', 'morning', 'coffee', 'flower', 'beach', 'sunset', 'anniversary', 'park'];
    const detectedSubjects = potentialKeywords.filter(k => desc.includes(k));

    return { scene, vibe, recommendedTemplate, detectedSubjects };
  }

  async generateMessages({ photoInfo = {}, intention = '', recipient = 'Someone Special', mood = 'Loving' }) {
    const cleanIntention = (intention || '').trim();
    const isUndecided = !cleanIntention || cleanIntention.toLowerCase().includes("don't know") || cleanIntention.toLowerCase().includes("not sure");

    if (isUndecided) {
      return this._undecidedMessages(recipient, photoInfo, mood);
    }
    return this._synthesizeMessages(cleanIntention, recipient, mood, photoInfo);
  }

  _undecidedMessages(recipient, photoInfo, mood) {
    const isGrandchild = recipient.toLowerCase().includes('grandchild');
    const isChild = recipient.toLowerCase().includes('child');
    const isPartner = recipient.toLowerCase().includes('partner');
    const isFriend = recipient.toLowerCase().includes('friend');
    const isFamily = recipient.toLowerCase().includes('family');

    if (isGrandchild) {
      return [
        { id: 'opt_1', style: 'Warm', label: 'Warm & Tender', text: "Every time I see this, I think of you and how much light you bring into my world. Sending you the biggest hug today! ❤️" },
        { id: 'opt_2', style: 'Poetic', label: 'Poetic', text: "Some moments are so full of love they feel like they belong in a story. You are my favorite chapter." },
        { id: 'opt_3', style: 'Simple', label: 'Simple & Sweet', text: "Just thinking of you today and smiling. Miss you! 🌸" }
      ];
    }
    if (isPartner) {
      return [
        { id: 'opt_1', style: 'Warm', label: 'Warm & Tender', text: "Every day with you feels like a gift. Thank you for being my favorite person in the world. ❤️" },
        { id: 'opt_2', style: 'Poetic', label: 'Poetic', text: "Some things only get more beautiful with time — like us, and like this moment." },
        { id: 'opt_3', style: 'Simple', label: 'Simple & Sweet', text: "Just wanted you to know I'm thinking of you and I love you. 💕" }
      ];
    }
    if (isFriend) {
      return [
        { id: 'opt_1', style: 'Warm', label: 'Warm & Tender', text: "Saw this and thought of you immediately. Some friendships just make life so much better! 🌸" },
        { id: 'opt_2', style: 'Poetic', label: 'Poetic', text: "Good friends are like stars — you don't always see them, but you always know they're there." },
        { id: 'opt_3', style: 'Simple', label: 'Simple & Sweet', text: "Thinking of you today! Hope your day is as wonderful as you are. ✨" }
      ];
    }
    // Default / Family
    return [
      { id: 'opt_1', style: 'Warm', label: 'Warm & Tender', text: "Moments like this remind me how grateful I am for every single person in my life. Sending so much love! ❤️" },
      { id: 'opt_2', style: 'Poetic', label: 'Poetic', text: "The best things in life aren't things at all — they're moments, people, and the love we share." },
      { id: 'opt_3', style: 'Simple', label: 'Simple & Sweet', text: "Just thinking of you today and sending all my love. 🌸" }
    ];
  }

  _synthesizeMessages(intention, recipient, mood, photoInfo) {
    const isBirthday = /birthday|happy birthday/i.test(intention);
    const isMissing = /miss|thinking of you/i.test(intention);
    const isThankYou = /thank|grateful/i.test(intention);
    const isMorning = /morning|good morning/i.test(intention);
    const isCongrats = /congrat|well done|proud/i.test(intention);

    if (isBirthday) {
      return [
        { id: 'opt_1', style: 'Warm', label: 'Warm & Tender', text: `Happy Birthday, ${recipient}! 🎂 Today is all about celebrating you and how much joy you bring to everyone around you. Here's to a wonderful year ahead!` },
        { id: 'opt_2', style: 'Poetic', label: 'Poetic', text: `Another year, another reason to be grateful for having you in our lives. Happy Birthday — may this year be filled with all the magic you deserve. ✨` },
        { id: 'opt_3', style: 'Simple', label: 'Simple & Sweet', text: `Wishing you the happiest of birthdays! So much love for you today. 🎉` }
      ];
    }
    if (isMorning) {
      return [
        { id: 'opt_1', style: 'Warm', label: 'Warm & Tender', text: "Good morning! ☀️ Wishing you a day filled with small moments that make you smile. You deserve all the best today." },
        { id: 'opt_2', style: 'Poetic', label: 'Poetic', text: "May this morning bring you all the peace and possibility a new day holds. Rise up, the world is waiting for you. 🌅" },
        { id: 'opt_3', style: 'Simple', label: 'Simple & Sweet', text: "Good morning! Sending you love and good vibes to start your day. ☀️" }
      ];
    }
    if (isMissing) {
      return [
        { id: 'opt_1', style: 'Warm', label: 'Warm & Tender', text: `Distance may keep us apart, but you are always in my heart. Thinking of you and missing you so much. ❤️` },
        { id: 'opt_2', style: 'Poetic', label: 'Poetic', text: `No matter how far apart we are, some people just stay close to your heart. You are one of them. Missing you. 🌸` },
        { id: 'opt_3', style: 'Simple', label: 'Simple & Sweet', text: `Just thinking of you today. Miss you lots! 💕` }
      ];
    }
    if (isThankYou) {
      return [
        { id: 'opt_1', style: 'Warm', label: 'Warm & Tender', text: `Thank you from the bottom of my heart. Your kindness and thoughtfulness mean more to me than words can say. ❤️` },
        { id: 'opt_2', style: 'Poetic', label: 'Poetic', text: `Gratitude is a feeling that needs to be spoken. Thank you for everything — big and small. You matter so much.` },
        { id: 'opt_3', style: 'Simple', label: 'Simple & Sweet', text: `Thank you so much! I truly appreciate you. 🙏` }
      ];
    }
    if (isCongrats) {
      return [
        { id: 'opt_1', style: 'Warm', label: 'Warm & Tender', text: `Congratulations! 🎉 I am so incredibly proud of you and everything you have accomplished. This is just the beginning!` },
        { id: 'opt_2', style: 'Poetic', label: 'Poetic', text: `Hard work, heart, and dedication — you have all three in abundance. Congratulations on this wonderful achievement. ✨` },
        { id: 'opt_3', style: 'Simple', label: 'Simple & Sweet', text: `So proud of you! Congratulations! You deserve this and so much more. 🌟` }
      ];
    }

    // Generic fallback with intention
    return [
      { id: 'opt_1', style: 'Warm', label: 'Warm & Tender', text: `${intention}. Thinking of you and sending all my love your way, always. ❤️` },
      { id: 'opt_2', style: 'Poetic', label: 'Poetic', text: `${intention}. Some things in life are just too good not to share. You are one of them.` },
      { id: 'opt_3', style: 'Simple', label: 'Simple & Sweet', text: `${intention}. Sending love! 🌸` }
    ];
  }

  async refineMessage(currentMessage, refinementType, context) {
    const words = currentMessage.split(' ');

    switch (refinementType) {
      case 'shorter':
        // Take first sentence or ~12 words
        const firstSentence = currentMessage.match(/^[^.!?]+[.!?]/)?.[0];
        return firstSentence || words.slice(0, 12).join(' ') + (words.length > 12 ? ' ❤️' : '');

      case 'warmer':
        const warmPhrases = [
          "With all the love in my heart — ",
          "You mean the world to me — ",
          "Sending you the biggest hug — "
        ];
        const prefix = warmPhrases[Math.floor(Math.random() * warmPhrases.length)];
        return prefix + currentMessage;

      case 'funnier':
        return currentMessage.replace(/❤️|🌸|💕/g, '😄') + " (And remember, you're always my favorite! 😉)";

      case 'different':
        // Return a fresh take
        const fresh = [
          `You popped into my mind today and I just had to reach out. ${currentMessage.split('.')[0]}. 💕`,
          `Life is short and love is everything. ${currentMessage.split('!')[0] || currentMessage}. ❤️`,
          `Every now and then, the universe reminds us what matters most. Today it reminded me of you. 🌸`
        ];
        return fresh[Math.floor(Math.random() * fresh.length)];

      default:
        return currentMessage;
    }
  }
}

module.exports = { AIOrchestrator };
