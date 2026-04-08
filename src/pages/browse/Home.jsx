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

const { tmdbBaseUrl } = config;
const STALE_MS = 5 * 60 * 1000;
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


// ================= HERO =================
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

  const backgroundImage =
    getTmdbImage(item.backdrop_path) ||
    getTmdbImage(item.poster_path);

  const logoImage = item.images?.logos?.find(
    (logo) => logo.iso_639_1 === 'en'
  )?.file_path;

  const mediaType = item.title ? 'movie' : 'tv';

  const handleWatchClick = () =>
    navigate(`/${mediaType}/${item.id}?watch=1`);

  const handleInfoClick = () =>
    navigate(`/${mediaType}/${item.id}`);

  const handleLikeClick = () =>
    toast(`Liked ${item.title || item.name}`);

  const handleWatchlistToggle = async (e) => {
    e.stopPropagation();
    const added = await toggleWatchlist(item);
    setInWatchlist(added);
  };

  return (
    <div
      className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] bg-cover bg-center flex items-end"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      <div className="hidden md:block absolute top-20 left-1/2 -translate-x-1/2 z-20">
        <div
          onClick={onQuickSearchOpen}
          className="bg-white/10 border border-white/20 rounded-full px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-white/20"
        >
          <Search className="w-4 h-4 text-white" />
          <span className="text-white text-sm">
            Press Ctrl+G to search
          </span>
        </div>
      </div>

      <div className="relative z-10 p-4 md:p-8 w-full max-w-2xl text-white">
        {logoImage ? (
          <img
            src={getTmdbImage(logoImage)}
            className="max-h-40 mb-4"
            alt="logo"
          />
        ) : (
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {item.title || item.name}
          </h1>
        )}

        <div className="flex items-center gap-2 mb-4 text-sm text-gray-300">
          <span>⭐ {item.vote_average?.toFixed(1) || "8.0"}</span>
          <span>•</span>
          <span>
            {formatReleaseDate(
              item.release_date || item.first_air_date
            )}
          </span>
          <span className="hidden sm:inline">• 100% match</span>
        </div>

        <p className="text-sm md:text-base mb-6 line-clamp-3">
          {item.overview}
        </p>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleWatchClick}
            className="bg-white text-black px-5 py-2 rounded font-semibold flex items-center gap-2"
          >
            <Play size={18} fill="black" /> Watch
          </button>

          <button
            onClick={handleInfoClick}
            className="bg-white/20 px-4 py-2 rounded"
          >
            <Info size={18} />
          </button>

          <button
            onClick={handleLikeClick}
            className="bg-white/20 px-4 py-2 rounded"
          >
            <ThumbsUp size={18} />
          </button>

          <button
            onClick={handleWatchlistToggle}
            className={`px-4 py-2 rounded ${
              inWatchlist ? "bg-white/30" : "bg-white/20"
            }`}
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="mt-4 hidden md:inline-block">
          <span className="bg-white/20 px-3 py-1 text-sm">
            {getContentRating(item)}
          </span>
        </div>
      </div>
    </div>
  );
};


// ================= CONTINUE WATCHING =================
const ContinueWatchingRow = ({ items }) => {
  const navigate = useNavigate();
  if (!items?.length) return null;

  return (
    <div>
      <h2 className="text-white text-xl mb-3">Continue Watching</h2>
      <div className="flex gap-3 overflow-x-auto">
        {items.slice(0, MAX_CW_VISIBLE).map((it) => (
          <div
            key={it.id}
            className="min-w-[200px] cursor-pointer"
            onClick={() =>
              navigate(`/${it.title ? 'movie' : 'tv'}/${it.id}`)
            }
          >
            <img
              src={getTmdbImage(it.poster_path)}
              className="rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
};


// ================= MAIN =================
const Home = () => {
  const {
    categoryData,
    spotlightItem,
    continueWatchingItems,
    isLoading,
    spotlightLoading,
    error,
    setCategoryData,
    setSpotlightItem,
    setContinueWatchingItems,
    setLoading,
    setError,
  } = useHomeStore();

  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    const hide = localStorage.getItem("dontShowPopup");
    if (!hide) setIsPopupOpen(true);
  }, []);

  const handlePopupClose = () => {
    if (dontShow) localStorage.setItem("dontShowPopup", "true");
    setIsPopupOpen(false);
  };

  useEffect(() => {
    (async () => {
      const items = await getContinueWatchingCards(50);
      setContinueWatchingItems(items || []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading({ isLoading: true });

        const results = await Promise.all(
          categories.map(async (c) => {
            const data = await fetchTmdb(c.url.replace(c.detailUrl, ""));
            return { ...c, data: data.results || [] };
          })
        );

        const next = {};
        results.forEach((r) => {
          next[r.title] = r.data;
          if (r.updateHero && r.data.length > 0) {
            setSpotlightItem(r.data[0]);
          }
        });

        setCategoryData(next);
        setLoading({ isLoading: false });
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#090a0a]">

      <Header />

      <SpotlightSection
        item={spotlightItem}
        isLoading={spotlightLoading}
        onQuickSearchOpen={() => setIsQuickSearchOpen(true)}
      />

      <div className="p-4 space-y-6">
        <ContinueWatchingRow items={continueWatchingItems} />

        {Object.keys(categoryData).map((title) => (
          <EnhancedCategorySection
            key={title}
            title={title}
            items={categoryData[title]}
            isLoading={isLoading}
          />
        ))}
      </div>

      <Footer />

      <QuickSearch
        isOpen={isQuickSearchOpen}
        onOpenChange={setIsQuickSearchOpen}
      />

      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70">
          <div className="relative w-full max-w-md mb-4 rounded-2xl bg-neutral-900 text-white p-6 text-center">

            <button onClick={handlePopupClose} className="absolute top-3 right-3">
              <XIcon size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-2">Better on App</h3>

            <p className="text-sm text-white/60 mb-4">
              HD • No Ads • Faster Streaming
            </p>

            <a
              href="https://nepoflix.micorp.pro/download"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold"
            >
              Download Now
            </a>

            <label className="mt-4 flex justify-center gap-2 text-xs text-white/50">
              <input
                type="checkbox"
                checked={dontShow}
                onChange={(e) => setDontShow(e.target.checked)}
              />
              Don’t show again
            </label>

          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
