// src/pages/browse/Home.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchTmdb,
  getTmdbImage,
  formatReleaseDate,
  getContentRating,
  isInWatchlist,
  toggleWatchlist,
  getContinueWatchingCards,
} from '../../utils.jsx';
import { Play, ThumbsUp, Plus, Info, Search, ChevronRight, X as XIcon } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import QuickSearch from '../../components/QuickSearch.jsx';
import { SpotlightSkeleton } from '../../components/Skeletons.jsx';
import EnhancedCategorySection from '../../components/enhanced-carousel.jsx';
import config from '../../config.json';
import { useHomeStore } from '../../store/homeStore.js';

export default function AppPromoPopup() {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [dontShow, setDontShow] = useState(false)

const { tmdbBaseUrl } = config;
const STALE_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CW_VISIBLE = 8;

const categories = [
  {
    title: 'Trending Movies',
    url: `${tmdbBaseUrl}/trending/movie/week?language=en-US&append_to_response=images,content_ratings&include_image_language=en`,
    detailUrl: tmdbBaseUrl,
    updateHero: true,
  },
  {
    title: 'Trending TV Shows',
    url: `${tmdbBaseUrl}/trending/tv/week?language=en-US&append_to_response=images,content_ratings&include_image_language=en`,
    detailUrl: tmdbBaseUrl,
  },
  {
    title: 'Top Rated Movies',
    url: `${tmdbBaseUrl}/movie/top_rated?language=en-US&page=1&append_to_response=images,content_ratings&include_image_language=en`,
    detailUrl: tmdbBaseUrl,
  },
  {
    title: 'Top Rated TV Shows',
    url: `${tmdbBaseUrl}/tv/top_rated?language=en-US&page=1&append_to_response=images,content_ratings&include_image_language=en`,
    detailUrl: tmdbBaseUrl,
  },
  {
    title: 'Popular Movies',
    url: `${tmdbBaseUrl}/movie/popular?language=en-US&page=1&append_to_response=images,content_ratings&include_image_language=en`,
    detailUrl: tmdbBaseUrl,
  },
  {
    title: 'Popular TV Shows',
    url: `${tmdbBaseUrl}/tv/popular?language=en-US&page=1&append_to_response=images,content_ratings&include_image_language=en`,
    detailUrl: tmdbBaseUrl,
  },
];

const SpotlightSection = ({ item, isLoading, onQuickSearchOpen }) => {
  const [inWatchlist, setInWatchlist] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    (async () => {
      if (item && item.id) {
        try {
          const present = await isInWatchlist(item.id);
          if (active) setInWatchlist(present);
        } catch {
          if (active) setInWatchlist(false);
        }
      }
    })();
    return () => { active = false; };
  }, [item]);

  if (isLoading || !item) return <SpotlightSkeleton />;

  const backgroundImage = getTmdbImage(item.backdrop_path) || getTmdbImage(item.poster_path);
  const logoImage = item.images?.logos?.find((logo) => logo.iso_639_1 === 'en')?.file_path;
  const mediaType = item.title ? 'movie' : 'tv';

  const handleWatchlistToggle = async (e) => {
    e.stopPropagation();
    const added = await toggleWatchlist(item);
    setInWatchlist(added);
  };

  const handleWatchClick = () => navigate(`/${mediaType}/${item.id}?watch=1`);
  const handleInfoClick = () => navigate(`/${mediaType}/${item.id}`);
  const handleLikeClick = () => toast(`Liked ${item.title || item.name}`);

  return (
    <div
      id="spotlight"
      className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] bg-cover bg-center bg-no-repeat flex items-end animate-slide-up"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#090a0a]/70 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090a0a]/80 via-black/40 md:via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#090a0a]/80 md:from-[#090a0a]/60 via-[#090a0a]/10 to-transparent" />

      <div className="hidden md:block absolute top-18 left-1/2 -translate-x-1/2 z-20 animate-fade-in-delayed backdrop-blur-sm">
        <div
          className="bg-white/10 border border-white/20 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg cursor-pointer hover:bg-white/15 transition-all duration-200"
          onClick={onQuickSearchOpen}
        >
          <Search className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-medium">
            Press <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-xs">Ctrl+G</kbd> to quickly search movies/tv
          </span>
        </div>
      </div>

      <div className="relative z-10 p-4 md:p-8 pb-0 w-full md:pl-8 md:pr-0 md:text-left text-center">
        {logoImage ? (
          <img
            src={getTmdbImage(logoImage) || '/placeholder.svg'}
            className="w-[80%] md:max-h-72 max-w-sm min-w-[13rem] mb-4 animate-fade-in-delayed mx-auto md:mx-0"
            alt={item.title || item.name}
          />
        ) : (
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 w-full md:w-[24rem] animate-fade-in-delayed">
            {item.title || item.name}
          </h1>
        )}

        <div className="flex items-center gap-1 sm:gap-2 mb-4 animate-fade-in-delayed-2 justify-center md:justify-start flex-wrap">
          <div className="bg-gradient-to-r from-[#90cea1] to-[#01b4e4] text-black px-1 py-[1px] rounded font-black tracking-tighter text-sm">
            TMDB
          </div>
          <span className="text-neutral-300 text-sm sm:text-base">{item.vote_average?.toFixed(1) || '8.0'}</span>
          <span className="text-neutral-300">•</span>
          <span className="text-neutral-300 text-sm sm:text-base">{formatReleaseDate(item.release_date || item.first_air_date)}</span>
          <span className="text-neutral-300 hidden sm:inline">•</span>
          <span className="text-neutral-300 text-sm sm:text-base hidden sm:inline">
            {item.runtime ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m` : item.number_of_seasons ? `${item.number_of_seasons} seasons` : '0-100 seasons'}
          </span>
          <span className="text-neutral-300 hidden sm:inline">•</span>
          <span className="text-green-400 text-sm sm:text-base hidden sm:inline">100% match</span>
        </div>

        <p className="text-white text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-16 leading-5 sm:leading-6 max-w-xl line-clamp-3 overflow-ellipsis animate-fade-in-delayed-3 mx-auto md:mx-0">
          {item.overview}
        </p>

        <div className="flex flex-col md:flex-row mb-4 w-full md:justify-between items-center gap-4 animate-fade-in-delayed-4">
          <div className="flex items-center gap-2 justify-center">
            <button
              onClick={handleWatchClick}
              className="bg-white text-black px-4 sm:px-6 py-2 rounded-full font-semibold text-sm sm:text-lg flex items-center gap-2 hover:bg-neutral-200 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" />
              Watch now
            </button>
            <button
              onClick={handleInfoClick}
              className="bg-white/15 text-white p-2 sm:p-2.5 rounded-full hover:bg-white/25 transition-all cursor-pointer"
            >
              <Info className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={handleLikeClick}
              className="bg-white/15 text-white p-2 sm:p-2.5 rounded-full hover:bg-white/25 transition-all cursor-pointer"
            >
              <ThumbsUp className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={handleWatchlistToggle}
              className={`text-white p-2 sm:p-2.5 rounded-full transition-all cursor-pointer ${inWatchlist ? 'bg-white/25' : 'bg-white/15 hover:bg-white/25'}`}
            >
              <Plus className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="bg-white/15 text-white p-2 pl-3 pr-12 font-light">{getContentRating(item)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   Continue Watching Row (single row + "View more")
--------------------------------------------------------------*/
const ContinueWatchingRow = ({ items }) => {
  const navigate = useNavigate();
  const showMore = items.length > MAX_CW_VISIBLE;

  const visible = useMemo(() => items.slice(0, MAX_CW_VISIBLE), [items]);

  const cards = useMemo(
    () =>
      visible.map((it) => {
        const mt = (it.mediaType || it.media_type || (it.title ? 'movie' : 'tv')).toLowerCase();
        const id = it.id;
        const season = mt === 'movie' ? 1 : Math.max(1, it.__progress?.season ?? it.season_number ?? it.season ?? 1);
        const episode = mt === 'movie' ? 1 : Math.max(1, it.__progress?.episode ?? it.episode_number ?? it.episode ?? 1);
        const path = `/${mt}/${id}?watch=1&season=${season}&episode=${episode}`;

        const full = Number(it.__progress?.fullDuration ?? it.full_duration ?? it.fullDuration ?? 0);
        const watched = Number(it.__progress?.watchedDuration ?? it.watched_duration ?? it.watchedDuration ?? 0);
        const pct = full > 0 ? Math.min(100, Math.round((watched / full) * 100)) : 0;

        const remainingLabel = (() => {
          if (!full) return '0 left';
          const rem = Math.max(0, full - watched);
          const minutes = Math.round(rem / 60);
          if (minutes >= 60) {
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            return `${h}h${m}m left`;
          }
          return `${minutes}m left`;
        })();

        const sub = mt === 'movie'
          ? `Movie • ${remainingLabel}`
          : `S${season} • E${episode} • ${remainingLabel}`;

        return {
          id,
          mt,
          season,
          episode,
          path,
          pct,
          sub,
          img: getTmdbImage(it.backdrop_path) || getTmdbImage(it.poster_path),
          title: it.title || it.name || 'Untitled',
        };
      }),
    [visible]
  );

  if (!cards.length) return null;

  return (
    <section className="animate-stagger" style={{ animationDelay: '0ms' }}>
      <div className="px-2 sm:px-4 md:px-8 mb-3 flex items-center justify-between">
        <h2 className="text-white text-2xl font-semibold">Continue Watching</h2>
        {showMore && (
          <button
            onClick={() => navigate('/continue-watching')}
            className="text-white/80 hover:text-white text-sm inline-flex items-center gap-1"
          >
            View more <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="px-2 sm:px-4 md:px-8">
        <div className="grid grid-flow-col auto-cols-[75%] sm:auto-cols-[50%] md:auto-cols-[33%] lg:auto-cols-[25%] gap-3 md:gap-4 overflow-x-auto pb-2 hide-scrollbar">
          {cards.map((c) => (
            <button
              key={`${c.mt}-${c.id}`}
              className="relative group rounded-xl overflow-hidden bg-neutral-900 text-left"
              onClick={() => navigate(c.path)}
              aria-label={`Continue ${c.title}`}
            >
              <div className="w-full aspect-video bg-cover bg-center" style={{ backgroundImage: `url('${c.img || ''}')` }} />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
              <div className="absolute left-3 bottom-10">
                <div className="bg-white/15 backdrop-blur-xs text-white text-sm md:text-base px-3 py-1.5 rounded-full shadow">
                  Continue watching
                </div>
              </div>
              <div className="absolute left-3 bottom-4 text-xs md:text-sm text-white/90">
                {c.sub}
              </div>
              <div className="absolute left-0 right-0 bottom-0 h-1.5 bg-white/10">
                <div className="h-full bg-white/90" style={{ width: `${c.pct}%` }} />
              </div>
            </button>
          ))}

          {/* “View more” tile at the end (only if there are more) */}
          {showMore && (
            <button
              onClick={() => navigate('/continue-watching')}
              className="relative rounded-xl overflow-hidden bg-neutral-900/60 border border-white/10 hover:bg-neutral-800/80 transition"
            >
              <div className="w-full aspect-video flex items-center justify-center">
                <div className="text-white/90 text-sm sm:text-base inline-flex items-center gap-2">
                  View more <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const {
    categoryData,
    spotlightItem,
    continueWatchingItems,
    isLoading,
    spotlightLoading,
    error,
    lastFetchedAt,
    setCategoryData,
    setSpotlightItem,
    setContinueWatchingItems,
    setLoading,
    setError,
    setLastFetched,
  } = useHomeStore();

  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const handleQuickSearchOpen = () => setIsQuickSearchOpen(true);

  // ---------------- Popup ----------------
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    const hidePopup = localStorage.getItem("dontShowPopup");
    if (!hidePopup) setIsPopupOpen(true);
  }, []);

  const handlePopupClose = () => {
    if (dontShow) localStorage.setItem("dontShowPopup", "true");
    setIsPopupOpen(false);
  };
  // --------------------------------------

  // Continue Watching loader
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await getContinueWatchingCards(50);
        if (!cancelled) setContinueWatchingItems(items ?? []);
      } catch {
        if (!cancelled) setContinueWatchingItems([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Categories + spotlight loader
  useEffect(() => {
    const now = Date.now();
    const isFresh = now - (lastFetchedAt || 0) < STALE_MS;
    const hasCached = Object.keys(categoryData || {}).length > 0 && !!spotlightItem;
    if (isFresh && hasCached) {
      setLoading({ isLoading: false, spotlightLoading: false });
      return;
    }

    const load = async () => {
      try {
        setLoading({ isLoading: true, spotlightLoading: true, error: null });

        const promises = categories.map(async (c) => {
          const route = c.url.replace(c.detailUrl, '');
          const data = await fetchTmdb(route);
          return { ...c, data: data.results || [] };
        });

        const results = await Promise.all(promises);
        const next = {};
        let heroSet = false;

        results.forEach((r) => {
          next[r.title] = r.data;

          if (r.updateHero && r.data.length > 0 && !heroSet) {
            heroSet = true;
            const heroItem = r.data[0];
            const detailRoute = `/${heroItem.title ? 'movie' : 'tv'}/${heroItem.id}?language=en-US&append_to_response=images,content_ratings${
              heroItem.title ? ',release_dates' : ''
            }&include_image_language=en`;

            fetchTmdb(detailRoute)
              .then((d) => {
                setSpotlightItem(d);
                setLoading({ spotlightLoading: false });
              })
              .catch(() => {
                setSpotlightItem(heroItem);
                setLoading({ spotlightLoading: false });
              });
          }
        });

        setCategoryData(next);
        setLoading({ isLoading: false });
        setLastFetched(Date.now());
      } catch (err) {
        setError(err.message || 'Failed to load');
        setLoading({ isLoading: false, spotlightLoading: false });
      }
    };

    load();
  }, []);

  if (error) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 text-xl">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-[#090a0a] pb-12 md:pb-0">
      <Header />

      <SpotlightSection item={spotlightItem} isLoading={spotlightLoading} onQuickSearchOpen={handleQuickSearchOpen} />

      <div className="px-2 sm:px-4 md:px-8 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8">
        {continueWatchingItems.length > 0 && <ContinueWatchingRow items={continueWatchingItems} />}
        {Object.keys(categoryData).map((title, index) => {
          const items = categoryData[title] || [];
          const delay = continueWatchingItems.length > 0 ? (index + 1) * 200 : index * 200;
          return (
            <div key={title} className="animate-stagger" style={{ animationDelay: `${delay}ms` }}>
              <EnhancedCategorySection title={title} items={items} isLoading={isLoading} />
            </div>
          );
        })}
      </div>

      <Footer />

      <QuickSearch isOpen={isQuickSearchOpen} onOpenChange={setIsQuickSearchOpen} />

  // Show popup
  useEffect(() => {
    const hidden = localStorage.getItem("hideAppPopup")
    if (!hidden) {
      setIsPopupOpen(true)
    }
  }, [])

  // Disable background scroll
  useEffect(() => {
    document.body.style.overflow = isPopupOpen ? "hidden" : "auto"
    return () => (document.body.style.overflow = "auto")
  }, [isPopupOpen])

  const handlePopupClose = () => {
    if (dontShow) {
      localStorage.setItem("hideAppPopup", "true")
    }
    setIsPopupOpen(false)
  }

  if (!isPopupOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-fadeIn">
      <div className="relative w-full max-w-md mx-auto mb-4 rounded-2xl
                      bg-neutral-900 text-white shadow-2xl
                      animate-slideUp overflow-hidden">

        {/* Close Button */}
        <button
          onClick={handlePopupClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white"
        >
          <XIcon size={20} />
        </button>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold mb-2">
            Better on App
          </h3>

          <p className="text-sm text-white/70 mb-4">
            HD • No Ads
          </p>

          {/* CTA */}
          <a
            href="https://nepoflix.micorp.pro/download"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 rounded-xl
                       bg-gradient-to-r from-cyan-400 to-green-400
                       text-black font-semibold hover:opacity-90 transition"
          >
            Download App
          </a>

          {/* Don't show again */}
          <label className="mt-4 flex items-center justify-center gap-2
                            text-xs text-white/60">
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              className="accent-green-400"
            />
            Don’t show again
          </label>
        </div>
      </div>
    </div>
  )
}
      )}
    </div>
  );
};

export default Home;
