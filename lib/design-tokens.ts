/**
 * SchedLume Design System Tokens
 *
 * This file defines the canonical spacing, sizing, and layout constants
 * for consistent UI across all screens and components.
 */

// =============================================================================
// SPACING SCALE (4px base, 8px primary)
// =============================================================================

export const SPACING = {
  /** 4px - Micro spacing for dense elements */
  xs: "4px", // 0.25rem / space-1
  /** 8px - Standard tight spacing */
  sm: "8px", // 0.5rem / space-2
  /** 12px - Compact spacing */
  md: "12px", // 0.75rem / space-3
  /** 16px - Default spacing */
  lg: "16px", // 1rem / space-4
  /** 20px - Comfortable spacing */
  xl: "20px", // 1.25rem / space-5
  /** 24px - Generous spacing */
  "2xl": "24px", // 1.5rem / space-6
  /** 32px - Section spacing */
  "3xl": "32px", // 2rem / space-8
  /** 40px - Large section spacing */
  "4xl": "40px", // 2.5rem / space-10
  /** 48px - Extra large spacing */
  "5xl": "48px", // 3rem / space-12
} as const;

// Tailwind class equivalents
export const SPACING_CLASSES = {
  xs: "p-1", // 4px
  sm: "p-2", // 8px
  md: "p-3", // 12px
  lg: "p-4", // 16px
  xl: "p-5", // 20px
  "2xl": "p-6", // 24px
  "3xl": "p-8", // 32px
  "4xl": "p-10", // 40px
  "5xl": "p-12", // 48px
} as const;

// =============================================================================
// PAGE LAYOUT
// =============================================================================

export const PAGE_LAYOUT = {
  /** Maximum content width */
  maxWidth: "512px", // max-w-lg

  /** Horizontal padding on mobile */
  paddingXMobile: "16px", // px-4

  /** Horizontal padding on tablet+ */
  paddingXDesktop: "24px", // px-6

  /** Top padding (below header) */
  paddingTop: "16px", // pt-4

  /** Bottom padding (above nav) */
  paddingBottom: "24px", // pb-6

  /** Safe area for bottom nav */
  bottomNavHeight: "64px", // h-16

  /** Safe area padding (iOS notch, etc.) */
  safeAreaBottom: "env(safe-area-inset-bottom, 0px)",
} as const;

// =============================================================================
// COMPONENT SIZING
// =============================================================================

