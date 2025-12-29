import React from 'react';
import { SearchResultType } from '@/types/search';

/**
 * Highlight matching text in search results
 */
export const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query.trim() || !text) return text;
  
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-gray-900 font-semibold">
        {part}
      </mark>
    ) : (
      part
    )
  );
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

