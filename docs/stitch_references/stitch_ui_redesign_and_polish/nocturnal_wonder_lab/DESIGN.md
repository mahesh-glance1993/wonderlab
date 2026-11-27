---
name: Nocturnal Wonder Lab
colors:
  surface: '#0e1321'
  surface-dim: '#0e1321'
  surface-bright: '#343948'
  surface-container-lowest: '#090e1b'
  surface-container-low: '#161b29'
  surface-container: '#1a1f2e'
  surface-container-high: '#252a38'
  surface-container-highest: '#2f3444'
  on-surface: '#dee2f6'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#dee2f6'
  inverse-on-surface: '#2b303f'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#ffafd3'
  on-tertiary: '#620040'
  tertiary-container: '#e364a7'
  on-tertiary-container: '#560038'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#ffd8e7'
  tertiary-fixed-dim: '#ffafd3'
  on-tertiary-fixed: '#3d0026'
  on-tertiary-fixed-variant: '#85145a'
  background: '#0e1321'
  on-background: '#dee2f6'
  surface-variant: '#2f3444'
typography:
  display-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 38px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
  headline-md:
    fontFamily: Bricolage Grotesque
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Bricolage Grotesque
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Outfit
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  margin-lg: 4rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system is tailored for nocturnal study, exploratory research, and focused late-night discovery. The visual tone balances the rigor of an observatory instrument with the organic, welcoming softness of a midnight sanctuary. It evokes a tactile, curiosity-fueled laboratory where learning feels calm, restorative, and unbounded by daytime urgency.

The aesthetic fuses experimental organic curvature with deep-space glass and illuminated optical layers. Expressive, buoyant headlines establish a sense of discovery, while pillowed container contours absorb ambient contrast to prevent visual fatigue. Surfaces recede into rich astronomical voids, allowing luminous indicators, soft astral blurs, and tactile interactive nodes to guide the eye effortlessly in pitch-dark environments.

## Colors

The palette establishes an ultra-low glare, high-legibility spectrum calibrated strictly for low-lux conditions. It avoids pure white emissions and stark pitch blacks in favor of deep spectral navy tones and bioluminescent accents.

### Surface Hierarchy
- **Canvas Base (`#0F1422`)**: The foundational midnight bedrock for root views.
- **Surface Dim (`#0B0E17`)**: Recessed backdrop for deep viewwells and shell framing.
- **Surface Container Lowest (`#151B2E`)**: Recessed panels, inset controls, and inactive tool trays.
- **Surface Container (`#1B2238`)**: Standard card plane and floating panel background.
- **Surface Container High (`#242D4A`)**: Elevated flyouts, active modal surfaces, and hover states.

### Core Accents
- **Primary Indigo / Violet (`#8B5CF6`)**: The primary vehicle for focus rings, luminous keyframes, and hero interactive components.
- **Secondary Cyan (`#38BDF8`)**: Telemetry badges, auxiliary data points, and active exploratory tags.
- **Tertiary Starlight Rose (`#F472B6`)**: Special curiosity callouts, bookmarks, and discovery highlights.

### Content & Functional Tones
- **Text High (`#EAEFFC`)**: Primary headings and critical reading text, softened to prevent retina burn-in.
- **Text Muted (`#9BA8C7`)**: Secondary labels, metadata, and structural microcopy.
- **Success (`#4ADE80`)**: Gentle phosphor green for verified milestones and correct answers.
- **Warning (`#FBBF24`)**: Warm amber for non-blocking cautions and time counters.
- **Error (`#F87171`)**: Softened coral red, avoiding jarring harsh alerts.

## Typography

The type scale combines the whimsical, idiosyncratic curves of Bricolage Grotesque with the ultra-clean, balanced proportions of Outfit.

- **Bricolage Grotesque** is deployed exclusively across display tiers, module titles, and celebratory milestones. Its intentional ink-traps and warm flares introduce an eccentric, astronomical laboratory personality without sacrificing scan speed.
- **Outfit** carries all body reading, data tables, and input controls. With its open counters, circular geometry, and wide tracking capacity, it ensures fatigue-free reading during prolonged sessions in dark environments.
- Mobile variants step down in size while maintaining generous line-height ratios (1.2 to 1.35) to guard against claustrophobic line collision on small viewports.

## Layout & Spacing

The layout model is built on an adaptive, fluid column matrix surrounded by breathing room to keep learning interfaces uncluttered.

- **Desktop (>= 1200px)**: 12-column layout with 24px (`gutter`) column separation and 64px (`margin-lg`) canvas padding. Content spans dynamic clusters (e.g., 8-column workspace with a 4-column reference drawer).
- **Tablet (768px - 1199px)**: 8-column layout with 24px (`gutter`) separation and 32px (`margin`) outer margins. Drawers collapse to overlay sheets.
- **Mobile (< 768px)**: 4-column layout with 16px (`gutter-sm`) separation and 16px (`margin-sm`) edge margins. Stacks vertically into distinct card bubbles.

