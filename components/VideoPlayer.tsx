
import React, { useState, useEffect } from 'react';
import { Movie, Episode } from '../types';
import AgeVerificationModal from './AgeVerificationModal';
import { AlertTriangle, WifiOff, Server, ShieldCheck, Cast, Play } from 'lucide-react';

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
      <div className="relative w-full aspect-video bg-black shadow-inner">
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
      <div className="bg-[#181818] p-4 md:p-6 border-b border-white/5">
        
        {/* Server Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
           <div className="flex items-center gap-2 text-gray-300 font-bold text-sm">
             <Server className="w-4 h-4 text-red-500" />
             <span>سيرفرات المشاهدة:</span>
           </div>
           <div className="flex flex-wrap gap-2 justify-center sm:justify-end w-full sm:w-auto">
              {servers.map((server, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveServerIndex(idx)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    activeServerIndex === idx 
                      ? 'bg-red-600 border-red-600 text-white' 
                      : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                  }`}
                >
                  {server.name}
                </button>
              ))}
           </div>
        </div>

        {/* Series Controls */}
        {movie.type === 'series' && movie.episodes && (
          <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
            
            {/* Season Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {seasons.map(season => (
                <button
                  key={season}
                  onClick={() => setSelectedSeason(season)}
                  className={`px-5 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                    selectedSeason === season 
                    ? 'bg-white text-black' 
                    : 'bg-black/40 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  الموسم {season}
                </button>
              ))}
            </div>

            {/* Episode List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
               {episodesInSeason.map(episode => (
                 <button
                   key={episode.id}
                   onClick={() => {
                     setCurrentEpisode(episode);
                     setActiveServerIndex(0);
                   }}
                   className={`group flex items-center justify-between p-2 px-3 rounded text-right transition-all border ${
                     currentEpisode?.id === episode.id 
                     ? 'bg-red-600/10 border-red-600/50 text-red-500' 
                     : 'bg-[#0f0f0f] border-transparent text-gray-400 hover:bg-white/5'
                   }`}
                 >
                   <div className="flex flex-col">
                      <span className="font-bold text-xs group-hover:text-white transition-colors">حلقة {episode.number}</span>
                      <span className="text-[10px] opacity-60 truncate max-w-[80px]">{episode.title || `Episode ${episode.number}`}</span>
                   </div>
                   {currentEpisode?.id === episode.id && <Play className="w-3 h-3 fill-current" />}
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
