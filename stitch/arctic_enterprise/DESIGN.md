---
name: Arctic Enterprise
colors:
  surface: '#fbfbdc'
  surface-dim: '#dcdcbe'
  surface-bright: '#fbfbdc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f6d6'
  surface-container: '#f0f0d1'
  surface-container-high: '#eaeacb'
  surface-container-highest: '#e4e4c6'
  on-surface: '#1b1d0a'
  on-surface-variant: '#43474f'
  inverse-surface: '#30321d'
  inverse-on-surface: '#f3f3d3'
  outline: '#74777f'
  outline-variant: '#c4c6d0'
  surface-tint: '#445f8b'
  primary: '#001736'
  on-primary: '#ffffff'
  primary-container: '#0c2c55'
  on-primary-container: '#7a94c3'
  inverse-primary: '#adc7f9'
  secondary: '#2c6577'
  on-secondary: '#ffffff'
  secondary-container: '#b3ebff'
  on-secondary-container: '#336c7d'
  tertiary: '#001b20'
  on-tertiary: '#ffffff'
  tertiary-container: '#003139'
  on-tertiary-container: '#5f9caa'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#adc7f9'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#2c4771'
  secondary-fixed: '#b3ebff'
  secondary-fixed-dim: '#97cfe2'
  on-secondary-fixed: '#001f27'
  on-secondary-fixed-variant: '#094d5e'
  tertiary-fixed: '#afecfc'
  tertiary-fixed-dim: '#93d0df'
  on-tertiary-fixed: '#001f25'
  on-tertiary-fixed-variant: '#004e5b'
  background: '#fbfbdc'
  on-background: '#1b1d0a'
  surface-variant: '#e4e4c6'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system is built for a high-stakes enterprise environment where clarity, intelligence, and reliability are paramount. The brand personality is "Cold Winter Technology"—it leverages a sophisticated, icy palette to evoke a sense of calm, focused precision. By blending **Minimalism** with subtle **Glassmorphism**, the UI achieves a premium, multi-layered depth that feels both cutting-edge and established.

The emotional response should be one of "effortless command." Users should feel like they are interacting with an advanced, quiet intelligence that handles complex data processing without visual noise. Generous white space (or "cool space") ensures that the AI's insights remain the focal point, while high-quality typography conveys authority.

## Colors

The palette is anchored by "Deep Navy" (#0C2C55) to provide enterprise-grade stability. The "Warm Beige" (#EDEDCE) functions as a sophisticated, parchment-like background for light mode, providing a softer alternative to pure white that reduces eye strain during long analytical sessions.

The "Sea Green Blue" and "Muted Sky Blue" are used for interactive elements and data visualization, creating a "cool" spectrum that feels technologically advanced. For dark mode or high-focus AI interfaces, the "Dark Background" and "Dark Card" tokens create a deep, immersive environment where the cyan-leaning accents can truly glow. Gradients should be used sparingly for hero sections, primary actions, or to signify active AI processing states.

## Typography

This design system utilizes **Inter** for its exceptional legibility and systematic, neutral character. The scale is designed for high-density information environments.

Headlines use tighter letter spacing and heavier weights to maintain a strong presence against the generous white space. Labels are often used in uppercase with slight tracking to differentiate them from body copy in data-heavy tables and sidebars. For reading-heavy AI responses, the `body-lg` setting provides the optimal line height for sustained focus.

## Layout & Spacing

The layout follows a **Fluid Grid** model based on a 12-column system for desktop. However, the system prioritizes "Safe Zones"—areas of intentional emptiness that prevent the interface from feeling cluttered.

- **Desktop:** 12 columns, 24px gutters, 40px outer margins.
- **Sidebar:** Fixed width at 280px to ensure consistent navigation access.
- **Content Max-Width:** The main reading/chat area should be capped at 900px to maintain line-length readability, even if the container is wider.
- **Rhythm:** All spacing is a multiple of the 4px base unit, ensuring a mathematical harmony across all components.

## Elevation & Depth

Visual hierarchy is established through **Glassmorphism** and **Tonal Layering**. Instead of traditional, heavy shadows, this design system uses:

1.  **Backdrop Blurs:** Surfaces (like sidebars and navbars) use a 20px-30px Gaussian blur with a semi-transparent fill of the background color (approx. 80% opacity).
2.  **Inner Glows:** To simulate "frozen" edges, use a 1px white or light-blue inner border (opacity 10-20%) on cards.
3.  **Soft Ambient Shadows:** For floating elements like menus or active chat bubbles, use ultra-diffused shadows (`box-shadow: 0 12px 40px rgba(12, 44, 85, 0.08)`).
4.  **Z-Index Tiers:**
    - `Level 0`: Base Background (#EDEDCE).
    - `Level 1`: Content Cards (Pure white or #102E55 in dark mode).
    - `Level 2`: Navigation and Fixed Elements (Glassmorphic).
    - `Level 3`: Modals and Overlays (Soft Shadow).

## Shapes

The design system uses a **Rounded** language (Role 2) to soften the "cold" tech aesthetic, making the AI feel approachable and modern. 

- **Standard Components:** Buttons, inputs, and small cards use a 12px (`rounded-md`) radius.
- **Large Containers:** Content cards, source citation panels, and sidebars use a 16px (`rounded-lg`) radius.
- **Chat Bubbles:** Use 16px radius, with the corner closest to the sender sharpened to 4px to indicate direction.
- **Search Bars:** Use a fully rounded pill shape (`rounded-full`) to differentiate "Input/Search" from "Structural Cards."

## Components

### Sidebar & Navbar
The navigation is fixed and glassmorphic. The sidebar uses active state indicators consisting of a 4px vertical bar in the Primary Gradient and a subtle background tint (#629FAD at 10% opacity).

### Buttons
- **Primary:** Primary Gradient background, white text, 12px radius.
- **Secondary:** Transparent background with a 1px border of #296374, text in #0C2C55.
- **Tertiary/Ghost:** No border, text in #296374, background appears on hover at 5% opacity.

### Chat Bubbles
AI responses are styled as "Level 1" cards (white/navy) with a subtle #629FAD left-border accent. User messages are simplified with a light-grey or #296374 background to clearly distinguish roles.

### Source Citation Cards
Small, compact cards used within the chat or in a side-panel. They feature a 12px radius, `label-md` typography, and a small icon indicating the document type (PDF, Doc, Web).

### Analytics Cards
These use "Level 1" elevation. Headlines are `headline-sm`. Data points use the Primary Gradient for sparks or progress bars to draw the eye to key metrics.

### Forms & Tables
Table headers use `label-lg` with a subtle #EDEDCE background (in light mode). Form inputs use a 1px #629FAD border when focused, accompanied by a soft blue outer glow.