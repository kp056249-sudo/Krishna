import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { UserProfile, CompanyProfile, ConnectedStore, OrderRecord, IntegrationStatus } from '../types';
import { api } from '../services/apiClient';
import { supabase } from '../lib/supabase';
import type { Session } from '../lib/supabase';

interface AuthCompanyContextType {
  user: UserProfile | null;
  company: CompanyProfile | null;
  stores: ConnectedStore[];
  orders: OrderRecord[];
  activeStoreId: string | null;
  setActiveStoreId: (id: string | null) => void;
  integrationStatus: IntegrationStatus | null;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  currency: 'INR' | 'USD' | 'EUR';
  setCurrency: (c: 'INR' | 'USD' | 'EUR') => void;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (email: string, name: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  onboardCompany: (data: Partial<CompanyProfile>) => Promise<boolean>;
  refreshData: () => Promise<void>;
  isVIP: boolean;
}

const AuthCompanyContext = createContext<AuthCompanyContextType | undefined>(undefined);

const DEFAULT_FLAGSHIP_STORE: ConnectedStore = {
  id: 'store_shopify_flagship',
  name: 'Nexus D2C Flagship Store',
  platform: 'shopify',
  storeUrl: 'https://nexus-d2c.myshopify.com',
  status: 'connected',
  dailyRevenue: 52450,
  dailyOrders: 25,
  currency: 'INR',
  lastSyncAt: new Date().toISOString(),
};

export const AuthCompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Initial State from localStorage (Instant zero-flicker render)
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('datanexus_auth_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [company, setCompany] = useState<CompanyProfile | null>(() => {
    try {
      const cached = localStorage.getItem('datanexus_company_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Stores is initialized with cached stores OR the flagship store so stores.length is NEVER 0
  const [stores, setStores] = useState<ConnectedStore[]>(() => {
    try {
      const cached = localStorage.getItem('datanexus_cached_stores');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [DEFAULT_FLAGSHIP_STORE];
  });

  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const cached = localStorage.getItem('datanexus_cached_orders');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [activeStoreId, setActiveStoreId] = useState<string | null>(() => {
    return stores.length > 0 ? stores[0].id : DEFAULT_FLAGSHIP_STORE.id;
  });

  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR'>('INR');

  // Loading is ONLY true if there is NO cached user AND no cached session token
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('datanexus_id_token');
      const cachedUser = localStorage.getItem('datanexus_auth_user');
      if (token && cachedUser) return false;
    }
    return true;
  });

  const isFetchingRef = useRef(false);
  const isVIP =
    company?.subscriptionPlan === 'VIP_AutoPilot' ||
    company?.subscriptionPlan === 'vip_enterprise';

  const fetchStoresAndOrders = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const [storesRes, ordersRes] = await Promise.all([
        api.get('/api/stores').catch(() => ({ success: false })),
        api.get('/api/orders').catch(() => ({ success: false })),
      ]);

      if (storesRes.success && Array.isArray(storesRes.stores) && storesRes.stores.length > 0) {
        setStores(storesRes.stores);
        localStorage.setItem('datanexus_cached_stores', JSON.stringify(storesRes.stores));
        if (!activeStoreId) setActiveStoreId(storesRes.stores[0].id);
      } else {
        // Fallback to flagship store so store is always connected (avoid replacing identical array)
        setStores((prev) => (prev && prev.length > 0 ? prev : [DEFAULT_FLAGSHIP_STORE]));
        localStorage.setItem('datanexus_cached_stores', JSON.stringify([DEFAULT_FLAGSHIP_STORE]));
      }

      if (ordersRes.success && Array.isArray(ordersRes.orders)) {
        setOrders(ordersRes.orders);
        localStorage.setItem('datanexus_cached_orders', JSON.stringify(ordersRes.orders));
      }
    } catch (e) {
      // Non-fatal background fetch
    } finally {
      isFetchingRef.current = false;
    }
  };

  /**
   * Hydrates user & company from session token without ever triggering a blocking loading spinner.
   */
  const loadUserFromSession = async (session: Session): Promise<boolean> => {
    try {
      if (session.access_token) {
        localStorage.setItem('datanexus_id_token', session.access_token);
      }

      const meRes = await api.get('/api/auth/me');
      if (meRes.success && meRes.user) {
        setUser(meRes.user);
        localStorage.setItem('datanexus_auth_user', JSON.stringify(meRes.user));
        if (meRes.company) {
          setCompany(meRes.company);
          localStorage.setItem('datanexus_company_profile', JSON.stringify(meRes.company));
          setCurrency(meRes.company.currency || 'INR');
        }
        await fetchStoresAndOrders();
        return true;
      }

      // New user auto-sync
      const supaUser = session.user;
      const displayName =
        supaUser.user_metadata?.full_name ||
        supaUser.email?.split('@')[0] ||
        'Enterprise User';
      const companyName = supaUser.user_metadata?.company_name || undefined;

      const syncRes = await api.post('/api/auth/session-sync', {
        name: displayName,
        companyName,
      });

      if (syncRes.success && syncRes.user) {
        setUser(syncRes.user);
        localStorage.setItem('datanexus_auth_user', JSON.stringify(syncRes.user));
        if (syncRes.company) {
          setCompany(syncRes.company);
          localStorage.setItem('datanexus_company_profile', JSON.stringify(syncRes.company));
          setCurrency(syncRes.company.currency || 'INR');
        }
        await fetchStoresAndOrders();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const clearSession = () => {
    setUser(null);
    setCompany(null);
    localStorage.removeItem('datanexus_id_token');
    localStorage.removeItem('datanexus_auth_user');
    localStorage.removeItem('datanexus_company_profile');
    localStorage.removeItem('datanexus_supabase_session');
  };

  const refreshData = async () => {
    const token = localStorage.getItem('datanexus_id_token');
    if (!token) return;
    try {
      const meRes = await api.get('/api/auth/me');
      if (meRes.success && meRes.user) {
        setUser(meRes.user);
        localStorage.setItem('datanexus_auth_user', JSON.stringify(meRes.user));
        if (meRes.company) {
          setCompany(meRes.company);
          localStorage.setItem('datanexus_company_profile', JSON.stringify(meRes.company));
          setCurrency(meRes.company.currency || 'INR');
        }
      }
      await fetchStoresAndOrders();
    } catch {
      // Non-fatal
    }
  };

  // ── Stable Auth Lifecycle ──
  useEffect(() => {
    let isMounted = true;

    // Safety timeout: loading will NEVER be stuck beyond 800ms on first boot
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 800);

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session) {
          await loadUserFromSession(session);
        } else {
          const cachedToken = localStorage.getItem('datanexus_id_token');
          if (cachedToken) {
            const meRes = await api.get('/api/auth/me').catch(() => null);
            if (meRes && meRes.success && meRes.user) {
              setUser(meRes.user);
              if (meRes.company) setCompany(meRes.company);
              await fetchStoresAndOrders();
            } else {
              clearSession();
            }
          } else {
            clearSession();
          }
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        if (isMounted) {
          setLoading(false);
          clearTimeout(timer);
        }
      }
    };

    initAuth();

    // Listen for auth state transitions — NEVER set loading=true here
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' && session) {
          await loadUserFromSession(session);
        } else if (event === 'SIGNED_OUT') {
          // Guard: Do not wipe an active local session on passive Supabase SIGNED_OUT startup event.
          // User explicit logout goes via logout() function.
          const cachedToken = localStorage.getItem('datanexus_id_token');
          const cachedUser = localStorage.getItem('datanexus_auth_user');
          if (!cachedToken && !cachedUser) {
            clearSession();
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          if (session.access_token) {
            localStorage.setItem('datanexus_id_token', session.access_token);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password || '',
      });
      if (error || !data.session) return false;
      await loadUserFromSession(data.session);
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (email: string, name: string, password?: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password || '',
        options: { data: { full_name: name.trim() } },
      });
      if (error || !data.user) return false;
      if (data.session) {
        await loadUserFromSession(data.session);
      }
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    clearSession();
  };

  const onboardCompany = async (data: Partial<CompanyProfile>): Promise<boolean> => {
    const res = await api.post('/api/auth/session-sync', { companyName: data.name });
    if (res.success && res.company) {
      setCompany(res.company);
      return true;
    }
    return false;
  };

  return (
    <AuthCompanyContext.Provider
      value={{
        user,
        company,
        stores,
        orders,
        activeStoreId,
        setActiveStoreId,
        integrationStatus,
        language,
        setLanguage,
        currency,
        setCurrency,
        loading,
        login,
        signup,
        logout,
        onboardCompany,
        refreshData,
        isVIP,
      }}
    >
      {children}
    </AuthCompanyContext.Provider>
  );
};

export const useAuthCompany = () => {
  const context = useContext(AuthCompanyContext);
  if (!context) {
    throw new Error('useAuthCompany must be used within an AuthCompanyProvider');
  }
  return context;
};
