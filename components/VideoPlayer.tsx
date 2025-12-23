
import React, { useState, useEffect } from 'react';
import { Movie, Episode } from '../types';
import AgeVerificationModal from './AgeVerificationModal';
import { AlertTriangle, WifiOff, Server, ShieldCheck, Cast, Play, Languages, Info } from 'lucide-react';

interface Props {
  movie: Movie;
}

const VideoPlayer: React.FC<Props> = ({ movie }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Player State
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);

  // Initialize for Series or Movie
  useEffect(() => {
    if (movie.type === 'series' && movie.episodes && movie.episodes.length > 0) {
      // Sort episodes to find the first one
      const sorted = [...movie.episodes].sort((a,b) => (a.season - b.season) || (a.number - b.number));
      setCurrentEpisode(sorted[0]);
      setSelectedSeason(sorted[0].season);
    }
  }, [movie]);

  const needsVerification = movie.rating === '18+';

  // Build Server List dynamically
  const getServers = () => {
    const baseServers: { name: string; src: string }[] = [];
    
    // Determine source based on type
    if (movie.type === 'movie') {
      if (movie.embedCode) baseServers.push({ name: 'VIP سيرفر', src: movie.embedCode });
      if (movie.additionalServers) {
        movie.additionalServers.forEach((s, i) => baseServers.push({ name: `سيرفر ${i+1}`, src: s }));
      }
    } else if (currentEpisode) {
      if (currentEpisode.embedCode) baseServers.push({ name: 'VIP سيرفر', src: currentEpisode.embedCode });
      if (currentEpisode.additionalServers) {
        currentEpisode.additionalServers.forEach((s, i) => baseServers.push({ name: `سيرفر ${i+1}`, src: s }));
      }
    }

    // Fallback if no servers found
    if (baseServers.length === 0) {
      return [{ name: 'VidCloud', src: '' }, { name: 'UpStream', src: '' }];
    }
    
    return baseServers;
  };

  const servers = getServers();

  useEffect(() => {
    const sessionVerified = sessionStorage.getItem('age_verified');
    if (sessionVerified === 'true') {
      setIsVerified(true);
    }
  }, []);

  const handleVerify = () => {
    setIsVerified(true);
    sessionStorage.setItem('age_verified', 'true');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // Re-trigger load state when server or episode changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activeServerIndex, currentEpisode]);

  if (needsVerification && !isVerified) {
    return (
      <div className="w-full aspect-video bg-[#0f0f0f] relative group">
        <img 
          src={movie.backdropUrl || movie.thumbnailUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover opacity-20 blur-sm"
        />
        <AgeVerificationModal 
          onVerify={handleVerify} 
          onCancel={() => window.history.back()} 
        />
      </div>
    );
  }

  // Extract SRC from embed code or use direct link
  const rawSrc = servers[activeServerIndex]?.src || '';
  const finalSrc = rawSrc.startsWith('http') ? rawSrc : rawSrc.match(/src=["'](.*?)["']/)?.[1] || '';

  // Group episodes by season
  const seasons = movie.episodes ? Array.from(new Set(movie.episodes.map(e => e.season))).sort((a: number, b: number) => a - b) : [];
  const episodesInSeason = movie.episodes?.filter(e => e.season === selectedSeason).sort((a: Episode, b: Episode) => a.number - b.number) || [];

  return (
    <div className="flex flex-col gap-0">
      
      {/* Player Frame */}
      <div className="relative w-full aspect-video bg-black shadow-inner overflow-hidden">
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-4 bg-[#0a0a0a]">
            <WifiOff className="w-12 h-12 text-red-500" />
            <div className="text-center">
              <p className="text-lg font-bold text-white mb-2">عذراً، تعذر الاتصال بالسيرفر</p>
              <p className="text-sm">يرجى تجربة سيرفر آخر</p>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] z-20">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">جاري الاتصال بالسيرفر...</span>
              </div>
            )}
            
            {finalSrc ? (
              <iframe
                key={`${activeServerIndex}-${currentEpisode?.id}`} 
                src={finalSrc}
                title={movie.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-300 p-6 text-center">
                <AlertTriangle className="w-10 h-10 mb-4 text-yellow-500" />
                <p>لا يوجد مصدر متاح حالياً.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Server & Season Controls Container */}
      <div className="bg-[#111] p-6 md:p-8 border-t border-white/5 space-y-6">
        
        {/* Subtitle Info Banner */}
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-4 animate-fadeIn">
          <div className="bg-blue-600/20 p-2 rounded-xl">
            <Info className="w-5 h-5 text-blue-400" />
          </div>
          <div>
             <h4 className="text-sm font-black text-white mb-1">تلميح بخصوص الترجمة</h4>
             <p className="text-xs text-blue-100/70 leading-relaxed">
               إذا لم تظهر الترجمة العربية تلقائياً في السيرفر الحالي، يرجى تجربة السيرفرات الأخرى المتاحة في القائمة أدناه، فغالباً ما تتوفر الترجمة في السيرفرات البديلة.
             </p>
          </div>
        </div>

        {/* Server Tabs */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-3 text-gray-300 font-black text-sm shrink-0">
             <div className="p-2 bg-red-600/10 rounded-xl border border-red-600/20">
                <Server className="w-5 h-5 text-red-600" />
             </div>
             <span>سيرفرات البث المتاحة:</span>
           </div>
           
           <div className="flex flex-wrap gap-3 justify-center lg:justify-end w-full">
              {servers.map((server, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveServerIndex(idx)}
                  className={`min-w-[120px] px-6 py-3.5 rounded-2xl text-sm font-black transition-all border flex items-center justify-center gap-2 group active:scale-95 ${
                    activeServerIndex === idx 
                      ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/30' 
                      : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <Play className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeServerIndex === idx ? 'fill-current' : 'opacity-40'}`} />
                  {server.name}
                </button>
              ))}
           </div>
        </div>

        {/* Series Controls */}
        {movie.type === 'series' && movie.episodes && (
          <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
            
            {/* Season Selector */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
              <div className="bg-white/5 p-2 px-4 rounded-xl text-xs font-black text-gray-500 uppercase tracking-widest border border-white/5">المواسم</div>
              {seasons.map(season => (
                <button
                  key={season}
                  onClick={() => setSelectedSeason(season)}
                  className={`px-6 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all border ${
                    selectedSeason === season 
                    ? 'bg-white text-black shadow-xl shadow-white/10' 
                    : 'bg-black/40 border-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                  }`}
                >
                  الموسم {season}
                </button>
              ))}
            </div>

            {/* Episode List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
               {episodesInSeason.map(episode => (
                 <button
                   key={episode.id}
                   onClick={() => {
                     setCurrentEpisode(episode);
                     setActiveServerIndex(0);
                   }}
                   className={`group flex flex-col p-4 rounded-2xl text-right transition-all border h-full justify-between gap-1 active:scale-95 ${
                     currentEpisode?.id === episode.id 
                     ? 'bg-red-600/10 border-red-600/50 text-red-500 shadow-lg shadow-red-600/5' 
                     : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/20 hover:text-white hover:bg-white/5'
                   }`}
                 >
                   <span className="font-black text-sm leading-tight">حلقة {episode.number}</span>
                   <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="text-[10px] font-bold opacity-60 truncate">{episode.title || `الحلقة ${episode.number}`}</span>
                      {currentEpisode?.id === episode.id && <Play className="w-3 h-3 fill-current shrink-0" />}
                   </div>
                 </button>
               ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default VideoPlayer;
