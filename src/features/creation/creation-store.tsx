import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, CreationDraft } from "@/domain/entities/types";
import { getVariant } from "@/domain/catalog";

const DRAFT_KEY = "dearly.draft.v1";
const CART_KEY = "dearly.cart.v1";
const PREFS_KEY = "dearly.prefs.v1";

export function emptyDraft(): CreationDraft {
  return {
    id: `cre_${Math.random().toString(36).slice(2, 10)}`,
    outcome: "card",
    title: "Untitled",
    photo: null,
    rightsConfirmedAt: null,
    recipientNickname: "",
    relationship: "unspecified",
    occasion: "unspecified",
    mood: "unspecified",
    memory: "",
    senderName: "",
    language: "English",
    message: "",
    styleId: "original",
    styleIntensity: "medium",
    styleJobStatus: "complete",
    artworkRenders: {},
    templateId: "warm",
    ratioId: "square",
    fontId: "handwritten",
    foilColor: "gold",
    styleIntensityPercent: 85,
    textPosition: "bottom-center",
    imageRotation: 0,
    textCoordinates: null,
    dedication: "",
    variantId: null,
    quantity: 1,
    qualityAcknowledged: false,
    updatedAt: new Date().toISOString(),
    retentionClass: "guest-24h",
  };
}

export interface Preferences {
  textSize: "standard" | "large";
}

interface StoreValue {
  draft: CreationDraft;
  hydrated: boolean;
  updateDraft: (patch: Partial<CreationDraft>) => void;
  resetDraft: () => void;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  promoCode: string | null;
  setPromoCode: (code: string | null) => void;
  prefs: Preferences;
  setTextSize: (size: Preferences["textSize"]) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? ({ ...fallback, ...(JSON.parse(raw) as object) } as T) : fallback;
  } catch {
    return fallback;
  }
}

export function CreationStoreProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<CreationDraft>(() => emptyDraft());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Preferences>({ textSize: "standard" });
  const [hydrated, setHydrated] = useState(false);

  // Hydrate after mount so SSR and client markup match.
  useEffect(() => {
    setDraft((current) => {
      const restored = read<CreationDraft>(DRAFT_KEY, current);
      // Never resume an artwork job on load — artwork is created only when the
      // user picks a style.
      if (restored.styleJobStatus === "queued" || restored.styleJobStatus === "processing") {
        restored.styleJobStatus = "complete";
      }
      return restored;
    });
    try {
      const rawCart = window.localStorage.getItem(CART_KEY);
      if (rawCart) setCart(JSON.parse(rawCart) as CartItem[]);
    } catch {
      /* ignore corrupt cart */
    }
    setPrefs(read<Preferences>(PREFS_KEY, { textSize: "standard" }));
    setHydrated(true);
  }, []);

  // Autosave (debounced) once hydrated.
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch {
        /* storage full or blocked — work stays in memory */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [draft, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
    document.documentElement.dataset["textSize"] = prefs.textSize;
  }, [prefs, hydrated]);

  const updateDraft = useCallback((patch: Partial<CreationDraft>) => {
    setDraft((current) => ({ ...current, ...patch, updatedAt: new Date().toISOString() }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(emptyDraft());
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, "id">) => {
    setCart((current) => [...current, { ...item, id: `ci_${Math.random().toString(36).slice(2, 9)}` }]);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((current) => current.filter((item) => item.id !== id));
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setCart((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const setTextSize = useCallback((textSize: Preferences["textSize"]) => {
    setPrefs((p) => ({ ...p, textSize }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      draft,
      hydrated,
      updateDraft,
      resetDraft,
      cart,
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      promoCode,
      setPromoCode,
      prefs,
      setTextSize,
    }),
    [
      draft,
      hydrated,
      updateDraft,
      resetDraft,
      cart,
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      promoCode,
      prefs,
      setTextSize,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside CreationStoreProvider");
  return ctx;
}

export function cartItemTitle(item: CartItem): string {
  const variant = getVariant(item.variantId);
  return variant ? variant.label : "Item";
}
