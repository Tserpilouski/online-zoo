# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

- `npm run dev` - Start Vite development server with hot module replacement
- `npm run build` - Build production bundle to `dist/`
- `npm run preview` - Preview production build locally

## Architecture

This is a vanilla HTML/CSS/JavaScript multi-page application (no frontend frameworks) built with Vite and SCSS.

### Multi-Page Structure

The site uses Vite's multi-page setup configured in `vite.config.js`:
- `index.html` - Root entry (redirects to landing)
- `pages/landing/` - Main landing page with hero, works, pets, animals, donation, feed, reviews sections
- `pages/zoos/` - Zoos listing
- `pages/map/` - Map/location page
- `pages/contact-us/` - Contact form

Each page has its own `index.html`, `script.js`, and `style.scss`.

### Styling Architecture

Global styles in `styles/`:
- `main.scss` - Entry point importing all partials
- `_variables.scss` - Colors, breakpoints, typography, spacing
- `_base.scss` - Global reset and defaults
- `_utilities.scss` - Typography utility classes (.h1, .h2, .h3, .text)
- `components/` - Reusable components (_header.scss, _buttons.scss, _footer.scss, _carousel.scss, _forms.scss)

Page-specific styles use `sections/` subdirectories with SCSS partials (e.g., `pages/landing/sections/_hero.scss`).

### Design Tokens

Colors: `$white`, `$black`, `$navy` (#20113d), `$orange` (#f58021), `$turquoise` (#00a092)

Breakpoints: `$breakpoint-sm` (640px), `$breakpoint-lg` (1200px), `$breakpoint-xl` (1920px)

Fonts: Montserrat (primary), Roboto (secondary) - loaded via Google Fonts in HTML

### Assets

- `assets/icons/` - SVG icons
- `assets/images/` - PNG images for animals and scenes
