<div align="center">

# 🎃 Hallow Type

**A spooky-themed typing speed test with Halloween vibes**

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)

</div>

---

## 👻 What is Hallow Type?

Hallow Type is a Halloween-themed typing speed test application that helps you improve your typing skills while enjoying spooky aesthetics. Test your WPM (words per minute), compete on leaderboards, unlock achievements, and enjoy the eerie atmosphere!

## ✨ Features

### 🎮 Core Typing Test
- **Multiple Time Modes**: 15s, 30s, 60s, or 120s tests
- **Difficulty Levels**: Easy, Medium, Hard word lists
- **Real-time Stats**: Live WPM, accuracy, and progress tracking
- **Visual Keyboard**: On-screen keyboard showing key presses
- **Detailed Results**: Graphs, character stats, and performance analysis

### 🎃 Halloween Theme
- **Spooky Passages**: Horror-themed typing content from classic literature
- **Flying Bats**: Animated bats flying across the screen
- **Floating Ghosts**: Ethereal ghosts drifting in the background
- **Cobwebs**: Decorative cobwebs in corners
- **Spooky Sound**: Halloween-themed key sound effect

### 🏆 Achievements System
- **Regular Achievements**: WPM milestones, accuracy goals, test completion
- **Halloween Achievements**: 12 special spooky badges with unique icons
  - Ghostly Typist, Pumpkin King, Skeleton Crew, Night Crawler
  - Web Weaver, Trick or Type, Potion Master, Witch's Apprentice
  - Undead Typist, Midnight Typer, All-Seeing, Soul Burner
- **Animated Profile Badges**: Equip achievements to show animated Halloween rings

### 👥 Multiplayer
- **Create Rooms**: Host typing races with friends
- **Join Rooms**: Enter room codes to compete
- **Real-time Progress**: See opponents' progress live

### 📊 Profile & Stats
- **Leveling System**: Gain XP from typing time
- **Test History**: View past results with detailed breakdowns
- **Progress Graphs**: Track improvement over time
- **High Scores**: Personal bests for WPM and accuracy

### 🔥 Leaderboards
- **Global Rankings**: Compete with players worldwide
- **Time-based Boards**: Separate leaderboards for each time mode
- **Achievement Display**: Show off equipped badges

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **TypeScript** | Type Safety |
| **Tailwind CSS** | Styling |
| **Firebase Auth** | Google Sign-in |
| **Firestore** | Database & Leaderboards |
| **Web Audio API** | Sound Effects |
| **Vite** | Build Tool |

## 📁 Project Structure

```
├── App.tsx                 # Main application component
├── index.tsx               # Entry point
├── index.html              # HTML template with CSS animations
├── types.ts                # TypeScript type definitions
├── constants.ts            # Word lists and configuration
├── achievements.ts         # Achievement definitions
├── firebase.ts             # Firebase configuration
│
├── components/
│   ├── TypingTest.tsx      # Core typing test logic
│   ├── Profile.tsx         # User profile & settings
│   ├── Leaderboard.tsx     # Global rankings
│   ├── Results.tsx         # Test results display
│   ├── Keyboard.tsx        # Visual keyboard
│   ├── Timer.tsx           # Countdown timer
│   ├── HistoryGraph.tsx    # Progress visualization
│   ├── MultiplayerLobby.tsx # Multiplayer rooms
│   ├── AchievementToast.tsx # Achievement notifications
│   ├── Settings.tsx        # Quick settings panel
│   │
│   │ # Halloween Components
│   ├── FlyingBats.tsx      # Animated bat decorations
│   ├── FloatingGhosts.tsx  # Floating ghost animations
│   ├── Cobwebs.tsx         # Corner cobweb decorations
│   ├── Confetti.tsx        # Celebration effects
│   └── icons.tsx           # SVG icon components
│
├── services/
│   ├── wordService.ts      # Word generation logic
│   └── spookyPassages.ts   # Halloween-themed text content
│
└── hooks/
    └── useThrottle.ts      # Performance optimization hook
```

## 🎯 How It Works

### Typing Test Flow
1. **Select Settings**: Choose time limit and difficulty
2. **Start Typing**: Begin typing the displayed words
3. **Real-time Feedback**: Green = correct, Red = errors
4. **Complete Test**: View detailed results and stats
5. **Unlock Achievements**: Earn badges for milestones

### Sound System
The app uses Web Audio API to generate sounds:
- **Key Sounds**: 10 different sound types including "spooky"
- **Error Sound**: Feedback for mistakes
- **Tick Sound**: Countdown warnings
- **Complete Sound**: Test completion celebration

### Data Persistence
- **Logged In**: Data synced to Firebase
- **Guest Mode**: Data saved to localStorage
- **Preferences**: Theme, sound, layout settings preserved

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd hallow-type

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
Create a `.env.local` file:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## 🎨 Themes

| Theme | Description |
|-------|-------------|
| **Light** | Warm cream background |
| **Dark** | Dark gray background |
| **Serene** | Monkeytype-inspired minimal theme |

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab + Enter` | Restart test |
| `Ctrl + Q` | Toggle visual keyboard |
| `Ctrl + M` | Toggle sound |

## 📜 License

MIT License - feel free to use and modify!

---

<div align="center">

**Happy Halloween Typing! 🎃👻🦇**

</div>
