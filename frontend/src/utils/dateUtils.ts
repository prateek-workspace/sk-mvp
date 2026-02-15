/**
 * Date utility functions with Indian Standard Time (IST) timezone support
 * IST is UTC+5:30
 */

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Format a date string to Indian locale date format with IST timezone
 * @param dateString - ISO date string or timestamp
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string in IST
 */
export const formatDateIST = (
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    ...options,
    timeZone: IST_TIMEZONE,
  });
};

/**
 * Format a date string to Indian locale time format with IST timezone
 * @param dateString - ISO date string or timestamp
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted time string in IST
 */
export const formatTimeIST = (
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }
): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    ...options,
    timeZone: IST_TIMEZONE,
  });
};

/**
 * Format a date string to full Indian locale datetime format with IST timezone
 * @param dateString - ISO date string or timestamp
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted datetime string in IST
 */
export const formatDateTimeIST = (
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    ...options,
    timeZone: IST_TIMEZONE,
  });
};

/**
 * Get relative time string (e.g., "2 hours ago", "yesterday")
 * @param dateString - ISO date string or timestamp
 * @returns Relative time string
 */
export const getRelativeTimeIST = (dateString: string | Date): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return formatDateIST(dateString);
};

/**
 * Format currency in Indian Rupees
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export const formatINR = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Get current date/time in IST
 * @returns Current Date object (browser local, but can be used with IST formatting functions)
 */
export const getCurrentDateIST = (): Date => {
  return new Date();
};
