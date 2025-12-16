
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { getStoredMovies, GENRES } from '../constants';
import { Movie } from '../types';
import { Play, Info, ChevronLeft, ChevronRight, Star, Flame, TrendingUp, Film, Zap, Tv, Filter, X, ChevronDown, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroCarousel = ({ movies }: { movies: Movie[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [key, setKey] = useState(0); // Force text animation restart

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
      {/* Background Images Layer (Cross-fade) */}
      {movies.map((movie, index) => {
        const isActive = index === currentIndex;
        return (
          <div 
            key={movie.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {/* Image with Ken Burns Zoom Effect */}
            <div className={`absolute inset-0 transition-transform duration-[10s] ease-linear ${isActive ? 'scale-110' : 'scale-100'}`}>
               <img 
                src={movie.backdropUrl} 
                alt={movie.title} 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/30 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#111] via-[#111]/50 to-transparent"></div>
          </div>
        );
      })}

      {/* Content Layer */}
      <div className="relative z-20 h-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-20 flex flex-col justify-center pt-24 pb-12">
         {movies.map((movie, index) => {
            if (index !== currentIndex) return null;
            return (
              <div key={`${movie.id}-${key}`} className="max-w-4xl space-y-6 animate-[fadeInUp_0.8s_ease-out_forwards]">
                  
                  {/* Badges */}
                  <div className="flex items-center gap-3 opacity-0 animate-[fadeIn_0.8s_ease-out_0.2s_forwards]">
                     <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase shadow-lg shadow-red-900/50">
                       Featured
                     </span>
                     <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-gray-200 px-2 py-0.5 rounded text-xs font-bold border border-white/5">
                       <Flame className="w-3 h-3 text-red-500" />
                       Trending
                     </span>
                     <span className="bg-white/10 backdrop-blur-md text-white px-2 py-0.5 rounded text-xs font-bold border border-white/5">
                       {movie.quality}
                     </span>
                     <span className="bg-white/10 backdrop-blur-md text-white px-2 py-0.5 rounded text-xs font-bold border border-white/5 flex items-center gap-1">
                       <Star className="w-3 h-3 text-yellow-500 fill-current" /> 9.8
                     </span>
                  </div>
                  
                  {/* Title */}
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none drop-shadow-2xl opacity-0 animate-[slideUp_0.8s_ease-out_0.3s_forwards]" dir="ltr">
                     {movie.title}
                  </h1>
                  
                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm font-medium opacity-0 animate-[fadeIn_0.8s_ease-out_0.5s_forwards]">
                    <span className="text-white">{movie.year}</span>
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    <span>{movie.duration}</span>
                    <span className="border border-white/20 px-1.5 rounded text-xs text-gray-300">
                      {movie.rating}
                    </span>
                     <div className="flex items-center gap-2">
                        {movie.genre?.slice(0, 3).map(g => (
                            <span key={g} className="text-xs bg-white/5 px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer">{g}</span>
                        )) || null}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-base md:text-lg line-clamp-3 leading-relaxed max-w-2xl font-light opacity-0 animate-[fadeIn_0.8s_ease-out_0.6s_forwards]">
                    {movie.description}
                  </p>

                  {/* Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 opacity-0 animate-[fadeIn_0.8s_ease-out_0.7s_forwards]">
                    <Link to={`/movie/${movie.id}`} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-red-900/20 group">
                      <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                      <span>شاهد الآن</span>
                    </Link>
                    <Link to={`/movie/${movie.id}`} className="bg-white/5 hover:bg-white/10 backdrop-blur-md text-white px-6 py-3.5 rounded-full font-bold flex items-center gap-2 transition-all border border-white/10 hover:border-white/30">
                      <Info className="w-5 h-5" />
                      <span>تفاصيل</span>
                    </Link>
                  </div>
              </div>
            )
         })}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3 p-4 bg-gradient-to-t from-black/80 to-transparent w-full justify-center">
        {movies.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-500 shadow-lg ${idx === currentIndex ? 'w-8 bg-red-600' : 'w-2 bg-gray-600 hover:bg-white'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
      
      {/* Side Navigation (Optional, visible on hover) */}
      <button 
        onClick={() => goToSlide((currentIndex - 1 + movies.length) % movies.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/20 hover:bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button 
        onClick={() => goToSlide((currentIndex + 1) % movies.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/20 hover:bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
    </div>
  );
};

interface CarouselProps {
  title: string;
  icon?: React.ReactNode;
  movies: Movie[];
  variant?: 'portrait' | 'trending';
}

const Carousel = ({ title, icon, movies, variant = 'portrait' }: CarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -600 : 600;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="py-6 group/carousel relative animate-fadeIn">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full mb-4">
        <div className="flex items-center gap-2">
           <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
             {icon} {title}
           </h2>
           <ChevronLeft className="w-5 h-5 text-red-600 opacity-50" />
        </div>
      </div>
      
      <div className="relative max-w-[1600px] mx-auto group">
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-4 z-40 w-12 bg-black/50 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer hidden md:flex rounded-l-lg border-l border-white/10 backdrop-blur-[2px]"
          aria-label="Previous"
        >
          <ChevronRight className="w-10 h-10 text-white drop-shadow-md" />
        </button>

        <div 
          ref={scrollRef}
          className={`flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-4 scrollbar-hide snap-x items-start ${variant === 'trending' ? 'pl-12' : ''}`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie, index) => (
            <div 
              key={movie.id} 
              className={`snap-start flex-shrink-0 transition-transform duration-300 ${
                variant === 'trending' ? 'w-[140px] sm:w-[160px] md:w-[190px] ml-8' : 
                'w-[140px] sm:w-[160px] md:w-[190px]'
              }`}
            >
              <MovieCard movie={movie} variant={variant} rank={index + 1} />
            </div>
          ))}
        </div>

        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-4 z-40 w-12 bg-black/50 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer hidden md:flex rounded-r-lg border-r border-white/10 backdrop-blur-[2px]"
          aria-label="Next"
        >
          <ChevronLeft className="w-10 h-10 text-white drop-shadow-md" />
        </button>
      </div>
    </div>
  );
};

const FilterBar = ({ 
  activeType, 
  setActiveType, 
  activeGenre, 
  setActiveGenre 
}: { 
  activeType: string, 
  setActiveType: (t: string) => void, 
  activeGenre: string, 
  setActiveGenre: (g: string) => void 
}) => {
  return (
    <div className="sticky top-[64px] md:top-[80px] z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-y border-white/5 py-4 mb-8 transition-all duration-300 shadow-xl">
       <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 text-white font-bold text-lg w-full sm:w-auto">
            <Filter className="w-5 h-5 text-red-600" />
            <span className="hidden sm:inline">تصفية المحتوى</span>
            <span className="sm:hidden text-sm text-gray-400">تصفية النتائج</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            
            {/* Type Filter */}
            <div className="relative group flex-shrink-0">
               <select 
                 value={activeType}
                 onChange={(e) => setActiveType(e.target.value)}
                 className="appearance-none bg-[#1a1a1a] hover:bg-[#252525] text-white pl-10 pr-4 py-2.5 rounded-full border border-gray-700 focus:border-red-600 focus:outline-none cursor-pointer transition-all text-sm font-medium min-w-[130px] shadow-sm"
               >
                 <option value="all">الكل</option>
                 <option value="movie">أفلام</option>
                 <option value="series">مسلسلات</option>
                 <option value="anime">أنيمي</option>
               </select>
               <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Genre Filter */}
            <div className="relative group flex-shrink-0">
               <select 
                 value={activeGenre}
                 onChange={(e) => setActiveGenre(e.target.value)}
                 className="appearance-none bg-[#1a1a1a] hover:bg-[#252525] text-white pl-10 pr-4 py-2.5 rounded-full border border-gray-700 focus:border-red-600 focus:outline-none cursor-pointer transition-all text-sm font-medium min-w-[150px] shadow-sm"
               >
                 <option value="all">جميع التصنيفات</option>
                 {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
               </select>
               <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Clear Button */}
            {(activeType !== 'all' || activeGenre !== 'all') && (
              <button 
                onClick={() => { setActiveType('all'); setActiveGenre('all'); }}
                className="flex items-center gap-1 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2.5 rounded-full text-xs font-bold transition-all border border-red-600/20 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">مسح</span>
              </button>
            )}
          </div>
       </div>
    </div>
  )
}

const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);
  
  // Filter States
  const [activeType, setActiveType] = useState('all');
  const [activeGenre, setActiveGenre] = useState('all');

  useEffect(() => {
    const data = getStoredMovies();
    setMovies(data);
    
    if (data.length > 0) {
      // Pick top 6 featured movies/series for carousel
      // Shuffle slightly to rotate content on refresh
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      const featured = shuffled.filter(m => m.isFeatured).slice(0, 6);
      
      // Fallback if no featured items found
      const finalHero = featured.length > 0 ? featured : shuffled.slice(0, 6);
      setHeroMovies(finalHero);
    }
  }, []);

  // Filter Logic
  const filteredContent = useMemo(() => {
    if (activeType === 'all' && activeGenre === 'all') return null;

    return movies.filter(movie => {
      // 1. Check Type
      let typeMatch = true;
      if (activeType === 'movie') typeMatch = movie.type === 'movie';
      if (activeType === 'series') typeMatch = movie.type === 'series';
      if (activeType === 'anime') typeMatch = movie.genre.includes('أنيمي');

      // 2. Check Genre
      let genreMatch = true;
      if (activeGenre !== 'all') {
        genreMatch = movie.genre.includes(activeGenre);
      }

      return typeMatch && genreMatch;
    });
  }, [movies, activeType, activeGenre]);

  const sortedByViews = useMemo(() => {
    return [...movies].sort((a,b) => b.views - a.views).slice(0, 10);
  }, [movies]);

  const recentMovies = useMemo(() => {
    return [...movies].reverse().slice(0, 12);
  }, [movies]);
  
  const seriesList = useMemo(() => {
    return movies.filter(m => m.type === 'series');
  }, [movies]);
  
  const actionMovies = useMemo(() => {
    return movies.filter(m => m.genre?.includes('أكشن'));
  }, [movies]);

  const dramaMovies = useMemo(() => {
    return movies.filter(m => m.genre?.includes('دراما') || m.genre?.includes('غموض'));
  }, [movies]);

  if (movies.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#111] text-white selection:bg-red-600 selection:text-white font-sans overflow-x-hidden">
      <Navbar />
      
      {/* Hero Carousel */}
      <HeroCarousel movies={heroMovies} />
      
      {/* Filter Bar */}
      <FilterBar 
        activeType={activeType} 
        setActiveType={setActiveType}
        activeGenre={activeGenre}
        setActiveGenre={setActiveGenre}
      />

      <div className="relative z-10 pb-12 space-y-2 min-h-[500px]">
        
        {/* Conditional Rendering: Filtered Grid vs Default Carousels */}
        {filteredContent ? (
           // Filtered Grid View
           <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
              <div className="flex items-center gap-2 mb-6">
                 <Layers className="w-5 h-5 text-red-600" />
                 <h2 className="text-xl font-bold">
                   نتائج التصفية 
                   <span className="text-gray-500 text-sm mx-2 font-normal">({filteredContent.length} نتيجة)</span>
                 </h2>
              </div>

              {filteredContent.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                  {filteredContent.map(movie => (
                    <MovieCard key={movie.id} movie={movie} className="w-full" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 border border-white/5 rounded-xl bg-white/5">
                   <Filter className="w-16 h-16 mb-4 opacity-20" />
                   <h3 className="text-xl font-bold text-white mb-2">لا توجد نتائج</h3>
                   <p className="text-sm">حاول تغيير خيارات التصفية للعثور على ما تبحث عنه.</p>
                   <button 
                     onClick={() => { setActiveType('all'); setActiveGenre('all'); }}
                     className="mt-6 text-red-500 hover:text-white underline transition-colors"
                   >
                     مسح جميع الفلاتر
                   </button>
                </div>
              )}
           </div>
        ) : (
           // Default Carousels View
           <>
              <div id="popular" className="pt-4 scroll-mt-24">
                 <Carousel 
                   title="الأكثر رواجاً اليوم" 
                   icon={<TrendingUp className="w-5 h-5 text-red-600" />}
                   movies={sortedByViews} 
                   variant="trending" 
                 />
              </div>
              
              <Carousel 
                title="أضيف حديثاً" 
                icon={<Zap className="w-5 h-5 text-yellow-500" />}
                movies={recentMovies} 
                variant="portrait" 
              />

              {seriesList.length > 0 && (
                <div id="series" className="scroll-mt-24">
                   <Carousel 
                     title="مسلسلات" 
                     icon={<Tv className="w-5 h-5 text-blue-500" />}
                     movies={seriesList} 
                     variant="portrait" 
                   />
                </div>
              )}

              <div id="movies" className="scroll-mt-24">
                <Carousel 
                  title="أفلام الحركة" 
                  icon={<Flame className="w-5 h-5 text-orange-500" />}
                  movies={actionMovies} 
                  variant="portrait" 
                />
                
                <Carousel 
                  title="دراما وغموض" 
                  icon={<Film className="w-5 h-5 text-purple-500" />}
                  movies={dramaMovies} 
                  variant="portrait" 
                />
              </div>
           </>
        )}

      </div>

      <footer className="bg-[#0a0a0a] pt-16 pb-8 border-t border-white/5 mt-8">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
             <div className="col-span-1 md:col-span-2">
                <h2 className="text-2xl font-black text-white mb-4 uppercase font-sans tracking-tighter">
                  Cinema<span className="text-red-600">Stream</span>
                </h2>
                <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
                  استمتع بأحدث الأفلام والمسلسلات بجودة عالية وبدون إعلانات مزعجة. منصتك الأولى للترفيه السينمائي.
                </p>
             </div>
             <div>
               <h4 className="font-bold text-white mb-4 text-sm">الأقسام</h4>
               <ul className="space-y-2 text-gray-500 text-xs">
                 <li><a href="#movies" className="hover:text-white transition-colors">أفلام</a></li>
                 <li><a href="#series" className="hover:text-white transition-colors">مسلسلات</a></li>
                 <li><a href="#popular" className="hover:text-white transition-colors">الأكثر مشاهدة</a></li>
               </ul>
             </div>
             <div>
               <h4 className="font-bold text-white mb-4 text-sm">معلومات</h4>
               <ul className="space-y-2 text-gray-500 text-xs">
                 <li><a href="#" className="hover:text-white transition-colors">عن الموقع</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">DMCA</a></li>
                 <li><a href="#" className="hover:text-white transition-colors">شروط الاستخدام</a></li>
               </ul>
             </div>
           </div>
           
           <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
             <p className="text-gray-600 text-xs">
               &copy; 2024 CinemaStream. All rights reserved.
             </p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
