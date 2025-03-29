# Touch Duel - Product Requirements Document

## Product Overview

**Touch Duel** is a two-player mobile browser game designed for competitive play on a single device. Players compete by tapping dots that appear on their half of the screen, with the faster player winning.

## Core Value Proposition
- Fast-paced gameplay (configurable match duration: 1-300 seconds)
- Immediate setup with minimal barriers to play
- Offline capability via PWA functionality
- Three distinct game modes for varied gameplay

## Game Mechanics

### Core Mechanics
- One dot appears at a time in each player's zone
- Tapping a dot awards one point
- Dots timeout and respawn if not tapped within 3 seconds
- Game ends after a predetermined time limit
- Higher score wins, ties are possible

### Game Modes
- **Classic**: Standard gameplay, one point per dot tapped
- **Penalty**: Missing the play area deducts one point
- **Mirror**: Dots appear in mirrored positions, first player to tap gets the point

### Customization Options
- Game duration: 10s, 30s, 45s, or custom (1-300s)
- Screen orientation: Horizontal (left/right) or Vertical (up/down)
- Accessibility toggles: sound, vibration, high contrast mode
- Automatically remembers last used settings

## User Interface

### Screens
- **Start Screen**: Game settings, tutorial access, start button
- **Game Screen**: Player zones, countdown timer, real-time scores
- **Result Screen**: Winner announcement, final scores, replay options

### Accessibility Features
- High contrast mode for visual clarity
- Sound toggle for audio feedback control
- Vibration toggle for haptic feedback control
- Dark mode support
- Color-blind friendly design with pattern differentiation

## Technical Specifications
- Vanilla JavaScript implementation (no frameworks)
- Responsive design for all mobile screen sizes
- Progressive Web App capabilities
- Local storage for persistent user preferences
- Support for modern mobile browsers (iOS Safari, Android Chrome)
- Offline functionality
- Support for device notches and safe areas
