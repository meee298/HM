
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Plus, PlayCircle, Film, AlertCircle, CheckCircle, Image as ImageIcon, LogOut, Tv, Trash2, Edit2, ShieldAlert, Layers, Server, Code, Copy, X, Wand2, Minus } from 'lucide-react';
import { GENRES, getStoredMovies, saveStoredMovies } from '../constants';
import { Movie, Episode } from '../types';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [contentList, setContentList] = useState<Movie[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Episode Management State
  const [currentEpisode, setCurrentEpisode] = useState<Partial<Episode>>({ season: 1, number: 1, title: '' });
  const [episodeEmbed, setEpisodeEmbed] = useState('');
  const [episodeServer2, setEpisodeServer2] = useState('');
  const [episodeServer3, setEpisodeServer3] = useState('');
  
  // Auto Generator State
  const [tmdbId, setTmdbId] = useState('');
  const [movieTmdbId, setMovieTmdbId] = useState(''); // Specific for movies
  // Use array of objects for seasons instead of string
  const [seasonsConfig, setSeasonsConfig] = useState<{count: string}[]>([{count: ''}]);
  
  // Movie/Series Form State
  const [formData, setFormData] = useState<Partial<Movie>>({
    type: 'movie',
    rating: 'All',
    genre: [],
    embedCode: '',
    quality: 'HD',
    episodes: [],
    additionalServers: [],
    cast: []
  });

  // Local state for movie additional servers input
  const [movieServer2, setMovieServer2] = useState('');
  const [movieServer3, setMovieServer3] = useState('');

  const [previewSrc, setPreviewSrc] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Export Modal State
  const [showExport, setShowExport] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  const navigate = useNavigate();

  // Load Data on Mount
  useEffect(() => {
    const movies = getStoredMovies();
    setContentList(movies);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'embedCode') {
      const match = value.match(/src=["'](.*?)["']/);
      if (match && match[1]) {
        setPreviewSrc(match[1]);
      } else {
        setPreviewSrc('');
      }
    }
  };

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => {
      const current = prev.genre || [];
      if (current.includes(genre)) {
        return { ...prev, genre: current.filter(g => g !== genre) };
      } else {
        return { ...prev, genre: [...current, genre] };
      }
    });
  };

  const handleAddEpisode = () => {
    if (!currentEpisode.title || !episodeEmbed) {
      setMessage({ type: 'error', text: 'يرجى إكمال بيانات الحلقة (العنوان وكود التضمين الرئيسي)' });
      return;
    }
    
    // Generate a secure random ID
    const newEpisodeId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();

    const newEpisode: Episode = {
      id: newEpisodeId,
      season: currentEpisode.season || 1,
      number: currentEpisode.number || 1,
      title: currentEpisode.title || `Episode ${currentEpisode.number}`,
      embedCode: episodeEmbed,
      additionalServers: [episodeServer2, episodeServer3].filter(s => s.trim() !== '')
    };

    setFormData(prev => ({
      ...prev,
      episodes: [...(prev.episodes || []), newEpisode]
    }));

    // Auto-increment episode number
    setCurrentEpisode(prev => ({ ...prev, number: (prev.number || 1) + 1, title: '' }));
    setEpisodeEmbed('');
    setEpisodeServer2('');
    setEpisodeServer3('');
    
    setMessage({ type: 'success', text: 'تم إضافة الحلقة بنجاح' });
    setTimeout(() => setMessage(null), 2000);
  };

  // --- Auto Generator Handlers ---
  const handleAddSeasonConfig = () => {
    setSeasonsConfig(prev => [...prev, { count: '' }]);
  };

  const handleRemoveSeasonConfig = (index: number) => {
    setSeasonsConfig(prev => prev.filter((_, i) => i !== index));
  };

  const handleSeasonCountChange = (index: number, value: string) => {
    const newConfig = [...seasonsConfig];
    newConfig[index].count = value;
    setSeasonsConfig(newConfig);
  };

  const handleGenerateMovieEmbed = () => {
    if (!movieTmdbId) {
      setMessage({ type: 'error', text: 'يرجى إدخال TMDB ID' });
      return;
    }
    
    const embed = `<iframe src="https://www.vidking.net/embed/movie/${movieTmdbId}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
    
    setFormData(prev => ({
      ...prev,
      embedCode: embed
    }));
    
    setPreviewSrc(`https://www.vidking.net/embed/movie/${movieTmdbId}`);
    setMessage({ type: 'success', text: 'تم توليد كود التضمين بنجاح!' });
  };

  const handleGenerateEpisodes = () => {
    if (!tmdbId) {
      setMessage({ type: 'error', text: 'يرجى إدخال TMDB ID' });
      return;
    }
    
    // Parse counts
    const counts = seasonsConfig.map(s => parseInt(s.count)).filter(n => !isNaN(n) && n > 0);
    
    if (counts.length === 0) {
       setMessage({ type: 'error', text: 'يرجى إدخال عدد الحلقات لموسم واحد على الأقل' });
       return;
    }

    if (counts.length !== seasonsConfig.length) {
        setMessage({ type: 'error', text: 'يرجى التأكد من إدخال أرقام صحيحة لجميع المواسم' });
        return;
    }

    const newEpisodes: Episode[] = [];
    
    counts.forEach((count, index) => {
      const seasonNum = index + 1;
      for (let i = 1; i <= count; i++) {
        const uniqueId = `${tmdbId}_s${seasonNum}_e${i}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        newEpisodes.push({
          id: uniqueId,
          season: seasonNum,
          number: i,
          title: `Episode ${i}`,
          embedCode: `<iframe src="https://www.vidking.net/embed/tv/${tmdbId}/${seasonNum}/${i}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`,
          additionalServers: []
        });
      }
    });

    setFormData(prev => ({
      ...prev,
      episodes: [...(prev.episodes || []), ...newEpisodes]
    }));
    
    setMessage({ type: 'success', text: `تم توليد ${newEpisodes.length} حلقة بنجاح!` });
  };

  const handleNewSeason = () => {
    const nextSeason = (currentEpisode.season || 1) + 1;
    setCurrentEpisode({
      season: nextSeason,
      number: 1,
      title: ''
    });
    setMessage({ type: 'success', text: `تم البدء بالموسم ${nextSeason}` });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleRemoveEpisode = (id: string) => {
    setFormData(prev => ({
      ...prev,
      episodes: prev.episodes?.filter(e => e.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setMessage({ type: 'error', text: 'يرجى تعبئة الحقول الأساسية (العنوان والوصف)' });
      return;
    }

    if (formData.type === 'movie' && !formData.embedCode) {
      setMessage({ type: 'error', text: 'يرجى إضافة كود التضمين للفيلم' });
      return;
    }

    if (formData.type === 'series' && (!formData.episodes || formData.episodes.length === 0)) {
      setMessage({ type: 'error', text: 'يرجى إضافة حلقة واحدة على الأقل للمسلسل' });
      return;
    }

    // --- LOGIC: Prepare Data ---
    // 1. Gather Additional Servers from Input States
    const servers = [movieServer2, movieServer3].filter(s => s.trim() !== '');

    // 2. Construct Base Object
    const baseData = {
      ...formData,
      additionalServers: servers,
      episodes: formData.type === 'series' ? formData.episodes : undefined,
    } as Movie;

    let updatedList: Movie[];

    // --- LOGIC: Save or Update ---
    if (isEditing && formData.id) {
      // Find and Replace
      updatedList = contentList.map(item => item.id === formData.id ? baseData : item);
      setMessage({ type: 'success', text: 'تم تحديث البيانات بنجاح' });
    } else {
      // Create New
      // Generate readable ID from title if possible (to match "formula" of other movies like 'topgun_maverick')
      const slugId = formData.title 
        ? formData.title.toLowerCase().trim().replace(/[\s\W-]+/g, '_')
        : (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString());
      
      const newItemId = slugId || Date.now().toString();

      const newMovie: Movie = {
        ...baseData,
        id: newItemId,
        views: 0,
        addedAt: new Date().toISOString(),
        isFeatured: false,
        cast: formData.cast || []
      };
      updatedList = [newMovie, ...contentList];
      setMessage({ type: 'success', text: 'تمت إضافة المحتوى بنجاح' });
    }

    // --- LOGIC: Persist to Storage FIRST ---
    saveStoredMovies(updatedList);
    
    // --- LOGIC: Update State SECOND ---
    setContentList(updatedList);

    // Reset UI
    setTimeout(() => {
      setMessage(null);
      if (isEditing) switchToAdd();
    }, 1500);
    
    if (!isEditing) {
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({ 
      type: 'movie', 
      rating: 'All', 
      genre: [], 
      embedCode: '', 
      quality: 'HD', 
      episodes: [],
      additionalServers: [],
      cast: []
    });
    setMovieServer2('');
    setMovieServer3('');
    setPreviewSrc('');
    setCurrentEpisode({ season: 1, number: 1, title: '' });
    setEpisodeEmbed('');
    setEpisodeServer2('');
    setEpisodeServer3('');
    setTmdbId('');
    setMovieTmdbId('');
    setSeasonsConfig([{count: ''}]);
    setIsEditing(false);
  };

  const switchToAdd = () => {
    resetForm();
    setActiveTab('add');
  };

  const handleEdit = (movie: Movie) => {
    setFormData(movie);
    
    setMovieServer2(movie.additionalServers?.[0] || '');
    setMovieServer3(movie.additionalServers?.[1] || '');
    
    if (movie.embedCode) {
      const match = movie.embedCode.match(/src=["'](.*?)["']/);
      setPreviewSrc(match?.[1] || '');
    } else {
      setPreviewSrc('');
    }

    setIsEditing(true);
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المحتوى؟ لا يمكن التراجع عن هذا الإجراء.')) {
      const updatedList = contentList.filter(m => m.id !== id);
      saveStoredMovies(updatedList);
      setContentList(updatedList);
      setMessage({ type: 'success', text: 'تم الحذف بنجاح' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    navigate('/login');
  };

  // --- EXPORT LOGIC ---
  const getExportData = () => {
    const json = JSON.stringify(contentList, null, 2);
    
    return `import { Movie, Episode } from './types';

export const GENRES = [
  'أكشن',
  'دراما',
  'كوميديا',
  'رعب',
  'خيال علمي',
  'رومانسي',
  'وثائقي',
  'عائلي',
  'غموض',
  'أنيمي',
  'جريمة',
  'تاريخي',
  'حرب',
  'كوري',
  'تركي',
  'فانتازيا',
  'مغامرة',
  'مدرسي',
  'شبابي'
];

const STORAGE_KEY = 'cinema_stream_content_v17';
const WATCHLIST_KEY = 'cinema_watchlist';

// Helper to generate VidKing Movie Iframe
const movieFrame = (tmdbId: number) => 
  \`<iframe src="https://www.vidking.net/embed/movie/\${tmdbId}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>\`;

// Helper to generate VidKing TV Episode Iframe
const tvFrame = (tmdbId: number, s: number, e: number) => 
  \`<iframe src="https://www.vidking.net/embed/tv/\${tmdbId}/\${s}/\${e}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>\`;

export const MOCK_MOVIES: Movie[] = ${json};

export const getStoredMovies = (): Movie[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load movies', e);
  }
  saveStoredMovies(MOCK_MOVIES);
  return MOCK_MOVIES;
};

export const saveStoredMovies = (movies: Movie[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  } catch (e) {
    console.error('Failed to save movies', e);
  }
};

export const getWatchlist = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
  } catch {
    return [];
  }
};

export const toggleWatchlist = (id: string): boolean => {
  try {
    const list = getWatchlist();
    let newList;
    let added = false;
    
    if (list.includes(id)) {
      newList = list.filter(item => item !== id);
    } else {
      newList = [...list, id];
      added = true;
    }
    
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newList));
    return added;
  } catch {
    return false;
  }
};
`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getExportData());
    setExportCopied(true);
    setTimeout(() => setExportCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      <Navbar />
      <div className="pt-24 px-4 max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6 px-2 flex items-center gap-2">
                <LayoutDashboard className="text-red-600" />
                لوحة الإدارة
              </h2>
              <nav className="space-y-2">
                <button 
                  onClick={switchToAdd}
                  className={`w-full text-right px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'add' ? 'bg-red-600/10 text-red-500 border-r-2 border-red-600' : 'text-gray-400 hover:bg-white/5'}`}
                >
                  <Plus className="w-5 h-5" />
                  {isEditing ? 'تعديل محتوى' : 'إضافة جديد'}
                </button>
                <button 
                  onClick={() => setActiveTab('list')}
                  className={`w-full text-right px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'list' ? 'bg-red-600/10 text-red-500 border-r-2 border-red-600' : 'text-gray-400 hover:bg-white/5'}`}
                >
                  <Layers className="w-5 h-5" />
                  إدارة المحتوى
                </button>
                <button 
                  onClick={() => setShowExport(true)}
                  className={`w-full text-right px-4 py-3 rounded-lg flex items-center gap-3 transition-colors text-purple-400 hover:bg-purple-900/10 hover:text-purple-300`}
                >
                  <Code className="w-5 h-5" />
                  تصدير الكود (Save)
                </button>
              </nav>

              <div className="mt-8 border-t border-gray-800 pt-4">
                <button 
                  onClick={handleLogout}
                  className="w-full text-right px-4 py-3 rounded-lg flex items-center gap-3 text-red-400 hover:bg-red-900/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'add' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Form Section */}
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
                     <h3 className="text-lg font-bold text-white">
                       {isEditing ? `تعديل: ${formData.title}` : 'إضافة محتوى جديد'}
                     </h3>
                     {isEditing && (
                       <button onClick={resetForm} className="text-xs text-red-500 hover:underline">إلغاء التعديل</button>
                     )}
                  </div>
                  
                  {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-900/50' : 'bg-red-900/20 text-red-400 border border-red-900/50'}`}>
                      {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      {message.text}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ... (Existing Form Content same as before) ... */}
                    {/* Content Type Selector */}
                    <div className="flex p-1 bg-black rounded-lg border border-gray-700">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: 'movie' }))}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${formData.type === 'movie' ? 'bg-red-600 text-white font-bold' : 'text-gray-400 hover:text-white'}`}
                      >
                        <Film className="w-4 h-4" /> فيلم
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: 'series' }))}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${formData.type === 'series' ? 'bg-red-600 text-white font-bold' : 'text-gray-400 hover:text-white'}`}
                      >
                        <Tv className="w-4 h-4" /> مسلسل
                      </button>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">عنوان المحتوى (English) *</label>
                      <input 
                        name="title"
                        value={formData.title || ''}
                        onChange={handleInputChange}
                        dir="ltr"
                        type="text" 
                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
                        placeholder="e.g. Breaking Bad"
                      />
                    </div>

                    {/* Movie Servers */}
                    {formData.type === 'movie' && (
                      <div className="space-y-4 bg-black/30 p-4 rounded-lg border border-gray-700 animate-fadeIn">
                         <div className="flex items-center gap-2 text-white font-bold mb-2">
                           <Server className="w-4 h-4 text-red-500" />
                           إدارة السيرفرات
                         </div>

                         {/* TMDB AUTO GENERATOR FOR MOVIES */}
                         <div className="bg-gradient-to-r from-blue-900/20 to-black border border-blue-500/30 rounded p-3 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                               <Wand2 className="w-3 h-3 text-blue-400" />
                               <span className="text-xs text-blue-400 font-bold">توليد تلقائي (TMDB)</span>
                            </div>
                            <div className="flex gap-2">
                               <input 
                                 type="text" 
                                 placeholder="TMDB ID"
                                 value={movieTmdbId}
                                 onChange={(e) => setMovieTmdbId(e.target.value)}
                                 className="flex-1 bg-black border border-gray-700 rounded px-2 py-1.5 text-white text-xs focus:border-blue-500 focus:outline-none"
                               />
                               <button 
                                 type="button"
                                 onClick={handleGenerateMovieEmbed}
                                 className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors"
                               >
                                 توليد
                               </button>
                            </div>
                         </div>
                         
                         <div>
                            <label className="block text-gray-400 text-xs mb-1">السيرفر الأساسي (كود التضمين) *</label>
                            <textarea 
                              name="embedCode"
                              value={formData.embedCode || ''}
                              onChange={handleInputChange}
                              dir="ltr"
                              rows={3}
                              className="w-full bg-black border border-gray-700 rounded p-2 text-white font-mono text-sm focus:border-red-600 focus:outline-none"
                              placeholder='<iframe src="..."></iframe>'
                            />
                         </div>

                         <div>
                            <label className="block text-gray-400 text-xs mb-1">سيرفر 2 (اختياري)</label>
                            <input 
                              type="text"
                              value={movieServer2}
                              onChange={(e) => setMovieServer2(e.target.value)}
                              dir="ltr"
                              className="w-full bg-black border border-gray-700 rounded p-2 text-white text-sm focus:border-red-600 focus:outline-none"
                              placeholder='رابط أو كود التضمين...'
                            />
                         </div>

                         <div>
                            <label className="block text-gray-400 text-xs mb-1">سيرفر 3 (اختياري)</label>
                            <input 
                              type="text"
                              value={movieServer3}
                              onChange={(e) => setMovieServer3(e.target.value)}
                              dir="ltr"
                              className="w-full bg-black border border-gray-700 rounded p-2 text-white text-sm focus:border-red-600 focus:outline-none"
                              placeholder='رابط أو كود التضمين...'
                            />
                         </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">الوصف (بالعربية) *</label>
                      <textarea 
                        name="description"
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
                        placeholder="قصة الفيلم أو المسلسل..."
                      />
                    </div>

                    {/* Series Episode Manager */}
                    {formData.type === 'series' && (
                      <div className="space-y-6">
                        
                        {/* 1. AUTO GENERATOR SECTION */}
                        <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-lg p-4 animate-fadeIn">
                           <div className="flex items-center gap-2 text-purple-400 font-bold mb-4 border-b border-purple-500/20 pb-2">
                             <Wand2 className="w-4 h-4" />
                             توليد تلقائي (TMDB)
                           </div>
                           
                           <div className="space-y-4">
                               {/* TMDB ID */}
                               <div>
                                  <label className="text-[10px] text-gray-400 block mb-1">معرف TMDB (ID)</label>
                                  <input 
                                    type="text" 
                                    placeholder="مثال: 60059"
                                    value={tmdbId}
                                    onChange={(e) => setTmdbId(e.target.value)}
                                    className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                                  />
                               </div>

                               {/* Seasons Config */}
                               <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                  {seasonsConfig.map((season, index) => (
                                    <div key={index} className="flex items-center gap-2 animate-fadeIn">
                                       <span className="text-xs text-purple-300 font-bold w-16 whitespace-nowrap">موسم {index + 1}</span>
                                       <input 
                                          type="number" 
                                          placeholder="عدد الحلقات"
                                          value={season.count}
                                          onChange={(e) => handleSeasonCountChange(index, e.target.value)}
                                          className="flex-1 bg-black/50 border border-gray-700 rounded px-3 py-1.5 text-white text-xs focus:border-purple-500 focus:outline-none"
                                       />
                                       {seasonsConfig.length > 1 && (
                                         <button 
                                           type="button"
                                           onClick={() => handleRemoveSeasonConfig(index)}
                                           className="p-1.5 text-red-500 hover:bg-red-900/20 rounded transition-colors"
                                           title="حذف الموسم"
                                         >
                                           <X className="w-4 h-4" />
                                         </button>
                                       )}
                                    </div>
                                  ))}
                               </div>

                               {/* Actions */}
                               <div className="flex gap-2 pt-2">
                                  <button 
                                     type="button"
                                     onClick={handleAddSeasonConfig}
                                     className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-white/5"
                                   >
                                     <Plus className="w-3 h-3" /> إضافة موسم
                                   </button>
                                   <button 
                                     type="button"
                                     onClick={handleGenerateEpisodes}
                                     className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-xs font-bold transition-colors shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
                                   >
                                     <Wand2 className="w-3 h-3" /> توليد الحلقات
                                   </button>
                               </div>
                           </div>
                        </div>

                        {/* 2. MANUAL MANAGER */}
                        <div className="bg-black/30 rounded-lg p-4 border border-gray-700 animate-fadeIn">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-white font-bold flex items-center gap-2">
                              <Layers className="w-4 h-4 text-red-500" />
                              إدارة الحلقات يدوياً
                            </h4>
                            <button 
                              type="button"
                              onClick={handleNewSeason}
                              className="text-xs bg-red-600/20 text-red-500 px-3 py-1 rounded hover:bg-red-600 hover:text-white transition-colors"
                            >
                              + موسم جديد
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                              <label className="text-[10px] text-gray-500 block mb-1">الموسم</label>
                              <input 
                                type="number" 
                                value={currentEpisode.season}
                                onChange={(e) => setCurrentEpisode(prev => ({ ...prev, season: parseInt(e.target.value) || 1 }))}
                                className="w-full bg-[#0f0f0f] border border-gray-700 rounded px-3 py-2 text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-500 block mb-1">رقم الحلقة</label>
                              <input 
                                type="number" 
                                value={currentEpisode.number}
                                onChange={(e) => setCurrentEpisode(prev => ({ ...prev, number: parseInt(e.target.value) || 1 }))}
                                className="w-full bg-[#0f0f0f] border border-gray-700 rounded px-3 py-2 text-white text-sm"
                              />
                            </div>
                          </div>

                          <div className="mb-2">
                            <label className="text-[10px] text-gray-500 block mb-1">عنوان الحلقة</label>
                            <input 
                              type="text" 
                              placeholder="مثال: البداية"
                              value={currentEpisode.title}
                              onChange={(e) => setCurrentEpisode(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full bg-[#0f0f0f] border border-gray-700 rounded px-3 py-2 text-white text-sm"
                            />
                          </div>

                          <div className="space-y-2 mb-4">
                            <div>
                                <label className="text-[10px] text-gray-500 block mb-1">السيرفر الأساسي (كود التضمين)</label>
                                <input 
                                  value={episodeEmbed}
                                  onChange={(e) => setEpisodeEmbed(e.target.value)}
                                  dir="ltr"
                                  className="w-full bg-[#0f0f0f] border border-gray-700 rounded px-3 py-2 text-white text-sm font-mono"
                                  placeholder='<iframe src="..."></iframe>'
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input 
                                  value={episodeServer2}
                                  onChange={(e) => setEpisodeServer2(e.target.value)}
                                  dir="ltr"
                                  className="w-full bg-[#0f0f0f] border border-gray-700 rounded px-3 py-2 text-white text-xs"
                                  placeholder="سيرفر 2 (اختياري)"
                                />
                                <input 
                                  value={episodeServer3}
                                  onChange={(e) => setEpisodeServer3(e.target.value)}
                                  dir="ltr"
                                  className="w-full bg-[#0f0f0f] border border-gray-700 rounded px-3 py-2 text-white text-xs"
                                  placeholder="سيرفر 3 (اختياري)"
                                />
                            </div>
                          </div>
                          
                          <button 
                            type="button"
                            onClick={handleAddEpisode}
                            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded text-sm transition-colors mb-4 border border-white/5"
                          >
                            + إضافة الحلقة
                          </button>

                          <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar bg-black/20 p-2 rounded">
                            {formData.episodes?.sort((a,b) => (a.season - b.season) || (a.number - b.number)).map((ep) => (
                              <div key={ep.id} className="flex items-center justify-between bg-[#1a1a1a] p-2 rounded border border-gray-800">
                                <span className="text-xs text-gray-300">S{ep.season}:E{ep.number} - {ep.title}</span>
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveEpisode(ep.id)}
                                  className="text-red-500 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            {(!formData.episodes || formData.episodes.length === 0) && (
                              <p className="text-xs text-gray-500 text-center py-2">لا توجد حلقات مضافة</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">سنة الإصدار</label>
                        <input 
                          type="number" 
                          name="year"
                          value={formData.year || ''}
                          onChange={handleInputChange}
                          className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">المدة الزمنية</label>
                        <input 
                          type="text" 
                          name="duration"
                          placeholder={formData.type === 'movie' ? '120 دقيقة' : '3 مواسم'}
                          value={formData.duration || ''}
                          onChange={handleInputChange}
                          className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div>
                        <label className="block text-gray-400 text-sm mb-2">رابط البوستر (Vertical)</label>
                        <input 
                          type="url" 
                          name="thumbnailUrl"
                          value={formData.thumbnailUrl || ''}
                          onChange={handleInputChange}
                          dir="ltr"
                          className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">رابط الخلفية (Landscape)</label>
                        <input 
                          type="url" 
                          name="backdropUrl"
                          value={formData.backdropUrl || ''}
                          onChange={handleInputChange}
                          dir="ltr"
                          className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">الجودة</label>
                      <div className="flex gap-4">
                        {['CAM', 'HD', 'FHD', '4K'].map(q => (
                           <label key={q} className={`cursor-pointer border rounded px-4 py-2 text-center transition-all ${formData.quality === q ? 'bg-white text-black font-bold' : 'border-gray-700 text-gray-400'}`}>
                            <input 
                              type="radio" 
                              name="quality" 
                              value={q} 
                              checked={formData.quality === q}
                              onChange={handleInputChange}
                              className="hidden"
                            />
                            {q}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">التصنيف العمري</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['All', '13+', '18+'].map(rating => (
                          <label key={rating} className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${formData.rating === rating ? 'bg-red-600/20 border-red-600 text-red-500 font-bold' : 'border-gray-700 text-gray-400 hover:bg-white/5'}`}>
                            <input 
                              type="radio" 
                              name="rating" 
                              value={rating} 
                              checked={formData.rating === rating}
                              onChange={handleInputChange}
                              className="hidden"
                            />
                            {rating === 'All' ? 'للجميع' : rating === '13+' ? '+١٣' : '+١٨'}
                          </label>
                        ))}
                      </div>
                      
                      {/* 18+ Warning */}
                      {formData.rating === '18+' && (
                        <div className="mt-3 bg-red-900/10 border border-red-800 rounded-lg p-4 flex items-start gap-3 animate-fadeIn">
                           <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0" />
                           <div>
                             <h4 className="text-red-500 font-bold text-sm mb-1">تنبيه المحتوى الحساس</h4>
                             <p className="text-gray-400 text-xs">
                               لقد قمت بتصنيف هذا المحتوى للكبار فقط. سيتم تفعيل نظام التحقق من العمر الإلزامي للمستخدمين قبل المشاهدة. يرجى التأكد من دقة هذا التصنيف.
                             </p>
                           </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">الأصناف</label>
                      <div className="flex flex-wrap gap-2">
                        {GENRES.map(genre => (
                          <button
                            key={genre}
                            type="button"
                            onClick={() => handleGenreToggle(genre)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.genre?.includes(genre) ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-800">
                      <button 
                        type="submit"
                        className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
                      >
                        {isEditing ? 'حفظ التغييرات' : 'نشر المحتوى'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Preview Section */}
                <div className="space-y-6">
                  <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 sticky top-24">
                    <h3 className="text-lg font-bold text-white mb-4">معاينة المحتوى</h3>
                    
                    {/* Backdrop Preview */}
                    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden border border-gray-700 relative mb-4">
                      {previewSrc ? (
                        <iframe 
                          src={previewSrc} 
                          className="w-full h-full"
                          sandbox="allow-scripts allow-same-origin"
                          title="preview"
                        />
                      ) : (
                         formData.backdropUrl ? 
                         <img src={formData.backdropUrl} className="w-full h-full object-cover" alt="backdrop" /> :
                         <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                           <PlayCircle className="w-12 h-12 mb-2 opacity-50" />
                           <p>معاينة الفيديو أو الخلفية</p>
                         </div>
                      )}
                    </div>

                    <div className="flex gap-4">
                       <div className="w-24 flex-shrink-0 aspect-[2/3] bg-gray-800 rounded overflow-hidden">
                         {formData.thumbnailUrl ? (
                           <img src={formData.thumbnailUrl} className="w-full h-full object-cover" alt="thumbnail" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon /></div>
                         )}
                       </div>
                       <div className="flex-1 space-y-2">
                          <h1 className="text-xl font-bold text-white font-sans text-left" dir="ltr">{formData.title || 'Title'}</h1>
                          <div className="flex items-center gap-2 text-xs">
                             <span className="bg-white text-black font-bold px-1 rounded">{formData.quality}</span>
                             <span className="text-gray-400">{formData.year}</span>
                             <span className="text-gray-400">{formData.duration}</span>
                             {formData.type === 'series' && <span className="bg-red-600 px-1 rounded">TV</span>}
                          </div>
                          <p className="text-gray-400 text-xs line-clamp-3">
                            {formData.description || 'الوصف...'}
                          </p>
                       </div>
                    </div>
                    
                    {formData.type === 'series' && formData.episodes && formData.episodes.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-800">
                         <h5 className="text-xs font-bold text-gray-400 mb-2">الحلقات ({formData.episodes.length})</h5>
                         <div className="space-y-1">
                           {formData.episodes.slice(0, 3).map(ep => (
                             <div key={ep.id} className="text-xs text-gray-500 bg-black/20 p-2 rounded">
                               S{ep.season}:E{ep.number} - {ep.title}
                             </div>
                           ))}
                           {formData.episodes.length > 3 && (
                             <div className="text-xs text-center text-gray-600">+{formData.episodes.length - 3} حلقات إضافية</div>
                           )}
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'list' && (
              <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800">
                {message && (
                    <div className={`m-4 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-900/50' : 'bg-red-900/20 text-red-400 border border-red-900/50'}`}>
                      {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      {message.text}
                    </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-right min-w-[800px]">
                    <thead className="bg-black/50 text-gray-400 text-sm">
                      <tr>
                        <th className="p-4">العنوان</th>
                        <th className="p-4">النوع</th>
                        <th className="p-4">السنة</th>
                        <th className="p-4">الجودة</th>
                        <th className="p-4">المشاهدات</th>
                        <th className="p-4">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {contentList.map(item => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img src={item.thumbnailUrl} className="w-8 h-12 object-cover rounded" alt="thumb" />
                            <div>
                              <span className="font-bold text-white font-sans block" dir="ltr">{item.title}</span>
                              <span className="text-xs text-gray-500">{item.rating}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            {item.type === 'series' ? 
                              <span className="inline-flex items-center gap-1 bg-purple-900/30 text-purple-400 px-2 py-1 rounded text-xs"><Tv className="w-3 h-3"/> مسلسل</span> : 
                              <span className="inline-flex items-center gap-1 bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs"><Film className="w-3 h-3"/> فيلم</span>
                            }
                          </td>
                          <td className="p-4 text-gray-400">{item.year}</td>
                          <td className="p-4"><span className="bg-gray-800 px-2 py-1 rounded text-xs">{item.quality}</span></td>
                          <td className="p-4 text-gray-400">{item.views.toLocaleString()}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleEdit(item)}
                                className="p-2 bg-blue-600/10 text-blue-500 rounded hover:bg-blue-600 hover:text-white transition-colors"
                                title="تعديل"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2 bg-red-600/10 text-red-500 rounded hover:bg-red-600 hover:text-white transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] w-full max-w-4xl h-[80vh] rounded-2xl border border-gray-800 flex flex-col shadow-2xl relative">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Code className="w-6 h-6 text-purple-500" />
                تصدير البيانات إلى constants.ts
              </h3>
              <button onClick={() => setShowExport(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-hidden relative">
              <textarea 
                readOnly
                className="w-full h-full bg-[#0a0a0a] text-gray-300 font-mono text-xs md:text-sm p-4 rounded-lg focus:outline-none resize-none custom-scrollbar"
                dir="ltr"
                value={getExportData()}
              />
              <div className="absolute bottom-8 right-8">
                <button 
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-xl transition-all transform hover:scale-105 ${exportCopied ? 'bg-green-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                >
                  {exportCopied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {exportCopied ? 'تم النسخ!' : 'نسخ الكود'}
                </button>
              </div>
            </div>

            <div className="p-4 bg-purple-900/10 border-t border-purple-900/30 text-xs text-purple-300 text-center">
              تعليمات هامة: هذا الكود يحتوي على الملف كاملاً. قم بحذف كل شيء داخل ملف <code className="bg-black px-1 py-0.5 rounded text-white">constants.ts</code> واستبدله بهذا الكود الجديد لمنع تعطل التطبيق.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPage;
