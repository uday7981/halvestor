/**
 * Utility functions for formatting values in the UI
 */

/**
 * Format a number as currency
 * @param value Number to format
 * @param currency Currency symbol (default: $)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, currency: string = '$'): string => {
  if (isNaN(value)) return `${currency}0.00`;
  
  // Format with commas for thousands
  return `${currency}${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Format a large number with appropriate suffix (K, M, B)
 * @param value Number to format
 * @returns Formatted number with suffix
 */
export const formatLargeNumber = (value: number): string => {
  if (!value) return '0';
  
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  
  return value.toString();
};

/**
 * Format a date string to a readable format
 * @param dateString ISO date string
 * @returns Formatted date string (e.g., "May 22, 2025")
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
