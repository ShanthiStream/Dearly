import type { OccasionId } from "./entities/types";
import familyPhoto from "@/assets/sample-family.jpg";
import petPhoto from "@/assets/sample-pet-watercolor.jpg";
import framedPrint from "@/assets/sample-framed-print.jpg";
import couplePhoto from "@/assets/sample-couple-impressionist.jpg";

export interface OccasionCategory {
  id: string;
  label: string;
  emoji: string;
  occasionId?: OccasionId;
}

export interface OccasionImageItem {
  id: string;
  title: string;
  categoryId: string;
  occasionId?: OccasionId;
  url: string;
  thumbUrl: string;
  credit: string;
  source: "Unsplash" | "Dearly Curated" | "Wikimedia";
  tags: string[];
}

export const OCCASION_CATEGORIES: OccasionCategory[] = [
  { id: "all", label: "All Photos", emoji: "✨" },
  { id: "birthday", label: "Birthday", emoji: "🎂", occasionId: "birthday" },
  { id: "romance", label: "Anniversary & Romance", emoji: "💍", occasionId: "congratulations" },
  { id: "gratitude", label: "Thank You & Gratitude", emoji: "💐", occasionId: "thank-you" },
  { id: "baby", label: "Baby & Family", emoji: "👶", occasionId: "congratulations" },
  { id: "pets", label: "Pets & Companions", emoji: "🐾", occasionId: "just-because" },
  { id: "celebration", label: "Congratulations & Milestones", emoji: "🎓", occasionId: "congratulations" },
  { id: "sympathy", label: "Thinking of You & Sympathy", emoji: "🕊️", occasionId: "thinking-of-you" },
  { id: "nature", label: "Nature & Serenity", emoji: "🌿", occasionId: "good-morning" },
  { id: "holidays", label: "Holidays & Winter", emoji: "🎄", occasionId: "just-because" },
];

