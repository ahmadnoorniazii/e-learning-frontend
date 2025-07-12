/**
 * Categories and Tags Service
 * Handles category and tag-related API calls
 */

import { apiClient, CourseCategory, Tag } from './api-client';

class CategoriesService {
  private categoriesCache: CourseCategory[] | null = null;
  private tagsCache: Tag[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getCategories(forceRefresh = false): Promise<CourseCategory[]> {
    const now = Date.now();
    
    if (!forceRefresh && this.categoriesCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.categoriesCache;
    }

    try {
      const response = await apiClient.getCategories();
      this.categoriesCache = response.data;
      this.cacheTimestamp = now;
      return response.data;
    } catch (error) {
      console.error('❌ CategoriesService: Error fetching categories:', error);
      return this.categoriesCache || [];
    }
  }

  async getTags(forceRefresh = false): Promise<Tag[]> {
    const now = Date.now();
    
    if (!forceRefresh && this.tagsCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.tagsCache;
    }

    try {
      const response = await apiClient.getTags();
      this.tagsCache = response.data;
      this.cacheTimestamp = now;
      return response.data;
    } catch (error) {
      console.error('❌ CategoriesService: Error fetching tags:', error);
      return this.tagsCache || [];
    }
  }

  getCategoryById(id: number): CourseCategory | undefined {
    return this.categoriesCache?.find(cat => cat.id === id);
  }

  getTagById(id: number): Tag | undefined {
    return this.tagsCache?.find(tag => tag.id === id);
  }

  getCategoryBySlug(slug: string): CourseCategory | undefined {
    return this.categoriesCache?.find(cat => cat.slug === slug);
  }

  getTagBySlug(slug: string): Tag | undefined {
    return this.tagsCache?.find(tag => tag.slug === slug);
  }

  clearCache(): void {
    this.categoriesCache = null;
    this.tagsCache = null;
    this.cacheTimestamp = 0;
  }

  // Helper methods for UI
  getCategoryColor(categoryId: number): string {
    const category = this.getCategoryById(categoryId);
    return category?.color || '#6B7280'; // Default gray color
  }

  getTagColor(tagId: number): string {
    const tag = this.getTagById(tagId);
    return tag?.color || '#6B7280'; // Default gray color
  }

  formatCategoryName(categoryId: number): string {
    const category = this.getCategoryById(categoryId);
    return category?.name || 'Unknown Category';
  }

  formatTagName(tagId: number): string {
    const tag = this.getTagById(tagId);
    return tag?.name || 'Unknown Tag';
  }
}

export const categoriesService = new CategoriesService();
export default categoriesService;
