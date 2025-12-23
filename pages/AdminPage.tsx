
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Plus, PlayCircle, Film, AlertCircle, CheckCircle, 
  LogOut, Tv, Trash2, Edit2, Layers, TrendingUp, RefreshCw, Loader2, 
  Database, ExternalLink, Image as ImageIcon, Calendar, ShieldAlert, 
  ListOrdered, Server, Link as LinkIcon, Flame, Laugh, Ghost, Rocket, 
  Heart, FileText, Users, Search, Cat, Library, Swords, Globe, 
  Sparkles, Mountain, GraduationCap, Zap, Clapperboard, ChevronLeft, Save, 
  Settings2, Star, Eye, EyeOff, Trophy, History
} from 'lucide-react';
import { GENRES, MovieService, supabase } from '../constants';
import { Movie, Episode } from '../types';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [contentList, setContentList] = useState<Movie[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  
  const [tmdbId, setTmdbId] = useState('');
  const [movieTmdbId, setMovieTmdbId] = useState(''); 
  const [totalSeasonsInput, setTotalSeasonsInput] = useState<number>(0);
  const [seasonsConfig, setSeasonsConfig] = useState<{season: number, episodesCount: string}[]>([]);
  const [defaultEpisodeServersRaw, setDefaultEpisodeServersRaw] = useState('');
  
  const [formData, setFormData] = useState<Partial<Movie>>({
    type: 'movie',
    rating: 'All',
    genre: [],
    embedCode: '',
    quality: 'HD',
    episodes: [],
    additionalServers: [],
    cast: [],
    isFeatured: false,
    isTrending: false,
    hasAdultContent: false,
    year: new Date().getFullYear(),
    backdropUrl: '',
    thumbnailUrl: '',
    tmdbId: '',
    duration: ''
  });

  const [additionalServersRaw, setAdditionalServersRaw] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const navigate = useNavigate();

  const getGenreIcon = (genre: string) => {
    switch (genre) {
      case 'أكشن': return Flame;
      case 'دراما': return Clapperboard;
      case 'كوميديا': return Laugh;
      case 'رعب': return Ghost;
      case 'خيال علمي': return Rocket;
      case 'رومانسي': return Heart;
      case 'وثائقي': return FileText;
      case 'عائلي': return Users;
      case 'غموض': return Search;
      case 'أنيمي': return Cat;
      case 'جريمة': return ShieldAlert;
      case 'تاريخي': return Library;
      case 'حرب': return Swords;
      case 'كوري': return Globe;
      case 'تركي': return Globe;
      case 'فانتازيا': return Sparkles;
      case 'مغامرة': return Mountain;
      case 'مدرسي': return GraduationCap;
      case 'شبابي': return Zap;
      default: return Layers;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('admin_auth');
    navigate('/login');
  };

  const fetchContent = async () => {
    try {
      setIsLoadingList(true);
      const data = await MovieService.getAll();
      setContentList(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'فشل في تحميل البيانات من قاعدة البيانات' });
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    if (totalSeasonsInput > 0) {
      const currentConfig = [...seasonsConfig];
      const newConfig = Array.from({ length: totalSeasonsInput }, (_, i) => {
        const seasonNum = i + 1;
        const existing = currentConfig.find(c => c.season === seasonNum);
        return existing || { season: seasonNum, episodesCount: '' };
      });
      setSeasonsConfig(newConfig);
    } else {
      setSeasonsConfig([]);
    }
  }, [totalSeasonsInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => {
      const current = prev.genre || [];
      const isSelected = current.includes(genre);
      const newList = isSelected 
        ? current.filter(g => g !== genre) 
        : [...current, genre];
      return { ...prev, genre: newList };
    });
  };

  const handleGenerateMovieEmbed = () => {
    if (!movieTmdbId) {
      setMessage({ type: 'error', text: 'يرجى إدخال TMDB ID للفيلم' });
      return;
    }
    const embed = `<iframe src="https://www.vidking.net/embed/movie/${movieTmdbId}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
    setFormData(prev => ({ ...prev, embedCode: embed, tmdbId: movieTmdbId }));
    setMessage({ type: 'success', text: 'تم توليد كود الفيلم بنجاح!' });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleGenerateEpisodes = () => {
    if (!tmdbId) {
      setMessage({ type: 'error', text: 'يرجى إدخال TMDB ID للمسلسل' });
      return;
    }
    
    const validSeasons = seasonsConfig.filter(s => parseInt(s.episodesCount) > 0);
    if (validSeasons.length === 0) {
       setMessage({ type: 'error', text: 'يرجى إدخال عدد الحلقات لموسم واحد على الأقل' });
       return;
    }

    const defaultServers = defaultEpisodeServersRaw.split('\n').map(s => s.trim()).filter(s => s !== '');

    const generatedEpisodes: Episode[] = [];
    let totalEps = 0;

    validSeasons.forEach((config) => {
      const count = parseInt(config.episodesCount);
      for (let i = 1; i <= count; i++) {
        totalEps++;
        generatedEpisodes.push({
          id: `${tmdbId}_s${config.season}_e${i}`,
          season: config.season,
          number: i,
          title: `الحلقة ${i}`,
          embedCode: `<iframe src="https://www.vidking.net/embed/tv/${tmdbId}/${config.season}/${i}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
          additionalServers: [...defaultServers]
        });
      }
    });

    setFormData(prev => ({ 
      ...prev, 
      episodes: generatedEpisodes,
      totalSeasons: totalSeasonsInput,
      totalEpisodes: totalEps,
      duration: `${totalSeasonsInput} مواسم`,
      tmdbId: tmdbId
    }));
    
    setMessage({ type: 'success', text: `تم توليد ${generatedEpisodes.length} حلقة بنجاح!` });
    setTimeout(() => setMessage(null), 2000);
  };

  const updateEpisodeServers = (episodeId: string, serversString: string) => {
    const servers = serversString.split('\n').map(s => s.trim()).filter(s => s !== '');
    setFormData(prev => ({
      ...prev,
      episodes: prev.episodes?.map(ep => ep.id === episodeId ? { ...ep, additionalServers: servers } : ep)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setMessage({ type: 'error', text: 'يرجى تعبئة الحقول الأساسية (العنوان والوصف)' });
      return;
    }

    try {
      setIsProcessing(true);
      const servers = additionalServersRaw.split('\n').map(s => s.trim()).filter(s => s !== '');
      
      const currentTmdbId = formData.type === 'movie' ? movieTmdbId : tmdbId;

      const movieData = {
        ...formData,
        id: formData.id || formData.title?.toLowerCase().trim().replace(/[\s\W-]+/g, '_'),
        additionalServers: servers,
        views: formData.views || 0,
        addedAt: formData.addedAt || new Date().toISOString(),
        cast: formData.cast || [],
        genre: formData.genre || [],
        year: Number(formData.year) || new Date().getFullYear(),
        tmdbId: currentTmdbId
      } as Movie;

      await MovieService.save(movieData);
      await fetchContent();
      
      setMessage({ type: 'success', text: isEditing ? 'تم حفظ التعديلات' : 'تمت الإضافة بنجاح' });
      
      setTimeout(() => { 
        setMessage(null); 
        if (isEditing) switchToAdd(); 
        else resetForm();
      }, 2000);

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'خطأ في الاتصال بقاعدة البيانات' });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      type: 'movie', rating: 'All', genre: [], embedCode: '', quality: 'HD', 
      episodes: [], isFeatured: false, isTrending: false, hasAdultContent: false,
      year: new Date().getFullYear(), thumbnailUrl: '', backdropUrl: '',
      totalSeasons: 0, totalEpisodes: 0, tmdbId: '', duration: ''
    });
    setAdditionalServersRaw(''); setMovieTmdbId(''); setTmdbId(''); setTotalSeasonsInput(0); setSeasonsConfig([]);
    setDefaultEpisodeServersRaw('');
    setIsEditing(false);
  };

  const switchToAdd = () => { resetForm(); setActiveTab('add'); };

  const handleEdit = (movie: Movie) => {
    setFormData(movie);
    setAdditionalServersRaw(movie.additionalServers?.join('\n') || '');
    if (movie.type === 'series') {
        setTotalSeasonsInput(movie.totalSeasons || 0);
        setTmdbId(movie.tmdbId || '');
    } else {
        setMovieTmdbId(movie.tmdbId || '');
    }
    setIsEditing(true);
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من الحذف؟')) {
      try {
        setIsProcessing(true);
        await MovieService.delete(id);
        await fetchContent();
        setMessage({ type: 'success', text: 'تم الحذف بنجاح' });
        setTimeout(() => setMessage(null), 2000);
      } catch (err) {
        setMessage({ type: 'error', text: 'فشل الحذف' });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] pb-32 selection:bg-red-600">
      <Navbar />
      
      {isProcessing && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-8 animate-pulse">
            <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
            <span className="text-white text-2xl font-black tracking-widest uppercase">جاري التحديث...</span>
          </div>
        </div>
      )}

      <div className="pt-28 px-6 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-[#111] rounded-[2rem] p-6 border border-white/5 sticky top-28 shadow-2xl space-y-8">
              <div className="flex items-center gap-4 px-2">
                 <div className="bg-red-600 p-2.5 rounded-xl shadow-lg shadow-red-600/20"> <LayoutDashboard className="w-6 h-6 text-white" /> </div>
                 <h2 className="text-xl font-black text-white">إدارة المنصة</h2>
              </div>
              
              <nav className="space-y-3">
                <button onClick={switchToAdd} className={`w-full text-right px-6 py-4 rounded-2xl flex items-center gap-4 transition-all font-bold ${activeTab === 'add' ? 'bg-red-600 text-white shadow-[0_10px_30px_rgba(229,9,20,0.3)]' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
                  <Plus className="w-5 h-5" /> {isEditing ? 'تعديل البيانات' : 'إضافة عمل جديد'}
                </button>
                <button onClick={() => { setActiveTab('list'); fetchContent(); }} className={`w-full text-right px-6 py-4 rounded-2xl flex items-center gap-4 transition-all font-bold ${activeTab === 'list' ? 'bg-red-600 text-white shadow-[0_10px_30px_rgba(229,9,20,0.3)]' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
                  <Layers className="w-5 h-5" /> قائمة المحتوى
                </button>
              </nav>

              <div className="pt-8 border-t border-white/5">
                <button onClick={handleLogout} className="w-full text-right px-6 py-4 rounded-2xl flex items-center gap-4 text-red-500 hover:bg-red-500/10 transition-all font-bold">
                  <LogOut className="w-5 h-5" /> تسجيل الخروج
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {activeTab === 'add' ? (
              <div className="animate-fadeIn space-y-10">
                <div className="bg-[#111] rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                    <h1 className="text-4xl font-black text-white">{isEditing ? 'تعديل المحتوى' : 'إضافة محتوى جديد'}</h1>
                    {message && (
                      <div className={`px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 animate-fadeIn shadow-2xl ${message.type === 'success' ? 'bg-green-600/10 text-green-500 border border-green-600/20' : 'bg-red-600/10 text-red-500 border border-red-600/20'}`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {message.text}
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-12">
                    {/* نوع المحتوى */}
                    <div className="flex p-1.5 bg-black/50 rounded-2xl border border-white/5 w-fit">
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, type: 'movie' }))} className={`px-10 py-4 rounded-xl transition-all font-black flex items-center gap-3 ${formData.type === 'movie' ? 'bg-red-600 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}> <Film className="w-5 h-5" /> فيلم </button>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, type: 'series' }))} className={`px-10 py-4 rounded-xl transition-all font-black flex items-center gap-3 ${formData.type === 'series' ? 'bg-red-600 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}> <Tv className="w-5 h-5" /> مسلسل </button>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                      <div className="space-y-10">
                        {/* معلومات أساسية */}
                        <section className="space-y-6">
                           <div className="flex items-center gap-3 mb-2 px-1">
                              <div className="w-2 h-6 bg-red-600 rounded-full"></div>
                              <h3 className="text-lg font-black text-white">المعلومات الأساسية</h3>
                           </div>
                           <label className="block space-y-3">
                             <span className="text-gray-500 text-xs font-black uppercase tracking-widest mr-2">العنوان</span>
                             <input name="title" value={formData.title || ''} onChange={handleInputChange} type="text" className="w-full bg-black border border-white/5 rounded-2xl p-5 text-white focus:border-red-600 transition-all outline-none shadow-inner" placeholder="اسم العمل..." />
                           </label>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <label className="block space-y-3">
                                <span className="text-gray-500 text-xs font-black uppercase tracking-widest mr-2">رابط البوستر (طولي)</span>
                                <input name="thumbnailUrl" value={formData.thumbnailUrl || ''} onChange={handleInputChange} type="text" className="w-full bg-black border border-white/5 rounded-2xl p-5 text-white focus:border-red-600 outline-none transition-all shadow-inner" placeholder="https://..." />
                              </label>
                              <label className="block space-y-3">
                                <span className="text-gray-500 text-xs font-black uppercase tracking-widest mr-2">رابط الخلفية (عرضي)</span>
                                <input name="backdropUrl" value={formData.backdropUrl || ''} onChange={handleInputChange} type="text" className="w-full bg-black border border-white/5 rounded-2xl p-5 text-white focus:border-red-600 outline-none transition-all shadow-inner" placeholder="https://..." />
                              </label>
                           </div>

                           <label className="block space-y-3">
                             <span className="text-gray-500 text-xs font-black uppercase tracking-widest mr-2">الوصف العربي</span>
                             <textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows={5} className="w-full bg-black border border-white/5 rounded-2xl p-5 text-white focus:border-red-600 outline-none resize-none transition-all shadow-inner leading-relaxed" placeholder="ملخص القصة..." />
                           </label>
                        </section>

                        {/* إعدادات العرض والحالة */}
                        <section className="bg-black/30 p-8 rounded-[2rem] border border-white/5 space-y-8">
                           <div className="flex items-center gap-3 mb-4">
                              <Settings2 className="w-5 h-5 text-red-500" />
                              <h3 className="text-lg font-black text-white">إعدادات العرض والحالة</h3>
                           </div>

                           <div className="grid grid-cols-2 gap-6">
                              <label className="block space-y-3">
                                <span className="text-gray-500 text-xs font-black uppercase tracking-widest mr-2">سنة الإنتاج</span>
                                <input name="year" value={formData.year || ''} onChange={handleInputChange} type="number" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none" />
                              </label>
                              <label className="block space-y-3">
                                <span className="text-gray-500 text-xs font-black uppercase tracking-widest mr-2">المدة / المواسم</span>
                                <input name="duration" value={formData.duration || ''} onChange={handleInputChange} type="text" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none" placeholder="مثال: 120 دقيقة" />
                              </label>
                           </div>

                           <div className="grid grid-cols-2 gap-6">
                              <label className="block space-y-3">
                                <span className="text-gray-500 text-xs font-black uppercase tracking-widest mr-2">التصنيف العمري</span>
                                <select name="rating" value={formData.rating || 'All'} onChange={handleInputChange} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none">
                                  <option value="All">للكل (All)</option>
                                  <option value="13+">13+</option>
                                  <option value="18+">18+</option>
                                </select>
                              </label>
                              <label className="block space-y-3">
                                <span className="text-gray-500 text-xs font-black uppercase tracking-widest mr-2">الجودة</span>
                                <select name="quality" value={formData.quality || 'HD'} onChange={handleInputChange} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white focus:border-red-600 outline-none">
                                  <option value="HD">HD</option>
                                  <option value="FHD">Full HD</option>
                                  <option value="4K">4K UHD</option>
                                  <option value="CAM">CAM</option>
                                </select>
                              </label>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                              <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${formData.isFeatured ? 'bg-red-600/10 border-red-600 text-red-500' : 'bg-black border-white/10 text-gray-500'}`}>
                                <span className="text-xs font-black uppercase tracking-widest">عمل مميز</span>
                                <input name="isFeatured" checked={formData.isFeatured || false} onChange={handleInputChange} type="checkbox" className="hidden" />
                                {formData.isFeatured ? <CheckCircle className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-current opacity-20" />}
                              </label>

                              <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${formData.isTrending ? 'bg-orange-600/10 border-orange-600 text-orange-500' : 'bg-black border-white/10 text-gray-500'}`}>
                                <span className="text-xs font-black uppercase tracking-widest">رائج الآن</span>
                                <input name="isTrending" checked={formData.isTrending || false} onChange={handleInputChange} type="checkbox" className="hidden" />
                                {formData.isTrending ? <Flame className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-current opacity-20" />}
                              </label>

                              <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${formData.hasAdultContent ? 'bg-purple-600/10 border-purple-600 text-purple-500' : 'bg-black border-white/10 text-gray-500'}`}>
                                <span className="text-xs font-black uppercase tracking-widest">18+ (Adult)</span>
                                <input name="hasAdultContent" checked={formData.hasAdultContent || false} onChange={handleInputChange} type="checkbox" className="hidden" />
                                {formData.hasAdultContent ? <ShieldAlert className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-current opacity-20" />}
                              </label>
                           </div>
                        </section>

                        {/* سيرفرات إضافية */}
                        <section className="space-y-6 bg-black/30 p-8 rounded-[2rem] border border-white/5">
                           <div className="flex items-center gap-3 mb-4">
                              <Server className="w-5 h-5 text-blue-500" />
                              <h3 className="text-lg font-black text-white">السيرفرات الإضافية للعمل</h3>
                           </div>
                           <p className="text-[10px] text-gray-500 leading-relaxed">هذه السيرفرات تظهر للفيلم (أو السيرفرات الأساسية للمسلسل)</p>
                           <textarea 
                             value={additionalServersRaw} 
                             onChange={(e) => setAdditionalServersRaw(e.target.value)} 
                             rows={4} 
                             className="w-full bg-black border border-white/5 rounded-2xl p-5 text-white text-xs font-mono focus:border-blue-600 outline-none transition-all" 
                             placeholder="رابط واحد في كل سطر..." 
                           />
                        </section>
                      </div>

                      <div className="space-y-10">
                        {formData.type === 'series' ? (
                          <section className="bg-purple-600/5 p-8 rounded-[2.5rem] border border-purple-600/20 space-y-8 shadow-2xl">
                            <div className="flex items-center gap-4">
                               <div className="bg-purple-600 p-3 rounded-2xl"> <ListOrdered className="w-6 h-6 text-white" /> </div>
                               <h3 className="text-xl font-black text-white">أداة توليد الحلقات الذكية</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                              <label className="block space-y-3">
                                <span className="text-purple-400 text-[10px] font-black uppercase tracking-widest">TMDB ID للمسلسل</span>
                                <input type="text" placeholder="مثال: 131927" value={tmdbId} onChange={(e) => setTmdbId(e.target.value)} className="w-full bg-black border border-purple-600/20 rounded-2xl px-5 py-4 text-white text-sm focus:border-purple-600 outline-none shadow-inner" />
                              </label>
                              <label className="block space-y-3">
                                <span className="text-purple-400 text-[10px] font-black uppercase tracking-widest">عدد المواسم</span>
                                <input type="number" min="0" placeholder="0" value={totalSeasonsInput || ''} onChange={(e) => setTotalSeasonsInput(parseInt(e.target.value) || 0)} className="w-full bg-black border border-purple-600/20 rounded-2xl px-5 py-4 text-white text-sm focus:border-purple-600 outline-none shadow-inner" />
                              </label>
                            </div>

                            {seasonsConfig.length > 0 && (
                              <div className="space-y-4 max-h-64 overflow-y-auto pr-3 custom-scrollbar">
                                {seasonsConfig.map((config, idx) => (
                                  <div key={config.season} className="flex items-center gap-5 bg-black/40 p-4 rounded-2xl border border-white/5">
                                    <span className="text-xs font-black text-purple-400 w-16">موسم {config.season}</span>
                                    <input 
                                      type="number" 
                                      placeholder="عدد الحلقات" 
                                      value={config.episodesCount} 
                                      onChange={(e) => {
                                        const next = [...seasonsConfig];
                                        next[idx].episodesCount = e.target.value;
                                        setSeasonsConfig(next);
                                      }}
                                      className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="space-y-3">
                              <label className="block space-y-2">
                                <span className="text-purple-400 text-[10px] font-black uppercase tracking-widest">سيرفرات احتياطية لكل الحلقات (اختياري)</span>
                                <textarea 
                                  value={defaultEpisodeServersRaw}
                                  onChange={(e) => setDefaultEpisodeServersRaw(e.target.value)}
                                  rows={3}
                                  className="w-full bg-black border border-purple-600/20 rounded-2xl p-4 text-white text-[10px] font-mono focus:border-purple-600 outline-none shadow-inner"
                                  placeholder="سيتم إضافة هذه الروابط لجميع الحلقات التي سيتم توليدها..."
                                />
                              </label>
                            </div>

                            <button type="button" onClick={handleGenerateEpisodes} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-purple-900/40 active:scale-95 flex items-center justify-center gap-3">
                               توليد جميع الحلقات الآن
                            </button>

                            {/* قائمة معاينة وتعديل الحلقات المولدة */}
                            {formData.episodes && formData.episodes.length > 0 && (
                              <div className="space-y-4 mt-6">
                                <div className="flex items-center justify-between px-1">
                                  <span className="text-xs font-black text-white flex items-center gap-2"> <Settings2 className="w-4 h-4 text-purple-400" /> معاينة وتعديل الحلقات </span>
                                  <span className="text-[10px] text-gray-500">{formData.episodes.length} حلقة</span>
                                </div>
                                <div className="space-y-3 max-h-80 overflow-y-auto pr-3 custom-scrollbar">
                                  {formData.episodes.map((ep) => (
                                    <div key={ep.id} className="bg-black/60 rounded-2xl border border-white/5 p-4 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black text-purple-400">موسم {ep.season} - حلقة {ep.number}</span>
                                      </div>
                                      <label className="block space-y-2">
                                        <span className="text-[9px] text-gray-600 font-bold uppercase">سيرفرات هذه الحلقة:</span>
                                        <textarea 
                                          defaultValue={ep.additionalServers?.join('\n') || ''}
                                          onBlur={(e) => updateEpisodeServers(ep.id, e.target.value)}
                                          rows={2}
                                          className="w-full bg-black border border-white/10 rounded-xl p-3 text-[9px] text-gray-400 font-mono focus:border-purple-500 outline-none"
                                          placeholder="رابط في كل سطر..."
                                        />
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </section>
                        ) : (
                          <section className="bg-blue-600/5 p-8 rounded-[2.5rem] border border-blue-600/20 space-y-8">
                            <div className="flex items-center gap-4">
                               <div className="bg-blue-600 p-3 rounded-2xl"> <ExternalLink className="w-6 h-6 text-white" /> </div>
                               <h3 className="text-xl font-black text-white">تضمين الفيلم (VidKing)</h3>
                            </div>
                            <div className="flex gap-4">
                              <input type="text" placeholder="TMDB ID..." value={movieTmdbId} onChange={(e) => setMovieTmdbId(e.target.value)} className="flex-1 bg-black border border-white/10 rounded-2xl px-6 py-4 text-white text-sm" />
                              <button type="button" onClick={handleGenerateMovieEmbed} className="bg-white text-black font-black px-8 rounded-2xl hover:bg-gray-200 transition-all text-xs active:scale-95">توليد</button>
                            </div>
                            <textarea name="embedCode" value={formData.embedCode || ''} onChange={handleInputChange} rows={3} className="w-full bg-black border border-white/10 rounded-2xl p-5 text-white text-xs font-mono" placeholder="<iframe></iframe>" />
                          </section>
                        )}

                        <section className="bg-black/40 p-10 rounded-[2.5rem] border border-white/5 space-y-8">
                           <div className="flex items-center gap-3 mb-2 px-1">
                              <div className="w-2 h-6 bg-red-600 rounded-full"></div>
                              <h3 className="text-lg font-black text-white">التصنيفات</h3>
                           </div>
                           <div className="flex flex-wrap gap-3 max-h-80 overflow-y-auto pr-3 custom-scrollbar">
                              {GENRES.map(genre => {
                                const GenreIcon = getGenreIcon(genre);
                                const isSelected = formData.genre?.includes(genre);
                                return (
                                  <button
                                    key={genre}
                                    type="button"
                                    onClick={() => handleGenreToggle(genre)}
                                    className={`px-6 py-3 rounded-2xl text-[11px] font-black transition-all border flex items-center gap-3 shadow-xl ${isSelected ? 'bg-red-600 border-red-500 text-white' : 'bg-[#141414] border-white/5 text-gray-500 hover:text-white hover:border-white/20'}`}
                                  >
                                    <GenreIcon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                                    {genre}
                                  </button>
                                );
                              })}
                           </div>
                        </section>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 pt-12 border-t border-white/5">
                      <button type="submit" className="flex-1 bg-red-600 text-white font-black py-6 rounded-3xl hover:bg-red-700 transition-all shadow-2xl shadow-red-600/30 text-2xl flex items-center justify-center gap-4 active:scale-[0.98]">
                        <Save className="w-8 h-8" />
                        {isEditing ? 'حفظ التعديلات' : 'نشر العمل الآن'}
                      </button>
                      <button type="button" onClick={resetForm} className="px-12 bg-[#1a1a1a] text-gray-400 font-black rounded-3xl hover:bg-white/5 transition-all text-lg">
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h1 className="text-4xl font-black text-white">مكتبة المحتوى</h1>
                  <button onClick={fetchContent} className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all flex items-center gap-4 text-sm font-black border border-white/10 shadow-xl active:scale-95">
                    <RefreshCw className={`w-5 h-5 ${isLoadingList ? 'animate-spin' : ''}`} /> تحديث المكتبة
                  </button>
                </div>

                <div className="bg-[#111] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
                  {isLoadingList ? (
                    <div className="p-40 flex flex-col items-center justify-center gap-8">
                       <Loader2 className="w-20 h-20 animate-spin text-red-600" />
                       <span className="text-2xl font-black text-gray-600 tracking-widest">جاري سحب البيانات...</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-right">
                        <thead>
                          <tr className="bg-black/60 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                            <th className="p-8">العمل السينمائي</th>
                            <th className="p-8">النوع</th>
                            <th className="p-8 text-center">التصنيف</th>
                            <th className="p-8 text-center">الحالة</th>
                            <th className="p-8 text-left">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {contentList.map(item => (
                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="p-8">
                                <div className="flex items-center gap-6">
                                  <img src={item.thumbnailUrl} className="w-16 h-24 object-cover rounded-2xl shadow-xl group-hover:scale-105 transition-transform" />
                                  <div className="flex flex-col gap-1">
                                    <span className="font-black text-white text-xl group-hover:text-red-500 transition-colors" dir="ltr">{item.title}</span>
                                    <span className="text-xs font-bold text-gray-500">{item.year} • {item.quality}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-8">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.type === 'series' ? 'bg-purple-600/10 text-purple-500 border border-purple-600/20' : 'bg-blue-600/10 text-blue-500 border border-blue-600/20'}`}>
                                  {item.type === 'series' ? 'مسلسل' : 'فيلم'}
                                </span>
                              </td>
                              <td className="p-8 text-center">
                                <div className="flex flex-wrap gap-2 justify-center max-w-[180px] mx-auto">
                                  {item.genre.slice(0, 2).map(g => (
                                    <span key={g} className="text-[10px] font-bold bg-white/5 px-3 py-1 rounded-lg text-gray-400 border border-white/5">{g}</span>
                                  ))}
                                  {item.genre.length > 2 && <span className="text-[10px] font-black text-gray-600">+{item.genre.length - 2}</span>}
                                </div>
                              </td>
                              <td className="p-8 text-center">
                                <div className="flex items-center justify-center gap-3">
                                  {/* Fixed: Removed invalid 'title' prop from Lucide icon components */}
                                  {item.rating === '18+' && <ShieldAlert className="w-5 h-5 text-red-500" />}
                                  {item.isFeatured && <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_10px_rgba(229,9,20,0.8)]" title="مميز" />}
                                  {item.isTrending && <Flame className="w-5 h-5 text-orange-500 fill-current" />}
                                </div>
                              </td>
                              <td className="p-8">
                                <div className="flex items-center justify-end gap-4">
                                  <button onClick={() => handleEdit(item)} className="w-12 h-12 bg-white/5 text-white rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center shadow-lg active:scale-90"> <Edit2 className="w-5 h-5" /> </button>
                                  <button onClick={() => handleDelete(item.id)} className="w-12 h-12 bg-white/5 text-white rounded-2xl hover:bg-red-600 transition-all flex items-center justify-center shadow-lg active:scale-90"> <Trash2 className="w-5 h-5" /> </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
