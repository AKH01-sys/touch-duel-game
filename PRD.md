# 📝 Product Requirements Document (PRD)

## 🎮 Product Name  
**Touch Duel: Reflex Rush**

---

## 📌 Objective  
Build a fast-paced, two-player mobile browser game where players race to tap randomly appearing dots in their own half of the screen. Only one dot appears at a time per player. The game ends after a fixed time limit, and the player with the most successful taps wins.

---

## 🧑‍💻 Target Platform  
- Mobile-first web game  
- Runs fully client-side as a **static website**  
- Supports modern mobile browsers (Safari, Chrome, Firefox)  
- Hosted on Netlify/Vercel/GitHub Pages/etc.

---

## 🔧 Core Gameplay Mechanics

### 👆 Screen Layout
- Split vertically into **two halves**: Player 1 (left), Player 2 (right)
- Responsive layout adapts to screen size, prioritizing tap targets and clarity

### 🎮 Game Modes
- **Classic Mode**: One dot per player, standard scoring
- **Penalty Mode**: Incorrect taps (missing a dot) result in point deduction
- **Mirror Mode**: Dots appear at mirrored positions for both players, with first-to-tap scoring

### 🟣 Dot Spawning
- **One dot at a time per player**  
- Appears in a **random location** within their half  
- Dot disappears when tapped, replaced with a new one  
- If not tapped within X seconds (e.g. 3s), it times out and gets replaced

### ⏱ Game Flow
1. Start screen with instructions → Start button
2. Countdown (e.g. 3...2...1...GO!)
3. Dots appear → Players tap to score
4. Timer counts down (e.g. 20–30s)
5. When time runs out → Show scores + winner
6. Option to **Rematch** or **Restart Game**

---

## 🧠 Touch Handling Logic

- Use `touchstart` events to register taps
- Only count touches that intersect with the current dot
- Ignore multi-touch abuse by:
  - Allowing only one dot per player
  - Removing tapped dot instantly to prevent multiple hits
- Optional game mode: Penalty for incorrect taps (increases game duration or subtracts point)

---

## 📊 Scoring & Feedback

### ✅ Real-Time UI
- Player 1 and Player 2 scores shown at the top of each half  
- Countdown timer centered or placed at the top  
- Visual/audio feedback when a dot is tapped

### 🎵 Sound Feedback
- Tap sound on correct hit  
- Error sound (optional game mode only)  
- Countdown tick  
- Final buzzer  
- Victory/Defeat sound

---

## 🎨 UI/UX Requirements

### Mobile-First Design
- Large tap areas  
- Clear player zones with color-coded sides  
- Dots are large enough for thumbs but not too easy  
- Text is readable on small devices (12pt+ minimum)  
- Smooth animations and transitions  
- **Remember user preferences** between game sessions

### Screens
1. **Welcome Screen**
   - Game title
   - Start Game button
   - Optional mode toggle (Penalty mode)
2. **Game Screen**
   - Real-time score for each player
   - Timer countdown
   - Dots appearing in each zone
3. **Results Screen**
   - Final scores
   - Winner message
   - “Rematch” and “Restart” buttons

---

## 🔩 Tech Stack

| Component        | Technology             |
|------------------|------------------------|
| Structure        | HTML5                  |
| Styling          | CSS3 (Flexbox/Grid, transitions) |
| Interactivity    | Vanilla JavaScript     |
| Sound            | Web Audio API / `<audio>` tag |
| Storage          | localStorage for user preferences |
| Hosting          | Netlify, Vercel, GitHub Pages |

---

## 🧪 Testing & Validation

| Feature                        | Test Criteria                                     |
|-------------------------------|---------------------------------------------------|
| Touch accuracy                | Only valid dot taps are registered                |
| Dot lifecycle                 | Dots spawn, timeout, and respawn correctly        |
| Multi-touch behavior          | Only one touch per player counted at a time      |
| Score display                 | Updates immediately on correct taps               |
| Timer                         | Countdown works accurately and ends game reliably |
| Rematch/Restart               | Game resets cleanly with fresh state              |
| Mobile responsiveness         | Layout adapts to various screen sizes             |
| Audio                         | Sounds trigger on appropriate actions             |

---

## 🧠 Stretch Features (Optional for v2)
- Difficulty presets (faster spawn intervals, smaller dots)
- Custom timer or round settings
- Animated background themes
- Dark mode
- **Practice mode**: Single-player mode for practicing
- **Game variants**:
  - "Hot Potato": Dots must be tapped within decreasing time windows
- **Haptic feedback** on supported devices
- **Color themes** with high-contrast options for accessibility
