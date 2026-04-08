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

  // ✅ Popup state (ONLY ONE VERSION)
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

  // Continue Watching
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const items = await getContinueWatchingCards(50);
      if (!cancelled) setContinueWatchingItems(items ?? []);
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch data
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
        setLoading({ isLoading: true, spotlightLoading: true });

        const results = await Promise.all(
          categories.map(async (c) => {
            const route = c.url.replace(c.detailUrl, '');
            const data = await fetchTmdb(route);
            return { ...c, data: data.results || [] };
          })
        );

        const next = {};
        let heroSet = false;

        results.forEach((r) => {
          next[r.title] = r.data;

          if (r.updateHero && r.data.length > 0 && !heroSet) {
            heroSet = true;
            setSpotlightItem(r.data[0]);
          }
        });

        setCategoryData(next);
        setLastFetched(Date.now());
        setLoading({ isLoading: false });
      } catch (err) {
        setError(err.message || 'Failed');
        setLoading({ isLoading: false });
      }
    };

    load();
  }, []);

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#090a0a] pb-12 md:pb-0">
      <Header />

      <div className="px-2 sm:px-4 md:px-8 py-4 space-y-6">
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

      {/* ✅ FIXED POPUP */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
          <div className="relative w-full max-w-md mx-auto mb-4 rounded-2xl bg-neutral-900 text-white shadow-2xl overflow-hidden">

            <button
              onClick={handlePopupClose}
              className="absolute top-3 right-3 text-white/70 hover:text-white"
            >
              <XIcon size={20} />
            </button>

            <div className="p-5">
              <h3 className="text-lg font-semibold mb-2">Better on App</h3>
              <p className="text-sm text-white/70 mb-4">HD • No Ads</p>

              <a
                href="https://nepoflix.micorp.pro/download"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-green-400 text-black font-semibold"
              >
                Download App
              </a>

              <label className="mt-4 flex items-center justify-center gap-2 text-xs text-white/60">
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
      )}
    </div>
  );
};

export default Home;
