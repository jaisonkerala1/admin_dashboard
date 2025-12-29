import { SearchResultType } from '@/types/search';

/**
 * Highlight matching text in search results
 * Returns the original text (highlighting handled by component)
 */
export const highlightText = (text: string, query: string): string => {
  if (!query.trim() || !text) return text;
  return text;
};

/**
 * Escape special regex characters
 */
export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Format date for display
 */
export const formatDate = (date: string | Date | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Format search result metadata
 */
export const formatSearchMetadata = (item: any, type: SearchResultType): string[] => {
  switch (type) {
    case 'astrologer':
      return [
        item.phone || '',
        item.email || '',
        item.experience ? `${item.experience}y exp` : ''
      ].filter(Boolean);
    case 'consultation':
      return [
        item.consultationId || item._id,
        item.status || '',
        item.scheduledAt ? formatDate(item.scheduledAt) : ''
      ].filter(Boolean);
    case 'service':
      return [
        item.category || '',
        item.price ? `₹${item.price}` : '',
        item.status || ''
      ].filter(Boolean);
    case 'serviceRequest':
      return [
        item.phone || '',
        item.status || '',
        item.createdAt ? formatDate(item.createdAt) : ''
      ].filter(Boolean);
    default:
      return [];
  }
};

