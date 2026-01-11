# SchedLume Design System & Spacing Guide

## 1. Spacing Scale

Based on a 4px base unit, the app uses an 8px primary spacing scale:

| Token | Value | Tailwind | Use Cases                         |
| ----- | ----- | -------- | --------------------------------- |
| `xs`  | 4px   | `p-1`    | Tight gaps, badge padding         |
| `sm`  | 8px   | `p-2`    | Icon gaps, inline spacing         |
| `md`  | 12px  | `p-3`    | Card list gaps, compact spacing   |
| `lg`  | 16px  | `p-4`    | Standard padding, section padding |
| `xl`  | 20px  | `p-5`    | Comfortable component padding     |
| `2xl` | 24px  | `p-6`    | Section gaps, generous spacing    |
| `3xl` | 32px  | `p-8`    | Large section breaks              |
| `4xl` | 40px  | `p-10`   | Major layout divisions            |

## 2. Page Layout

### Mobile (< 640px)

- **Max content width**: 512px (`max-w-lg`)
- **Horizontal padding**: 16px (`px-4`)
- **Top padding**: 16px (`pt-4`)
- **Bottom padding**: 24px (`pb-6`)
- **Bottom nav clearance**: 96px (`pb-24`) + safe area

### Tablet/Desktop (≥ 640px)

- **Horizontal padding**: 24px (`px-6`)
- **Content remains max-w-lg centered**

### Safe Areas (iOS)

- Bottom nav includes: `pb-safe` using `env(safe-area-inset-bottom)`
- Main content includes extra bottom padding for nav clearance

## 3. Component Specifications

### Header

```
Height: 56px (h-14)
Padding: 0 16px (px-4)
Background: white/80 with backdrop blur
Border: 1px bottom, surface-200
Position: sticky top-0, z-30
```

### Bottom Navigation

```
Height: 64px (h-16) + safe area
Item min-width: 64px
Icon size: 24px (w-6 h-6)
Label size: 10px font-medium
Background: white/95 with backdrop blur
Border: 1px top, surface-200
Position: fixed bottom-0, z-40
```

### Date Strip

```
Height: ~72px
Item size: 48×64px (w-12 h-16)
Item gap: 6px (gap-1.5)
Side padding: 8px (px-2)
Vertical padding: 12px (py-3)
Nav button: 40×40px touch target
Position: sticky top-14, z-20
```

### Class Card

```
Padding: 16px all sides (p-4)
Border radius: 16px (rounded-2xl)
Border left: 4px solid [subject color]
Min height: ~88px (content dependent)
Shadow: shadow-card (2px 8px blur)
Gap between icon/text: 6px (gap-1.5)
Status badges gap: 4px (gap-1)
```

### Section Card (Settings)

```
Border radius: 16px (rounded-2xl)
Header padding: 16px (p-4)
Content padding: 16px (p-4)
Header border: 1px bottom, surface-200
Shadow: shadow-card
```

### Button Sizes

```
Small (sm):
  Height: 36px (h-9)
  Padding: 0 12px (px-3)
  Font: 14px (text-sm)

Medium (md):
  Height: 44px (h-11)
  Padding: 0 16px (px-4)
  Font: 16px (text-base)

Large (lg):
  Height: 48px (h-12)
  Padding: 0 24px (px-6)
  Font: 18px (text-lg)

All:
  Border radius: 12px (rounded-xl)
  Font weight: 500 (font-medium)
```

### Badge

```
Padding: 4px 10px (px-2.5 py-1)
Border radius: full (rounded-full)
Font: 12px medium (text-xs font-medium)
```

### Text Input

```
Height: 44px (h-11) - minimum touch target
Padding: 0 16px (px-4)
Font: 16px (prevents iOS zoom)
Border radius: 12px (rounded-xl)
Background: surface-100
Border: 1px transparent, primary-400 on focus
```

### Textarea (Notes)

```
Min height: 160px
Padding: 16px (p-4)
Font: 16px base
Line height: relaxed
Border radius: 12px (rounded-xl)
Resize: vertical
```

## 4. Layout Gaps

| Context          | Gap  | Tailwind    |
| ---------------- | ---- | ----------- |
| Cards in list    | 12px | `space-y-3` |
| Sections on page | 24px | `space-y-6` |
| Form fields      | 16px | `space-y-4` |
| Inline elements  | 8px  | `gap-2`     |
| Icon + text      | 6px  | `gap-1.5`   |
| Badges           | 4px  | `gap-1`     |

## 5. Typography

| Style          | Size | Weight | Line Height | Tailwind                  |
| -------------- | ---- | ------ | ----------- | ------------------------- |
| Page title     | 18px | 600    | 28px        | `text-lg font-semibold`   |
| Section header | 16px | 600    | 24px        | `text-base font-semibold` |
| Card title     | 16px | 600    | 24px        | `font-semibold`           |
| Body text      | 14px | 400    | 20px        | `text-sm`                 |
| Small/caption  | 12px | 400    | 16px        | `text-xs`                 |
| Label          | 14px | 500    | 20px        | `text-sm font-medium`     |

## 6. Color Usage

### Primary (Coral/Salmon)

- `primary-50`: Light backgrounds, hover states
- `primary-100`: Icon backgrounds
- `primary-400`: Primary buttons, selected states
- `primary-500`: Primary hover
- `primary-600`: Primary active

### Surface (Grays)

- `surface-50`: Pure white
- `surface-100`: Input backgrounds, subtle backgrounds
- `surface-200`: Borders, dividers, secondary buttons
- `surface-300`: Darker borders

### Semantic

- `green-*`: Added, success states
- `blue-*`: Modified/override states
- `amber-*`: Notes indicator, warning
- `red-*`: Canceled, danger, destructive

## 7. Touch Targets

All interactive elements maintain minimum 44px touch target:

- Buttons: h-9 minimum (36px) with adequate padding
- Nav items: 64×56px
- Date strip items: 48×64px
- Icon buttons: 40×40px minimum

## 8. Motion & Transitions

Standard transition:

```css
transition: all 0.2s ease;
/* or cubic-bezier(0.4, 0, 0.2, 1) for more natural feel */
```

Page enter animation:

```css
animation: fadeIn 0.2s ease-out;
```

Active press:

```css
transform: scale(0.98);
```

## 9. Z-Index Scale

| Layer         | Z-Index |
| ------------- | ------- |
| Date strip    | z-20    |
| Header        | z-30    |
| Bottom nav    | z-40    |
| Modal overlay | z-50    |
| Toast         | z-50    |

## 10. Responsive Breakpoints

Following Tailwind defaults:

- `sm`: 640px (tablet portrait)
- `md`: 768px (tablet landscape)
- `lg`: 1024px (desktop)

Primary breakpoint for padding changes: `sm` (640px)
