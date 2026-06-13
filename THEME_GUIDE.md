# Da Nang Tourism Theme Guide

## Quick Theme Change

All theme colors are now centralized in `styles/globals.css`. To change the entire color scheme, simply update the CSS variables at the top of the file.

## Current Theme: Turquoise Waters

A soft, monochromatic turquoise palette inspired by Da Nang's coastal beauty.

### Color Variables Location
**File:** `styles/globals.css` (Lines 3-35)

### Color Palette

The theme uses 4 shades of turquoise/cyan (from lightest to darkest):

```css
#E3FDFD  /* Lightest - Backgrounds */
#CBF1F5  /* Light - Secondary backgrounds */
#A6E3E9  /* Medium - Accents and lighter elements */
#71C9CE  /* Darkest - Primary brand color, buttons */
```

### Primary Colors (Main Brand Color)

```css
--theme-primary: #71C9CE;        /* Darkest turquoise */
--theme-primary-dark: #5FB4BA;   /* Darker variant */
--theme-primary-light: #A6E3E9;  /* Medium turquoise */
```

**Used for:**
- Navigation logo
- Hero background gradients
- Tour card backgrounds
- Links and hover states
- Statistics numbers
- Primary buttons

### Secondary/Accent Colors

```css
--theme-accent: #A6E3E9;         /* Medium cyan */
--theme-accent-dark: #71C9CE;    /* Darker cyan */
--theme-accent-darker: #5FB4BA;  /* Darkest cyan */
```

**Used for:**
- All CTA buttons ("Book Now", "Plan My Trip", etc.)
- Button gradients
- Interactive elements

### Background Colors

```css
--theme-bg-light: #E3FDFD;       /* Lightest cyan */
--theme-bg-lighter: #CBF1F5;     /* Light cyan */
```

**Used for:**
- Section backgrounds
- Card backgrounds
- Alternating background colors

---

## How to Change Theme

### Option 1: Try Theme 2 - Tropical Sunset

Replace the color variables in `styles/globals.css` with:

```css
/* Primary Colors (Warm Pink/Coral) */
--theme-primary: #EC4899;        /* Pink 500 */
--theme-primary-dark: #DB2777;   /* Pink 600 */
--theme-primary-light: #F472B6;  /* Pink 400 */

/* Secondary Colors (Golden) */
--theme-accent: #FBBF24;         /* Amber 400 */
--theme-accent-dark: #F59E0B;    /* Amber 500 */
--theme-accent-darker: #D97706;  /* Amber 600 */

/* Tertiary (Teal) */
--theme-tertiary: #14B8A6;       /* Teal 500 */
--theme-tertiary-dark: #0D9488;  /* Teal 600 */

/* Background Tints */
--theme-bg-light: #FEF3C7;       /* Amber 50 */
--theme-bg-lighter: #FFEDD5;     /* Orange 50 */
--theme-bg-cyan: #CCFBF1;        /* Teal 100 */

/* Gradient Stops */
--gradient-hero-start: #EC4899;
--gradient-hero-mid: #F59E0B;
--gradient-hero-end: #FBBF24;

--gradient-cta-start: #FBBF24;
--gradient-cta-end: #F59E0B;
```

### Option 2: Try Theme 3 - Mountain & Sea

```css
/* Primary Colors (Blue) */
--theme-primary: #3B82F6;        /* Blue 500 */
--theme-primary-dark: #2563EB;   /* Blue 600 */
--theme-primary-light: #60A5FA;  /* Blue 400 */

/* Secondary Colors (Green) */
--theme-accent: #10B981;         /* Emerald 500 */
--theme-accent-dark: #059669;    /* Emerald 600 */
--theme-accent-darker: #047857;  /* Emerald 700 */

/* Tertiary (Cyan) */
--theme-tertiary: #06B6D4;       /* Cyan 500 */
--theme-tertiary-dark: #0891B2;  /* Cyan 600 */

/* Background Tints */
--theme-bg-light: #ECFDF5;       /* Emerald 50 */
--theme-bg-lighter: #D1FAE5;     /* Emerald 100 */
--theme-bg-cyan: #CFFAFE;        /* Cyan 100 */

/* Gradient Stops */
--gradient-hero-start: #3B82F6;
--gradient-hero-mid: #06B6D4;
--gradient-hero-end: #10B981;

--gradient-cta-start: #10B981;
--gradient-cta-end: #059669;
```

