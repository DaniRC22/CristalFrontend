import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Product, PaginatedResponse } from '../types';

export function useProducts(params?: Record<string, string | number>) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', params],
    queryFn: () => api.get('/api/products', { params }).then((r) => r.data),
  });
}

export function useFeaturedProducts() {
  return useQuery<Product[]>({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get('/api/products/featured').then((r) => r.data),
  });
}

export function useProduct(slug: string) {
  return useQuery<Product>({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/api/products/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });
}
