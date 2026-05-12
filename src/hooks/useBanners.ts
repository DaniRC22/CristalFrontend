import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Banner, SiteConfig } from '../types';

export function useBanners() {
  return useQuery<Banner[]>({
    queryKey: ['banners'],
    queryFn: () => api.get('/api/banners').then((r) => r.data),
  });
}

export function useSiteConfig() {
  return useQuery<SiteConfig>({
    queryKey: ['site-config'],
    queryFn: () => api.get('/api/config').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}
