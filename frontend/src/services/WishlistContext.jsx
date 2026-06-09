/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';

const GUEST_STORAGE_KEY = 'guest_wishlist';
const WishlistContext = createContext(null);

/**
 * Reads the guest wishlist from localStorage.
 */
const readGuestWishlist = () => {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Writes the guest wishlist to localStorage.
 */
const writeGuestWishlist = (ids) => {
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(ids));
};

export const WishlistProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();

  // Set of wishlisted product IDs (works for both guest + logged-in)
  const [wishlistIds, setWishlistIds] = useState(() => {
    // Initialise from localStorage for guests
    return new Set(readGuestWishlist());
  });

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const hasSyncedRef = useRef(false);

  // ── Fetch wishlist IDs from server when authenticated ──
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    let cancelled = false;
    const fetchIds = async () => {
      setLoading(true);
      try {
        // If there are guest items to sync, sync them first
        const guestIds = readGuestWishlist();
        if (guestIds.length > 0 && !hasSyncedRef.current) {
          hasSyncedRef.current = true;
          const result = await api.syncWishlist(guestIds, token);
          localStorage.removeItem(GUEST_STORAGE_KEY);
          if (!cancelled) {
            setWishlistIds(new Set(result.product_ids));
          }
        } else {
          const data = await api.getWishlistIds(token);
          if (!cancelled) {
            setWishlistIds(new Set(data.product_ids));
          }
        }
      } catch (err) {
        console.error('Failed to fetch wishlist:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchIds();
    return () => { cancelled = true; };
  }, [isAuthenticated, token]);

  // ── Keep localStorage in sync for guests ──
  useEffect(() => {
    if (!isAuthenticated) {
      writeGuestWishlist([...wishlistIds]);
    }
  }, [wishlistIds, isAuthenticated]);

  // ── Check if a product is wishlisted ──
  const isInWishlist = useCallback((productId) => {
    return wishlistIds.has(productId);
  }, [wishlistIds]);

  // ── Toggle wishlist with optimistic UI ──
  const toggleWishlist = useCallback(async (productId) => {
    const wasInWishlist = wishlistIds.has(productId);

    // Optimistic update
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (wasInWishlist) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });

    if (!isAuthenticated) {
      // For guests, localStorage is updated via the effect
      return;
    }

    // Server call
    try {
      await api.toggleWishlist(productId, token);
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
      // Rollback
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (wasInWishlist) {
          next.add(productId);
        } else {
          next.delete(productId);
        }
        return next;
      });
    }
  }, [wishlistIds, isAuthenticated, token]);

  // ── Fetch full wishlist items (for WishlistPage) ──
  const fetchWishlistItems = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setWishlistItems([]);
      return;
    }
    setLoading(true);
    try {
      const items = await api.getWishlist(token);
      setWishlistItems(items);
    } catch (err) {
      console.error('Failed to fetch wishlist items:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // ── Remove and refresh ──
  const removeFromWishlist = useCallback(async (productId) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
    setWishlistItems((prev) => prev.filter((item) => item.product_id !== productId));

    if (isAuthenticated && token) {
      try {
        await api.removeFromWishlist(productId, token);
      } catch (err) {
        console.error('Failed to remove from wishlist:', err);
      }
    }
  }, [isAuthenticated, token]);

  const wishlistCount = wishlistIds.size;

  const value = useMemo(() => ({
    wishlistIds,
    wishlistItems,
    wishlistCount,
    loading,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    fetchWishlistItems,
  }), [wishlistIds, wishlistItems, wishlistCount, loading, isInWishlist, toggleWishlist, removeFromWishlist, fetchWishlistItems]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
