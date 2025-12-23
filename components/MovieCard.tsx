
import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import { Play, Clock, Plus, Check, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MovieService, supabase } from '../constants';

interface Props {
  movie: Movie;
  variant?: 'portrait' | 'trending';
  rank?: number;
  className?: string;
}

const MovieCard: React.FC<Props> = ({ movie, variant = 'portrait', rank, className = '' }) => {
  const isTrending = variant === 'trending';
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const list = await MovieService.getWatchlist();
        setInWatchlist(list.includes(movie.id));
      } catch (e) { }
    };
    checkStatus();
  }, [movie.id]);

  const handleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }

    try {
      setIsUpdating(true);
      const added = await MovieService.toggleWatchlist(movie.id);
      setInWatchlist(added);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Link to={`/movie/${movie.id}`} className={`group/card relative block w-full select-none transition-transform duration-500 hover:z-30 ${className}`}>
      
      {isTrending && rank && (
        <div className="absolute -left-10 bottom-6 z-10 pointer-events-none hidden md:block">
          <span className="text-[120px] font-black leading-none text-black/40 font-sans tracking-tighter"
                style={{ WebkitTextStroke: '2px rgba(255,255,255,0.2)' }}>
            {rank}
          </span>
        </div>
      )}
      
      {isTrending && rank && (
         <div className="absolute -left-2 -top-2 z-30 md:hidden bg-red-600 text-white w-9 h-9 flex items-center justify-center font-black rounded-xl shadow-2xl">
           {rank}
         </div>
      )}

      <div className={`relative rounded-3xl overflow-hidden bg-[#141414] shadow-2xl transition-all duration-500 group-hover/card:scale-105 group-hover/card:brightness-110 z-20 aspect-[2/3] border border-white/5`}>
        <img 
          src={movie.thumbnailUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover/card:scale-110"
          loading="lazy"
        />
        
        <button 
          onClick={handleWatchlist}
          disabled={isUpdating}
          className={`absolute top-4 left-4 z-40 p-2.5 rounded-2xl glass-effect border transition-all duration-300 group-hover/card:opacity-100 md:opacity-0 active:scale-90 ${
            inWatchlist 
            ? 'bg-red-600 border-red-500 text-white shadow-xl shadow-red-600/30' 
            : 'border-white/20 text-white hover:bg-white hover:text-black hover:border-white'
          }`}
        >
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
        </button>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-all duration-500 flex items-center justify-center">
           <div className="w-16 h-16 rounded-[2rem] bg-red-600 text-white flex items-center justify-center transform scale-50 opacity-0 group-hover/card:scale-100 group-hover/card:opacity-100 transition-all duration-500 shadow-2xl shadow-red-600/40">
             <Play className="w-8 h-8 fill-current ml-1" />
           </div>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <span className="bg-black/70 backdrop-blur-md text-white border border-white/20 text-[9px] font-black px-3 py-1 rounded-lg shadow-2xl uppercase tracking-widest">
            {movie.quality}
          </span>
        </div>
        
        {movie.rating === '18+' && (
          <div className="absolute bottom-4 right-4 z-10">
             <span className="bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-md shadow-2xl uppercase tracking-widest">
               R18+
             </span>
          </div>
        )}
      </div>

      <div className="mt-5 text-right px-2 space-y-1.5">
        <h3 className="text-white text-base font-black truncate group-hover/card:text-red-500 transition-colors tracking-tight leading-tight" dir="ltr">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase tracking-widest">
           <span>{movie.year}</span>
           <span className="flex items-center gap-2">
             <Clock className="w-3.5 h-3.5" /> {movie.duration}
           </span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
