
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Heart, LogOut, ChevronLeft, Loader2, Film, ShieldCheck } from 'lucide-react';
import { supabase, MovieService } from '../constants';
import { Movie } from '../types';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      setUser(session.user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setProfile(profileData);

      const movies = await MovieService.getWatchlistMovies();
      setWatchlist(movies);
      
      setIsLoading(false);
    };

    fetchProfileData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('admin_auth');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.email === 'mohamedaouslim@gmail.com' || profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-red-600 font-sans">
      <Navbar />

      <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
        <div className="bg-[#111] rounded-3xl border border-white/5 overflow-hidden shadow-2xl mb-12">
          {/* Header/Banner */}
          <div className="h-32 bg-gradient-to-r from-red-900 to-black relative">
             <div className="absolute -bottom-12 right-8 flex items-end gap-6">
                <div className="w-24 h-24 rounded-2xl bg-[#1a1a1a] border-4 border-[#111] shadow-xl flex items-center justify-center text-red-600 overflow-hidden">
                   {profile?.avatar_url ? (
                     <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                   ) : (
                     <User className="w-12 h-12" />
                   )}
                </div>
                <div className="mb-2">
                   <h1 className="text-2xl md:text-3xl font-black text-white">{profile?.name || 'مستخدم سينما ستريم'}</h1>
                   <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{user?.email}</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-6">
                <div className="text-center">
                   <div className="text-2xl font-black text-white">{watchlist.length}</div>
                   <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">المفضلة</div>
                </div>
                <div className="w-px h-8 bg-gray-800"></div>
                <div className="text-center">
                   <div className="text-2xl font-black text-white">
                      {watchlist.filter(m => m.type === 'movie').length}
                   </div>
                   <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">أفلام</div>
                </div>
                <div className="w-px h-8 bg-gray-800"></div>
                <div className="text-center">
                   <div className="text-2xl font-black text-white">
                      {watchlist.filter(m => m.type === 'series').length}
                   </div>
                   <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">مسلسلات</div>
                </div>
             </div>

             <div className="flex flex-wrap items-center gap-3">
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-xl text-sm font-bold border border-white/10 flex items-center gap-2 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    لوحة التحكم
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-6 py-2.5 rounded-xl text-sm font-bold border border-red-500/20 flex items-center gap-2 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </button>
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                 <Heart className="w-6 h-6 text-red-600 fill-current" />
                 قائمة مفضلاتي
              </h2>
              <Link to="/" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
                اكتشف المزيد
                <ChevronLeft className="w-4 h-4" />
              </Link>
           </div>

           {watchlist.length > 0 ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-fadeIn">
                {watchlist.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
             </div>
           ) : (
             <div className="bg-[#111] rounded-3xl p-20 flex flex-col items-center justify-center text-center gap-6 border border-dashed border-gray-800">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center">
                   <Film className="w-10 h-10 text-gray-700" />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-gray-300">قائمتك فارغة حالياً</h3>
                   <p className="text-gray-500 mt-2">ابدأ بإضافة الأفلام والمسلسلات التي تنوي مشاهدتها لاحقاً!</p>
                </div>
                <Link to="/" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-red-900/20">
                   تصفح المحتوى
                </Link>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
