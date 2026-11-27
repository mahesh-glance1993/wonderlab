---
name: Studio Calm
colors:
  surface: '#f9f9ff'
  surface-dim: '#d2daee'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e8eeff'
  surface-container-high: '#e0e8fd'
  surface-container-highest: '#dbe2f7'
  on-surface: '#141c2a'
  on-surface-variant: '#464554'
  inverse-surface: '#293140'
  inverse-on-surface: '#ecf0ff'
  outline: '#777585'
  outline-variant: '#c8c4d6'
  surface-tint: '#534cca'
  primary: '#25149f'
  on-primary: '#ffffff'
  primary-container: '#3e35b5'
  on-primary-container: '#b6b3ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#522900'
  on-tertiary: '#ffffff'
  tertiary-container: '#733c00'
  on-tertiary-container: '#ffa658'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#100069'
  on-primary-fixed-variant: '#3a30b1'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f9f9ff'
  on-background: '#141c2a'
  surface-variant: '#dbe2f7'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Outfit
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: 0em
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  title-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  gutter-desktop: 2rem
  margin: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system establishes an elevated, pedagogical studio aesthetic designed for focused learning, digital safety, and creative exploration. It spans nursery sensory exercises through class 10 physics laboratories, requiring an interface that rejects overstimulating primary-colored gamification while avoiding dry institutional sterility.

The style unites structured minimalism with soft, tactile warmth. The emotional landscape is orderly, encouraging, and clear. Visual elements prioritize high signal-to-noise ratios, generous negative space, intentional hierarchy, and gentle, supportive tactile feedback that invites both young hands and discerning parents.

## Colors

The palette balances a focused, scholastic indigo primary with balanced curricular functional accents and warm, low-glare neutrals. 

- **Primary (`#3E35B5`):** The foundational anchor for focal actions, key interfaces, and brand focus.
- **Secondary (`#0D9488`):** Allocated to mathematics, logic, and scientific precision modules.
- **Tertiary (`#D97706`):** Dedicated to tactile labs, discovery, and practical experimentation.
- **Neutral (`#505869`):** A slate-infused neutral providing high-contrast clarity against soft backgrounds.

### Auxiliary Learning Spaces
- **Creative & Expression:** `#8B5CF6` (Creative Arts)
- **Play & Cognitive Skill:** `#E06352` (Interactive Games)
- **Metrics & Milestone:** `#0284C7` (Progress)
- **Reference & Offline:** `#64748B` (Library & Downloads)

Surfaces prioritize comfort over pure white brilliance. The default canvas rests on `#F6F7FC`, interactive surfaces on pure `#FFFFFF`, and structural inset wells on `#EEF0F8`. Text hierarchy enforces strict WCAG AA contrast against every surface layer.

## Typography

The type scale pairs the structured geometric openness of Outfit for titles and signposts with the humanistic, legible warmth of Be Vietnam Pro for prolonged instructional reading and interface operations.

- **Headlines & Titles:** Outfit provides geometric balance, friendly round counter-forms, and clear structural cadence.
- **Longform & System Text:** Be Vietnam Pro guarantees strong character distinction, robust rendering across low-DPI displays, and natural flow for bilingual interfaces.
- **Multilingual Support:** When rendering Indic or regional scripts (such as Telugu), line-height tokens automatically expand by 25% across body and headline levels to prevent clipping of ascending, descending, or conjunct markers.

## Layout & Spacing

The layout is built around a predictable 12-column responsive fluid grid designed to keep interactive targets large and instructional materials legible across handheld tablets, desktops, and small mobile phones.

- **Breakpoints:**
  - `Mobile` (< 640px): 4-column system, `margin-mobile` (16px), full-width card interactions, minimum 48px touch targets.
  - `Tablet` (640px – 1024px): 8-column system, standard `gutter` (24px), split-screen visual-to-tool workspace ratios.
  - `Desktop` (> 1024px): 12-column system, maximum container bounds of 1280px to protect line-length comfort (optimal 60–75 characters).

