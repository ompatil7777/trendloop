import { notFound } from "next/navigation";
import { getUserProfile, getUserBoards } from "../../../lib/data/users";
import Link from "next/link";
import { Folder, Heart, Globe, ArrowRight } from "lucide-react";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = await getUserProfile(username);
  if (!user) return { title: "Profile Not Found — Trendloop" };

  return {
    title: `${user.display_name} (@${user.username}) — Trendloop Curator`,
    description: user.bio,
  };
}

export default async function CuratorProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = await getUserProfile(username);

  if (!user) {
    notFound();
  }

  const userBoards = await getUserBoards(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Profile Card Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left border-b border-card-border pb-8">
        <img
          src={user.avatar_url}
          alt={user.display_name}
          className="w-24 h-24 rounded-full object-cover border border-card-border shadow-sm"
        />
        
        <div className="space-y-3 flex-grow">
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase text-foreground font-display">
              {user.display_name}
            </h1>
            <span className="text-xs text-foreground/40 font-semibold tracking-wider">
              @{user.username}
            </span>
          </div>
          
          <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed max-w-xl font-sans">
            {user.bio}
          </p>

          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-[9px] font-bold uppercase tracking-widest text-foreground/45 pt-1">
            <span className="bg-gray-55 border border-card-border px-2.5 py-1 rounded-full">
              {userBoards.length} boards
            </span>
            <span className="bg-gray-55 border border-card-border px-2.5 py-1 rounded-full">
              {Math.floor(100 + Math.random() * 400)} followers
            </span>
          </div>
        </div>
      </div>

      {/* Boards Grid */}
      <div className="space-y-6">
        <h2 className="text-xs font-black uppercase tracking-widest text-foreground/50 border-b border-card-border pb-3">
          Boards Created By {user.display_name}
        </h2>

        {userBoards.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {userBoards.map((board) => (
              <Link
                key={board.id}
                href={`/boards/${user.username}/${board.slug}`}
                className="group flex flex-col bg-card border border-card-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Board Preview Image */}
                <div className="aspect-[16/9] w-full overflow-hidden bg-gray-150 relative">
                  <img
                    src={board.cover_image}
                    alt={board.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                    <Folder className="w-3 h-3 text-gold" />
                    {board.items.length} items pinned
                  </span>
                </div>
                
                {/* Details */}
                <div className="p-4 flex-grow flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-foreground group-hover:text-gold uppercase tracking-wide transition-colors truncate">
                      {board.name}
                    </h3>
                    <p className="text-[11px] text-foreground/50 leading-normal line-clamp-2">
                      {board.description}
                    </p>
                  </div>
                  
                  <div className="text-[9px] font-bold text-gold uppercase tracking-widest inline-flex items-center gap-1.5 pt-2 border-t border-card-border w-full">
                    <span>Enter Board</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-card-border rounded-3xl">
            <p className="text-foreground/50 text-sm">No boards created yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}