export const OCCASION_IMAGES: OccasionImageItem[] = [
  // --- BIRTHDAY ---
  {
    id: "bday-1",
    title: "Artisan Cake & Glowing Candles",
    categoryId: "birthday",
    occasionId: "birthday",
    url: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=400&q=75",
    credit: "David Holifield",
    source: "Unsplash",
    tags: ["birthday", "cake", "candle", "sweet", "celebration", "party"],
  },
  {
    id: "bday-2",
    title: "Festive Balloons & Celebration",
    categoryId: "birthday",
    occasionId: "birthday",
    url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=400&q=75",
    credit: "Adi Goldstein",
    source: "Unsplash",
    tags: ["birthday", "balloons", "joy", "colorful", "party", "fun"],
  },
  {
    id: "bday-3",
    title: "Golden Birthday Sparkler",
    categoryId: "birthday",
    occasionId: "birthday",
    url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=75",
    credit: "Kobu Agency",
    source: "Unsplash",
    tags: ["birthday", "sparkler", "glow", "night", "celebration", "magic"],
  },
  {
    id: "bday-4",
    title: "Pastel Party Confetti",
    categoryId: "birthday",
    occasionId: "birthday",
    url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=75",
    credit: "Joanna Kosinska",
    source: "Unsplash",
    tags: ["birthday", "confetti", "party", "pastel", "happy"],
  },

  // --- ANNIVERSARY & ROMANCE ---
  {
    id: "romance-1",
    title: "Evening Walk Together",
    categoryId: "romance",
    occasionId: "congratulations",
    url: couplePhoto,
    thumbUrl: couplePhoto,
    credit: "Dearly Studio",
    source: "Dearly Curated",
    tags: ["anniversary", "romance", "couple", "love", "walk", "sunset"],
  },
  {
    id: "romance-2",
    title: "Bridal Bouquet & Silk",
    categoryId: "romance",
    occasionId: "congratulations",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=75",
    credit: "Jeremy Wong",
    source: "Unsplash",
    tags: ["wedding", "anniversary", "flowers", "bouquet", "white", "roses"],
  },
  {
    id: "romance-3",
    title: "Wedding Rings on Velvet",
    categoryId: "romance",
    occasionId: "congratulations",
    url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=75",
    credit: "Sandy Millar",
    source: "Unsplash",
    tags: ["rings", "wedding", "gold", "anniversary", "promise", "love"],
  },
  {
    id: "romance-4",
    title: "Golden Hour Romance",
    categoryId: "romance",
    occasionId: "congratulations",
    url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=400&q=75",
    credit: "Scott Broome",
    source: "Unsplash",
    tags: ["romance", "couple", "hands", "sunlight", "warmth", "intimate"],
  },

  // --- THANK YOU & GRATITUDE ---
  {
    id: "grat-1",
    title: "Fresh Spring Blooms",
    categoryId: "gratitude",
    occasionId: "thank-you",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=400&q=75",
    credit: "Alisa Anton",
    source: "Unsplash",
    tags: ["thank you", "flowers", "spring", "gratitude", "blossom", "peonies"],
  },
  {
    id: "grat-2",
    title: "Soft Morning Garden Peonies",
    categoryId: "gratitude",
    occasionId: "thank-you",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=75",
    credit: "Evie S.",
    source: "Unsplash",
    tags: ["thank you", "peonies", "garden", "pink", "soft", "elegant"],
  },
  {
    id: "grat-3",
    title: "Warm Tea & Lavender",
    categoryId: "gratitude",
    occasionId: "thank-you",
    url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=75",
    credit: "Sixteen Miles Out",
    source: "Unsplash",
    tags: ["tea", "cozy", "gratitude", "calm", "friendship", "warm"],
  },

  // --- BABY & FAMILY ---
  {
    id: "baby-1",
    title: "Generations: Family Bond",
    categoryId: "baby",
    occasionId: "congratulations",
    url: familyPhoto,
    thumbUrl: familyPhoto,
    credit: "Dearly Studio",
    source: "Dearly Curated",
    tags: ["family", "grandmother", "child", "generations", "love", "home"],
  },
  {
    id: "baby-2",
    title: "Newborn Sweet Slumber",
    categoryId: "baby",
    occasionId: "congratulations",
    url: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=400&q=75",
    credit: "Colin Maynard",
    source: "Unsplash",
    tags: ["baby", "newborn", "sleeping", "innocence", "child", "birth"],
  },
  {
    id: "baby-3",
    title: "Tiny Newborn Feet",
    categoryId: "baby",
    occasionId: "congratulations",
    url: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=400&q=75",
    credit: "Christian Bowen",
    source: "Unsplash",
    tags: ["baby", "feet", "tiny", "newborn", "welcome", "tender"],
  },

  // --- PETS & ANIMALS ---
  {
    id: "pets-1",
    title: "Joyful Golden Retriever",
    categoryId: "pets",
    occasionId: "just-because",
    url: petPhoto,
    thumbUrl: petPhoto,
    credit: "Dearly Studio",
    source: "Dearly Curated",
    tags: ["dog", "pet", "golden retriever", "happy", "companion", "puppy"],
  },
  {
    id: "pets-2",
    title: "Smiling Dog in Meadow",
    categoryId: "pets",
    occasionId: "just-because",
    url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=75",
    credit: "Alvan Nee",
    source: "Unsplash",
    tags: ["dog", "puppy", "field", "summer", "playful"],
  },
  {
    id: "pets-3",
    title: "Sweet Sleeping Kitten",
    categoryId: "pets",
    occasionId: "just-because",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=75",
    credit: "Kari Shea",
    source: "Unsplash",
    tags: ["cat", "kitten", "cute", "nap", "whiskers", "soft"],
  },

  // --- CONGRATULATIONS & MILESTONES ---
  {
    id: "celeb-1",
    title: "Graduation Caps in the Sky",
    categoryId: "celebration",
    occasionId: "congratulations",
    url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=400&q=75",
    credit: "Good Free Photos",
    source: "Unsplash",
    tags: ["graduation", "congratulations", "success", "future", "degree", "proud"],
  },
  {
    id: "celeb-2",
    title: "Champagne Celebration Toast",
    categoryId: "celebration",
    occasionId: "congratulations",
    url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=400&q=75",
    credit: "Hermes Rivera",
    source: "Unsplash",
    tags: ["champagne", "celebrate", "toast", "congratulations", "cheers", "bubbles"],
  },

  // --- THINKING OF YOU & SYMPATHY ---
  {
    id: "symp-1",
    title: "Tranquil Dawn Waters",
    categoryId: "sympathy",
    occasionId: "thinking-of-you",
    url: framedPrint,
    thumbUrl: framedPrint,
    credit: "Dearly Studio",
    source: "Dearly Curated",
    tags: ["sea", "calm", "morning", "coast", "peace", "sympathy"],
  },
  {
    id: "symp-2",
    title: "Warm Memory Candle",
    categoryId: "sympathy",
    occasionId: "thinking-of-you",
    url: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=400&q=75",
    credit: "Priscilla Du Preez",
    source: "Unsplash",
    tags: ["candle", "light", "memory", "peace", "quiet", "sympathy"],
  },

  // --- NATURE & SERENITY ---
  {
    id: "nat-1",
    title: "Serene Alpine Morning",
    categoryId: "nature",
    occasionId: "good-morning",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=75",
    credit: "Bailey Zindel",
    source: "Unsplash",
    tags: ["nature", "mountains", "landscape", "lake", "serene", "dawn"],
  },
  {
    id: "nat-2",
    title: "Golden Hour Ocean Shore",
    categoryId: "nature",
    occasionId: "good-morning",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=75",
    credit: "Sean Oulashin",
    source: "Unsplash",
    tags: ["beach", "waves", "ocean", "sunset", "horizon", "calm"],
  },

  // --- HOLIDAYS & WINTER ---
  {
    id: "hol-1",
    title: "Warm Fairy Lights & Pine",
    categoryId: "holidays",
    occasionId: "just-because",
    url: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1200&q=85",
    thumbUrl: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=400&q=75",
    credit: "Kira auf der Heide",
    source: "Unsplash",
    tags: ["christmas", "holiday", "lights", "winter", "pine", "festive"],
  },
];