Component padding strictly aligns to the 4px baseline rhythm (`space-xs` through `space-xl`). Dense layouts are avoided; negative space serves as functional breathing room to reduce cognitive fatigue during prolonged study sessions.

## Elevation & Depth

Visual hierarchy is communicated through structural tonal layering supported by soft, colored ambient shadows. Hard drop-shadows and aggressive borders are eliminated to maintain visual calmness.

- **Ground Level (Base Canvas):** Light soft-tint slate (`#F6F7FC`). Everything rests on this un-elevated foundation.
- **Level 1 (Card & Module Layer):** Pure white (`#FFFFFF`) with a hairline border (`1px solid rgba(80, 88, 105, 0.08)`) and an ambient shadow: `0 4px 20px -2px rgba(62, 53, 181, 0.04)`.
- **Level 2 (Active & Floating Modules):** Interactive elements, active lesson palettes, and selected tiles float higher with: `0 10px 28px -4px rgba(62, 53, 181, 0.08)`.
- **Level 3 (Modals & Parent Gates):** Dialog overlays utilize a low-blur scrim backdrop (`rgba(29, 37, 64, 0.4)` paired with `backdrop-filter: blur(4px)`) and a grounded ambient shadow: `0 20px 40px -8px rgba(29, 37, 64, 0.16)`.
- **Inset Recesses (Workspaces & Canvas Fields):** Constructed with background `#EEF0F8` and an inner shadow `inset 0 2px 4px rgba(29, 37, 64, 0.04)` to visually anchor drawing canvases and experimental scratchpads into the surface.

## Shapes

The interface embraces a disciplined `rounded-2` geometry. The standard 0.5rem (8px) to 1rem (16px) curvature strikes an intentional balance: approachable and forgiving for younger students, yet crisp and structured enough for secondary school disciplines.

- Standard buttons, input frames, and interactive chips use `0.5rem` (8px).
- Learning cards, task panels, and container dialogs use `1rem` (16px).
- Floating toolbars, audio controls, and modal enclosures scale to `1.5rem` (24px).
- Micro-indicators, notification badges, and quick-toggle state tags retain full pill profiles (`9999px`).

## Components

### Buttons
- **Primary:** Background `#3E35B5`, text `#FFFFFF`, border-radius 8px (`rounded-md`), minimum height 48px. Resting state contains zero sharp shadow; active state depresses subtly by 1px with increased color saturation.
- **Secondary / Ghost:** Surface `#EEF0F8` or transparent with a 1.5px border of `rgba(62, 53, 181, 0.2)`. Text is `#3E35B5`.
- **Destructive / Exit:** Soft coral tint background with muted maroon label; avoids alarming red sirens.

### Subject Chips & Badges
- Compact indicators combining a subtle tonal tint (12% opacity of subject color) with high-contrast text matching the subject token.
- Radii set to `9999px` (pill) with 6px vertical and 12px horizontal padding.

### Cards
- Surface `#FFFFFF`, border-radius 16px (`rounded-lg`), bounded by a subtle outline `rgba(80, 88, 105, 0.08)`.
- Cards never show unprompted decorative artifice; pedagogical content fills the header, while practical metadata sits in a distinct footer divider.

### Inputs & Parental Gates
- **Form Inputs:** Resting surface `#FFFFFF`, 1.5px border `rgba(80, 88, 105, 0.2)`, focus state triggers a clean 2px `#3E35B5` outline with no outer fuzzy glow.
- **Parental Gate Dialogue:** Clean, focused modal challenge using high-contrast mathematical or linguistic verification steps. Uses Level 3 elevation, devoid of third-party ads or external distraction links.

### Lists & Activity Trackers
- Divided by a 1px soft seam `#EEF0F8`.
- List rows feature tactile hover transitions with `#F6F7FC` background shifts, rounded inner corners (8px), and generous tap targets (> 48px) suited for touch interfaces.

### Audio & Multimedia Controllers
- Dedicated pill-shaped float bars with clear icon buttons, persistent play/pause toggle states, and clean progress tracks using the primary or subject-specific color token.