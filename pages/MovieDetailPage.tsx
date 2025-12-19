
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import VideoPlayer from '../components/VideoPlayer';
import { MovieService } from '../constants';
import { Movie } from '../types';
import { Star, Share2, Plus, Flag, Play, ThumbsUp, Loader2 } from 'lucide-react';

const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      setIsLoading(true);
      if (id) {
        const data = await MovieService.getById(id);
        setMovie(data || null);
      }
      setIsLoading(false);
      window.scrollTo(0, 0);
    };
    fetchMovie();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black text-gray-800">404</h1>
          <h2 className="text-2xl font-bold">عذراً، هذا العمل غير متوفر</h2>
          <Link to="/" className="inline-block bg-red-600 px-8 py-3 rounded-full text-white font-bold hover:bg-red-700">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-600 overflow-x-hidden">
      <Navbar />
      
      <div className="relative w-full min-h-[60vh] md:min-h-[85vh] flex items-center pb-32 md:pb-48">
        <div className="absolute inset-0 z-0">
          <img src={movie.backdropUrl} className="w-full h-full object-cover" alt="backdrop" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/40 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 pt-32 md:pt-20">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            <div className="hidden lg:block w-72 rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
              <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                 <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded shadow-lg shadow-red-900/40">{movie.quality}</span>
                 <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1 rounded border border-white/10 text-xs font-bold">
                   <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" /> 9.8
                 </span>
                 <span className="bg-white/10 backdrop-blur px-3 py-1 rounded border border-white/10 text-xs">{movie.year}</span>
                 <span className="bg-white/10 backdrop-blur px-3 py-1 rounded border border-white/10 text-xs">{movie.duration}</span>
              </div>

              <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white leading-tight" dir="ltr">{movie.title}</h1>

              <div className="flex flex-wrap gap-2 md:gap-3">
                {movie.genre.map(g => <span key={g} className="text-xs md:text-sm text-gray-300 bg-white/5 px-3 py-1 rounded-full border border-white/5">{g}</span>)}
              </div>

              <p className="text-gray-300 text-sm md:text-lg leading-relaxed max-w-3xl line-clamp-4 font-light">{movie.description}</p>

              <div className="flex flex-wrap items-center gap-4 pt-4 md:pt-6">
                <button onClick={() => playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="bg-red-600 hover:bg-red-700 text-white h-12 md:h-14 px-8 md:px-10 rounded-full font-black flex items-center gap-2 transition-all hover:scale-105 shadow-2xl shadow-red-900/30">
                  <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" /> شاهد الآن
                </button>
                <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white h-12 md:h-14 px-6 md:px-8 rounded-full font-bold flex items-center gap-2 backdrop-blur-sm transition-all">
                  <Plus className="w-4 h-4 md:w-5 md:h-5" /> قائمتي
                </button>
                <button className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:text-red-500 transition-all backdrop-blur-sm">
                  <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref={playerRef} className="relative z-20 -mt-24 md:-mt-32 pb-20 px-4 max-w-[1600px] mx-auto">
        <div className="bg-[#121212] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          <div className="p-1 md:p-6">
            <VideoPlayer movie={movie} />
          </div>
          
          <div className="bg-[#0a0a0a] px-4 md:px-8 py-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
             <div className="flex items-center gap-4 md:gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-white font-black text-lg">9.8</span>
                  <span className="text-[10px] md:text-xs opacity-50">(2.5k تقييم)</span>
                </div>
                <div className="flex items-center gap-4 md:gap-6">
                  <button className="flex items-center gap-2 hover:text-white transition-colors text-xs md:text-sm"> <ThumbsUp className="w-4 h-4 md:w-5 md:h-5" /> أعجبني </button>
                  <button className="flex items-center gap-2 hover:text-white transition-colors text-xs md:text-sm"> <Flag className="w-4 h-4 md:w-5 md:h-5" /> إبلاغ </button>
                </div>
             </div>
             <div className="text-[10px] md:text-xs text-gray-500 font-bold bg-white/5 px-4 py-2 rounded-full border border-white/5">
               سيرفرات فائقة السرعة • جودة 4K • بدون إعلانات
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
