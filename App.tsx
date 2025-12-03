
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Difficulty, TestResult, TestHistoryItem, FontSize, MultiplayerRoom, MultiplayerPlayer, Achievement, UnlockedAchievements, EquippedItems, LayoutMode, MinimalLayoutWidth, KeySound } from './types';
import { TIME_OPTIONS, DIFFICULTY_OPTIONS } from './constants';
import { generateWords } from './services/wordService';
import Settings from './components/Settings';
import TypingTest from './components/TypingTest';
import Results from './components/Results';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import MultiplayerLobby from './components/MultiplayerLobby';
import { MailIcon, SunIcon, MoonIcon, UserIcon, TrophyIcon, SettingsIcon, StarIcon } from './components/icons';
import { SoundType } from './types';
import AchievementToast from './components/AchievementToast';
import { ACHIEVEMENTS, getAchievementById } from './achievements';


import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, deleteField } from 'firebase/firestore';
import { auth, db, provider } from './firebase';


// Create a single AudioContext to be reused.
// It must be created or resumed after a user gesture.
let audioContext: AudioContext | null = null;
const getAudioContext = () => {
  if (typeof window !== 'undefined') {
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser");
        return null;
      }
    }
    return audioContext;
  }
  return null;
};

const playSound = (type: SoundType | KeySound) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Browsers may suspend AudioContext until a user gesture.
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  try {
    const now = ctx.currentTime;
    
    if (type === 'complete') {
        const freqs = [261.63, 329.63, 392.00]; // C4, E4, G4
        freqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            gainNode.gain.setValueAtTime(0.3, now + i * 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, now + i * 0.1 + 0.2);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.2);
        });
        return;
    }

    if (type === 'mechanical') {
        // High-frequency click
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(1200, now);
        clickGain.gain.setValueAtTime(0.3, now);
        clickGain.gain.exponentialRampToValueAtTime(0.00001, now + 0.05);
        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);
        clickOsc.start(now);
        clickOsc.stop(now + 0.05);
        
        // Low-frequency body sound
        const bodyOsc = ctx.createOscillator();
        const bodyGain = ctx.createGain();
        bodyOsc.type = 'square';
        bodyOsc.frequency.setValueAtTime(300, now);
        bodyGain.gain.setValueAtTime(0.1, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.00001, now + 0.1);
        bodyOsc.connect(bodyGain);
        bodyGain.connect(ctx.destination);
        bodyOsc.start(now);
        bodyOsc.stop(now + 0.1);
        return;
    }

    if (type === 'rubber dome') {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.1);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
        return;
    }

    // 🎃 Spooky Halloween sound - eerie descending tone with vibrato
    if (type === 'spooky') {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const lfo = ctx.createOscillator(); // Low frequency oscillator for vibrato
        const lfoGain = ctx.createGain();
        
        // Setup vibrato (wobble effect)
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(8, now); // 8Hz vibrato
        lfoGain.gain.setValueAtTime(15, now); // Vibrato depth
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        // Main spooky tone - descending eerie sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.15);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        lfo.start(now);
        osc.start(now);
        lfo.stop(now + 0.15);
        osc.stop(now + 0.15);
        return;
    }

    if (type === 'click') {
        const bufferSize = ctx.sampleRate * 0.05; // 50ms
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.05);
        noise.connect(gainNode);
        gainNode.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.05);
        return;
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(0, now);

    let freq = 440;
    let oscType: OscillatorType = 'sine';
    let gain = 0.15;
    let duration = 0.1;

    switch (type) {
        case 'error':
            oscType = 'sawtooth';
            freq = 164.81; // E3
            gain = 0.2;
            duration = 0.2;
            break;
        case 'tick':
            oscType = 'triangle';
            freq = 880; // A5
            gain = 0.1;
            duration = 0.05;
            break;
        case 'beep':
            oscType = 'sine';
            freq = 440; // A4
            break;
        case 'pop':
            oscType = 'sine';
            gain = 0.3;
            duration = 0.08;
            oscillator.frequency.setValueAtTime(200, now);
            oscillator.frequency.exponentialRampToValueAtTime(100, now + duration);
            break;
        case 'sine':
            oscType = 'sine';
            freq = 659.25; // E5
            break;
        case 'sawtooth':
            oscType = 'sawtooth';
            freq = 440; // A4
            break;
        case 'square':
            oscType = 'square';
            freq = 329.63; // E4
            break;
        case 'triangle':
            oscType = 'triangle';
            freq = 523.25; // C5
            break;
    }

    oscillator.type = oscType;
    if (type !== 'pop') {
      oscillator.frequency.setValueAtTime(freq, now);
    }
    gainNode.gain.linearRampToValueAtTime(gain, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);

  } catch (e) {
    console.error(`Failed to play sound: ${type}`, e);
  }
};


