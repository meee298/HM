
import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import { Play, Clock, Plus, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWatchlist, toggleWatchlist } from '../constants';

interface Props {
  movie: Movie;
  variant?: 'portrait' | 'trending';
  rank?: number;
  className?: string;
}

const MovieCard: React.FC<Props> = ({ movie, variant = 'portrait', rank, className = '' }) => {
  const isTrending = variant === 'trending';
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    // Check initial state logic from storage
    const list = getWatchlist();
    setInWatchlist(list.includes(movie.id));
  }, [movie.id]);

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    const newState = toggleWatchlist(movie.id);
    setInWatchlist(newState);
  };
  
  return (
    <Link to={`/movie/${movie.id}`} className={`group/card relative block w-full select-none ${className}`}>
      
      {/* Trending Rank Number */}
      {isTrending && rank && (
        <div className="absolute -left-6 bottom-4 z-10 pointer-events-none hidden md:block">
          <span className="text-[100px] font-black leading-none text-[#111] drop-shadow-[0_0_1px_rgba(255,255,255,0.3)] font-sans select-none"
                style={{ WebkitTextStroke: '2px #555' }}>
            {rank}
          </span>
        </div>
      )}
      {/* Mobile Rank Number */}
      {isTrending && rank && (
         <div className="absolute -left-2 -top-2 z-20 md:hidden bg-red-600 text-white w-8 h-8 flex items-center justify-center font-black rounded-br-lg shadow-lg">
           {rank}
         </div>
      )}

      <div className={`relative rounded-xl overflow-hidden bg-[#1a1a1a] shadow-lg transition-all duration-300 group-hover/card:scale-[1.03] group-hover/card:brightness-110 z-20 aspect-[2/3] border border-white/5 ring-1 ring-white/5`}>
        {/* Poster Image */}
        <img 
          src={movie.thumbnailUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Watch Later Button (Top Left) */}
        <button 
          onClick={handleWatchlist}
          className={`absolute top-2 left-2 z-30 p-1.5 rounded-full backdrop-blur-md border transition-all duration-200 group-hover/card:opacity-100 opacity-100 md:opacity-0 ${
            inWatchlist 
            ? 'bg-red-600 border-red-500 text-white' 
            : 'bg-black/40 border-white/20 text-white hover:bg-white hover:text-black'
          }`}
          title={inWatchlist ? "إزالة من القائمة" : "إضافة للمشاهدة لاحقاً"}
        >
          {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>

        {/* Overlay Gradient on Hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
           <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center transform scale-0 group-hover/card:scale-100 transition-transform duration-300 shadow-xl shadow-red-900/40">
             <Play className="w-5 h-5 fill-current ml-0.5" />
           </div>
        </div>

        {/* Quality Badge - Top Right */}
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-[#1a1a1a]/90 backdrop-blur-sm text-white border border-white/10 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
            {movie.quality}
          </span>
        </div>
        
        {/* Rating Badge - Bottom Right (Inside Image) */}
        {movie.rating === '18+' && (
          <div className="absolute bottom-2 right-2 z-10">
             <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm shadow-lg">
               18+
             </span>
          </div>
        )}
      </div>

      {/* Title Below Card */}
      <div className="mt-3 text-right px-1">
        <h3 className="text-gray-100 text-sm font-bold truncate group-hover/card:text-red-500 transition-colors tracking-wide" dir="ltr">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-1.5 text-[11px] text-gray-400 font-medium">
           <span>{movie.year}</span>
           <span className="flex items-center gap-1 opacity-80">
             <Clock className="w-3 h-3" /> {movie.duration}
           </span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
