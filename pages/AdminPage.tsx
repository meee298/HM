
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Plus, PlayCircle, Film, AlertCircle, CheckCircle, LogOut, Tv, Trash2, Edit2, Layers, TrendingUp, RefreshCw, Loader2, Database, ExternalLink, Image as ImageIcon, Calendar, ShieldAlert, ListOrdered } from 'lucide-react';
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
    tmdbId: ''
  });

  const [movieServer2, setMovieServer2] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const navigate = useNavigate();

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
          additionalServers: []
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
    
    setMessage({ type: 'success', text: `تم توليد ${generatedEpisodes.length} حلقة عبر ${totalSeasonsInput} مواسم!` });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setMessage({ type: 'error', text: 'يرجى تعبئة الحقول الأساسية (العنوان والوصف)' });
      return;
    }

    try {
      setIsProcessing(true);
      const servers = [movieServer2].filter(s => s.trim() !== '');
      
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
      
      setMessage({ type: 'success', text: isEditing ? 'تم حفظ التعديلات بنجاح' : 'تمت إضافة العمل بنجاح' });
      
      setTimeout(() => { 
        setMessage(null); 
        if (isEditing) switchToAdd(); 
        else resetForm();
      }, 2000);

    } catch (err: any) {
      console.error(err);
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
      totalSeasons: 0, totalEpisodes: 0, tmdbId: ''
    });
    setMovieServer2(''); setMovieTmdbId(''); setTmdbId(''); setTotalSeasonsInput(0); setSeasonsConfig([]);
    setIsEditing(false);
  };

  const switchToAdd = () => { resetForm(); setActiveTab('add'); };

  const handleEdit = (movie: Movie) => {
    setFormData(movie);
    setMovieServer2(movie.additionalServers?.[0] || '');
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
    if (window.confirm('هل أنت متأكد من حذف هذا العمل نهائياً من قاعدة البيانات؟')) {
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
    <div className="min-h-screen bg-[#0a0a0a] pb-20 selection:bg-red-600">
      <Navbar />
      
      {isProcessing && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center">
          <div className="bg-[#1a1a1a] p-10 rounded-3xl border border-white/10 flex flex-col items-center gap-6 shadow-2xl">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
            <div className="text-center">
              <span className="text-white text-xl font-black block mb-2">جاري المعالجة...</span>
              <span className="text-gray-500 text-sm">يتم التحديث في Supabase Cloud</span>
            </div>
          </div>
        </div>
      )}

      <div className="pt-24 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-gray-800 sticky top-24 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 px-2 flex items-center gap-2">
                <LayoutDashboard className="text-red-600 w-5 h-5" /> لوحة التحكم
              </h2>
              <nav className="space-y-2">
                <button onClick={switchToAdd} className={`w-full text-right px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'add' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-gray-400 hover:bg-white/5'}`}>
                  <Plus className="w-5 h-5" /> {isEditing ? 'تعديل العمل' : 'إضافة عمل جديد'}
                </button>
                <button onClick={() => { setActiveTab('list'); fetchContent(); }} className={`w-full text-right px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'list' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-gray-400 hover:bg-white/5'}`}>
                  <Layers className="w-5 h-5" /> إدارة المحتوى
                </button>
              </nav>
              <div className="mt-8 border-t border-gray-800 pt-4">
                <button onClick={handleLogout} className="w-full text-right px-4 py-3 rounded-xl flex items-center gap-3 text-red-400 hover:bg-red-950/20 transition-colors">
                  <LogOut className="w-5 h-5" /> تسجيل الخروج
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {activeTab === 'add' ? (
              <div className="animate-fadeIn">
                <div className="bg-[#111] rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-white">{isEditing ? 'تعديل البيانات' : 'إضافة محتوى'}</h1>
                    {message && (
                      <div className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 animate-fadeInUp shadow-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {message.text}
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex p-1.5 bg-black rounded-2xl border border-gray-800">
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, type: 'movie' }))} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl transition-all ${formData.type === 'movie' ? 'bg-red-600 text-white font-black' : 'text-gray-500 hover:text-gray-300'}`}> 
                        <Film className="w-5 h-5" /> فيلم 
                      </button>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, type: 'series' }))} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl transition-all ${formData.type === 'series' ? 'bg-red-600 text-white font-black' : 'text-gray-500 hover:text-gray-300'}`}> 
                        <Tv className="w-5 h-5" /> مسلسل 
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <label className="block">
                          <span className="text-gray-400 text-sm mb-2 block font-bold">العنوان (English)</span>
                          <input name="title" value={formData.title || ''} onChange={handleInputChange} type="text" className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-red-600 transition-all outline-none" placeholder="Enter title..." />
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <label className="block">
                             <span className="text-gray-400 text-sm mb-2 block font-bold">رابط البوستر (Vertical)</span>
                             <div className="relative">
                               <input name="thumbnailUrl" value={formData.thumbnailUrl || ''} onChange={handleInputChange} type="text" className="w-full bg-black border border-gray-800 rounded-2xl p-4 pl-12 text-white focus:border-red-600 outline-none" placeholder="Poster URL..." />
                               <ImageIcon className="absolute left-4 top-4 w-5 h-5 text-gray-600" />
                             </div>
                           </label>
                           <label className="block">
                             <span className="text-gray-400 text-sm mb-2 block font-bold">رابط الخلفية (Wide)</span>
                             <div className="relative">
                               <input name="backdropUrl" value={formData.backdropUrl || ''} onChange={handleInputChange} type="text" className="w-full bg-black border border-gray-800 rounded-2xl p-4 pl-12 text-white focus:border-red-600 outline-none" placeholder="Backdrop URL..." />
                               <ImageIcon className="absolute left-4 top-4 w-5 h-5 text-gray-600" />
                             </div>
                           </label>
                        </div>

                        <label className="block">
                          <span className="text-gray-400 text-sm mb-2 block font-bold">الوصف العربي (قصة العمل)</span>
                          <textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows={5} className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-red-600 outline-none resize-none leading-relaxed" placeholder="أدخل ملخص القصة..." />
                        </label>

                        <div className="grid grid-cols-3 gap-4">
                           <label className="block">
                             <span className="text-gray-400 text-sm mb-2 block font-bold">السنة</span>
                             <input type="number" name="year" value={formData.year || ''} onChange={handleInputChange} className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white outline-none focus:border-red-600" />
                           </label>
                           <label className="block">
                             <span className="text-gray-400 text-sm mb-2 block font-bold">الجودة</span>
                             <select name="quality" value={formData.quality} onChange={handleInputChange} className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white outline-none focus:border-red-600">
                                <option value="HD">HD</option>
                                <option value="FHD">FHD</option>
                                <option value="4K">4K</option>
                                <option value="CAM">CAM</option>
                             </select>
                           </label>
                           <label className="block">
                             <span className="text-gray-400 text-sm mb-2 block font-bold">المدة</span>
                             <input type="text" name="duration" value={formData.duration || ''} onChange={handleInputChange} className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white outline-none focus:border-red-600" placeholder="2h 10m" />
                           </label>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {formData.type === 'series' ? (
                          <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-gray-800 space-y-6 shadow-inner">
                            <h3 className="text-white font-bold flex items-center gap-2"> <Tv className="w-5 h-5 text-purple-500" /> توليد حلقات المسلسل (VidKing) </h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <label className="block">
                                <span className="text-gray-500 text-xs mb-2 block">TMDB ID</span>
                                <input type="text" placeholder="مثال: 131927" value={tmdbId} onChange={(e) => setTmdbId(e.target.value)} className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-600 outline-none" />
                              </label>
                              <label className="block">
                                <span className="text-gray-500 text-xs mb-2 block">عدد المواسم</span>
                                <input type="number" min="0" placeholder="0" value={totalSeasonsInput || ''} onChange={(e) => setTotalSeasonsInput(parseInt(e.target.value) || 0)} className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-600 outline-none" />
                              </label>
                            </div>

                            {seasonsConfig.length > 0 && (
                              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                <span className="text-gray-500 text-xs block mb-1">حدد عدد الحلقات لكل موسم:</span>
                                {seasonsConfig.map((config, idx) => (
                                  <div key={config.season} className="flex items-center gap-3 bg-black/40 p-2 rounded-lg border border-white/5">
                                    <span className="text-xs text-gray-400 w-16">موسم {config.season}</span>
                                    <input 
                                      type="number" 
                                      placeholder="عدد الحلقات" 
                                      value={config.episodesCount} 
                                      onChange={(e) => {
                                        const next = [...seasonsConfig];
                                        next[idx].episodesCount = e.target.value;
                                        setSeasonsConfig(next);
                                      }}
                                      className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            <button type="button" onClick={handleGenerateEpisodes} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2">
                               <ListOrdered className="w-4 h-4" /> توليد قائمة الحلقات
                            </button>
                            
                            <div className="text-[10px] text-gray-500 bg-black/50 p-3 rounded-lg border border-white/5 text-center">
                               {formData.episodes?.length || 0} حلقة جاهزة للمشاهدة
                            </div>
                          </div>
                        ) : (
                          <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-gray-800 space-y-4">
                            <h3 className="text-white font-bold flex items-center gap-2"> <ExternalLink className="w-4 h-4 text-blue-500" /> تضمين الفيلم </h3>
                            <div className="flex gap-2">
                              <input type="text" placeholder="TMDB ID الفيلم..." value={movieTmdbId} onChange={(e) => setMovieTmdbId(e.target.value)} className="flex-1 bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm" />
                              <button type="button" onClick={handleGenerateMovieEmbed} className="bg-white text-black font-black px-4 rounded-xl hover:bg-gray-200 transition-all text-xs">
                                توليد كود
                              </button>
                            </div>
                            <textarea name="embedCode" value={formData.embedCode || ''} onChange={handleInputChange} rows={3} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white text-[10px] font-mono" placeholder="<iframe></iframe>" />
                          </div>
                        )}

                        <div className="bg-black/50 p-6 rounded-3xl border border-gray-800">
                           <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm"> <Layers className="w-4 h-4 text-red-600" /> التصنيفات </h3>
                           <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                              {GENRES.map(genre => (
                                <button
                                  key={genre}
                                  type="button"
                                  onClick={() => handleGenreToggle(genre)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${formData.genre?.includes(genre) ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/40' : 'bg-gray-900 border-gray-700 text-gray-500 hover:text-gray-300'}`}
                                >
                                  {genre}
                                </button>
                              ))}
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className={`p-4 rounded-2xl border transition-all ${formData.rating === '18+' ? 'bg-red-600/10 border-red-600 text-red-500' : 'bg-black border-gray-800 text-gray-500'}`}>
                             <div className="flex items-center justify-between mb-2">
                               <ShieldAlert className="w-5 h-5" />
                               <span className="font-black text-xs">+18 للكبار</span>
                             </div>
                             <select name="rating" value={formData.rating} onChange={handleInputChange} className="w-full bg-transparent text-[10px] font-bold outline-none cursor-pointer">
                                <option value="All">مناسب للجميع</option>
                                <option value="13+">للشباب +13</option>
                                <option value="18+">للبالغين +18</option>
                             </select>
                           </div>

                           <button type="button" onClick={() => setFormData(prev => ({...prev, hasAdultContent: !prev.hasAdultContent}))} className={`p-4 rounded-2xl border text-right transition-all ${formData.hasAdultContent ? 'bg-orange-600/10 border-orange-600 text-orange-500' : 'bg-black border-gray-800 text-gray-500'}`}>
                             <div className="flex items-center justify-between mb-2">
                               <AlertCircle className="w-5 h-5" />
                               <span className="font-black text-xs">مشاهد جريئة</span>
                             </div>
                             <span className="text-[10px]">{formData.hasAdultContent ? 'تفعيل التحذير' : 'لا توجد مشاهد'}</span>
                           </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <button type="button" onClick={() => setFormData(prev => ({...prev, isFeatured: !prev.isFeatured}))} className={`p-4 rounded-2xl border text-right transition-all ${formData.isFeatured ? 'bg-red-600/10 border-red-600 text-red-500' : 'bg-black border-gray-800 text-gray-500'}`}>
                             <div className="flex items-center justify-between mb-2">
                               <PlayCircle className="w-5 h-5" />
                               <span className="font-black text-xs">الواجهة الرئيسية</span>
                             </div>
                             <span className="text-[10px]">{formData.isFeatured ? 'مفعل' : 'غير مفعل'}</span>
                           </button>
                           <button type="button" onClick={() => setFormData(prev => ({...prev, isTrending: !prev.isTrending}))} className={`p-4 rounded-2xl border text-right transition-all ${formData.isTrending ? 'bg-blue-600/10 border-blue-600 text-blue-500' : 'bg-black border-gray-800 text-gray-500'}`}>
                             <div className="flex items-center justify-between mb-2">
                               <TrendingUp className="w-5 h-5" />
                               <span className="font-black text-xs">رائج (Hot)</span>
                             </div>
                             <span className="text-[10px]">{formData.isTrending ? 'مفعل' : 'غير مفعل'}</span>
                           </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-10 border-t border-gray-800">
                      <button type="submit" className="flex-1 bg-red-600 text-white font-black py-5 rounded-2xl hover:bg-red-700 transition-all shadow-2xl shadow-red-900/40 text-xl flex items-center justify-center gap-3">
                        {isEditing ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                        {isEditing ? 'حفظ التغييرات' : 'إضافة للشبكة'}
                      </button>
                      <button type="button" onClick={resetForm} className="px-10 bg-gray-900 text-gray-400 font-black rounded-2xl hover:bg-gray-800 transition-all">
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-black text-white">إدارة المحتوى</h1>
                  <button onClick={fetchContent} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all flex items-center gap-3 text-sm font-black border border-white/5">
                    <RefreshCw className={`w-5 h-5 ${isLoadingList ? 'animate-spin' : ''}`} /> تحديث قاعدة البيانات
                  </button>
                </div>

                <div className="bg-[#111] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                  {isLoadingList ? (
                    <div className="p-32 flex flex-col items-center justify-center gap-6 text-gray-500">
                       <Loader2 className="w-16 h-16 animate-spin text-red-600" />
                       <span className="text-xl font-black">جاري سحب البيانات...</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-right border-collapse">
                        <thead className="bg-black/60 text-gray-500 text-xs uppercase tracking-widest font-black">
                          <tr>
                            <th className="p-6">العمل</th>
                            <th className="p-6">النوع</th>
                            <th className="p-6 text-center">التصنيف</th>
                            <th className="p-6">الحالة</th>
                            <th className="p-6 text-left">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/30">
                          {contentList.map(item => (
                            <tr key={item.id} className="hover:bg-white/[0.03] transition-colors group">
                              <td className="p-6 flex items-center gap-5">
                                <img src={item.thumbnailUrl} className="w-12 h-16 object-cover rounded-xl border border-white/10" />
                                <div className="flex flex-col">
                                  <span className="font-black text-white text-lg group-hover:text-red-600 transition-colors" dir="ltr">{item.title}</span>
                                  <span className="text-xs text-gray-500">{item.year} • {item.quality}</span>
                                </div>
                              </td>
                              <td className="p-6">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${item.type === 'series' ? 'bg-purple-600/10 text-purple-500' : 'bg-blue-600/10 text-blue-500'}`}>
                                  {item.type === 'series' ? 'مسلسل' : 'فيلم'}
                                </span>
                              </td>
                              <td className="p-6 text-center">
                                <div className="flex flex-wrap gap-1 justify-center max-w-[150px] mx-auto">
                                  {item.genre.slice(0, 2).map(g => (
                                    <span key={g} className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400">{g}</span>
                                  ))}
                                  {item.genre.length > 2 && <span className="text-[9px] text-gray-600">+{item.genre.length - 2}</span>}
                                </div>
                              </td>
                              <td className="p-6">
                                <div className="flex items-center gap-2">
                                  {item.rating === '18+' && <span title="18+ للكبار"><ShieldAlert className="w-4 h-4 text-red-500" /></span>}
                                  {item.hasAdultContent && <span title="مشاهد جريئة"><AlertCircle className="w-4 h-4 text-orange-500" /></span>}
                                  {item.isFeatured && <div className="w-2 h-2 rounded-full bg-red-600" title="Featured" />}
                                </div>
                              </td>
                              <td className="p-6">
                                <div className="flex items-center justify-end gap-3">
                                  <button onClick={() => handleEdit(item)} className="p-3 bg-blue-600/10 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-lg hover:shadow-blue-900/40"> <Edit2 className="w-4 h-4" /> </button>
                                  <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-lg hover:shadow-red-900/40"> <Trash2 className="w-4 h-4" /> </button>
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
