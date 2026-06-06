import type { ProductStatus } from '@/lib/supabase/database.types';

export interface ProductListItem {
  id: string;
  slug: string;
  title: string;
  price: number; // satang
  stock: number;
  lowStockThreshold: number;
  status: ProductStatus;
  imagePath: string | null;
}

export interface ProductImageItem {
  path: string;
  alt: string;
}

export interface ProductDetail extends ProductListItem {
  description: string;
  attributes: Record<string, string> | null;
  categoryName: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  images: ProductImageItem[];
}

export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
}
