import { createSupabasePublicClient } from '@/lib/supabase/public';
import type { CategoryItem, ProductDetail, ProductListItem } from './types';

// Read-side repository for the catalog. Public reads are governed by RLS
// (only ACTIVE/SOLD_OUT products are visible to anon). Server-side mutations will
// move through a service layer once privileged DB access (service role / Prisma) is wired.

interface ProductRow {
  id: string;
  slug: string;
  title: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  status: ProductListItem['status'];
  ProductImage?: { storagePath: string; sortOrder: number; alt?: string }[];
}

const LIST_COLUMNS = 'id,slug,title,price,stock,lowStockThreshold,status';
const LIST_SELECT = `${LIST_COLUMNS},ProductImage(storagePath,sortOrder)`;

export async function listActiveProducts(options?: {
  search?: string;
  categorySlug?: string;
}): Promise<ProductListItem[]> {
  const sb = createSupabasePublicClient();
  let query = sb
    .from('Product')
    .select(LIST_SELECT)
    .in('status', ['ACTIVE', 'SOLD_OUT'])
    .order('createdAt', { ascending: false });

  if (options?.search) {
    query = query.ilike('title', `%${options.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => mapListItem(row as ProductRow));
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const sb = createSupabasePublicClient();
  const { data, error } = await sb
    .from('Product')
    .select(
      `${LIST_SELECT},description,attributes,seoTitle,seoDescription,Category(name),ProductImage(storagePath,sortOrder,alt)`,
    )
    .eq('slug', slug)
    .in('status', ['ACTIVE', 'SOLD_OUT'])
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as ProductRow & {
    description: string;
    attributes: Record<string, string> | null;
    seoTitle: string | null;
    seoDescription: string | null;
    // Supabase types an embedded to-one as an object at runtime; allow either shape.
    Category: { name: string } | { name: string }[] | null;
  };

  const category = Array.isArray(row.Category) ? row.Category[0] : row.Category;
  const images = (row.ProductImage ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => ({ path: img.storagePath, alt: img.alt ?? '' }));

  return {
    ...mapListItem(row),
    description: row.description,
    attributes: row.attributes,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    categoryName: category?.name ?? null,
    images,
  };
}

export async function listActiveProductSlugs(): Promise<string[]> {
  const sb = createSupabasePublicClient();
  const { data, error } = await sb
    .from('Product')
    .select('slug')
    .in('status', ['ACTIVE', 'SOLD_OUT']);
  if (error) throw error;
  return (data ?? []).map((r) => (r as { slug: string }).slug);
}

export async function listCategories(): Promise<CategoryItem[]> {
  const sb = createSupabasePublicClient();
  const { data, error } = await sb.from('Category').select('id,slug,name').order('name');
  if (error) throw error;
  return (data ?? []) as CategoryItem[];
}

function mapListItem(row: ProductRow): ProductListItem {
  const firstImage = (row.ProductImage ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)[0];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    price: row.price,
    stock: row.stock,
    lowStockThreshold: row.lowStockThreshold,
    status: row.status,
    imagePath: firstImage?.storagePath ?? null,
  };
}
