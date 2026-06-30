import { notFound } from "next/navigation";
import { getBoardBySlug } from "../../../../lib/data/users";
import ProductCard from "../../../../components/feed/ProductCard";
import Link from "next/link";
import { ArrowLeft, User, Calendar, MessageSquare } from "lucide-react";

interface BoardPageProps {
  params: Promise<{ username: string; boardSlug: string }>;
}

export async function generateMetadata({ params }: BoardPageProps) {
  const { username, boardSlug } = await params;
  const board = await getBoardBySlug(username, boardSlug);
  if (!board) return { title: "Board Not Found — Trendloop" };

  return {
    title: `Board: ${board.name} by @${board.user.username} — Trendloop`,
    description: board.description,
  };
}

export default async function PublicBoardPage({ params }: BoardPageProps) {
  const { username, boardSlug } = await params;
  const board = await getBoardBySlug(username, boardSlug);

  if (!board) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button link */}
      <Link
        href={`/profile/${username}`}
        className="inline-flex items-center gap-1.5 text-foreground/45 hover:text-foreground text-xs font-bold uppercase tracking-widest transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to @{username}'s Profile
      </Link>

      {/* Board Header Details */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-card-border pb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-1 bg-gold-light text-gold text-[8.5px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full w-max">
            User Board
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight uppercase text-foreground font-display">
            {board.name}
          </h1>
          <p className="text-xs sm:text-sm text-foreground/60 max-w-xl leading-relaxed">
            {board.description}
          </p>
          
          <div className="flex items-center gap-4 text-[9px] text-foreground/40 font-bold uppercase tracking-widest pt-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created {new Date(board.created_at).toLocaleDateString()}</span>
            </div>
            <div>
              {board.items.length} items pinned
            </div>
          </div>
        </div>

        {/* Creator Info Card */}
        <Link 
          href={`/profile/${board.user.username}`}
          className="flex items-center gap-3 p-3 rounded-2xl border border-card-border bg-card hover:bg-gray-150 transition-colors self-stretch sm:self-start min-w-[200px]"
        >
          <img
            src={board.user.avatar_url}
            alt={board.user.display_name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-foreground truncate">{board.user.display_name}</span>
            <span className="text-[10px] text-foreground/40 font-medium">@{board.user.username}</span>
          </div>
        </Link>
      </div>

      {/* Pinned Items Grid */}
      {board.products.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-foreground/50 border-b border-card-border pb-3">
            Pinned Products
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {board.products.map((product) => {
              // Find matching note for this product
              const noteItem = board.items.find((item) => item.product_id === product.id);
              
              return (
                <div key={product.id} className="space-y-3">
                  <ProductCard product={product} />
                  {/* Curator Note Banner */}
                  {noteItem?.note && (
                    <div className="flex gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-100/5 border border-card-border text-xs text-foreground/75 leading-relaxed font-sans">
                      <MessageSquare className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[10px] uppercase text-foreground/40 block mb-0.5">Note from curator</span>
                        {noteItem.note}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-card-border rounded-3xl">
          <p className="text-foreground/50 text-sm">This board is currently empty.</p>
        </div>
      )}

    </div>
  );
}
