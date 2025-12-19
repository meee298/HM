
import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, Film, User, X, PlayCircle, Tv } from 'lucide-react';
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

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      const inDesktop = searchRef.current && searchRef.current.contains(target);
      const inMobileInput = mobileInputRef.current && mobileInputRef.current.contains(target);
      const inMobileResults = mobileResultsRef.current && mobileResultsRef.current.contains(target);

      if (!inDesktop && !inMobileInput && !inMobileResults) {
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
  }, [location.pathname]);

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
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          m.description.includes(searchQuery)
        );
        setSearchResults(filtered);
      } else {
        setSearchResults([]);
      }
    };
    triggerSearch();
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
    { name: 'الأكثر مشاهدة', path: '/#popular' }
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
          element.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', path);
        }
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent ${isScrolled ? 'bg-[#0f0f0f]/95 backdrop-blur-md border-white/5 shadow-xl' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          <div className={`flex items-center gap-8 ${showMobileSearch ? 'hidden lg:flex' : 'flex'}`}>
            <Link to="/" className="flex items-center gap-2 group" onClick={(e) => handleNavClick(e, '/')}>
              <div className="bg-red-600 rounded p-1 group-hover:bg-white transition-colors">
                 <Film className="w-6 h-6 text-white group-hover:text-red-600" />
              </div>
              <span className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase font-sans">
                Cinema<span className="text-red-600">Stream</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-gray-300">
              {navLinks.map((item) => (
                <Link 
                  key={item.name}
                  to={item.path} 
                  onClick={(e) => handleNavClick(e, item.path)}
                  className="px-4 py-2 rounded-full hover:bg-white/10 hover:text-white transition-all"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className={`flex items-center gap-4 ${showMobileSearch ? 'w-full lg:w-auto' : ''}`}>
             
             {showMobileSearch && (
               <div ref={mobileInputRef} className="flex-1 flex items-center gap-2 lg:hidden animate-fadeIn w-full">
                 <div className="relative flex-1">
                   <input 
                     autoFocus
                     type="text" 
                     placeholder="ابحث عن فيلم..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full bg-[#1a1a1a] border border-red-900/50 text-white text-sm rounded-full px-4 py-2.5 pl-10 pr-4 focus:outline-none focus:border-red-600 shadow-lg"
                   />
                   <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                 </div>
                 <button 
                   onClick={() => { setShowMobileSearch(false); setSearchQuery(''); }}
                   className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full cursor-pointer"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>
             )}

            <div className="hidden lg:flex relative group" ref={searchRef}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن فيلم..." 
                className="bg-[#1a1a1a]/80 backdrop-blur border border-white/5 group-hover:border-white/20 text-white text-sm rounded-full px-4 py-2.5 pl-10 pr-12 focus:outline-none focus:border-red-600 focus:bg-black transition-all w-64 focus:w-80 shadow-inner"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-4 top-3.5" />
              
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto z-50">
                  {searchResults.map(movie => (
                    <button 
                      key={movie.id}
                      onClick={() => handleResultClick(movie.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-gray-800 last:border-0 text-right group/item cursor-pointer"
                    >
                      <img src={movie.thumbnailUrl} alt={movie.title} className="w-10 h-14 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold text-sm truncate group-hover/item:text-red-500 transition-colors" dir="ltr">{movie.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <span>{movie.year}</span>
                          <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                          <span className="flex items-center gap-1">
                             {movie.type === 'series' ? <Tv className="w-3 h-3" /> : <PlayCircle className="w-3 h-3" />}
                             {movie.type === 'series' ? 'مسلسل' : 'فيلم'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={`flex items-center gap-3 ${showMobileSearch ? 'hidden lg:flex' : 'flex'}`}>
              <button 
                onClick={() => setShowMobileSearch(true)}
                className="lg:hidden w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-red-600 transition-colors cursor-pointer"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link 
                to={isLoggedIn ? "/profile" : "/login"} 
                className={`w-10 h-10 rounded-full border flex items-center justify-center text-white transition-colors shadow-lg cursor-pointer ${isLoggedIn ? 'bg-red-600 border-red-600 hover:bg-red-700' : 'bg-gradient-to-br from-gray-700 to-gray-900 border-white/10 hover:border-red-600'}`}
                title={isLoggedIn ? "ملفي الشخصي" : "تسجيل الدخول"}
              >
                <User className="w-5 h-5" />
              </Link>

              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-red-600 transition-colors cursor-pointer"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {showMobileSearch && searchResults.length > 0 && (
            <div ref={mobileResultsRef} className="lg:hidden absolute top-full left-0 right-0 bg-[#0f0f0f] border-b border-gray-800 max-h-[70vh] overflow-y-auto shadow-2xl z-40">
                 {searchResults.map(movie => (
                    <button 
                      key={movie.id}
                      onClick={() => handleResultClick(movie.id)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors border-b border-gray-800 text-right cursor-pointer"
                    >
                      <img src={movie.thumbnailUrl} alt={movie.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                      <div className="flex-1">
                        <h4 className="text-white font-bold text-base mb-1" dir="ltr">{movie.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{movie.year}</span>
                          <span className="px-2 py-0.5 bg-gray-800 rounded text-gray-300">{movie.quality}</span>
                          <span className="flex items-center gap-1">
                             {movie.type === 'series' ? <Tv className="w-3 h-3" /> : <PlayCircle className="w-3 h-3" />}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
            </div>
        )}

        {isMenuOpen && !showMobileSearch && (
          <div ref={menuRef} className="lg:hidden absolute top-full left-0 right-0 bg-[#0f0f0f]/95 backdrop-blur-xl border-t border-gray-800 shadow-2xl z-40 animate-fadeIn">
            <div className="flex flex-col p-4 gap-2">
              {navLinks.map((item) => (
                <Link 
                  key={item.name}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item.path)}
                  className="px-4 py-3 rounded-xl hover:bg-white/10 hover:text-white text-gray-300 transition-all font-medium flex items-center justify-between group"
                >
                  {item.name}
                  <span className="w-2 h-2 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
              ))}
              <div className="h-px bg-gray-800 my-2"></div>
              <Link 
                to={isLoggedIn ? "/profile" : "/login"}
                onClick={() => setIsMenuOpen(false)} 
                className={`px-4 py-3 rounded-xl transition-all font-bold flex items-center justify-center gap-2 ${isLoggedIn ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white'}`}
              >
                <User className="w-4 h-4" />
                {isLoggedIn ? 'ملفي الشخصي' : 'تسجيل الدخول / حسابي'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
