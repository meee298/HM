
import React, { useState, useEffect, useRef } from 'react';
/* Added ChevronLeft to imports */
import { Search, Menu, Film, User, X, PlayCircle, Tv, ChevronLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MovieService, supabase } from '../constants';
import { Movie } from '../types';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLDivElement>(null);
  const mobileResultsRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchResults([]);
      }
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setShowMobileSearch(false);
    setIsMenuOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  }, [location.pathname]);

  useEffect(() => {
    const triggerSearch = async () => {
      if (searchQuery.trim().length > 1) {
        const movies = await MovieService.getAll();
        const filtered = movies.filter(m => 
          m.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
      } else {
        setSearchResults([]);
      }
    };
    const delayDebounceFn = setTimeout(() => {
      triggerSearch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleResultClick = (id: string) => {
    navigate(`/movie/${id}`);
    setSearchQuery('');
    setSearchResults([]);
    setShowMobileSearch(false);
  };

  const navLinks = [
    { name: 'الرئيسية', path: '/' },
    { name: 'أفلام', path: '/#movies' },
    { name: 'مسلسلات', path: '/#series' },
    { name: 'رائج', path: '/#popular' }
  ];

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    if (location.pathname === '/') {
      if (path === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (path.startsWith('/#')) {
        const id = path.substring(2);
        const element = document.getElementById(id);
        if (element) {
          e.preventDefault();
          const offset = 100;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          window.history.pushState(null, '', path);
        }
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-black/85 backdrop-blur-xl border-b border-white/10 shadow-2xl py-2' : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent py-4'}`}>
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10">
        <div className="flex items-center justify-between h-14 md:h-16">
          
          <div className={`flex items-center gap-10 ${showMobileSearch ? 'hidden lg:flex' : 'flex'}`}>
            <Link to="/" className="flex items-center gap-2.5 group transition-transform active:scale-95" onClick={(e) => handleNavClick(e, '/')}>
              <div className="bg-red-600 rounded-lg p-1.5 shadow-lg shadow-red-600/20 group-hover:bg-red-500 transition-all">
                 <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase font-sans">
                Cinema<span className="text-red-600">Stream</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((item) => (
                <Link 
                  key={item.name}
                  to={item.path} 
                  onClick={(e) => handleNavClick(e, item.path)}
                  className="px-4 py-2 rounded-full text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className={`flex items-center gap-5 ${showMobileSearch ? 'w-full lg:w-auto' : ''}`}>
             
             {showMobileSearch && (
               <div ref={mobileInputRef} className="flex-1 flex items-center gap-3 lg:hidden animate-fadeIn w-full">
                 <div className="relative flex-1">
                   <input 
                     autoFocus
                     type="text" 
                     placeholder="عن ماذا تبحث اليوم؟" 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full bg-[#141414] border border-white/10 text-white text-sm rounded-2xl px-5 py-3 pl-12 focus:outline-none focus:border-red-600 shadow-2xl transition-all"
                   />
                   <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                 </div>
                 <button 
                   onClick={() => { setShowMobileSearch(false); setSearchQuery(''); }}
                   className="p-3 text-gray-400 hover:text-white bg-white/5 rounded-2xl transition-all active:scale-90"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>
             )}

            <div className="hidden lg:flex relative group" ref={searchRef}>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث سريع..." 
                  className="bg-[#141414]/60 border border-white/10 group-hover:border-white/30 text-white text-sm rounded-2xl px-5 py-2.5 pl-12 focus:outline-none focus:border-red-600 focus:bg-black transition-all w-56 focus:w-80"
                />
                <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
              
              {searchResults.length > 0 && (
                <div className="absolute top-full right-0 mt-3 bg-[#111] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden w-80 max-h-[500px] overflow-y-auto z-[100] animate-fadeInUp">
                  <div className="p-3 border-b border-white/5 bg-black/50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">نتائج البحث</span>
                  </div>
                  {searchResults.map(movie => (
                    <button 
                      key={movie.id}
                      onClick={() => handleResultClick(movie.id)}
                      className="w-full flex items-center gap-4 p-3.5 hover:bg-white/5 transition-all text-right group/item border-b border-white/5 last:border-0"
                    >
                      <img src={movie.thumbnailUrl} alt={movie.title} className="w-10 h-14 object-cover rounded-lg shadow-lg group-hover/item:scale-105 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold text-sm truncate group-hover/item:text-red-500 transition-colors" dir="ltr">{movie.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1 font-bold">
                          <span>{movie.year}</span>
                          <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                          <span className="bg-white/5 px-2 py-0.5 rounded uppercase">{movie.type === 'series' ? 'مسلسل' : 'فيلم'}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={`flex items-center gap-4 ${showMobileSearch ? 'hidden lg:flex' : 'flex'}`}>
              <button 
                onClick={() => setShowMobileSearch(true)}
                className="lg:hidden w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link 
                to={isLoggedIn ? "/profile" : "/login"} 
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all shadow-xl active:scale-95 ${isLoggedIn ? 'bg-red-600 border-red-500 text-white shadow-red-600/20' : 'bg-[#141414] border-white/10 text-gray-400 hover:border-red-600'}`}
              >
                <User className="w-5 h-5" />
              </Link>

              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div ref={menuRef} className="lg:hidden absolute top-full left-0 right-0 glass-effect border-t border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.9)] z-50 animate-fadeIn overflow-hidden">
            <div className="flex flex-col p-6 gap-3">
              {navLinks.map((item) => (
                <Link 
                  key={item.name}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item.path)}
                  className="px-5 py-4 rounded-2xl hover:bg-white/5 text-gray-300 hover:text-white transition-all font-bold flex items-center justify-between group"
                >
                  {item.name}
                  <ChevronLeft className="w-4 h-4 text-gray-600 group-hover:text-red-600 group-hover:translate-x-[-4px] transition-all" />
                </Link>
              ))}
              <div className="h-px bg-white/5 my-3"></div>
              <Link 
                to={isLoggedIn ? "/profile" : "/login"}
                className="px-5 py-4 rounded-2xl bg-red-600 text-white text-center font-black shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all"
              >
                {isLoggedIn ? 'ملفي الشخصي' : 'تسجيل الدخول'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
