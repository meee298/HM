
import React, { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import VideoPlayer from '../components/VideoPlayer';
import MovieCard from '../components/MovieCard';
import { getStoredMovies } from '../constants';
import { Calendar, Clock, Star, Share2, Plus, Flag, Play, ThumbsUp, ChevronLeft } from 'lucide-react';

const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const movies = getStoredMovies();
  const movie = movies.find(m => m.id === id);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white font-sans">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">404</h1>
          <h2 className="text-2xl font-bold">الفيلم غير موجود</h2>
          <Link to="/" className="inline-block bg-red-600 px-6 py-2 rounded-full text-white hover:bg-red-700 transition-colors">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const relatedMovies = movies.filter(m => m.id !== movie.id && m.genre.some(g => movie.genre.includes(g)));
  
  const scrollToPlayer = () => {
    playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-600 selection:text-white">
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <div className="relative w-full min-h-[85vh] flex items-center">
        {/* Backdrop */}
        <div className="absolute inset-0 z-0">
          <img 
            src={movie.backdropUrl} 
            className="w-full h-full object-cover" 
            alt="backdrop" 
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/40 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
            
            {/* Poster (Floating) */}
            <div className="hidden md:block w-64 lg:w-72 flex-shrink-0 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 transform hover:scale-105 transition-transform duration-500 group">
              <img 
                src={movie.thumbnailUrl} 
                alt={movie.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-6 md:pt-4">
              
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 animate-fadeIn">
                 <span className="bg-red-600 text-white text-xs font-black px-2 py-1 rounded tracking-wider shadow-lg shadow-red-900/40">
                   {movie.quality}
                 </span>
                 <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur text-gray-200 text-xs font-bold px-3 py-1 rounded border border-white/10">
                   <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                   9.8
                 </span>
                 <span className="bg-white/10 backdrop-blur text-gray-300 text-xs px-2 py-1 rounded border border-white/10">
                   {movie.year}
                 </span>
                 <span className="bg-white/10 backdrop-blur text-gray-300 text-xs px-2 py-1 rounded border border-white/10">
                   {movie.duration}
                 </span>
                 {movie.rating === '18+' && (
                   <span className="bg-red-950/50 text-red-500 border border-red-900/50 text-xs font-bold px-2 py-1 rounded">
                     18+
                   </span>
                 )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-2xl" dir="ltr">
                {movie.title}
              </h1>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {movie.genre.map(g => (
                  <Link key={g} to="/" className="text-sm text-gray-300 hover:text-red-500 hover:underline transition-colors">
                    {g}
                  </Link>
                ))}
              </div>

              {/* Description */}
              <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-3xl line-clamp-4 font-light">
                {movie.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button 
                  onClick={scrollToPlayer}
                  className="bg-red-600 hover:bg-red-700 text-white h-12 px-8 rounded-full font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>مشاهدة الآن</span>
                </button>
                <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white h-12 px-6 rounded-full font-bold flex items-center gap-2 transition-all hover:border-white/30 backdrop-blur-sm">
                  <Plus className="w-5 h-5" />
                  <span>قائمتي</span>
                </button>
                <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-red-500 transition-colors backdrop-blur-sm">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- PLAYER SECTION --- */}
      <div ref={playerRef} className="relative z-20 -mt-20 pb-16 bg-gradient-to-b from-transparent to-[#050505]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-[#121212] rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative">
            {/* Ambient Glow */}
            <div className="absolute -inset-1 bg-red-600/20 blur-3xl opacity-20 pointer-events-none"></div>
            
            <div className="relative p-1 md:p-4">
              <VideoPlayer movie={movie} />
            </div>
            
            {/* Interaction Bar */}
            <div className="bg-[#0a0a0a] px-6 py-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
               <div className="flex items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-white font-bold">9.8</span>
                    <span className="text-xs">(2.5k تقييم)</span>
                  </div>
                  <div className="w-px h-4 bg-gray-800"></div>
                  <button className="flex items-center gap-2 hover:text-white transition-colors">
                    <ThumbsUp className="w-4 h-4" /> 
                    <span>أعجبني</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-white transition-colors">
                    <Flag className="w-4 h-4" />
                    <span>إبلاغ</span>
                  </button>
               </div>
               
               <div className="text-xs text-gray-500">
                 سيرفرات سريعة • جودة عالية • بدون إعلانات
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- DETAILS & CAST --- */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Cast Section */}
            <section>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-red-600 rounded-full"></span>
                طاقم التمثيل
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                 {movie.cast.map((actor, i) => (
                   <div key={i} className="flex-shrink-0 w-28 text-center group">
                      <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-2 border-transparent group-hover:border-red-600 transition-all">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${actor.replace(' ', '+')}&background=222&color=fff&size=128`} 
                          alt={actor}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                        />
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-red-500 transition-colors truncate">{actor}</h4>
                      <span className="text-xs text-gray-500">Actor</span>
                   </div>
                 ))}
                 <div className="flex-shrink-0 w-28 text-center flex flex-col items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 cursor-pointer transition-colors">
                       <span className="text-xs font-bold text-gray-400">عرض الكل</span>
                    </div>
                 </div>
              </div>
            </section>

             {/* Story & Directors */}
            <section className="bg-[#121212] rounded-xl p-6 border border-white/5">
               <div className="grid md:grid-cols-2 gap-8">
                 <div>
                    <h4 className="text-gray-500 text-sm font-bold mb-2">قصة العمل</h4>
                    <p className="text-gray-300 text-sm leading-7">
                      {movie.description}
                      <br/><br/>
                      لوريم إيبسوم هو نص وهمي يستخدم في صناعة المطابع والتنضيد. لوريم إيبسوم كان النص القياسي للصناعة منذ القرن الخامس عشر.
                    </p>
                 </div>
                 <div className="space-y-4">
                    <div>
                      <h4 className="text-gray-500 text-sm font-bold mb-1">المخرج</h4>
                      <span className="text-white font-medium">{movie.director}</span>
                    </div>
                    <div>
                      <h4 className="text-gray-500 text-sm font-bold mb-1">تاريخ الإصدار</h4>
                      <span className="text-white font-medium">{movie.addedAt.split('T')[0]}</span>
                    </div>
                    <div>
                      <h4 className="text-gray-500 text-sm font-bold mb-1">الكلمات المفتاحية</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {movie.genre.map(g => (
                          <span key={g} className="text-xs bg-black border border-gray-800 px-2 py-1 rounded text-gray-400">#{g}</span>
                        ))}
                      </div>
                    </div>
                 </div>
               </div>
            </section>

          </div>

          {/* Related Sidebar */}
          <div className="lg:col-span-4">
             <div className="sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-6 bg-red-600 rounded-full"></span>
                    أعمال مشابهة
                  </h3>
                  <button className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                    عرض المزيد <ChevronLeft className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-3 max-h-[80vh] overflow-y-auto pr-1 custom-scrollbar">
                   {relatedMovies.length > 0 ? relatedMovies.slice(0, 6).map(rm => (
                     <Link key={rm.id} to={`/movie/${rm.id}`} className="flex gap-3 bg-[#121212] p-2.5 rounded-lg hover:bg-[#1a1a1a] border border-transparent hover:border-white/5 transition-all group">
                        <div className="w-16 h-24 flex-shrink-0 rounded overflow-hidden">
                          <img src={rm.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt={rm.title} />
                        </div>
                        <div className="flex flex-col justify-center flex-1">
                          <h4 className="text-sm font-bold text-white group-hover:text-red-500 transition-colors mb-1 font-sans text-left line-clamp-1" dir="ltr">{rm.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <span>{rm.year}</span>
                            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                            <span>{rm.type === 'series' ? 'مسلسل' : 'فيلم'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                             <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400 border border-white/5">{rm.quality}</span>
                             <span className="flex items-center gap-1 text-[10px] text-yellow-500 ml-auto">
                               <Star className="w-3 h-3 fill-current" /> 9.5
                             </span>
                          </div>
                        </div>
                     </Link>
                   )) : (
                     <div className="text-gray-500 text-center py-10">لا توجد أعمال مشابهة</div>
                   )}
                </div>
             </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default MovieDetailPage;
