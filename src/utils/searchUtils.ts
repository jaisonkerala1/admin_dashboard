import React from 'react';
import { SearchResultType } from '@/types/search';

/**
 * Highlight matching text in search results
 * Returns JSX with highlighted matches wrapped in <mark> tags
 */
export const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query.trim() || !text) return text;
  
  const escapedQuery = escapeRegExp(query.trim());
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);
  
  // When splitting with a capturing group, captured parts are included in the array
  // Check each part to see if it matches the query (case-insensitive)
  return parts.map((part, index) => {
    // Create a new regex for testing (to avoid state issues)
    const testRegex = new RegExp(`^${escapedQuery}$`, 'i');
    const isMatch = testRegex.test(part);
    
    if (isMatch) {
      return (
        <mark key={index} className="bg-yellow-200 text-gray-900 font-medium px-0.5 rounded">
          {part}
        </mark>
      );
    }
    return <span key={index}>{part}</span>;
  });
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