const getInitialTheme = (): 'light' | 'dark' | 'serene' => {
  if (typeof window === 'undefined') return 'serene';
  const storedTheme = localStorage.getItem('doodle-type-theme');
  
  let theme: string | null = storedTheme;
  try {
    if (storedTheme) {
        theme = JSON.parse(storedTheme);
    }
  } catch (e) {
      // ignore, fallback to using the raw string
  }

  if (theme === 'dark' || theme === 'light' || theme === 'serene') {
    return theme as 'light' | 'dark' | 'serene';
  }
  // Default to serene instead of light
  return 'serene';
};

export type HomeScreenMode = 'quick' | 'classic';

// Helper to read settings, checking for new and legacy keys for backward compatibility.
const getPersistedSetting = (newKey: string, legacyKey: string, defaultValue: string) => {
    const value = localStorage.getItem(newKey) ?? localStorage.getItem(legacyKey);
    return JSON.parse(value || defaultValue);
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Loading);
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Medium);
  const [words, setWords] = useState<string>('');
  const [results, setResults] = useState<TestHistoryItem | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => getPersistedSetting('doodle-type-is-muted', 'doodle-type-muted', 'true'));
  const [keySound, setKeySound] = useState<KeySound>(() => (JSON.parse(localStorage.getItem('doodle-type-key-sound') || '"off"')) as KeySound);
  const [theme, setTheme] = useState<'light' | 'dark' | 'serene'>(getInitialTheme);
  const [showVisualKeyboard, setShowVisualKeyboard] = useState<boolean>(() => getPersistedSetting('doodle-type-show-visual-keyboard', 'doodle-type-visual-keyboard', 'false'));
  const [fontSize, setFontSize] = useState<FontSize>(() => (JSON.parse(localStorage.getItem('doodle-type-font-size') || '"md"')) as FontSize);
  const [layout, setLayout] = useState<LayoutMode>(() => (JSON.parse(localStorage.getItem('doodle-type-layout') || '"minimal"')) as LayoutMode);
  const [minimalLayoutWidth, setMinimalLayoutWidth] = useState<MinimalLayoutWidth>(() => (JSON.parse(localStorage.getItem('doodle-type-minimal-layout-width') || '"large"')) as MinimalLayoutWidth);
  const [wordHighlight, setWordHighlight] = useState<boolean>(() => JSON.parse(localStorage.getItem('doodle-type-word-highlight') || 'false'));
  const [highScores, setHighScores] = useState<TestResult>({ wpm: 0, accuracy: 0 });
  const [testHistory, setTestHistory] = useState<TestHistoryItem[]>([]);
  const [totalTypingTime, setTotalTypingTime] = useState<number>(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [homeScreenMode, setHomeScreenMode] = useState<HomeScreenMode>(() => (JSON.parse(localStorage.getItem('doodle-type-home-mode') || '"quick"')) as HomeScreenMode);
  const [isUiHidden, setIsUiHidden] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [roomId, setRoomId] = useState<string | null>(null);

  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievements>({});
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({ achievementId: null });
  const [newlyUnlockedQueue, setNewlyUnlockedQueue] = useState<Achievement[]>([]);

  const loadLocalData = useCallback(() => {
    setHighScores(JSON.parse(localStorage.getItem('doodle-type-high-scores') || '{"wpm":0,"accuracy":0}'));
    setTestHistory(JSON.parse(localStorage.getItem('doodle-type-history') || '[]'));
    setTotalTypingTime(JSON.parse(localStorage.getItem('doodle-type-total-time') || '0'));
    setIsMuted(getPersistedSetting('doodle-type-is-muted', 'doodle-type-muted', 'true'));
    setKeySound((JSON.parse(localStorage.getItem('doodle-type-key-sound') || '"off"')) as KeySound);
    setTheme(getInitialTheme());
    setShowVisualKeyboard(getPersistedSetting('doodle-type-show-visual-keyboard', 'doodle-type-visual-keyboard', 'false'));
    setHomeScreenMode(JSON.parse(localStorage.getItem('doodle-type-home-mode') || '"quick"') as HomeScreenMode);
    setFontSize(JSON.parse(localStorage.getItem('doodle-type-font-size') || '"md"') as FontSize);
    setLayout(JSON.parse(localStorage.getItem('doodle-type-layout') || '"minimal"') as LayoutMode);
    setMinimalLayoutWidth(JSON.parse(localStorage.getItem('doodle-type-minimal-layout-width') || '"large"') as MinimalLayoutWidth);
    setWordHighlight(JSON.parse(localStorage.getItem('doodle-type-word-highlight') || 'false'));
    setTimeLimit(JSON.parse(localStorage.getItem('doodle-type-time-limit') || '30'));
    setDifficulty(JSON.parse(localStorage.getItem('doodle-type-difficulty') || `"${Difficulty.Medium}"`));
    setUnlockedAchievements(JSON.parse(localStorage.getItem('doodle-type-unlocked-achievements') || '{}'));
    setEquippedItems(JSON.parse(localStorage.getItem('doodle-type-equipped-items') || '{"achievementId":null}'));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setHighScores(data.highScores || { wpm: 0, accuracy: 0 });
                setTestHistory(data.history || []);
                setTotalTypingTime(data.totalTypingTime || 0);
                setUnlockedAchievements(data.unlockedAchievements || {});
                setEquippedItems(data.equippedItems || { achievementId: null });
                setIsMuted(data.preferences?.isMuted ?? true);
                setKeySound(data.preferences?.keySound || 'off');
                setTheme(data.preferences?.theme || 'serene'); // Default to serene for new users
                setShowVisualKeyboard(data.preferences?.showVisualKeyboard ?? false);
                setHomeScreenMode(data.preferences?.homeScreenMode || 'quick');
                setFontSize(data.preferences?.fontSize || 'md');
                setLayout(data.preferences?.layout || 'minimal');
                setMinimalLayoutWidth(data.preferences?.minimalLayoutWidth || 'large');
                setWordHighlight(data.preferences?.wordHighlight ?? false);
                setTimeLimit(data.preferences?.timeLimit || 30);
                setDifficulty(data.preferences?.difficulty || Difficulty.Medium);
            } else {
                const localHighScores = JSON.parse(localStorage.getItem('doodle-type-high-scores') || '{"wpm":0,"accuracy":0}');
                const localHistory = JSON.parse(localStorage.getItem('doodle-type-history') || '[]');
                const localTotalTime = JSON.parse(localStorage.getItem('doodle-type-total-time') || '0');
                const localMuted = getPersistedSetting('doodle-type-is-muted', 'doodle-type-muted', 'true');
                const localKeySound = (JSON.parse(localStorage.getItem('doodle-type-key-sound') || '"off"')) as KeySound;
                const localTheme = getInitialTheme();
                const localKeyboard = getPersistedSetting('doodle-type-show-visual-keyboard', 'doodle-type-visual-keyboard', 'false');
                const localHomeMode = (localStorage.getItem('doodle-type-home-mode') as HomeScreenMode) || 'quick';
                const localFontSize = (localStorage.getItem('doodle-type-font-size') as FontSize) || 'md';
                const localLayout = (localStorage.getItem('doodle-type-layout') as LayoutMode) || 'minimal';
                const localMinimalWidth = (localStorage.getItem('doodle-type-minimal-layout-width') as MinimalLayoutWidth) || 'large';
                const localWordHighlight = JSON.parse(localStorage.getItem('doodle-type-word-highlight') || 'false');
                const localTimeLimit = JSON.parse(localStorage.getItem('doodle-type-time-limit') || '30');
                const localDifficulty = JSON.parse(localStorage.getItem('doodle-type-difficulty') || `"${Difficulty.Medium}"`);
                const localAchievements = JSON.parse(localStorage.getItem('doodle-type-unlocked-achievements') || '{}');
                const localEquipped = JSON.parse(localStorage.getItem('doodle-type-equipped-items') || '{"achievementId":null}');

                const userData = {
                    highScores: localHighScores,
                    history: localHistory,
                    totalTypingTime: localTotalTime,
                    unlockedAchievements: localAchievements,
                    equippedItems: localEquipped,
                    preferences: {
                        isMuted: localMuted,
                        keySound: localKeySound,
                        theme: localTheme,
                        showVisualKeyboard: localKeyboard,
                        homeScreenMode: localHomeMode,
                        fontSize: localFontSize,
                        layout: localLayout,
                        minimalLayoutWidth: localMinimalWidth,
                        wordHighlight: localWordHighlight,
                        timeLimit: localTimeLimit,
                        difficulty: localDifficulty,
                    },
                };
                await setDoc(userDocRef, userData);
                loadLocalData();
            }
        } else {
            loadLocalData();
        }
        setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [loadLocalData]);

    const handlePreferenceChange = useCallback(async (key: string, value: any) => {
        if (user) {
            await updateDoc(doc(db, 'users', user.uid), { [`preferences.${key}`]: value });
        } else {
            localStorage.setItem(`doodle-type-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, JSON.stringify(value));
        }
    }, [user]);

    const handleSetTimeLimit = useCallback((time: number) => {
      setTimeLimit(time);
      handlePreferenceChange('timeLimit', time);
    }, [handlePreferenceChange]);
    
    const handleSetDifficulty = useCallback((difficulty: Difficulty) => {
        setDifficulty(difficulty);
        handlePreferenceChange('difficulty', difficulty);
    }, [handlePreferenceChange]);

    const handleSetHomeScreenMode = useCallback((mode: HomeScreenMode) => {
        setHomeScreenMode(mode);
        handlePreferenceChange('homeScreenMode', mode);
    }, [handlePreferenceChange]);

    const handleSetLayout = useCallback((layout: LayoutMode) => {
        setLayout(layout);
        handlePreferenceChange('layout', layout);
    }, [handlePreferenceChange]);

    const handleSetMinimalLayoutWidth = useCallback((width: MinimalLayoutWidth) => {
        setMinimalLayoutWidth(width);
        handlePreferenceChange('minimalLayoutWidth', width);
    }, [handlePreferenceChange]);

    const toggleMute = useCallback(() => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        handlePreferenceChange('isMuted', newMutedState);
    }, [isMuted, handlePreferenceChange]);
    
    const handleSetKeySound = useCallback((sound: KeySound) => {
        setKeySound(sound);
        handlePreferenceChange('keySound', sound);
        if (sound !== 'off') {
            playSound(sound);
        }
    }, [handlePreferenceChange]);

    const toggleTheme = useCallback(() => {
        let newTheme: 'light' | 'dark' | 'serene';
        if (theme === 'light') {
            newTheme = 'dark';
        } else if (theme === 'dark') {
            newTheme = 'serene';
        } else {
            newTheme = 'light';
        }
        setTheme(newTheme);
        handlePreferenceChange('theme', newTheme);
    }, [theme, handlePreferenceChange]);

    const toggleVisualKeyboard = useCallback(() => {
        const newKeyboardState = !showVisualKeyboard;
        setShowVisualKeyboard(newKeyboardState);
        handlePreferenceChange('showVisualKeyboard', newKeyboardState);
    }, [showVisualKeyboard, handlePreferenceChange]);
  
    const handleSetFontSize = useCallback((size: FontSize) => {
        setFontSize(size);
        handlePreferenceChange('fontSize', size);
    }, [handlePreferenceChange]);

    const toggleWordHighlight = useCallback(() => {
        const newHighlightState = !wordHighlight;
        setWordHighlight(newHighlightState);
        handlePreferenceChange('wordHighlight', newHighlightState);
    }, [wordHighlight, handlePreferenceChange]);

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'serene');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'serene') {
      document.documentElement.classList.add('dark', 'serene');
    }
  }, [theme]);

  useEffect(() => {
    if (authLoading) return;
    const timer = setTimeout(() => {
      setWords(generateWords(200, difficulty));
      setGameState(homeScreenMode === 'quick' ? GameState.Waiting : GameState.Settings);
    }, 1500);
    return () => clearTimeout(timer);
  }, [homeScreenMode, authLoading, difficulty]);
  
  const restartGame = useCallback(() => {
    setRoomId(null);
    setWords(generateWords(200, difficulty));
    setGameState(homeScreenMode === 'quick' ? GameState.Waiting : GameState.Settings);
    setResults(null);
    setIsNewHighScore(false);
  }, [homeScreenMode, difficulty]);

  const viewProfile = useCallback(() => {
    setGameState(GameState.Profile);
  }, []);

  const viewLeaderboard = useCallback(() => {
    setGameState(GameState.Leaderboard);
  }, []);
  
  const startGame = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx?.state === 'suspended') {
        ctx.resume();
    }
    setWords(generateWords(200, difficulty));
    setGameState(GameState.Running);
    setIsNewHighScore(false);
  }, [difficulty]);

  const startWaitingGame = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx?.state === 'suspended') {
        ctx.resume();
    }
    setGameState(GameState.Running);
    setIsNewHighScore(false);
  }, []);

  const handleQuickStartDifficultyChange = useCallback((newDifficulty: Difficulty) => {
    handleSetDifficulty(newDifficulty);
    setWords(generateWords(200, newDifficulty));
  }, [handleSetDifficulty]);

  const handleQuickStartTimeChange = useCallback((newTime: number) => {
    handleSetTimeLimit(newTime);
    setWords(generateWords(200, difficulty));
  }, [difficulty, handleSetTimeLimit]);

  useEffect(() => {
    const keysPressed = new Set<string>();
    const handleKeyDown = (e: KeyboardEvent) => {
        const isGameScreen = gameState === GameState.Running || gameState === GameState.Finished || gameState === GameState.Waiting || gameState === GameState.Settings;

        if (e.key === 'Tab' && isGameScreen) {
            e.preventDefault();
        }

        keysPressed.add(e.key);

        if (keysPressed.has('Tab') && keysPressed.has('Enter')) {
            e.preventDefault();
            if (isGameScreen) {
                restartGame();
            }
            return;
        }

        if (e.ctrlKey) {
            if (e.key.toLowerCase() === 'q') {
                e.preventDefault();
                toggleVisualKeyboard();
                return;
            }
            if (e.key.toLowerCase() === 'm') {
                e.preventDefault();
                toggleMute();
                return;
            }
        }

        if (e.key === 'Enter') {
          if (gameState === GameState.Finished || gameState === GameState.Settings) {
            e.preventDefault();
            if (gameState === GameState.Finished) {
              restartGame();
            } else {
              startGame();
            }
          }
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        keysPressed.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, restartGame, startGame, toggleMute, toggleVisualKeyboard]);

  
  const handlePlaySound = useCallback((soundType: SoundType) => {
    if (isMuted) return;
    if (soundType === 'keypress') {
        if (keySound !== 'off') {
            playSound(keySound);
        }
    } else {
        playSound(soundType);
    }
  }, [isMuted, keySound]);

    const onTestComplete = useCallback(async (result: Omit<TestHistoryItem, 'timestamp'>) => {
        let newHighScoreAchieved = false;
        const newHighScores = { ...highScores };

        if (result.wpm > highScores.wpm) {
            newHighScores.wpm = result.wpm;
            newHighScoreAchieved = true;
        }
        if (result.accuracy > highScores.accuracy) {
            newHighScores.accuracy = result.accuracy;
            newHighScoreAchieved = true;
        }

        if (newHighScoreAchieved) {
            setHighScores(newHighScores);
        }
        
        const newTotalTime = totalTypingTime + result.timeLimit;
        setTotalTypingTime(newTotalTime);
        
        const newHistoryItem: TestHistoryItem = { ...result, timestamp: Date.now() };
        const updatedHistory = [...testHistory, newHistoryItem];
        setTestHistory(updatedHistory);
        setResults(newHistoryItem);

        const justUnlocked: Achievement[] = [];
        const updatedAchievements = { ...unlockedAchievements };
        ACHIEVEMENTS.forEach(ach => {
            if (!updatedAchievements[ach.id]) {
                let unlocked = false;
                if (ach.type === 'wpm' && result.wpm >= ach.threshold) unlocked = true;
                if (ach.type === 'accuracy' && result.accuracy >= ach.threshold) unlocked = true;
                if (ach.type === 'testsCompleted' && updatedHistory.length >= ach.threshold) unlocked = true;
                
                if (unlocked) {
                    justUnlocked.push(ach);
                    updatedAchievements[ach.id] = Date.now();
                }
            }
        });

        if (justUnlocked.length > 0) {
            setNewlyUnlockedQueue(prev => [...prev, ...justUnlocked]);
            setUnlockedAchievements(updatedAchievements);
        }

        if (user) {
            const timeLimit = result.timeLimit;
            const leaderboardCollectionName = `leaderboard_${timeLimit}s`;
            const leaderboardDocRef = doc(db, leaderboardCollectionName, user.uid);
            const equippedAchievement = getAchievementById(equippedItems.achievementId);

            try {
                const docSnap = await getDoc(leaderboardDocRef);
                const currentBestWpmForTime = docSnap.exists() ? docSnap.data().wpm : 0;
                
                if (result.wpm > currentBestWpmForTime) {
                    await setDoc(leaderboardDocRef, {
                        uid: user.uid,
                        displayName: user.displayName || 'Anonymous',
                        photoURL: user.photoURL || '',
                        wpm: result.wpm,
                        timestamp: Date.now(),
                        timeLimit: timeLimit,
                        equippedAchievement: equippedAchievement 
                            ? { id: equippedAchievement.id, name: equippedAchievement.name, ringClass: equippedAchievement.ringClass } 
                            : deleteField(),
                    });
                }
            } catch (e) {
                console.error(`Failed to update ${leaderboardCollectionName} leaderboard:`, e);
            }

            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                highScores: newHighScores,
                totalTypingTime: newTotalTime,
                history: arrayUnion(newHistoryItem),
                unlockedAchievements: updatedAchievements,
            });
        } else {
            localStorage.setItem('doodle-type-high-scores', JSON.stringify(newHighScores));
            localStorage.setItem('doodle-type-total-time', JSON.stringify(newTotalTime));
            localStorage.setItem('doodle-type-history', JSON.stringify(updatedHistory));
            localStorage.setItem('doodle-type-unlocked-achievements', JSON.stringify(updatedAchievements));
        }

        setIsNewHighScore(newHighScoreAchieved);
        setGameState(GameState.Finished);
        handlePlaySound('complete');
    }, [handlePlaySound, highScores, user, totalTypingTime, testHistory, unlockedAchievements, equippedItems.achievementId]);

    const handleSignIn = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google: ", error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const handleEquipAchievement = useCallback(async (achievementId: string | null) => {
        const newEquippedItems = { achievementId };
        setEquippedItems(newEquippedItems);
        if (user) {
            await updateDoc(doc(db, 'users', user.uid), { equippedItems: newEquippedItems });

            const equippedAchievement = getAchievementById(achievementId);
            const updatePayload = equippedAchievement
                ? { equippedAchievement: { id: equippedAchievement.id, name: equippedAchievement.name, ringClass: equippedAchievement.ringClass } }
                : { equippedAchievement: deleteField() };

            const updatePromises = TIME_OPTIONS.map(async (time) => {
                const leaderboardCollectionName = `leaderboard_${time}s`;
                const leaderboardDocRef = doc(db, leaderboardCollectionName, user.uid);
                
                try {
                    const docSnap = await getDoc(leaderboardDocRef);
                    if (docSnap.exists()) {
                        await updateDoc(leaderboardDocRef, updatePayload);
                    }
                } catch (e) {
                    console.error(`Could not update leaderboard entry for user ${user.uid} in ${leaderboardCollectionName}:`, e);
                }
            });

            await Promise.all(updatePromises);

        } else {
            localStorage.setItem('doodle-type-equipped-items', JSON.stringify(newEquippedItems));
        }
    }, [user]);

    const generateRoomId = (length = 5) => {
        const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    const handleCreateRoom = async (timeLimit: number, difficulty: Difficulty) => {
        if (!user) return;
        setGameState(GameState.Loading);
        let newRoomId = generateRoomId();
        let roomExists = true;
        let attempts = 0;
        while(roomExists && attempts < 10) {
            const roomRef = doc(db, 'rooms', newRoomId);
            const docSnap = await getDoc(roomRef);
            if (!docSnap.exists()) {
                roomExists = false;
            } else {
                newRoomId = generateRoomId();
            }
            attempts++;
        }
        if (roomExists) {
            alert("Failed to create a unique room. Please try again.");
            setGameState(GameState.Profile);
            return;
        }
        const newPlayer: MultiplayerPlayer = {
            uid: user.uid,
            displayName: user.displayName || 'Anonymous',
            photoURL: user.photoURL || '',
            status: 'joined',
            wpm: 0,
            accuracy: 0,
            progress: 0,
        };
        const newRoom: MultiplayerRoom = {
            roomId: newRoomId,
            hostId: user.uid,
            status: 'waiting',
            createdAt: Date.now(),
            timeLimit,
            difficulty,
            words: generateWords(200, difficulty),
            players: { [user.uid]: newPlayer }
        };
        await setDoc(doc(db, 'rooms', newRoomId), newRoom);
        setRoomId(newRoomId);
        setGameState(GameState.MultiplayerLobby);
    };

    const handleJoinRoom = async (roomIdToJoin: string) => {
        if (!user || !roomIdToJoin) return;
        const normalizedRoomId = roomIdToJoin.toUpperCase().trim();
        setGameState(GameState.Loading);
        const roomRef = doc(db, 'rooms', normalizedRoomId);
        const docSnap = await getDoc(roomRef);
        if (docSnap.exists()) {
            const roomData = docSnap.data() as MultiplayerRoom;
            if (roomData.status !== 'waiting') {
                alert("This game has already started or is finished.");
                setGameState(GameState.Profile);
                return;
            }
            const newPlayer: MultiplayerPlayer = {
                uid: user.uid,
                displayName: user.displayName || 'Anonymous',
                photoURL: user.photoURL || '',
                status: 'joined',
                wpm: 0,
                accuracy: 0,
                progress: 0,
            };
            await updateDoc(roomRef, { [`players.${user.uid}`]: newPlayer });
            setRoomId(normalizedRoomId);
            setGameState(GameState.MultiplayerLobby);
        } else {
            alert('Room not found.');
            setGameState(GameState.Profile);
        }
    };

    const handleLeaveRoom = useCallback(() => {
        setRoomId(null);
        setGameState(GameState.Profile);
    }, []);

  const renderContent = () => {
    if (authLoading || gameState === GameState.Loading) {
        return (
          <div className="flex flex-col items-center justify-center text-[#8D6E63] dark:text-amber-400 animate-pulse">
            <MailIcon className="w-16 h-16" />
            <p className="text-2xl mt-4 tracking-widest">LOADING</p>
          </div>
        );
    }

    switch (gameState) {
      case GameState.Settings:
        return (
          <Settings
            timeLimit={timeLimit}
            setTimeLimit={handleSetTimeLimit}
            difficulty={difficulty}
            setDifficulty={handleSetDifficulty}
            onStart={startGame}
          />
        );
      case GameState.Waiting:
      case GameState.Running:
        return (
          <TypingTest
            words={words}
            timeLimit={timeLimit}
            difficulty={difficulty}
            onComplete={onTestComplete}
            onRestart={restartGame}
            playSound={handlePlaySound}
            isMuted={isMuted}
            toggleMute={toggleMute}
            showVisualKeyboard={showVisualKeyboard}
            fontSize={fontSize}
            layout={layout}
            minimalLayoutWidth={minimalLayoutWidth}
            isWaiting={gameState === GameState.Waiting}
            onWaitingStart={startWaitingGame}
            setTimeLimit={handleQuickStartTimeChange}
            setDifficulty={handleQuickStartDifficultyChange}
            setIsUiHidden={setIsUiHidden}
            isUiHidden={isUiHidden}
            wordHighlight={wordHighlight}
          />
        );
      case GameState.Finished:
        return <Results results={results} onRestart={restartGame} highScores={highScores} isNewHighScore={isNewHighScore} onViewProfile={viewProfile}/>;
      case GameState.Profile:
          return <Profile 
            history={testHistory}
            highScores={highScores}
            totalTypingTime={totalTypingTime}
            onClose={restartGame}
            isMuted={isMuted}
            toggleMute={toggleMute}
            theme={theme}
            toggleTheme={toggleTheme}
            showVisualKeyboard={showVisualKeyboard}
            toggleVisualKeyboard={toggleVisualKeyboard}
            homeScreenMode={homeScreenMode}
            setHomeScreenMode={handleSetHomeScreenMode}
            fontSize={fontSize}
            setFontSize={handleSetFontSize}
            layout={layout}
            setLayout={handleSetLayout}
            minimalLayoutWidth={minimalLayoutWidth}
            setMinimalLayoutWidth={handleSetMinimalLayoutWidth}
            user={user}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            unlockedAchievements={unlockedAchievements}
            equippedItems={equippedItems}
            onEquipAchievement={handleEquipAchievement}
            wordHighlight={wordHighlight}
            toggleWordHighlight={toggleWordHighlight}
            keySound={keySound}
            setKeySound={handleSetKeySound}
          />;
      case GameState.Leaderboard:
          return <Leaderboard onClose={restartGame} currentUser={user} />;
      case GameState.MultiplayerLobby:
        if (!roomId || !user) {
            restartGame();
            return null;
        }
        return <MultiplayerLobby 
            roomId={roomId} 
            user={user} 
            onLeaveRoom={handleLeaveRoom}
            playSound={handlePlaySound}
            isMuted={isMuted}
            toggleMute={toggleMute}
            showVisualKeyboard={showVisualKeyboard}
            fontSize={fontSize}
            layout={layout}
            minimalLayoutWidth={minimalLayoutWidth}
            wordHighlight={wordHighlight}
        />;
      default:
        return null;
    }
  };

  const isTestActive = gameState === GameState.Running || gameState === GameState.Waiting;
  const isHeaderHidden = isTestActive && isUiHidden;
  
  const mainClasses = `flex-grow flex justify-center ${
      isTestActive && layout === 'minimal'
      ? 'w-full items-start pt-[20vh] md:pt-[25vh] px-4'
      : 'w-full items-center px-6 md:px-12 py-4'
  }`;

  return (
    <div className={`bg-[#FEF7DC] dark:bg-gray-800 min-h-screen text-[#6D4C41] dark:text-gray-300 flex flex-col items-center ${isUiHidden ? 'cursor-none' : ''}`}>
       <header className={`absolute top-0 left-0 right-0 p-6 flex justify-between items-center transition-opacity duration-300 ${isHeaderHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex gap-4">
            {user && (
                <button
                    onClick={viewLeaderboard}
                    aria-label="View Leaderboard"
                    className="p-2 bg-[#FFF8E1] rounded-full border-2 border-[#8D6E63] text-[#8D6E63] hover:bg-[#EFEBE9] transition-colors dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                    <TrophyIcon className="w-8 h-8" />
                </button>
            )}
            <button
                onClick={viewProfile}
                aria-label="View Profile"
                className="p-2 bg-[#FFF8E1] rounded-full border-2 border-[#8D6E63] text-[#8D6E63] hover:bg-[#EFEBE9] transition-colors dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-600"
            >
                <UserIcon className="w-8 h-8" />
            </button>
        </div>
        <h1 className="text-5xl font-bold text-center dark:text-amber-200">Hallow Type</h1>
        <div className="flex gap-4">
        <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 bg-[#FFF8E1] rounded-full border-2 border-[#8D6E63] text-[#8D6E63] hover:bg-[#EFEBE9] transition-colors dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-600"
        >
            {theme === 'light' ? <MoonIcon className="w-8 h-8" /> : (theme === 'dark' ? <SettingsIcon className="w-8 h-8" /> : <SunIcon className="w-8 h-8" />)}
        </button>
        </div>
      </header>
      <main className={mainClasses}>
        {renderContent()}
      </main>
      {newlyUnlockedQueue.map((ach, index) => (
          <AchievementToast 
              key={ach.id + index}
              achievement={ach}
              onDismiss={() => setNewlyUnlockedQueue(q => q.slice(1))}
          />
      ))}
      {gameState !== GameState.Profile && gameState !== GameState.Leaderboard && gameState !== GameState.MultiplayerLobby && (
        <footer className={`absolute bottom-0 left-0 right-0 p-6 text-center text-lg dark:text-gray-400 transition-opacity duration-300 ${isHeaderHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <p>Your thoughts, doodled.</p>
        </footer>
      )}
    </div>
  );
};

export default App;
