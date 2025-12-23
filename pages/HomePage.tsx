
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { MovieService, GENRES } from '../constants';
import { Movie } from '../types';
import { 
  Play, Info, ChevronLeft, ChevronRight, Star, Flame, TrendingUp, 
  Film, Zap, Tv, Filter, X, ChevronDown, Layers, Loader2, Sparkles,
  Ghost, Laugh, Cat, Globe, Rocket
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroCarousel = ({ movies }: { movies: Movie[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
      setKey(prev => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, [movies.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setKey(prev => prev + 1);
  };

  if (movies.length === 0) return null;

  return (
    <div className="relative h-[80vh] md:h-[95vh] w-full overflow-hidden bg-black">
      {movies.map((movie, index) => {
        const isActive = index === currentIndex;
        return (
          <div 
            key={movie.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div className={`absolute inset-0 transition-transform duration-[12s] ease-linear ${isActive ? 'scale-110' : 'scale-100'}`}>
               <img src={movie.backdropUrl} alt={movie.title} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent"></div>
          </div>
        );
      })}

      <div className="relative z-20 h-full max-w-[1600px] mx-auto px-8 sm:px-16 flex flex-col justify-center pt-20">
         {movies.map((movie, index) => {
            if (index !== currentIndex) return null;
            return (
              <div key={`${movie.id}-${key}`} className="max-w-3xl space-y-8 animate-[fadeInUp_0.8s_ease-out_forwards]">
                  <div className="flex items-center gap-4">
                     <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-[11px] font-black tracking-widest uppercase shadow-2xl shadow-red-600/40">مميز</span>
                     {movie.isTrending && (
                       <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-gray-200 px-3 py-1 rounded-lg text-xs font-bold border border-white/10">
                         <Flame className="w-3.5 h-3.5 text-orange-500 fill-current" /> الأكثر بحثاً
                       </span>
                     )}
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] text-shadow-lg" dir="ltr">{movie.title}</h1>
                  
                  <div className="flex flex-wrap items-center gap-5 text-gray-300 text-sm font-bold">
                    <span className="text-white bg-white/10 px-3 py-1 rounded-md">{movie.year}</span>
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                    <span>{movie.duration}</span>
                    <span className="w-1.5 h-1.5 bg-gray-700 rounded-full"></span>
                    <span className="border border-white/20 px-2 rounded-md text-xs">{movie.quality}</span>
                  </div>

                  <p className="text-gray-300 text-base md:text-xl line-clamp-3 leading-relaxed max-w-2xl font-medium opacity-90 drop-shadow-md">{movie.description}</p>

                  <div className="flex flex-wrap items-center gap-5 pt-6">
                    <Link to={`/movie/${movie.id}`} className="bg-red-600 hover:bg-red-700 text-white px-10 py-4.5 rounded-2xl font-black flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_15px_30px_rgba(229,9,20,0.3)] group">
                      <Play className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                      <span className="text-lg">شاهد الآن</span>
                    </Link>
                    <Link to={`/movie/${movie.id}`} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4.5 rounded-2xl font-black flex items-center gap-3 transition-all border border-white/10">
                      <Info className="w-6 h-6" />
                      <span className="text-lg">التفاصيل</span>
                    </Link>
                  </div>
              </div>
            )
         })}
      </div>

      <div className="absolute bottom-12 right-16 z-30 flex flex-col gap-3">
        {movies.map((_, idx) => (
          <button key={idx} onClick={() => goToSlide(idx)} className={`w-1.5 transition-all duration-700 rounded-full ${idx === currentIndex ? 'h-10 bg-red-600 shadow-[0_0_15px_rgba(229,9,20,0.8)]' : 'h-3 bg-gray-600 hover:bg-white'}`} />
        ))}
      </div>
    </div>
  );
};

const Carousel = ({ id, title, icon, movies, variant = 'portrait' }: { id?: string, title: string, icon?: React.ReactNode, movies: Movie[], variant?: 'portrait' | 'trending' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 800 : 400;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (movies.length === 0) return null;

  return (
    <div id={id} className="py-12 group/carousel relative animate-fadeIn scroll-mt-24">
      <div className="max-w-[1600px] mx-auto px-8 sm:px-12 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white/5 rounded-2xl border border-white/10">{icon}</div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">{title}</h2>
        </div>
        <div className="hidden md:flex gap-3">
           <button onClick={() => scroll('right')} className="w-12 h-12 rounded-2xl bg-[#141414] border border-white/5 hover:bg-white hover:text-black transition-all flex items-center justify-center shadow-xl active:scale-90"> <ChevronRight className="w-6 h-6" /> </button>
           <button onClick={() => scroll('left')} className="w-12 h-12 rounded-2xl bg-[#141414] border border-white/5 hover:bg-white hover:text-black transition-all flex items-center justify-center shadow-xl active:scale-90"> <ChevronLeft className="w-6 h-6" /> </button>
        </div>
      </div>
      
      <div className="relative max-w-[1600px] mx-auto overflow-hidden">
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto px-8 sm:px-12 pb-8 scrollbar-hide snap-x items-start" style={{ scrollbarWidth: 'none' }}>
          {movies.map((movie, index) => (
            <div key={movie.id} className="snap-start flex-shrink-0 w-[160px] sm:w-[200px] md:w-[220px]">
              <MovieCard movie={movie} variant={variant} rank={index + 1} />
            </div>
          ))}
        </div>
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
      
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome_v2');
      if (!hasSeenWelcome) {
        setTimeout(() => setShowWelcome(true), 2000);
      }
    };
    load();
  }, []);

  const dismissWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome_v2', 'true');
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
    hero: movies.filter(m => m.isFeatured).slice(0, 5),
    trending: movies.filter(m => m.isTrending).slice(0, 10),
    recent: movies.slice(0, 15),
    series: movies.filter(m => m.type === 'series').slice(0, 15),
    horror: movies.filter(m => m.genre.includes('رعب')).slice(0, 15),
    comedy: movies.filter(m => m.genre.includes('كوميديا')).slice(0, 15),
    anime: movies.filter(m => m.genre.includes('أنيمي')).slice(0, 15),
    korean: movies.filter(m => m.genre.includes('كوري') || m.genre.includes('تركي')).slice(0, 15),
    adventure: movies.filter(m => m.genre.includes('مغامرة') || m.genre.includes('خيال علمي')).slice(0, 15)
  }), [movies]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-8 animate-fadeIn">
          <div className="relative">
             <div className="w-20 h-20 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
             <Film className="w-8 h-8 text-red-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <span className="text-gray-500 font-black text-xl tracking-widest uppercase">جاري تهيئة السينما...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-red-600 font-sans overflow-x-hidden pb-20">
      <Navbar />
      <HeroCarousel movies={sections.hero} />
      
      <div className="sticky top-[72px] md:top-[88px] z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-y border-white/5 py-5 shadow-2xl">
        <div className="max-w-[1600px] mx-auto px-8 sm:px-12 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex p-1 bg-black rounded-2xl border border-white/10 shadow-inner">
               <button onClick={() => setActiveType('all')} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeType === 'all' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>الكل</button>
               <button onClick={() => setActiveType('movie')} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeType === 'movie' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>أفلام</button>
               <button onClick={() => setActiveType('series')} className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeType === 'series' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>مسلسلات</button>
            </div>
            
            <select 
              value={activeGenre} 
              onChange={(e) => setActiveGenre(e.target.value)} 
              className="bg-black text-white px-6 py-3 rounded-2xl border border-white/10 text-xs font-bold outline-none focus:border-red-600 transition-all cursor-pointer shadow-lg appearance-none"
            >
              <option value="all">جميع التصنيفات</option>
              {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {(activeType !== 'all' || activeGenre !== 'all') && (
            <button 
              onClick={() => { setActiveType('all'); setActiveGenre('all'); }} 
              className="flex items-center gap-2 text-red-500 text-xs font-black hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all"
            >
              <X className="w-4 h-4" /> مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      <div className="min-h-[600px]">
        {filteredContent ? (
          <div className="max-w-[1600px] mx-auto px-8 sm:px-12 mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-12 animate-fadeIn">
            {filteredContent.map(movie => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        ) : (
          <div className="space-y-4">
            <Carousel id="popular" title="الأكثر رواجاً" icon={<TrendingUp className="w-5 h-5 text-red-500" />} movies={sections.trending} variant="trending" />
            <Carousel id="movies" title="أحدث الإضافات" icon={<Zap className="w-5 h-5 text-yellow-400 fill-current" />} movies={sections.recent} />
            <Carousel id="series" title="مسلسلات مختارة" icon={<Tv className="w-5 h-5 text-purple-500" />} movies={sections.series} />
            <Carousel title="عالم الأنيمي" icon={<Cat className="w-5 h-5 text-orange-500" />} movies={sections.anime} />
            <Carousel title="أفلام الرعب" icon={<Ghost className="w-5 h-5 text-gray-400" />} movies={sections.horror} />
            <Carousel title="دراما كورية وتركية" icon={<Globe className="w-5 h-5 text-emerald-500" />} movies={sections.korean} />
            <Carousel title="الكوميديا والضحك" icon={<Laugh className="w-5 h-5 text-yellow-400" />} movies={sections.comedy} />
            <Carousel title="مغامرة وخيال علمي" icon={<Rocket className="w-5 h-5 text-blue-500" />} movies={sections.adventure} />
          </div>
        )}
      </div>

      {showWelcome && (
        <div className="fixed bottom-10 left-10 z-[60] animate-slideUp">
          <div className="bg-[#141414] border border-white/10 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-w-sm relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 blur-3xl -z-10"></div>
            <div className="flex items-start gap-5">
              <div className="bg-red-600/10 p-3 rounded-2xl flex-shrink-0">
                 <Sparkles className="w-7 h-7 text-red-600 animate-soft-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-white text-lg">أهلاً بك في الإصدار الجديد!</h3>
                  <button onClick={dismissWelcome} className="text-gray-600 hover:text-white transition-colors p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  استمتع بتجربة مشاهدة محسنة، مساحات بصرية مريحة، وسرعة فائقة في التصفح. مشاهدة ممتعة!
                </p>
                <button 
                  onClick={dismissWelcome}
                  className="mt-5 w-full bg-white text-black font-black py-3 rounded-2xl hover:bg-gray-200 transition-all text-sm active:scale-95"
                >
                  استكشف الآن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="max-w-[1600px] mx-auto px-8 sm:px-12 mt-20 pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
         <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-red-600 rounded-lg p-1"> <Film className="w-5 h-5 text-white" /> </div>
              <span className="text-2xl font-black text-white tracking-tighter uppercase font-sans"> Cinema<span className="text-red-600">Stream</span> </span>
            </Link>
            <p className="text-gray-500 text-sm max-w-xs leading-loose">منصتك الأولى لمشاهدة أحدث الأفلام والمسلسلات بجودة عالية وتجربة سينمائية لا مثيل لها.</p>
         </div>
         <div className="flex flex-wrap gap-10 text-gray-500 text-sm font-bold">
            <a href="#" className="hover:text-white transition-colors">عن المنصة</a>
            <a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-white transition-colors">شروط الاستخدام</a>
            <a href="#" className="hover:text-white transition-colors">اتصل بنا</a>
         </div>
         <p className="text-gray-700 text-[10px] font-black uppercase tracking-widest">&copy; 2024 CinemaStream Cloud Infrastructure.</p>
      </footer>
    </div>
  );
};

export default HomePage;
