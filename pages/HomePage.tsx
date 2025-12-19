
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { MovieService, GENRES } from '../constants';
import { Movie } from '../types';
import { Play, Info, ChevronLeft, ChevronRight, Star, Flame, TrendingUp, Film, Zap, Tv, Filter, X, ChevronDown, Layers, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroCarousel = ({ movies }: { movies: Movie[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
      setKey(prev => prev + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, [movies.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setKey(prev => prev + 1);
  };

  if (movies.length === 0) return null;

  return (
    <div className="relative h-[70vh] md:h-[90vh] w-full overflow-hidden group font-sans bg-black">
      {movies.map((movie, index) => {
        const isActive = index === currentIndex;
        return (
          <div 
            key={movie.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div className={`absolute inset-0 transition-transform duration-[10s] ease-linear ${isActive ? 'scale-110' : 'scale-100'}`}>
               <img src={movie.backdropUrl} alt={movie.title} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/30 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#111] via-[#111]/50 to-transparent"></div>
          </div>
        );
      })}

      <div className="relative z-20 h-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-20 flex flex-col justify-center pt-24 pb-12">
         {movies.map((movie, index) => {
            if (index !== currentIndex) return null;
            return (
              <div key={`${movie.id}-${key}`} className="max-w-4xl space-y-6 animate-[fadeInUp_0.8s_ease-out_forwards]">
                  <div className="flex items-center gap-3">
                     <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase shadow-lg shadow-red-900/50">Featured</span>
                     {movie.isTrending && (
                       <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-gray-200 px-2 py-0.5 rounded text-xs font-bold border border-white/5">
                         <Flame className="w-3 h-3 text-red-500" /> Trending
                       </span>
                     )}
                     <span className="bg-white/10 backdrop-blur-md text-white px-2 py-0.5 rounded text-xs font-bold border border-white/5">{movie.quality}</span>
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none drop-shadow-2xl" dir="ltr">{movie.title}</h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm font-medium">
                    <span className="text-white">{movie.year}</span>
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    <span>{movie.duration}</span>
                    <span className="border border-white/20 px-1.5 rounded text-xs text-gray-300">{movie.rating}</span>
                  </div>

                  <p className="text-gray-300 text-base md:text-lg line-clamp-3 leading-relaxed max-w-2xl font-light">{movie.description}</p>

                  <div className="flex flex-wrap items-center gap-3 pt-4">
                    <Link to={`/movie/${movie.id}`} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-red-900/20 group">
                      <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                      <span>شاهد الآن</span>
                    </Link>
                    <Link to={`/movie/${movie.id}`} className="bg-white/5 hover:bg-white/10 backdrop-blur-md text-white px-6 py-3.5 rounded-full font-bold flex items-center gap-2 transition-all border border-white/10">
                      <Info className="w-5 h-5" />
                      <span>تفاصيل</span>
                    </Link>
                  </div>
              </div>
            )
         })}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3 p-4 justify-center">
        {movies.map((_, idx) => (
          <button key={idx} onClick={() => goToSlide(idx)} className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-red-600' : 'w-2 bg-gray-600 hover:bg-white'}`} />
        ))}
      </div>
    </div>
  );
};

const Carousel = ({ id, title, icon, movies, variant = 'portrait' }: { id?: string, title: string, icon?: React.ReactNode, movies: Movie[], variant?: 'portrait' | 'trending' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -600 : 600, behavior: 'smooth' });
    }
  };

  if (movies.length === 0) return null;

  return (
    <div id={id} className="py-6 group/carousel relative animate-fadeIn scroll-mt-24">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">{icon} {title}</h2>
      </div>
      
      <div className="relative max-w-[1600px] mx-auto group">
        <button onClick={() => scroll('right')} className="absolute right-0 top-0 bottom-4 z-40 w-12 bg-black/50 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex rounded-l-lg border-l border-white/10">
          <ChevronRight className="w-10 h-10 text-white" />
        </button>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-4 scrollbar-hide snap-x items-start" style={{ scrollbarWidth: 'none' }}>
          {movies.map((movie, index) => (
            <div key={movie.id} className="snap-start flex-shrink-0 w-[140px] sm:w-[160px] md:w-[190px]">
              <MovieCard movie={movie} variant={variant} rank={index + 1} />
            </div>
          ))}
        </div>

        <button onClick={() => scroll('left')} className="absolute left-0 top-0 bottom-4 z-40 w-12 bg-black/50 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex rounded-r-lg border-r border-white/10">
          <ChevronLeft className="w-10 h-10 text-white" />
        </button>
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [activeGenre, setActiveGenre] = useState('all');
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await MovieService.getAll();
      setMovies(data);
      setIsLoading(false);
      
      // Check for welcome message
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome_v1');
      if (!hasSeenWelcome) {
        setTimeout(() => setShowWelcome(true), 1500);
      }
    };
    load();
  }, []);

  const dismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome_v1', 'true');
  };

  const filteredContent = useMemo(() => {
    if (activeType === 'all' && activeGenre === 'all') return null;
    return movies.filter(movie => {
      let typeMatch = activeType === 'all' || (activeType === 'movie' ? movie.type === 'movie' : movie.type === 'series');
      let genreMatch = activeGenre === 'all' || movie.genre.includes(activeGenre);
      return typeMatch && genreMatch;
    });
  }, [movies, activeType, activeGenre]);

  const sections = useMemo(() => ({
    hero: movies.filter(m => m.isFeatured).slice(0, 6),
    trending: movies.filter(m => m.isTrending).slice(0, 10),
    recent: [...movies].reverse().slice(0, 12),
    series: movies.filter(m => m.type === 'series').slice(0, 12),
    action: movies.filter(m => m.genre.includes('أكشن')).slice(0, 12)
  }), [movies]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
          <span className="text-gray-400 font-bold">جاري تحميل السينما...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] text-white selection:bg-red-600 font-sans overflow-x-hidden">
      <Navbar />
      <HeroCarousel movies={sections.hero} />
      
      {/* Basic Filter Bar */}
      <div className="sticky top-[64px] md:top-[80px] z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-y border-white/5 py-4">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-4">
          <select value={activeType} onChange={(e) => setActiveType(e.target.value)} className="bg-[#1a1a1a] text-white px-4 py-2 rounded-full border border-gray-800 text-sm outline-none focus:border-red-600">
            <option value="all">كل المحتوى</option>
            <option value="movie">أفلام</option>
            <option value="series">مسلسلات</option>
          </select>
          <select value={activeGenre} onChange={(e) => setActiveGenre(e.target.value)} className="bg-[#1a1a1a] text-white px-4 py-2 rounded-full border border-gray-800 text-sm outline-none focus:border-red-600">
            <option value="all">كل التصنيفات</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {(activeType !== 'all' || activeGenre !== 'all') && (
            <button onClick={() => { setActiveType('all'); setActiveGenre('all'); }} className="text-red-500 text-xs font-bold hover:underline">مسح الفلاتر</button>
          )}
        </div>
      </div>

      <div className="pb-12 min-h-[500px]">
        {filteredContent ? (
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredContent.map(movie => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        ) : (
          <>
            <Carousel id="popular" title="رائج الآن" icon={<TrendingUp className="w-5 h-5 text-red-600" />} movies={sections.trending} variant="trending" />
            <Carousel id="movies" title="أضيف حديثاً" icon={<Zap className="w-5 h-5 text-yellow-500" />} movies={sections.recent} />
            <Carousel id="series" title="مسلسلات مختارة" icon={<Tv className="w-5 h-5 text-purple-500" />} movies={sections.series} />
            <Carousel title="أفلام الأكشن" icon={<Flame className="w-5 h-5 text-orange-500" />} movies={sections.action} />
          </>
        )}
      </div>

      {/* Welcome Toast Message */}
      {showWelcome && (
        <div className="fixed bottom-6 right-6 z-[60] animate-slideUp">
          <div className="bg-[#1a1a1a]/95 backdrop-blur-xl border border-red-600/30 p-5 rounded-2xl shadow-2xl max-w-sm flex items-start gap-4">
            <div className="bg-red-600/20 p-2.5 rounded-xl flex-shrink-0">
               <Sparkles className="w-6 h-6 text-red-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black text-white text-lg">أهلاً بك في سينما ستريم!</h3>
                <button onClick={dismissWelcome} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                اكتشف عالمنا الجديد من الأفلام والمسلسلات الحصرية بأعلى جودة. مشاهدة ممتعة!
              </p>
              <button 
                onClick={dismissWelcome}
                className="mt-3 text-xs font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-widest"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-black py-12 border-t border-white/5 text-center text-gray-600 text-xs">
        <p>&copy; 2024 CinemaStream. All rights reserved. Connected to Cloud DB.</p>
      </footer>
    </div>
  );
};

export default HomePage;
