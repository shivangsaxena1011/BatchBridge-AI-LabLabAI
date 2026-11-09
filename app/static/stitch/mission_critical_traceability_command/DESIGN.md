---
name: Mission-Critical Traceability Command
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353942'
  surface-container-lowest: '#0a0e16'
  surface-container-low: '#181c24'
  surface-container: '#1c2028'
  surface-container-high: '#262a33'
  surface-container-highest: '#31353e'
  on-surface: '#dfe2ee'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dfe2ee'
  inverse-on-surface: '#2c3039'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#4cd7f6'
  on-tertiary: '#003640'
  tertiary-container: '#009eb9'
  on-tertiary-container: '#002f38'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#0f131c'
  on-background: '#dfe2ee'
  surface-variant: '#31353e'
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  display-xl-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-mono-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
  label-mono-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-compact: 0.5rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes a high-stakes, operational intelligence interface tailored for food safety directors, supply chain auditors, and regulatory incident response teams. The visual style merges **mission-critical technical precision** with **modern dark-mode command center ergonomics**. It rejects decorative fluff in favor of immediate situational awareness, ultra-dense information architecture, and decisive status differentiation under pressure.

The UI evokes unyielding reliability, rapid incident isolation, and definitive regulatory compliance. High-contrast indicators cut through dense, slate-tiered layers to guide the human eye instantly to critical food safety hazards, active recalls, and AI-predicted contamination vectors.

## Colors

The palette is engineered around high visual contrast in extreme operational environments, employing calibrated status accents against deep slate and charcoal backdrops.

### Surface System
- **Canvas Base (`#0b0f17`)**: The deep navy/slate operational floor. Provides maximum optical comfort during round-the-clock shift monitoring.
- **Card Surface Level 1 (`#131b2a`)**: Primary structural containment for tables, telemetry panels, and batch dossiers.
- **Card Surface Level 2 / Hover (`#1a2438`)**: Elevated panels, popovers, nested sub-modules, and row-hover states.
- **Border / Structural Grid (`#26354f`)**: Crisp boundary lines that preserve micro-grid clarity across dense displays.

### Operational Accents & Status Roles
- **Hazard / Active Recall Crimson (`#ef4444`, hover `#dc2626`)**: Reserved exclusively for Class I/II contaminations, biological hazards, urgent recalls, and quarantine locks.
- **Investigation Amber (`#f59e0b`)**: Root-cause analysis underway, sensor threshold deviations, holding holds, and customs inspections.
- **Verified Safe Emerald (`#10b981`)**: Complete supply chain chain-of-custody clearance, microbiological sign-offs, and compliance verification.
- **Active / Telemetry Blue (`#3b82f6`)**: Primary actionable interactive states, cold-chain in-transit tracking, and neutral pipeline telemetry.
- **AI Intelligence & Synthesis (`#8b5cf6`, secondary highlight `#06b6d4`)**: Automated supplier risk scoring, cross-batch anomaly detection, and predictive contamination vectors.

## Typography

Typography establishes an unambiguous dichotomy between qualitative narrative analysis and technical audit data. 

- **Primary Interface (Inter)**: Handles dashboard hierarchies, incident descriptions, action menus, and workflow copy with clean, neutral legibility.
- **Audit & Telemetry (JetBrains Mono)**: Mandatory for all Lot Identifiers, Global Location Numbers (GLN), cryptographic provenance hashes, RFC3339 timestamps, temperature readings, and regulatory tracking codes. Monospaced tabular alignment guarantees vertical scanning efficiency in high-density data grids.

## Layout & Spacing

The layout philosophy follows a high-density, **12-column fluid grid** engineered for data-intensive command consoles with fixed operational sidebars and collapsible investigation drawers.

- **Desktop (1440px+)**: 12-column grid, `1.5rem` margins, `1rem` gutters. Multi-pane layouts support simultaneous batch lineage tree navigation and live telemetry feeds.
- **Tablet (768px - 1439px)**: 8-column grid, `1rem` margins, `1rem` gutters. Side panels collapse into layered flyouts.
- **Mobile (<768px)**: 4-column reflow, `1rem` margins, `0.5rem` gutters. Complex trees collapse into linear provenance cards with vertical stepper nodes.

