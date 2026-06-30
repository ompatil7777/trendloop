"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "../supabase/client";
import { siteConfig } from "../../config/site";
import { Board, BoardItem, Product, User } from "../mock-data/fixtures";
import { analytics } from "../analytics/trackEvent";
import { Mail, Lock, User as UserIcon, X } from "lucide-react";

interface AppContextType {
  user: User | null;
  savedProductIds: string[];
  toggleSaveProduct: (productId: string) => void;
  isSaved: (productId: string) => boolean;
  currency: 'INR' | 'USD';
  setCurrency: (curr: 'INR' | 'USD') => void;
  formatPrice: (priceInINR: number) => string;
  boards: Board[];
  createBoard: (name: string, description?: string) => Promise<Board | null>;
  addProductToBoard: (boardId: string, productId: string, note?: string) => Promise<void>;
  removeProductFromBoard: (boardId: string, productId: string) => Promise<void>;
  toasts: { id: string; message: string; type: 'success' | 'info' | 'error' }[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  showAuthModal: boolean;
  setShowAuthModal: (open: boolean) => void;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const supabase = createClient();

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currency, setCurrencyState] = useState<'INR' | 'USD'>(siteConfig.activeCurrency);
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'error' }[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  
  // Auth Form State
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [authDisplayName, setAuthDisplayName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync user profile, saves, and boards
  const syncUserData = async (userId: string) => {
    try {
      // 1. Fetch public profile
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (profile) {
        setUser(profile as User);
      }

      // 2. Fetch saves
      const { data: saves } = await supabase
        .from("saved_products")
        .select("product_id")
        .eq("user_id", userId);

      if (saves) {
        setSavedProductIds(saves.map((s) => s.product_id));
      }

      // 3. Fetch boards
      const { data: boardsData } = await supabase
        .from("boards")
        .select("*, board_items(*)")
        .eq("user_id", userId);

      if (boardsData) {
        setBoards(
          boardsData.map((b) => ({
            ...b,
            items: b.board_items || [],
          }))
        );
      }
    } catch (err) {
      console.error("Error syncing user data:", err);
    }
  };

  // Listen to Supabase Auth state changes
  useEffect(() => {
    const handleAuthState = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await syncUserData(session.user.id);
      } else {
        setUser(null);
        setSavedProductIds([]);
        setBoards([]);
      }
    };

    handleAuthState();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await syncUserData(session.user.id);
      } else {
        setUser(null);
        setSavedProductIds([]);
        setBoards([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setCurrency = (curr: 'INR' | 'USD') => {
    setCurrencyState(curr);
    addToast(`Switched currency to ${curr}`, 'info');
  };

  const formatPrice = (priceInINR: number): string => {
    if (currency === 'INR') {
      return `₹${priceInINR.toLocaleString('en-IN')}`;
    } else {
      const converted = priceInINR / siteConfig.currencies.USD.rateToINR;
      return `$${converted.toFixed(2)}`;
    }
  };

  // Toggle Save Product (Persists to Supabase)
  const toggleSaveProduct = async (productId: string) => {
    if (!user) {
      addToast("Please login to save products", "info");
      setShowAuthModal(true);
      return;
    }

    const isCurrentlySaved = savedProductIds.includes(productId);

    // Optimistic UI updates
    if (isCurrentlySaved) {
      setSavedProductIds((prev) => prev.filter((id) => id !== productId));
      addToast("Removed from saved items", "info");

      const { error } = await supabase
        .from("saved_products")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) {
        setSavedProductIds((prev) => [...prev, productId]); // Rollback
        addToast("Error unsaving product", "error");
      }
    } else {
      setSavedProductIds((prev) => [...prev, productId]);
      addToast("Saved successfully!", "success");

      const { error } = await supabase
        .from("saved_products")
        .insert({ user_id: user.id, product_id: productId });

      if (error) {
        setSavedProductIds((prev) => prev.filter((id) => id !== productId)); // Rollback
        addToast("Error saving product", "error");
      } else {
        const { data: prod } = await supabase.from("products").select("name").eq("id", productId).maybeSingle();
        if (prod) analytics.productSaved({ id: productId, name: prod.name });
      }
    }
  };

  const isSaved = (productId: string) => savedProductIds.includes(productId);

  // Board CRUD operations
  const createBoard = async (name: string, description = ""): Promise<Board | null> => {
    if (!user) {
      addToast("Please login to create boards", "info");
      setShowAuthModal(true);
      return null;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    const { data, error } = await supabase
      .from("boards")
      .insert({
        user_id: user.id,
        name,
        slug,
        description,
        is_public: true,
        cover_image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80"
      })
      .select()
      .single();

    if (error) {
      addToast("Error creating board", "error");
      console.error(error);
      return null;
    }

    const newBoard = { ...data, items: [] };
    setBoards((prev) => [...prev, newBoard]);
    addToast(`Created board "${name}"`, "success");
    return newBoard;
  };

  const addProductToBoard = async (boardId: string, productId: string, note = "") => {
    if (!user) return;

    // Check duplicate
    const activeBoard = boards.find(b => b.id === boardId);
    if (activeBoard?.items.some(item => item.product_id === productId)) {
      addToast("Product is already pinned to this board!", "info");
      return;
    }

    const { data: pin, error } = await supabase
      .from("board_items")
      .insert({
        board_id: boardId,
        product_id: productId,
        note
      })
      .select()
      .single();

    if (error) {
      addToast("Error pinning product", "error");
      return;
    }

    // Update board cover image to matching product image
    const { data: prod } = await supabase
      .from("products")
      .select("images")
      .eq("id", productId)
      .maybeSingle();

    const coverImg = prod?.images?.[0]?.url || activeBoard?.cover_image;

    await supabase
      .from("boards")
      .update({ cover_image: coverImg })
      .eq("id", boardId);

    setBoards((prevBoards) =>
      prevBoards.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          cover_image: coverImg,
          items: [...b.items, pin as BoardItem]
        };
      })
    );
    addToast("Pinned to board!", "success");
  };

  const removeProductFromBoard = async (boardId: string, productId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("board_items")
      .delete()
      .eq("board_id", boardId)
      .eq("product_id", productId);

    if (error) {
      addToast("Error unpinning product", "error");
      return;
    }

    setBoards((prevBoards) =>
      prevBoards.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          items: b.items.filter((item) => item.product_id !== productId)
        };
      })
    );
    addToast("Removed item from board", "info");
  };

  // Auth Operations
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      addToast("Email and Password are required.", "error");
      return;
    }

    setAuthLoading(true);

    try {
      if (authTab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });

        if (error) {
          addToast(error.message, "error");
        } else {
          addToast("Logged in successfully!", "success");
          setShowAuthModal(false);
          setAuthEmail("");
          setAuthPassword("");
        }
      } else {
        if (!authUsername.trim()) {
          addToast("Username is required for sign up.", "error");
          setAuthLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              username: authUsername.trim().toLowerCase(),
              display_name: authDisplayName.trim() || authUsername.trim()
            }
          }
        });

        if (error) {
          addToast(error.message, "error");
        } else {
          addToast("Registration complete! Welcome to Trendloop.", "success");
          setShowAuthModal(false);
          setAuthEmail("");
          setAuthPassword("");
          setAuthUsername("");
          setAuthDisplayName("");
        }
      }
    } catch (err) {
      console.error(err);
      addToast("Connection error. Try again.", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      addToast("Logged out successfully.", "info");
      setUser(null);
      setSavedProductIds([]);
      setBoards([]);
    } else {
      addToast("Error logging out", "error");
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        savedProductIds,
        toggleSaveProduct,
        isSaved,
        currency,
        setCurrency,
        formatPrice,
        boards,
        createBoard,
        addProductToBoard,
        removeProductFromBoard,
        toasts,
        addToast,
        removeToast,
        showAuthModal,
        setShowAuthModal,
        signOut
      }}
    >
      {children}

      {/* DYNAMIC FLOATING NOTIFICATIONS */}
      <div className="fixed bottom-24 md:bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border border-white/10 glass-effect text-foreground text-sm font-sans transition-all duration-300 animate-slide-up"
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <span className="w-2 h-2 rounded-full bg-gold" />}
              {toast.type === 'info' && <span className="w-2 h-2 rounded-full bg-neutral-400" />}
              {toast.type === 'error' && <span className="w-2 h-2 rounded-full bg-red-500" />}
              <span>{toast.message}</span>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-foreground/45 hover:text-foreground text-xs">✕</button>
          </div>
        ))}
      </div>

      {/* PREMIUM FLOATING AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-card border border-card-border rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl relative animate-slide-up">
            
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-foreground/40 hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Heading */}
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black uppercase tracking-tight text-foreground font-display">
                {authTab === 'login' ? "Welcome back" : "Create Account"}
              </h3>
              <p className="text-[10px] uppercase font-bold text-gold tracking-widest">
                Trendloop Curator Access
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4 pt-2">
              {authTab === 'signup' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5" /> Username *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. streetwear_guru"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Karan Sen"
                      value={authDisplayName}
                      onChange={(e) => setAuthDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Address *
                </label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Password *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 rounded-xl bg-foreground text-background hover:bg-gold hover:text-white dark:bg-foreground dark:text-background dark:hover:bg-gold dark:hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                {authLoading ? "Verifying..." : authTab === 'login' ? "Login to Loop" : "Register Profile"}
              </button>
            </form>

            {/* Toggle tabs */}
            <div className="text-center pt-2">
              <button
                onClick={() => setAuthTab(authTab === 'login' ? 'signup' : 'login')}
                className="text-[10px] font-bold uppercase tracking-widest text-gold hover:underline"
              >
                {authTab === 'login' ? "Need an account? Sign up" : "Already have an account? Login"}
              </button>
            </div>

          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-up {
          animation: slideUp 200ms ease-out forwards;
        }
      `}</style>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
