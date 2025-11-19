/**
 * Truncates text to a maximum number of words
 * @param text - The text to truncate
 * @param maxWords - Maximum number of words (default: 25, which is roughly 2-3 lines)
 * @returns Truncated text with ellipsis if it was cut off
 */
export function truncateToWords(text: string | null | undefined, maxWords: number = 25): string {
  if (!text) return '';
  
  const words = text.trim().split(/\s+/);
  
  if (words.length <= maxWords) {
    return text;
  }
  
  return words.slice(0, maxWords).join(' ') + '...';
}