Spacing within data tables and cards favors tight utility (`space-xs` and `space-sm`) to maximize visible rows per viewport without compromising click/tap boundaries.

## Elevation & Depth

This system avoids soft, floating skeuomorphic drop shadows. Instead, it relies on **tonal layered containment and low-contrast borders** to preserve a clean, instrumental aesthetic.

- **Level 0 (Floor)**: `#0b0f17` background with optional 1px grid pattern lines (`#162032`) in data visualization charts.
- **Level 1 (Card/Container)**: `#131b2a` with a 1px continuous outline in `#26354f`. No drop shadow.
- **Level 2 (Popovers, Flyouts, Selected Rows)**: `#1a2438` with a 1px border in `#3b82f6` (if active) or `#334769`.
- **Level 3 (Emergency Modals & Critical Overlays)**: Surface `#131b2a` with a sharp ambient halo: `0 0 0 1px #ef4444, 0 16px 32px -8px rgba(0, 0, 0, 0.7)`.

## Shapes

The design uses a compact, disciplined shape language (`0.25rem` / `4px` default radius). This creates an authoritative, hardware-grade finish appropriate for mission-critical software.

- **Micro Components (Badges, Status Tags, Data Inputs)**: 4px border radius.
- **Structural Modules (Cards, Visualizers, Tables)**: 6px to 8px border radius (`rounded-lg`).
- **Regulatory Severity Badges**: Squared compact tags with 2px corner bevels to project industrial compliance.

## Components

### Buttons
- **Hazard Action (e.g., "Issue Recall Lock")**: Solid `#ef4444` background, `#ffffff` text, bold weight, with immediate hover transition to `#dc2626`.
- **Primary Operational**: Solid `#3b82f6`, hover `#2563eb`, focused with an explicit 2px outer outline in `#93c5fd`.
- **Secondary / Technical**: `#131b2a` surface with `#26354f` border and `#e2e8f0` text. Hover shifts to `#1a2438` and border `#3b82f6`.
- **AI Agent Automation**: Subtle `#8b5cf6` tinted background (`rgba(139, 92, 246, 0.15)`) with a `#8b5cf6` border and `#c4b5fd` text.

### Compliance & Regulatory Badges
- **US FDA Class I / FSSAI Cat 1**: Heavy emergency badge; background `rgba(239, 68, 68, 0.15)`, text `#ef4444`, solid 1px border `#ef4444`. Includes hazard icon and monospace standard code.
- **US FDA Class II / FSSAI Cat 2**: Investigation badge; background `rgba(245, 158, 11, 0.15)`, text `#f59e0b`, border `#f59e0b`.
- **US FDA Class III / FSSAI Cat 3**: Advisory badge; background `rgba(59, 130, 246, 0.15)`, text `#60a5fa`, border `#3b82f6`.
- **Verified Compliant**: Background `rgba(16, 185, 129, 0.15)`, text `#10b981`, border `#10b981`.

### Data Tables & Traceability Lists
- Header: Sticky `#0b0f17` bar, all-caps `11px` JetBrains Mono text in `#64748b`.
- Rows: Zebra-free, separated by 1px `#1a2438` dividers. Row height is fixed at `40px` for high-density reading.
- Active Quarantine Row: Tinted with an inset 2px left border in `#ef4444` and background `rgba(239, 68, 68, 0.05)`.

### Form Inputs & Search Filters
- Background `#0b0f17`, border 1px `#26354f`, text `#f8fafc`. Placeholder text in `#475569`.
- Monospace mode automatically engages when typing identifiers matching prefix formats like `LOT-`, `GTIN-`, or `SSCC-`.
- Focus state: Border transitions to `#3b82f6` with zero fuzzy blur rings.

### Batch Dossier & Telemetry Cards
- Encapsulated containers with a structured sub-header for lot metadata, cold-chain temperature telemetry, and live geofence signals.
- Embedded telemetry charts use a `#06b6d4` line for nominal sensor metrics and `#ef4444` for threshold breaches.