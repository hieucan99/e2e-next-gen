/**
 * Date utility functions for test automation
 */
export class DateHelper {
  /**
   * Get current date in specified format
   */
  static getCurrentDate(format: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY' = 'YYYY-MM-DD'): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    switch (format) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  /**
   * Get current timestamp
   */
  static getCurrentTimestamp(): number {
    return Date.now();
  }

  /**
   * Add days to current date
   */
  static addDaysToCurrentDate(days: number, format: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY' = 'YYYY-MM-DD'): string {
    const now = new Date();
    now.setDate(now.getDate() + days);
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    switch (format) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  /**
   * Get date range for the current week
   */
  static getCurrentWeekRange(): { start: string; end: string } {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));

    return {
      start: this.formatDate(startOfWeek),
      end: this.formatDate(endOfWeek)
    };
  }

  /**
   * Get date range for the current month
   */
  static getCurrentMonthRange(): { start: string; end: string } {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      start: this.formatDate(startOfMonth),
      end: this.formatDate(endOfMonth)
    };
  }

  /**
   * Format Date object to YYYY-MM-DD string
   */
  private static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Check if a date string is valid
   */
  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Calculate difference between two dates in days
   */
  static daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const timeDiff = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  /**
   * Get formatted time string
   */
  static getCurrentTime(format: '24h' | '12h' = '24h'): string {
    const now = new Date();
    
    if (format === '12h') {
      return now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}