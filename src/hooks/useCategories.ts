import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Category, Product, PaginatedResponse } from '../types';

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories').then((r) => r.data),
  });
}

export function useCategoryProducts(slug: string, params?: Record<string, string | number>) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ['category-products', slug, params],
    queryFn: () => api.get(`/api/categories/${slug}/products`, { params }).then((r) => r.data),
    enabled: !!slug,
  });
}
