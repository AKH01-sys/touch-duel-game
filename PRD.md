# 📱 Touch Duel: Reflex Rush
## Product Requirements Document

---

## 1. Product Overview

**Touch Duel: Reflex Rush** is a two-player mobile browser game designed for quick, competitive play on a single device. Players compete by tapping dots that appear on their half of the screen, with the faster player winning.

### 1.1 Core Value Proposition
- Fast-paced gameplay (30-second matches by default)
- Immediate setup with minimal barriers to play
- Perfect for settling friendly disputes or killing time together

### 1.2 Target Audience
- Mobile device users (primary)
- Friends looking for quick competitive games
- Ages 8+ (simple mechanics, no complex instructions)

---

## 2. User Experience

### 2.1 Key User Stories

**As a player, I want to:**
- Start a game quickly with minimal setup
- Understand the rules immediately without tutorials
- See my score updating in real-time
- Know clearly when I've won or lost
- Easily play another round after finishing
- Adjust settings to customize my experience
- Play on any mobile device regardless of screen size
- Install the game on my home screen for quick access
- Play without internet connection

### 2.2 Game Flow
1. User opens game and selects settings (duration, mode, orientation)
2. Game begins with countdown (3, 2, 1, GO!)
3. Dots appear for both players to tap
4. Upon tapping a dot, player receives a point and a new dot appears
5. When timer ends, scores are compared and winner is declared
6. Players can choose to play again or change settings

---

## 3. Technical Requirements

### 3.1 Platform Support
- **Primary**: Mobile browsers (iOS Safari, Android Chrome)
- **Secondary**: Desktop browsers (Chrome, Firefox, Safari, Edge)
- **Progressive Web App** capabilities for offline use and home screen installation

### 3.2 Implementation Constraints
- Static website with no server-side components
- Vanilla JavaScript (no frameworks)
- Optimized performance for smooth animations
- Mobile-first responsive design
- Offline functionality via service worker

---

## 4. Game Mechanics

### 4.1 Core Mechanics
- One dot appears at a time in each player's zone
- Tapping a dot awards one point
- Dots timeout and respawn if not tapped within 3 seconds
- Game ends after a predetermined time limit (default: 30 seconds)
- Higher score wins, ties are possible

### 4.2 Game Modes
- **Classic**: Standard gameplay, one point per dot tapped
- **Penalty**: Missing the play area deducts one point
- **Mirror**: Dots appear in mirrored positions, first player to tap gets the point

### 4.3 Customization Options
- Game duration: 10s, 30s, 45s, or custom (5-300s)
- Screen orientation: Horizontal (left/right) or Vertical (up/down)
- Automatically remember last used settings

---

## 5. User Interface

### 5.1 Screen Layouts

**Start Screen:**
- Game title
- Game duration selection
- Game mode selection
- Screen orientation selection
- Start button

**Game Screen:**
- Player scores prominently displayed
- Countdown timer
- Clear visual division between player zones
- Distinctive player zone styling

**Result Screen:**
- Winner announcement
- Final scores
- Play Again button
- Change Settings button

### 5.2 Visual Design
- High contrast colors for gameplay elements
- Accessible design with visual patterns for color blindness
- Minimal UI during gameplay to maximize playing area
- Responsive layouts for all device orientations and sizes
- Safe area handling for notched devices

---

## 6. Feedback Systems

### 6.1 Visual Feedback
- Score updates with animation
- Dot tap animation
- Countdown animation
- Game end transition
- Score comparison highlighting

### 6.2 Audio Feedback
- Tap sound on successful dot hit
- Error sound on penalty (penalty mode only)
- Game end sound
- Countdown sounds

---

## 7. Data Management

### 7.1 Local Storage
- Save user preferences between sessions:
  - Game duration
  - Game mode
  - Screen orientation

### 7.2 PWA Implementation
- Service worker for offline functionality
- Web app manifest for home screen installation
- Asset caching for offline performance

---

## 8. Project Scope

### 8.1 Implemented Features (v2.3.7)
- Three distinct game modes
- Customizable game duration
- Screen orientation options
- User preference persistence
- Real-time scoring
- PWA capabilities
- Modern device compatibility
- Accessibility considerations
- Cross-device support

### 8.2 Future Considerations
- Difficulty options (dot size, timeout duration)
- Dark mode theme
- High score tracking
- Haptic feedback on supported devices
- Single-player practice mode
- Additional game variants

---

## 9. Success Metrics

### 9.1 Performance Metrics
- Load under 2 seconds on 3G connection
- Smooth animations (60fps) during gameplay
- Full functionality on devices 320px wide and larger

### 9.2 User Metrics
- Session duration
- Return rate
- Game mode selection distribution
- Custom settings usage
