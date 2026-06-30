"use client";

import { useState, useEffect } from "react";
import { useApp } from "../../lib/context/AppContext";
import { Product } from "../../lib/mock-data/fixtures";
import { getProductsByIds } from "../../lib/data/products";
import ProductCard from "../../components/feed/ProductCard";
import Link from "next/link";
import { Folder, Heart, LogOut, Shield, FolderHeart, Plus, Lock } from "lucide-react";

interface AccountDashboardProps {
  initialTab?: 'saved' | 'boards';
}

export default function AccountDashboard({ initialTab = 'saved' }: AccountDashboardProps) {
  const { user, savedProductIds, boards, createBoard, signOut, setShowAuthModal } = useApp();
  const [activeTab, setActiveTab] = useState<'saved' | 'boards'>(initialTab);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDesc, setNewBoardDesc] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Dynamically load saved products from Supabase
  useEffect(() => {
    async function fetchSaved() {
      if (!user || savedProductIds.length === 0) {
        setSavedProducts([]);
        return;
      }
      setLoadingSaved(true);
      try {
        const data = await getProductsByIds(savedProductIds);
        setSavedProducts(data);
      } catch (err) {
        console.error("Error loading saved products:", err);
      } finally {
        setLoadingSaved(false);
      }
    }
    fetchSaved();
  }, [savedProductIds, user]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    await createBoard(newBoardName.trim(), newBoardDesc.trim());
    setNewBoardName("");
    setNewBoardDesc("");
    setShowCreateModal(false);
  };

  // 0. UNAUTHENTICATED STATE
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 flex flex-col items-center justify-center text-center space-y-6 animate-slide-up">
        <div className="w-16 h-16 rounded-full border border-card-border bg-card/65 flex items-center justify-center text-gold shadow-lg">
          <Lock className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black uppercase text-foreground font-display tracking-tight">
            Curator Access
          </h1>
          <p className="text-xs sm:text-sm text-foreground/50 max-w-xs leading-relaxed">
            Create custom design boards, save items to your personal feed, and manage your curator catalog.
          </p>
        </div>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-8 py-3.5 rounded-2xl bg-foreground text-background hover:bg-gold hover:text-white transition-all text-xs font-bold uppercase tracking-widest shadow-xl flex items-center gap-2 cursor-pointer"
        >
          Sign In or Register
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* 1. CURATOR ACCOUNT BIO CARD */}
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left border-b border-card-border pb-8">
        <img
          src={user.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
          alt={user.display_name || user.username}
          className="w-20 h-20 rounded-full object-cover border border-card-border shadow-sm bg-card"
        />
        
        <div className="space-y-3 flex-grow">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-xl sm:text-2xl font-black uppercase text-foreground font-display">
                {user.display_name || user.username}
              </h1>
              <span className="text-[10px] font-bold text-gold uppercase tracking-widest border border-gold-light bg-gold-light px-2.5 py-0.5 rounded-full w-max mx-auto sm:mx-0">
                {user.role === 'admin' ? 'Admin Curator' : 'Trend Curator'}
              </span>
            </div>
            <span className="text-xs text-foreground/40 font-semibold tracking-wider block mt-1">
              @{user.username}
            </span>
          </div>
          
          <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed max-w-xl font-sans">
            {user.bio || "Styling streetwear oversized fits & designing cozy room aesthetics. Curator @ Trendloop."}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border border-card-border hover:bg-gold-light hover:border-gold hover:text-gold text-[10px] font-bold uppercase tracking-wider transition-all"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Console
              </Link>
            )}

            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border border-card-border hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* 2. DASHBOARD TABS CONTROLLER */}
      <div className="space-y-6">
        <div className="flex border-b border-card-border">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-6 py-4.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'saved'
                ? "border-gold text-gold"
                : "border-transparent text-foreground/50 hover:text-foreground"
            }`}
          >
            <Heart className="w-4 h-4" />
            Saved Products ({savedProductIds.length})
          </button>
          
          <button
            onClick={() => setActiveTab('boards')}
            className={`flex items-center gap-2 px-6 py-4.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'boards'
                ? "border-gold text-gold"
                : "border-transparent text-foreground/50 hover:text-foreground"
            }`}
          >
            <Folder className="w-4 h-4" />
            My Boards ({boards.length})
          </button>
        </div>

        {/* 3. TAB PANELS CONTENT */}
        
        {/* Saved Products Tab */}
        {activeTab === 'saved' && (
          <div className="space-y-6 animate-slide-up">
            {loadingSaved ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : savedProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {savedProducts.map((product) => (
                  <ProductCard key={`acc-saved-${product.id}`} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-card-border rounded-3xl space-y-4">
                <FolderHeart className="w-8 h-8 text-foreground/30 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground/60">No saved products yet</p>
                  <p className="text-xs text-foreground/40 max-w-xs mx-auto">Heart items in the feed and details page to save them here.</p>
                </div>
                <Link
                  href="/discover"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:bg-gold hover:text-white transition-colors"
                >
                  Explore Feed
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Boards Tab */}
        {activeTab === 'boards' && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/45">Pinterest collections</span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1 text-[10px] font-bold text-gold hover:text-gold-hover uppercase tracking-widest border border-gold-light bg-gold-light px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New Board
              </button>
            </div>

            {boards.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {boards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/boards/${user.username}/${board.slug}`}
                    className="group flex flex-col bg-card border border-card-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden bg-gray-150 relative">
                      <img
                        src={board.cover_image || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80"}
                        alt={board.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                      <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                        <Folder className="w-3.5 h-3.5 text-gold" />
                        {board.items?.length || 0} items pinned
                      </span>
                    </div>
                    <div className="p-4 space-y-1">
                      <h3 className="text-xs font-bold text-foreground group-hover:text-gold uppercase tracking-wide truncate">
                        {board.name}
                      </h3>
                      <p className="text-[10px] text-foreground/50 line-clamp-2">
                        {board.description || "No description provided."}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-card-border rounded-3xl">
                <p className="text-foreground/50 text-sm">No boards created yet.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* 4. MODAL FOR NEW BOARD CREATION */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-card-border rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-card-border pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-display">Create new board</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-xs text-foreground/45 hover:text-foreground uppercase tracking-widest font-bold">cancel</button>
            </div>

            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">Board Name</label>
                <input
                  type="text"
                  placeholder="Retro street gear, Room setups..."
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/55">Description</label>
                <textarea
                  placeholder="What is this board for?"
                  value={newBoardDesc}
                  onChange={(e) => setNewBoardDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-card-border bg-white dark:bg-black text-foreground focus:outline-none focus:border-gold h-20 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-foreground text-background hover:bg-gold hover:text-white dark:bg-foreground dark:text-background dark:hover:bg-gold dark:hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Create & Enter
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
