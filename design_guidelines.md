# Design Guidelines: TechInfoPlanet Image Toolkit

## Design Approach
**System**: Modern SaaS-inspired design drawing from Linear's precision, Notion's clarity, and Figma's tool-focused interface. Clean, professional aesthetic that emphasizes functionality while maintaining visual sophistication.

## Typography

**Font Families** (Google Fonts):
- Primary: Inter (headings, UI elements, body text)
- Monospace: JetBrains Mono (file sizes, technical specs)

**Hierarchy**:
- Hero H1: text-5xl md:text-6xl, font-bold
- Section H2: text-3xl md:text-4xl, font-semibold
- Tool Cards H3: text-xl, font-semibold
- Body: text-base, regular (400)
- Small/Meta: text-sm, medium (500)

## Layout System

**Spacing Scale**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
**Container Strategy**: 
- Full-width sections with inner max-w-7xl mx-auto px-6 md:px-8
- Content areas: max-w-4xl for reading comfort
- Tool interfaces: max-w-6xl for working space

## Component Library

### Navigation
Fixed header with logo left, nav links center, theme toggle + CTA right. Height: h-16. Backdrop blur effect when scrolled.

### Hero Section
**Layout**: Two-column on desktop (60/40 split), stacked on mobile
**Left Column**: 
- H1 with gradient text treatment
- H2 supporting text
- Large drag-and-drop upload zone with dashed border, hover state
- Quick tool selector (3 icon buttons in row)
**Right Column**: 
- Hero illustration/graphic showing image optimization concept (compressed file visualization, before/after imagery)
- No photo required - use custom SVG illustration or abstract graphic representing image processing

**Upload Zone Specifications**:
- Min height: 320px on desktop, 240px mobile
- Dashed border (border-2 border-dashed), rounded corners (rounded-2xl)
- Hover: subtle scale transform, enhanced border
- Icon: Large upload icon (96px) with instructional text below
- Drag-active state: distinct visual feedback

### Featured Tools Grid
**Layout**: 3-column grid on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3), gap-6
**Tool Cards**:
- White/dark surface with subtle border
- Padding: p-6
- Icon at top (64px, using Font Awesome)
- Tool name (H3)
- 2-line description
- "Start Tool" button (full-width, secondary style)
- Hover: lift effect (shadow-lg transform)

### Trust & Security Section
**Layout**: 3-column grid with icon + text cards
**Card Structure**:
- Icon (48px) centered above text
- Headline (font-semibold)
- Supporting paragraph (text-sm)
- Minimal padding, emphasis on clarity

### How It Works
**Layout**: Horizontal 3-step timeline on desktop, vertical on mobile
**Step Cards**:
- Numbered badge (large circular badge with step number)
- Step title (font-semibold, text-lg)
- Brief description
- Visual connector line between steps (hidden on mobile)

### Tool Interface Pages
**Consistent Structure**:
- Tool header with breadcrumb navigation
- Primary action area (upload zone or canvas)
- Control panel sidebar (right side on desktop, below on mobile)
- Settings as cards with clear labels
- Before/after comparison view for processed images
- Download button (large, prominent, primary color)

### Footer
**Layout**: 4-column grid on desktop, stacked on mobile
- Column 1: Brand + tagline
- Column 2-3: Link groups
- Column 4: Newsletter signup (if applicable)
- Bottom bar: Copyright + social links

## Key UI Patterns

**Buttons**:
- Primary: Solid fill, medium weight text, px-6 py-3, rounded-lg
- Secondary: Border with transparent fill, same padding
- Icon buttons: Square (p-3), rounded-lg

**Input Fields**:
- Border style, rounded-lg, px-4 py-2.5
- Focus: ring treatment
- Labels above inputs, helper text below

**Cards**:
- Consistent border radius: rounded-xl or rounded-2xl
- Subtle borders, avoid heavy shadows except on hover
- Internal padding: p-6 or p-8 for larger cards

**Icons**: Font Awesome (CDN), 24px standard size, 48-64px for features

## Dark Mode Strategy
Toggle in header. Implement with CSS custom properties for smooth transitions. Dark mode uses near-black backgrounds (#0a0a0a) with lighter UI elements, maintaining WCAG AAA contrast ratios.

## Animations
**Minimal & Purposeful**:
- Upload zone: Subtle bounce on drag-over
- Tool cards: Gentle lift on hover (transform: translateY(-4px))
- Page transitions: Fade-in for tool switching (200ms)
- Avoid scroll-based animations

## Images
**No hero photograph required**. Use:
- Custom SVG illustrations for hero (image compression visualization)
- Icon-based design throughout
- Placeholder image previews in tool interfaces
- Tool icons from Font Awesome

## Accessibility
- High contrast mode support
- All interactive elements keyboard-accessible
- Skip navigation link
- ARIA labels for icon-only buttons
- Focus indicators (ring-2 ring-offset-2)
- Minimum touch targets: 44x44px

This design prioritizes clarity, speed, and professional utility while maintaining modern visual appeal suitable for a SaaS productivity tool.