Vertical spacing relies heavily on `space-lg` (24px) between related modules and `space-xl` (40px) between major topical shifts. Interactive elements maintain an internal padding rhythm of `space-sm` (vertical) and `space-md` (horizontal) to preserve tactile targets.

## Elevation & Depth

Visual hierarchy is constructed through tonal nesting, subtle optical luminance, and diffused chromatic glows rather than heavy, cast drop shadows.

- **Subsurface Depth**: Primary views sit upon `#0F1422`. Embedded work surfaces or inset code blocks step down to `#151B2E` with an inner border of `rgba(255, 255, 255, 0.03)`.
- **Card Tiers**: Floating cards use `#1B2238` paired with a delicate top edge highlight (`rgba(234, 239, 252, 0.08)`) and a low-frequency ambient violet bloom: `0 12px 32px -8px rgba(139, 92, 246, 0.08)`.
- **Overlays & Drawers**: Modals utilize `#242D4A` complemented by a 16px backdrop blur (`backdrop-filter: blur(16px)`) over an alpha-dim layer of `#0B0E17` at 70% opacity.
- **Luminescent Proximity**: Interactive elements emit gentle, localized glows on focus or hover (`0 0 16px rgba(139, 92, 246, 0.35)`), creating a feeling of energized instruments without harsh point-light sources.

## Shapes

The design system adopts an exaggerated, pillowed geometry (Level 3 Pill-shaped) to reinforce its tactile, safe, late-night atmosphere. Rigid corners are systematically eliminated to avoid visual sharpness that strains tired eyes.

- **Base Radius (`1rem` / 16px)**: Applied to input elements, list cards, chip groups, and compact controls.
- **Large Radius (`rounded-lg`, `2rem` / 32px)**: Applied to content modules, hero lesson cards, and interactive canvas panes.
- **Extra Large Radius (`rounded-xl`, `3rem` / 48px)**: Applied to modal sheets, floating dock navbars, and curiosity hubs.
- **Full Pill (`9999px`)**: Standard for all action buttons, status pills, slider thumbs, and tool triggers.

## Components

### Buttons
- **Primary**: Full pill radius (`9999px`), `#8B5CF6` background, `#EAEFFC` text. Hover shifts to `#7C3AED` with an ethereal ring glow (`0 0 14px rgba(139, 92, 246, 0.4)`).
- **Secondary**: Full pill, surface `#1B2238`, surrounded by a 1px border of `rgba(155, 168, 199, 0.2)`. Hover triggers border transition to `#8B5CF6` with `#EAEFFC` foreground.
- **Ghost**: Transparent backdrop, `#9BA8C7` text, transitioning to `#151B2E` on hover with pillowed `1rem` radius.

### Input Fields
- Built with a `1rem` radius container in `#151B2E`.
- Border is a soft 1px tone (`rgba(155, 168, 199, 0.15)`).
- Placeholder uses `#9BA8C7` at 60% opacity.
- Active/focus state transforms the border to `#8B5CF6` accompanied by an ambient ring: `0 0 0 3px rgba(139, 92, 246, 0.25)`.

### Chips & Badges
- Fully rounded pills (`9999px`) with padding `0.25rem 0.75rem`.
- Inactive: Background `#151B2E`, text `#9BA8C7`.
- Selected / Active: Background `rgba(139, 92, 246, 0.15)`, border `1px solid #8B5CF6`, text `#EAEFFC`.
- Indicator Chips (e.g., "Lab Session Active"): Feature a pulsing 6px circular dot using `#4ADE80` with a gentle radial haze.

### Cards & Study Pods
- Background uses `#1B2238` with `rounded-lg` (32px).
- Bounded by a micro-border of `rgba(234, 239, 252, 0.05)`.
- Internal layout maintains `space-lg` (24px) padding.
- Interactive cards elevate smoothly on hover via `-2px` vertical translation and an enhanced aura (`0 16px 36px -6px rgba(139, 92, 246, 0.12)`).

### Selection Controls (Checkboxes & Radios)
- Checkboxes feature soft squircle shapes (`0.5rem` radius), while Radios are circular.
- Unchecked: `#151B2E` body with a 1.5px border of `#9BA8C7` at 40% opacity.
- Checked: `#8B5CF6` fill with an `#EAEFFC` glyph, encircled by a faint violet mist.

### Lists & Activity Feeds
- List items reside inside `#1B2238` containers separated by `space-sm` (8px) gaps rather than solid dividing lines.
- Each item displays rounded `1rem` corners, turning to `#242D4A` upon selection or keyboard focus.

### Night-Lab Specific: Glowing Audio & Focus Timers
- Circular focus pods with ambient perimeter ring gauges rendered in `#8B5CF6` and `#38BDF8`.
- Backed by an ultra-soft radial backdrop dispersion to simulate a gentle observatory console.