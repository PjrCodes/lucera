/**
 * Utility functions for handling course colors with CSS styles
 */

/**
 * Converts a CSS style string to a React style object
 * @param cssStyle - CSS style string like "background-color: #xx00xx; color: #XXXXXX;"
 * @returns React style object
 */
export function parseCssStyle(cssStyle: string): Record<string, string> {
  if (!cssStyle) return {};

  return cssStyle.split(';').reduce((acc, rule) => {
    const [key, value] = rule.split(':').map(s => s.trim());
    if (key && value) {
      // Convert kebab-case to camelCase for React styles
      const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = value;
    }
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Gets the course color style or returns a default fallback
 * @param courseColorStyle - The course's CSS style string
 * @returns React style object with fallback
 */
export function getCourseColorStyle(courseColorStyle?: string | null): Record<string, string> {
  if (courseColorStyle) {
    return parseCssStyle(courseColorStyle);
  }

  // Default fallback colors
  return {
    backgroundColor: '#e2e8f0', // primary-200 equivalent
    color: '#334155' // primary-700 equivalent
  };
}

/**
 * Creates a CSS style string from hex color and its contrast color
 * @param hexColor - Hex color value like "#60A5FA"
 * @returns CSS style string like "background-color: #60A5FA; color: #1E40AF;"
 */
export function createCourseColorStyle(hexColor: string): string {
  const contrastColor = getContrastColor(hexColor);
  return `background-color: ${hexColor}; color: ${contrastColor};`;
}

/**
 * Calculate appropriate contrast color for text
 * @param hexColor - Hex color value like "#60A5FA"
 * @returns Hex color for text that contrasts well with background
 */
export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate relative luminance using WCAG formula
  const toLinear = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  // Create sophisticated color variations
  if (luminance > 0.5) {
    // Light background - create a darker shade
    const factor = 0.25; // Make it much darker for better contrast
    const darkR = Math.round(r * factor);
    const darkG = Math.round(g * factor);
    const darkB = Math.round(b * factor);
    return `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;
  } else {
    // Dark background - create a lighter shade
    const factor = 0.8; // Blend 80% with white for better readability
    const lightR = Math.round(r + (255 - r) * factor);
    const lightG = Math.round(g + (255 - g) * factor);
    const lightB = Math.round(b + (255 - b) * factor);
    return `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;
  }
}

/**
 * Predefined course color palette with accessible contrast
 */
export const COURSE_COLOR_PALETTE = [
  "#60A5FA", // Light Blue
  "#34D399", // Light Emerald
  "#A78BFA", // Light Violet
  "#FBBF24", // Light Amber
  "#F87171", // Light Red
  "#22D3EE", // Light Cyan
  "#A3E635", // Light Lime
  "#FB923C", // Light Orange
  "#F472B6", // Light Pink
  "#818CF8", // Light Indigo
  "#C084FC", // Light Purple
  "#4ADE80", // Light Green
];

/**
 * Get a random color from the predefined palette
 * @returns Hex color string
 */
export function getRandomCourseColor(): string {
  return COURSE_COLOR_PALETTE[Math.floor(Math.random() * COURSE_COLOR_PALETTE.length)];
}