### Option 3: Try Theme 4 - Hoi An Lanterns (Warm)

```css
/* Primary Colors (Gold) */
--theme-primary: #F59E0B;        /* Amber 500 */
--theme-primary-dark: #D97706;   /* Amber 600 */
--theme-primary-light: #FBBF24;  /* Amber 400 */

/* Secondary Colors (Red) */
--theme-accent: #DC2626;         /* Red 600 */
--theme-accent-dark: #B91C1C;    /* Red 700 */
--theme-accent-darker: #991B1B;  /* Red 800 */

/* Tertiary (Green) */
--theme-tertiary: #16A34A;       /* Green 600 */
--theme-tertiary-dark: #15803D;  /* Green 700 */

/* Background Tints */
--theme-bg-light: #FFFBEB;       /* Amber 50 */
--theme-bg-lighter: #FEF3C7;     /* Amber 100 */
--theme-bg-cyan: #F0FDF4;        /* Green 50 */

/* Gradient Stops */
--gradient-hero-start: #DC2626;
--gradient-hero-mid: #F59E0B;
--gradient-hero-end: #FBBF24;

--gradient-cta-start: #F59E0B;
--gradient-cta-end: #EA580C;
```

### Option 4: Try Theme 5 - Modern Tropical (Fresh)

```css
/* Primary Colors (Turquoise) */
--theme-primary: #06B6D4;        /* Cyan 500 */
--theme-primary-dark: #0891B2;   /* Cyan 600 */
--theme-primary-light: #22D3EE;  /* Cyan 400 */

/* Secondary Colors (Coral/Orange) */
--theme-accent: #F97316;         /* Orange 500 */
--theme-accent-dark: #EA580C;    /* Orange 600 */
--theme-accent-darker: #C2410C;  /* Orange 700 */

/* Tertiary (Lime) */
--theme-tertiary: #84CC16;       /* Lime 500 */
--theme-tertiary-dark: #65A30D;  /* Lime 600 */

/* Background Tints */
--theme-bg-light: #F0FDFA;       /* Teal 50 */
--theme-bg-lighter: #CCFBF1;     /* Teal 100 */
--theme-bg-cyan: #ECFCCB;        /* Lime 50 */

/* Gradient Stops */
--gradient-hero-start: #06B6D4;
--gradient-hero-mid: #0891B2;
--gradient-hero-end: #0E7490;

--gradient-cta-start: #F97316;
--gradient-cta-end: #EA580C;
```

---

## Custom Theme

Want to create your own? Just replace the hex values with your preferred colors!

### Color Picker Tools:
- **Tailwind Colors:** https://tailwindcss.com/docs/customizing-colors
- **Coolors:** https://coolors.co/ (Generate palettes)
- **Adobe Color:** https://color.adobe.com/create/color-wheel

### Pro Tips:
1. **Keep contrast:** Ensure text is readable on backgrounds
2. **Limit colors:** 2-3 main colors max for clean design
3. **Test gradients:** Preview how colors blend together
4. **Mobile check:** View on different devices after changes

---

## CSS Classes Available

These are automatically applied throughout the site:

- `.theme-logo` - Logo gradient text
- `.theme-hero-bg` - Hero section background
- `.theme-btn-primary` - All CTA buttons
- `.theme-nav-link` - Navigation hover states
- `.theme-text-primary` - Primary text color
- `.theme-bg-gradient-light` - Light background sections
- `.theme-card-gradient` - Tour card backgrounds
- `.theme-day1-gradient`, `.theme-day2-gradient`, `.theme-day3-gradient` - Itinerary cards
- `.theme-stat-number` - Statistics numbers

---

## Need Help?

1. **Change won't apply?** Clear browser cache and hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. **Colors look off?** Make sure you updated both the main colors AND the gradient stops
3. **Want to test?** Change one variable at a time to see the effect

**File to edit:** `styles/globals.css` (Lines 3-35)

That's it! No need to touch the React components. 🎨