export const COMPONENT_SIZES = {
  // Header
  header: {
    height: "56px", // h-14
    paddingX: "16px", // px-4
  },

  // Bottom Navigation
  bottomNav: {
    height: "64px", // h-16
    iconSize: "24px", // w-6 h-6
    labelSize: "10px", // text-[10px]
    itemPaddingY: "8px", // py-2
  },

  // Date Strip
  dateStrip: {
    height: "72px", // h-18
    itemWidth: "48px", // w-12
    itemHeight: "64px", // h-16
    paddingX: "8px", // px-2
    paddingY: "12px", // py-3
    gap: "4px", // gap-1
  },

  // Class Card
  classCard: {
    paddingX: "16px", // px-4
    paddingY: "16px", // py-4
    borderRadius: "16px", // rounded-2xl
    borderLeftWidth: "4px", // border-l-4
    gap: "12px", // gap-3
    minHeight: "88px",
  },

  // Calendar Grid
  calendarGrid: {
    cellSize: "44px", // min touch target
    headerHeight: "32px",
    dayHeight: "48px",
  },

  // Modal
  modal: {
    headerHeight: "56px", // h-14
    paddingX: "16px", // px-4
    borderRadius: "16px", // rounded-2xl (desktop)
    maxWidth: "512px", // max-w-lg
  },

  // Buttons
  button: {
    sm: { height: "32px", paddingX: "12px", fontSize: "14px" },
    md: { height: "40px", paddingX: "16px", fontSize: "16px" },
    lg: { height: "48px", paddingX: "24px", fontSize: "18px" },
    borderRadius: "12px", // rounded-xl
  },

  // Form Inputs
  input: {
    height: "44px", // min touch target
    paddingX: "16px", // px-4
    paddingY: "12px", // py-3
    borderRadius: "12px", // rounded-xl
    fontSize: "16px", // prevent zoom on iOS
  },

  // Textarea
  textarea: {
    minHeight: "120px",
    paddingX: "16px",
    paddingY: "16px",
    borderRadius: "12px",
  },

  // Badge
  badge: {
    paddingX: "8px", // px-2
    paddingY: "2px", // py-0.5
    borderRadius: "9999px", // rounded-full
    fontSize: "12px", // text-xs
  },

  // Section Card
  sectionCard: {
    borderRadius: "16px", // rounded-2xl
    headerPadding: "16px", // p-4
    contentPadding: "16px", // p-4
  },
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const TYPOGRAPHY = {
  // Page titles
  pageTitle: {
    fontSize: "18px", // text-lg
    fontWeight: "600", // font-semibold
    lineHeight: "28px",
  },

  // Section headers
  sectionHeader: {
    fontSize: "16px", // text-base
    fontWeight: "600", // font-semibold
    lineHeight: "24px",
  },

  // Card titles
  cardTitle: {
    fontSize: "16px", // text-base
    fontWeight: "600", // font-semibold
    lineHeight: "24px",
  },

  // Body text
  body: {
    fontSize: "14px", // text-sm
    fontWeight: "400", // font-normal
    lineHeight: "20px",
  },

  // Small text
  small: {
    fontSize: "12px", // text-xs
    fontWeight: "400", // font-normal
    lineHeight: "16px",
  },

  // Labels
  label: {
    fontSize: "14px", // text-sm
    fontWeight: "500", // font-medium
    lineHeight: "20px",
  },
} as const;

// =============================================================================
// LAYOUT GAPS (between elements)
// =============================================================================

export const GAPS = {
  /** Gap between cards in a list */
  cardList: "12px", // gap-3 / space-y-3

  /** Gap between sections on a page */
  sectionList: "24px", // gap-6 / space-y-6

  /** Gap between form fields */
  formFields: "16px", // gap-4 / space-y-4

  /** Gap between inline elements */
  inline: "8px", // gap-2

  /** Gap between icon and text */
  iconText: "8px", // gap-2

  /** Gap between badge and content */
  badge: "4px", // gap-1
} as const;

// =============================================================================
// CSS CUSTOM PROPERTIES (for globals.css)
// =============================================================================

export const CSS_VARIABLES = `
  /* Spacing Scale */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;
  --spacing-3xl: 32px;
  --spacing-4xl: 40px;
  --spacing-5xl: 48px;
  
  /* Page Layout */
  --page-max-width: 512px;
  --page-padding-x: 16px;
  --page-padding-top: 16px;
  --page-padding-bottom: 24px;
  
  /* Component Heights */
  --header-height: 56px;
  --bottom-nav-height: 64px;
  --date-strip-height: 72px;
  --touch-target-min: 44px;
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
`;

// =============================================================================
// TAILWIND CLASS PRESETS
// =============================================================================

export const TAILWIND_PRESETS = {
  // Page container
  pageContainer: "max-w-lg mx-auto px-4 sm:px-6 pt-4 pb-6",

  // Card styles
  card: "bg-white rounded-2xl shadow-card",
  cardInteractive:
    "bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow",

  // Section card
  sectionCard: "bg-white rounded-2xl shadow-card overflow-hidden",
  sectionHeader: "p-4 border-b border-surface-200",
  sectionContent: "p-4",

  // List gaps
  cardList: "space-y-3",
  sectionList: "space-y-6",
  formFields: "space-y-4",

  // Button base
  buttonBase:
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",

  // Input base
  inputBase:
    "w-full h-11 px-4 text-base bg-surface-100 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all",

  // Textarea base
  textareaBase:
    "w-full min-h-[120px] p-4 text-base bg-surface-100 border border-transparent rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all",
} as const;
