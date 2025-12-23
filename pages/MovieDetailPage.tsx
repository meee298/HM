
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import VideoPlayer from '../components/VideoPlayer';
import MovieCard from '../components/MovieCard';
import { MovieService } from '../constants';
import { Movie } from '../types';
import { Star, Share2, Plus, Flag, Play, ThumbsUp, Loader2, Calendar, Clock, Film, Sparkles } from 'lucide-react';

const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [suggestedMovies, setSuggestedMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      setIsLoading(true);
      if (id) {
        const data = await MovieService.getById(id);
        setMovie(data || null);
        
        if (data) {
          // Fetch all and filter for similar content
          const allMovies = await MovieService.getAll();
          const similar = allMovies
            .filter(m => m.type === data.type && m.id !== data.id)
            .sort(() => 0.5 - Math.random()) // Randomize suggestions
            .slice(0, 6);
          setSuggestedMovies(similar);
        }
      }
      setIsLoading(false);
      window.scrollTo(0, 0);
    };
    fetchMovieData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 animate-fadeIn">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
        <span className="text-gray-500 font-bold tracking-widest uppercase">جاري تجهيز المشغل...</span>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-6 animate-fadeIn">
        <div className="text-center max-w-md space-y-8">
          <div className="relative inline-block">
             <div className="text-[150px] font-black text-white/5 leading-none">404</div>
             <div className="absolute inset-0 flex items-center justify-center">
                <Film className="w-20 h-20 text-red-600 opacity-20" />
             </div>
          </div>
          <h2 className="text-3xl font-black">عذراً، لم نتمكن من العثور على هذا العمل</h2>
          <p className="text-gray-500 leading-relaxed">ربما تم حذف العمل أو أن الرابط غير صحيح. يمكنك استكشاف المزيد من الأفلام من الصفحة الرئيسية.</p>
          <Link to="/" className="inline-block bg-red-600 px-10 py-4 rounded-2xl text-white font-black hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-600 overflow-x-hidden pb-20">
      <Navbar />
      
      <div className="relative w-full min-h-[80vh] md:min-h-[90vh] flex items-center pb-64 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={movie.backdropUrl} className="w-full h-full object-cover scale-105 animate-soft-pulse" alt="backdrop" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/20 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-8 sm:px-16 pt-32">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="hidden lg:block w-80 rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 shrink-0 transform hover:scale-[1.02] transition-transform duration-500 animate-scaleIn">
              <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 space-y-10 animate-fadeInUp">
              <div className="flex flex-wrap items-center gap-4">
                 <span className="bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-xl shadow-red-600/30 uppercase tracking-widest">{movie.quality}</span>
                 <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 text-xs font-black">
                   <Star className="w-4 h-4 text-yellow-400 fill-current" /> 9.8
                 </div>
                 <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 text-[11px] font-bold text-gray-300">
                    <Calendar className="w-3.5 h-3.5" /> {movie.year}
                 </div>
                 <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 text-[11px] font-bold text-gray-300">
                    <Clock className="w-3.5 h-3.5" /> {movie.duration}
                 </div>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tighter" dir="ltr">{movie.title}</h1>

              <div className="flex flex-wrap gap-3">
                {movie.genre.map(g => (
                  <span key={g} className="text-xs font-bold text-gray-400 bg-[#111] px-5 py-2.5 rounded-2xl border border-white/5 hover:border-red-600 transition-all cursor-default">
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-gray-300 text-lg md:text-xl leading-[1.8] max-w-3xl font-medium opacity-80">{movie.description}</p>

              <div className="flex flex-wrap items-center gap-5 pt-8">
                <button 
                  onClick={() => playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })} 
                  className="bg-red-600 hover:bg-red-700 text-white h-16 px-12 rounded-3xl font-black flex items-center gap-3 transition-all hover:scale-105 shadow-2xl shadow-red-600/30 active:scale-95"
                >
                  <Play className="w-6 h-6 fill-current" /> 
                  <span className="text-lg">مشاهدة الآن</span>
                </button>
                <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white h-16 px-10 rounded-3xl font-black flex items-center gap-3 backdrop-blur-xl transition-all active:scale-95">
                  <Plus className="w-6 h-6" /> 
                  <span className="text-lg">قائمتي</span>
                </button>
                <button className="w-16 h-16 flex items-center justify-center rounded-3xl bg-white/5 border border-white/10 hover:text-red-500 transition-all backdrop-blur-xl active:scale-90">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref={playerRef} className="relative z-20 -mt-40 md:-mt-56 pb-20 px-6 max-w-[1500px] mx-auto animate-fadeInUp">
        <div className="bg-[#0f0f0f] rounded-[3rem] overflow-hidden border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,1)]">
          <div className="p-2 md:p-10">
            <VideoPlayer movie={movie} />
          </div>
          
          <div className="bg-[#080808] px-8 md:px-16 py-10 border-t border-white/5 flex flex-wrap items-center justify-between gap-12">
             <div className="flex items-center gap-12 text-sm text-gray-400">
                <div className="flex items-center gap-5">
                  <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                    <Star className="w-7 h-7 text-yellow-400 fill-current" />
                  </div>
                  <div>
                    <div className="text-white font-black text-2xl">9.8</div>
                    <div className="text-[10px] uppercase font-black tracking-widest text-gray-600">2.5k تقييم</div>
                  </div>
                </div>
                <div className="flex items-center gap-10 font-black">
                  <button className="flex items-center gap-3 hover:text-red-500 transition-colors uppercase tracking-widest text-xs"> <ThumbsUp className="w-5 h-5" /> أعجبني </button>
                  <button className="flex items-center gap-3 hover:text-white transition-colors uppercase tracking-widest text-xs"> <Flag className="w-5 h-5" /> إبلاغ </button>
                </div>
             </div>
             <div className="flex flex-col gap-2 items-end">
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">خادم البث</span>
                <div className="text-xs text-white font-black bg-white/5 px-6 py-3 rounded-2xl border border-white/10 shadow-inner">
                   سيرفرات فائقة السرعة • دقة 4K UHD
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Suggested Content Section */}
      <div className="max-w-[1500px] mx-auto px-6 mt-20 animate-fadeInUp">
         <div className="flex items-center gap-4 mb-10">
           <div className="h-12 w-2 bg-red-600 rounded-full"></div>
           <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <h3 className="text-3xl font-black">مقترحات مشابهة قد تعجبك</h3>
           </div>
         </div>
         
         {suggestedMovies.length > 0 ? (
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
             {suggestedMovies.map(m => (
               <MovieCard key={m.id} movie={m} className="animate-scaleIn card-hover-effect" />
             ))}
           </div>
         ) : (
           <div className="bg-white/5 p-20 rounded-[3rem] border border-white/5 text-center flex flex-col items-center gap-6">
              <Film className="w-16 h-16 text-gray-700" />
              <p className="text-gray-500 font-bold">لا توجد مقترحات مشابهة حالياً لهذا العمل.</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default MovieDetailPage;
