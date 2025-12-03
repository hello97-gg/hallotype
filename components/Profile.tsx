
import React, { useMemo, useState } from 'react';
import { TestHistoryItem, TestResult, FontSize, Difficulty, UnlockedAchievements, EquippedItems, LayoutMode, MinimalLayoutWidth, KeySound } from '../types';
import { HomeScreenMode } from '../App';
import HistoryGraph from './HistoryGraph';
import { CloseIcon, KeyboardIcon, SunIcon, MoonIcon, VolumeOnIcon, VolumeOffIcon, GoogleIcon, MailIcon, UsersIcon, LockIcon, HighlighterIcon, LayoutIcon, WidthIcon, StarIcon, SettingsIcon, TrophyIcon, FileTextIcon, GhostIcon, PumpkinIcon, BatIcon, SpiderIcon } from './icons';
// Fix: Use named import for User type to resolve 'Namespace has no exported member' error.
import { User } from 'firebase/auth';
import { TIME_OPTIONS, DIFFICULTY_OPTIONS, KEY_SOUND_OPTIONS } from '../constants';
import { ACHIEVEMENTS, getAchievementById } from '../achievements';
import Results from './Results';

// Halloween badge IDs for special styling
const HALLOWEEN_ACHIEVEMENT_IDS = ['HALLOWEEN_GHOST', 'HALLOWEEN_PUMPKIN', 'HALLOWEEN_SKULL', 'HALLOWEEN_BAT', 'HALLOWEEN_SPIDER', 'HALLOWEEN_CANDY', 'HALLOWEEN_CAULDRON', 'HALLOWEEN_WITCH', 'HALLOWEEN_COFFIN', 'HALLOWEEN_MOON', 'HALLOWEEN_EYE', 'HALLOWEEN_FLAME'];

// Animated Halloween Ring SVG Component
const HalloweenRing: React.FC<{ size?: number }> = ({ size = 100 }) => (
  <svg 
    className="absolute inset-0 w-full h-full animate-halloween-ring-spin" 
    viewBox="0 0 100 100"
    style={{ width: size, height: size, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
  >
    <defs>
      <linearGradient id="halloweenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="33%" stopColor="#a855f7" />
        <stop offset="66%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
    </defs>
    <circle 
      cx="50" 
      cy="50" 
      r="46" 
      fill="none" 
      stroke="url(#halloweenGradient)" 
      strokeWidth="3"
      strokeDasharray="8 4"
      className="animate-halloween-dash"
    />
  </svg>
);


interface ProfileProps {
    history: TestHistoryItem[];
    highScores: TestResult;
    totalTypingTime: number;
    onClose: () => void;
    isMuted: boolean;
    toggleMute: () => void;
    theme: 'light' | 'dark' | 'serene';
    toggleTheme: () => void;
    showVisualKeyboard: boolean;
    toggleVisualKeyboard: () => void;
    homeScreenMode: HomeScreenMode;
    setHomeScreenMode: (mode: HomeScreenMode) => void;
    fontSize: FontSize;
    setFontSize: (size: FontSize) => void;
    layout: LayoutMode;
    setLayout: (layout: LayoutMode) => void;
    minimalLayoutWidth: MinimalLayoutWidth;
    setMinimalLayoutWidth: (width: MinimalLayoutWidth) => void;
    user: User | null;
    onSignIn: () => void;
    onSignOut: () => void;
    onCreateRoom: (timeLimit: number, difficulty: Difficulty) => void;
    onJoinRoom: (roomId: string) => void;
    unlockedAchievements: UnlockedAchievements;
    equippedItems: EquippedItems;
    onEquipAchievement: (achievementId: string | null) => void;
    wordHighlight: boolean;
    toggleWordHighlight: () => void;
    keySound: KeySound;
    setKeySound: (sound: KeySound) => void;
}

const LEVEL_TITLES = [
    'Doodle Novice',      // 1
    'Key Tapper',         // 2
    'Letter Learner',     // 3
    'Word Walker',        // 4
    'Sentence Sprinter',  // 5
    'Paragraph Pacer',    // 6
    'Doodle Drifter',     // 7
    'Keyboard Cadet',     // 8
    'Text Trooper',       // 9
    'Word Weaver',        // 10
    'Velocity Virtuoso',  // 11
    'Character Champion', // 12
    'Syntax Samurai',     // 13
    'Prose Pilgrim',      // 14
    'Typing Titan',       // 15
    'Lexicon Legend',     // 16
    'Quill Quickster',    // 17
    'Doodle Dynamo',      // 18
    'Keyboard Kingpin',   // 19
    'Doodle Deity',       // 20
];

const updateLog = [
  {
    version: '1.5.0',
    date: 'December 11, 2025',
    changes: [
      { type: 'feature', text: 'Added detailed results graph and statistics after each test, with a toggle to switch back to the simple view.' },
      { type: 'feature', text: 'Test history items are now clickable, opening a modal to show detailed results for past tests.' },
      { type: 'fix', text: 'Improved caret positioning for better accuracy across different font sizes and during line wraps.' },
      { type: 'other', text: 'Added Google Analytics to help improve the app.'}
    ]
  },
  {
    version: '1.4.0',
    date: 'September 11, 2025',
    changes: [
      { type: 'feature', text: 'Introduced Achievements! Unlock badges for hitting typing milestones.' },
      { type: 'feature', text: 'User leveling system based on total typing time.' },
      { type: 'feature', text: 'You can now equip unlocked achievements to show them off on the leaderboard.' },
      { type: 'fix', text: 'Fixed a bug where multiplayer games would not end correctly if all players finished before the timer ran out.' }
    ]
  },
];

const commonProblems = [
    {
        question: 'Why can\'t I see the leaderboard?',
        answer: 'The leaderboard requires you to be signed in with a Google account. Also, your Firestore security rules must allow reads on the leaderboard collections (e.g., `leaderboard_30s`). If you see a permission error, check your browser\'s developer console for a link to create the necessary Firestore index.'
    },
    {
        question: 'My test progress isn\'t saving.',
        answer: 'Progress, history, and settings are saved automatically when you are logged in. If you are not logged in, data is saved to your browser\'s local storage and may be cleared if you clear your browser data.'
    },
    {
        question: 'The sound isn\'t working.',
        answer: 'Some browsers block audio until you interact with the page. Try clicking anywhere on the page first. Also, check that sound is not muted in your profile settings and that a key sound type (other than "off") is selected.'
    }
];


const Profile: React.FC<ProfileProps> = ({ history, highScores, totalTypingTime, onClose, isMuted, toggleMute, theme, toggleTheme, showVisualKeyboard, toggleVisualKeyboard, homeScreenMode, setHomeScreenMode, fontSize, setFontSize, layout, setLayout, minimalLayoutWidth, setMinimalLayoutWidth, user, onSignIn, onSignOut, onCreateRoom, onJoinRoom, unlockedAchievements, equippedItems, onEquipAchievement, wordHighlight, toggleWordHighlight, keySound, setKeySound }) => {
    
    const [joinRoomId, setJoinRoomId] = useState('');
    const [multiplayerTime, setMultiplayerTime] = useState(30);
    const [multiplayerDifficulty, setMultiplayerDifficulty] = useState(Difficulty.Medium);
    const [activeTab, setActiveTab] = useState('stats');
    const [viewingTest, setViewingTest] = useState<TestHistoryItem | null>(null);

    const equippedAchievement = useMemo(() => getAchievementById(equippedItems.achievementId), [equippedItems]);
    
    const stats = useMemo(() => {
        if (history.length === 0) {
            return {
                tests: 0,
                avgWpm: 0,
                avgAcc: 0,
            };
        }
        const totalWpm = history.reduce((sum, item) => sum + item.wpm, 0);
        const totalAcc = history.reduce((sum, item) => sum + item.accuracy, 0);
        return {
            tests: history.length,
            avgWpm: Math.round(totalWpm / history.length),
            avgAcc: Math.round(totalAcc / history.length),
        };
    }, [history]);

    const levelInfo = useMemo(() => {
        const xp = totalTypingTime; // 1 second = 1 XP
        const level = Math.floor(Math.sqrt(xp / 60)) + 1;
        
        const xpForCurrentLevelStart = Math.pow(level - 1, 2) * 60;
        const xpForNextLevelStart = Math.pow(level, 2) * 60;

        const progressXp = xp - xpForCurrentLevelStart;
        const neededXp = xpForNextLevelStart - xpForCurrentLevelStart;
        
        const getTitle = (lvl: number) => {
            if (lvl > 0 && lvl <= LEVEL_TITLES.length) {
                return LEVEL_TITLES[lvl - 1];
            }
            if (lvl > LEVEL_TITLES.length) {
                return `Doodle Legend (Lvl ${lvl})`;
            }
            return LEVEL_TITLES[0];
        }

        return {
            level,
            title: getTitle(level),
            progress: neededXp > 0 ? (progressXp / neededXp) * 100 : 100,
            progressXp: Math.floor(progressXp),
            neededXp: Math.floor(neededXp),
        };
    }, [totalTypingTime]);

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        let parts = [];
        if (h > 0) parts.push(`${h}h`);
        if (m > 0) parts.push(`${m}m`);
        if (s > 0 && h === 0) parts.push(`${s}s`);
        return parts.join(' ') || '0s';
    }
    
    const recentTests = useMemo(() => {
        return [...history].reverse();
    }, [history]);

    const StatCard: React.FC<{label: string; value: string | number}> = ({ label, value }) => (
        <div className="text-center bg-[#FFF8E1] dark:bg-gray-700 p-4 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-500 flex-1">
          <p className="text-xl capitalize">{label}</p>
          <p className="text-4xl font-bold text-[#4DB6AC] dark:text-teal-400">{value}</p>
        </div>
    );
    
    const TabButton: React.FC<{ tabName: string; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }> = ({ tabName, label, icon: Icon }) => {
        const isActive = activeTab === tabName;
        return (
            <button
                onClick={() => setActiveTab(tabName)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition-colors duration-200 text-lg ${isActive ? 'bg-[#FFF8E1] dark:bg-gray-700' : 'hover:bg-[#EFEBE9] dark:hover:bg-gray-600/50'}`}
            >
                <Icon className={`w-7 h-7 ${isActive ? 'text-[#8D6E63] dark:text-amber-400' : 'text-gray-500'}`} />
                <span className={isActive ? 'font-bold' : ''}>{label}</span>
            </button>
        );
    };

    const buttonBaseClasses = "w-full px-4 py-3 flex items-center justify-center gap-3 text-2xl border-2 border-[#8D6E63] rounded-lg transition-all duration-200 focus:outline-none dark:border-gray-400";
    const selectedClasses = "bg-[#8D6E63] text-[#FEF7DC] dark:bg-amber-500 dark:text-gray-900";
    const unselectedClasses = "hover:bg-[#EFEBE9] dark:hover:bg-gray-600";
    
    const settingButtonBaseClasses = "px-4 py-3 text-2xl border-2 border-[#8D6E63] rounded-lg transition-all duration-200 focus:outline-none dark:border-gray-400";

    return (
        <>
        <div className="w-full max-w-5xl bg-[#FEF7DC] dark:bg-gray-800 p-6 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-600 relative animate-fade-in overflow-y-auto scrollbar-hide max-h-[90vh]">
            <button 
                onClick={onClose}
                aria-label="Close profile"
                className="absolute top-4 right-4 p-2 bg-[#FFF8E1] rounded-full border-2 border-[#8D6E63] text-[#8D6E63] hover:bg-[#EFEBE9] transition-colors dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-600 z-10"
            >
                <CloseIcon className="w-8 h-8"/>
            </button>
            <h2 className="text-5xl font-bold text-center mb-2">Profile</h2>
            
            {user ? (
                <div className="flex flex-col items-center gap-2 mb-4">
                    {/* Halloween Badge Design */}
                    {equippedAchievement && HALLOWEEN_ACHIEVEMENT_IDS.includes(equippedAchievement.id) ? (
                        <div className="relative" style={{ width: 100, height: 100 }}>
                            {/* Animated spinning ring */}
                            <HalloweenRing size={100} />
                            
                            {/* Outer pulsing glow ring */}
                            <div className="absolute inset-0 rounded-full border-4 border-orange-500/40 animate-halloween-ring-pulse" style={{ margin: 4 }} />
                            
                            {/* Spooky glow effect */}
                            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-orange-500/30 via-purple-600/30 to-violet-800/30 blur-lg animate-spooky-pulse" />
                            
                            {/* Halloween frame with avatar */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`relative rounded-full p-1 bg-gradient-to-br from-orange-500 via-purple-600 to-violet-800 animate-halloween-glow shadow-lg shadow-purple-500/50`}>
                                    <div className="relative">
                                        <img src={user.photoURL || undefined} alt={user.displayName || 'User'} className="w-16 h-16 rounded-full border-2 border-orange-400" />
                                        {/* Animated floating decorations */}
                                        <GhostIcon className="absolute -top-4 -left-4 w-7 h-7 text-purple-300 animate-ghost-float opacity-90" />
                                        <BatIcon className="absolute -top-3 -right-4 w-6 h-6 text-violet-400 animate-bat-fly" />
                                        <PumpkinIcon className="absolute -bottom-3 -left-3 w-6 h-6 text-orange-400 animate-pumpkin-glow" />
                                        <SpiderIcon className="absolute -bottom-2 -right-3 w-5 h-5 text-gray-300 animate-spider-dangle" />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Cobweb corner decorations */}
                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-gray-400/30 rounded-tr-2xl" />
                            <div className="absolute top-1 right-1 w-4 h-4 border-t border-r border-gray-400/20 rounded-tr-lg" />
                        </div>
                    ) : (
                        <div className={`relative rounded-full p-1 ${equippedAchievement?.ringClass || 'ring-transparent'} ring-4 transition-all`}>
                            <img src={user.photoURL || undefined} alt={user.displayName || 'User'} className="w-16 h-16 rounded-full border-2 border-[#8D6E63] dark:border-gray-500" />
                        </div>
                    )}
                     <div className="flex items-center gap-2">
                        <p className="text-xl font-semibold">{user.displayName}</p>
                        {equippedAchievement && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                HALLOWEEN_ACHIEVEMENT_IDS.includes(equippedAchievement.id) 
                                    ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white' 
                                    : 'text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600'
                            }`}>
                                {HALLOWEEN_ACHIEVEMENT_IDS.includes(equippedAchievement.id) ? '🎃 ' : ''}{equippedAchievement.name}
                            </span>
                        )}
                    </div>
                    <button onClick={onSignOut} className="text-sm text-gray-500 hover:underline dark:text-gray-400">Sign Out</button>
                </div>
            ) : (
                <div className="flex justify-center mb-4">
                    <button 
                        onClick={onSignIn} 
                        className="flex items-center gap-3 px-6 py-3 text-2xl bg-white dark:bg-gray-700 border-2 border-[#8D6E63] dark:border-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                        <GoogleIcon className="w-7 h-7" />
                        Sign in with Google
                    </button>
                </div>
            )}
            
            <div className="bg-[#FFF8E1] dark:bg-gray-700 p-4 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-500 mb-6">
                <h3 className="text-2xl font-bold mb-2 text-center">Level {levelInfo.level}: {levelInfo.title}</h3>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 border border-gray-400">
                    <div 
                        className="bg-teal-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${levelInfo.progress}%`}}
                    ></div>
                </div>
                <p className="text-center text-sm mt-1 text-gray-500 dark:text-gray-400">
                    {levelInfo.progressXp} / {levelInfo.neededXp} XP
                </p>
            </div>
            
            <div className="flex justify-center gap-2 mb-6 p-2 bg-[#EFEBE9] dark:bg-gray-900/50 rounded-xl">
                <TabButton tabName="stats" label="Stats" icon={TrophyIcon} />
                <TabButton tabName="multiplayer" label="Multiplayer" icon={UsersIcon} />
                <TabButton tabName="achievements" label="Achievements" icon={StarIcon} />
                <TabButton tabName="updates" label="Updates" icon={FileTextIcon} />
                <TabButton tabName="preferences" label="Preferences" icon={SettingsIcon} />
            </div>

            <div>
                {activeTab === 'stats' && (
                    <div className="animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <StatCard label="Tests" value={stats.tests} />
                                    <StatCard label="Total Time" value={formatTime(totalTypingTime)} />
                                    <StatCard label="Avg WPM" value={stats.avgWpm} />
                                    <StatCard label="Avg Acc" value={`${stats.avgAcc}%`} />
                                </div>
                                <div className="bg-[#FFF8E1] dark:bg-gray-700 p-4 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-500">
                                    <h3 className="text-2xl font-bold mb-2 text-center">Progress</h3>
                                    <HistoryGraph history={history} />
                                </div>
                            </div>

                            <div className="bg-[#FFF8E1] dark:bg-gray-700 p-4 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-500 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold mb-4 text-center">Test History</h3>
                                {recentTests.length > 0 ? (
                                    <ul className="space-y-3 overflow-y-auto scrollbar-hide flex-grow max-h-80 pr-2">
                                        {recentTests.map(test => (
                                            <li key={test.timestamp}>
                                                <button onClick={() => setViewingTest(test)} className="w-full bg-[#FEF7DC] dark:bg-gray-600 p-3 rounded-lg flex justify-between items-center text-lg hover:bg-[#EFEBE9] dark:hover:bg-gray-500 transition-colors">
                                                    <div>
                                                        <span className="font-bold text-2xl">{test.wpm} WPM</span>
                                                        <span className="text-gray-500 dark:text-gray-400 ml-2">({test.accuracy}%)</span>
                                                    </div>
                                                    <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                                                        <p>{test.timeLimit}s - {test.difficulty}</p>
                                                        <p>{new Date(test.timestamp).toLocaleDateString()}</p>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-gray-500 dark:text-gray-400 mt-8">Complete a test to see your history here!</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'multiplayer' && (
                    <div className="animate-fade-in">
                         <div className="bg-[#FFF8E1] dark:bg-gray-700 p-4 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-500 max-w-2xl mx-auto">
                            <h3 className="text-2xl font-bold mb-4 text-center flex items-center justify-center gap-2"><UsersIcon className="w-7 h-7" /> Multiplayer</h3>
                            {user ? (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xl font-semibold mb-2 text-center">Join a Room</h4>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter Room Code"
                                                value={joinRoomId}
                                                onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                                                className="flex-grow bg-[#FEF7DC] dark:bg-gray-600 border-2 border-[#8D6E63] dark:border-gray-500 rounded-lg px-3 py-2 text-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                                            />
                                            <button
                                                onClick={() => onJoinRoom(joinRoomId)}
                                                disabled={!joinRoomId}
                                                className="px-6 py-2 text-xl bg-[#FFCA28] text-[#6D4C41] border-2 border-[#6D4C41] rounded-lg hover:bg-[#FFB300] transition-transform transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed dark:bg-amber-400 dark:text-gray-800 dark:border-amber-500 dark:hover:bg-amber-500"
                                            >
                                                Join
                                            </button>
                                        </div>
                                    </div>
                                    <hr className="border-t-2 border-dashed border-[#8D6E63] dark:border-gray-500 my-3" />
                                    <div>
                                        <h4 className="text-xl font-semibold mb-2 text-center">Create a New Room</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <h5 className="text-lg text-center mb-1">Time</h5>
                                                <div className="flex justify-center gap-2">
                                                    {TIME_OPTIONS.map(time => (
                                                        <button
                                                            key={time}
                                                            onClick={() => setMultiplayerTime(time)}
                                                            className={`${settingButtonBaseClasses} ${time === multiplayerTime ? selectedClasses : unselectedClasses}`}
                                                        >
                                                            {time}s
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <h5 className="text-lg text-center mb-1">Difficulty</h5>
                                                <div className="flex justify-center gap-2">
                                                    {DIFFICULTY_OPTIONS.map(level => (
                                                        <button
                                                            key={level}
                                                            onClick={() => setMultiplayerDifficulty(level)}
                                                            className={`${settingButtonBaseClasses} ${level === multiplayerDifficulty ? selectedClasses : unselectedClasses} capitalize`}
                                                        >
                                                            {level}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onCreateRoom(multiplayerTime, multiplayerDifficulty)}
                                                className="w-full mt-2 px-6 py-3 text-2xl font-bold bg-[#4DB6AC] text-white border-2 border-[#308d82] rounded-lg hover:bg-[#43a095] transition-transform transform hover:scale-105 dark:bg-teal-500 dark:border-teal-600 dark:hover:bg-teal-600"
                                            >
                                                Create Room
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400">Sign in to play with friends!</p>
                            )}
                        </div>
                    </div>
                )}
                
                {activeTab === 'achievements' && (
                    <div className="animate-fade-in space-y-6">
                        {/* Regular Achievements */}
                        <div className="bg-[#FFF8E1] dark:bg-gray-700 p-4 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-500">
                            <h3 className="text-2xl font-bold mb-4 text-center">Achievements</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                                {ACHIEVEMENTS.filter(ach => !HALLOWEEN_ACHIEVEMENT_IDS.includes(ach.id)).map(ach => {
                                    const isUnlocked = !!unlockedAchievements[ach.id];
                                    const isEquipped = equippedItems.achievementId === ach.id;
                                    
                                    return (
                                        <div key={ach.id} className={`flex flex-col items-center text-center p-3 rounded-lg border-2 transition-all ${isUnlocked ? 'border-[#8D6E63] dark:border-gray-500' : 'border-dashed border-gray-400 dark:border-gray-600'}`}>
                                            {isUnlocked ? (
                                                <ach.icon className={`w-12 h-12 mb-2 ${ach.ringClass.replace('ring-', 'text-')}`} />
                                            ) : (
                                                <LockIcon className="w-12 h-12 mb-2 text-gray-400 dark:text-gray-600" />
                                            )}
                                            <p className={`font-bold ${isUnlocked ? '' : 'text-gray-500 dark:text-gray-400'}`}>{ach.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 h-10">{ach.description}</p>
                                            {isUnlocked && (
                                                <button onClick={() => onEquipAchievement(isEquipped ? null : ach.id)} className={`w-full mt-auto px-2 py-1 text-sm rounded-md transition-colors ${isEquipped ? 'bg-amber-500 text-white' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}>
                                                    {isEquipped ? 'Equipped' : 'Equip'}
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* 🎃 Halloween Achievements Section */}
                        <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/90 to-orange-900/80 p-4 rounded-2xl border-2 border-orange-500/50 shadow-lg shadow-purple-500/20 overflow-hidden">
                            {/* Spooky background decorations */}
                            <div className="absolute top-2 left-4 opacity-20">
                                <GhostIcon className="w-16 h-16 text-purple-300" />
                            </div>
                            <div className="absolute bottom-2 right-4 opacity-20">
                                <PumpkinIcon className="w-14 h-14 text-orange-400" />
                            </div>
                            <div className="absolute top-1/2 right-1/4 opacity-10">
                                <BatIcon className="w-20 h-20 text-violet-400" />
                            </div>
                            
                            <h3 className="text-2xl font-bold mb-4 text-center text-orange-400 relative z-10">
                                🎃 Halloween Achievements 🦇
                            </h3>
                            <p className="text-center text-purple-300 text-sm mb-4 relative z-10">Limited time spooky badges!</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
                                {ACHIEVEMENTS.filter(ach => HALLOWEEN_ACHIEVEMENT_IDS.includes(ach.id)).map(ach => {
                                    const isUnlocked = !!unlockedAchievements[ach.id];
                                    const isEquipped = equippedItems.achievementId === ach.id;
                                    
                                    return (
                                        <div key={ach.id} className={`flex flex-col items-center text-center p-3 rounded-lg border-2 transition-all backdrop-blur-sm ${
                                            isUnlocked 
                                                ? 'border-orange-500 bg-black/40 shadow-md shadow-orange-500/30' 
                                                : 'border-dashed border-purple-500/50 bg-black/20'
                                        }`}>
                                            {isUnlocked ? (
                                                <ach.icon className={`w-12 h-12 mb-2 ${ach.ringClass.replace('ring-', 'text-')} drop-shadow-lg`} />
                                            ) : (
                                                <LockIcon className="w-12 h-12 mb-2 text-purple-400/50" />
                                            )}
                                            <p className={`font-bold ${isUnlocked ? 'text-orange-300' : 'text-purple-400/70'}`}>{ach.name}</p>
                                            <p className="text-xs text-purple-300/70 mb-2 h-10">{ach.description}</p>
                                            {isUnlocked && (
                                                <button onClick={() => onEquipAchievement(isEquipped ? null : ach.id)} className={`w-full mt-auto px-2 py-1 text-sm rounded-md transition-colors ${
                                                    isEquipped 
                                                        ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white' 
                                                        : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50'
                                                }`}>
                                                    {isEquipped ? '🎃 Equipped' : 'Equip'}
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'updates' && (
                    <div className="animate-fade-in">
                        <div className="bg-[#FFF8E1] dark:bg-gray-700 p-4 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-500 max-h-[70vh] overflow-y-auto scrollbar-hide">
                            <h3 className="text-2xl font-bold mb-4 text-center">Update Log</h3>
                            <div className="relative pl-6">
                                {/* Timeline line */}
                                <div className="absolute left-8 top-2 bottom-2 w-0.5 bg-[#8D6E63]/30 dark:bg-gray-500/30"></div>
                                {updateLog.map((log, index) => (
                                    <div key={index} className="mb-8 relative">
                                        <div className="absolute left-[-0.75rem] top-1.5 w-4 h-4 bg-[#8D6E63] dark:bg-amber-500 rounded-full border-4 border-[#FEF7DC] dark:border-gray-800"></div>
                                        <p className="font-bold text-xl">{log.version} <span className="font-normal text-sm text-gray-500 dark:text-gray-400 ml-2">{log.date}</span></p>
                                        <ul className="mt-2 space-y-1 list-none pl-4 text-lg">
                                            {log.changes.map((change, cIndex) => (
                                                <li key={cIndex} className="flex items-start gap-2">
                                                    <span className={`w-3 h-3 mt-2 rounded-full flex-shrink-0 ${
                                                        change.type === 'feature' ? 'bg-green-500/80' :
                                                        change.type === 'fix' ? 'bg-blue-500/80' :
                                                        'bg-gray-400/80'
                                                    }`}></span>
                                                    <span>{change.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            <hr className="border-t-2 border-dashed border-[#8D6E63]/50 dark:border-gray-500/50 my-5" />

                            <h3 className="text-2xl font-bold mb-4 text-center">Common Problems</h3>
                            <div className="space-y-2">
                                {commonProblems.map((problem, index) => (
                                    <details key={index} className="bg-[#FEF7DC] dark:bg-gray-600/50 p-3 rounded-lg open:shadow-md">
                                        <summary className="font-semibold text-xl cursor-pointer list-outside">{problem.question}</summary>
                                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{problem.answer}</p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'preferences' && (
                    <div className="animate-fade-in">
                        <div className="bg-[#FFF8E1] dark:bg-gray-700 p-4 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-500">
                            <h3 className="text-2xl font-bold mb-4 text-center">Preferences</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-xl font-semibold mb-2 text-center">Home Screen</h4>
                                        <div className="flex gap-2">
                                            <button onClick={() => setHomeScreenMode('quick')} className={`flex-1 ${settingButtonBaseClasses} ${homeScreenMode === 'quick' ? selectedClasses : unselectedClasses}`}>
                                                Quick Start
                                            </button>
                                            <button onClick={() => setHomeScreenMode('classic')} className={`flex-1 ${settingButtonBaseClasses} ${homeScreenMode === 'classic' ? selectedClasses : unselectedClasses}`}>
                                                Classic
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold mb-2 text-center">Layout</h4>
                                        <div className="flex gap-2">
                                            <button onClick={() => setLayout('default')} className={`flex-1 ${settingButtonBaseClasses} ${layout === 'default' ? selectedClasses : unselectedClasses}`}>
                                                Default
                                            </button>
                                            <button onClick={() => setLayout('minimal')} className={`flex-1 ${settingButtonBaseClasses} ${layout === 'minimal' ? selectedClasses : unselectedClasses}`}>
                                                Minimal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={toggleMute} className={`${buttonBaseClasses} ${!isMuted ? selectedClasses : unselectedClasses}`}>
                                        {isMuted ? <VolumeOffIcon className="w-6 h-6"/> : <VolumeOnIcon className="w-6 h-6"/>}
                                        Sound
                                    </button>
                                    <button onClick={toggleTheme} className={`${buttonBaseClasses} ${theme !== 'light' ? selectedClasses : unselectedClasses}`}>
                                        {theme === 'light' ? <MoonIcon className="w-6 h-6"/> : (theme === 'dark' ? <SettingsIcon className="w-6 h-6"/> : <SunIcon className="w-6 h-6"/>) }
                                        Theme
                                    </button>
                                    <button onClick={toggleVisualKeyboard} className={`${buttonBaseClasses} ${showVisualKeyboard ? selectedClasses : unselectedClasses}`}>
                                        <KeyboardIcon className="w-6 h-6"/>
                                        Keyboard
                                    </button>
                                    <button onClick={toggleWordHighlight} className={`${buttonBaseClasses} ${wordHighlight ? selectedClasses : unselectedClasses}`}>
                                        <HighlighterIcon className="w-6 h-6"/>
                                        Highlight
                                    </button>
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold mb-2 text-center">Key Sound</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                        {KEY_SOUND_OPTIONS.map(sound => (
                                            <button
                                                key={sound}
                                                onClick={() => setKeySound(sound)}
                                                className={`${settingButtonBaseClasses} capitalize ${keySound === sound ? selectedClasses : unselectedClasses}`}
                                            >
                                                {sound}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold mb-2 text-center">Font Size</h4>
                                    <div className="flex gap-2">
                                        <button onClick={() => setFontSize('sm')} className={`flex-1 ${settingButtonBaseClasses} ${fontSize === 'sm' ? selectedClasses : unselectedClasses}`}>
                                            Small
                                        </button>
                                        <button onClick={() => setFontSize('md')} className={`flex-1 ${settingButtonBaseClasses} ${fontSize === 'md' ? selectedClasses : unselectedClasses}`}>
                                            Medium
                                        </button>
                                        <button onClick={() => setFontSize('lg')} className={`flex-1 ${settingButtonBaseClasses} ${fontSize === 'lg' ? selectedClasses : unselectedClasses}`}>
                                            Large
                                        </button>
                                    </div>
                                </div>
                                {layout === 'minimal' && (
                                    <div>
                                        <h4 className="text-xl font-semibold mb-2 text-center">Minimal Layout Width</h4>
                                        <div className="flex gap-2">
                                            <button onClick={() => setMinimalLayoutWidth('normal')} className={`flex-1 ${settingButtonBaseClasses} ${minimalLayoutWidth === 'normal' ? selectedClasses : unselectedClasses}`}>
                                                Normal
                                            </button>
                                            <button onClick={() => setMinimalLayoutWidth('large')} className={`flex-1 ${settingButtonBaseClasses} ${minimalLayoutWidth === 'large' ? selectedClasses : unselectedClasses}`}>
                                                Large
                                            </button>
                                            <button onClick={() => setMinimalLayoutWidth('xlarge')} className={`flex-1 ${settingButtonBaseClasses} ${minimalLayoutWidth === 'xlarge' ? selectedClasses : unselectedClasses}`}>
                                                X-Large
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 bg-[#FFF8E1] dark:bg-gray-700 p-6 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-500">
                            <h3 className="text-3xl font-bold mb-5 text-center">Shortcuts & Support</h3>
                            <div className="space-y-4 text-2xl px-2">
                                <div className="flex justify-between items-center">
                                    <span>Restart Test:</span>
                                    <div className="flex items-center gap-2">
                                        <kbd className="px-3 py-1 text-xl rounded-md bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Tab</kbd>
                                        <span className="text-gray-500">+</span>
                                        <kbd className="px-3 py-1 text-xl rounded-md bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Enter</kbd>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Toggle Keyboard:</span>
                                    <div className="flex items-center gap-2">
                                        <kbd className="px-3 py-1 text-xl rounded-md bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Ctrl</kbd>
                                        <span className="text-gray-500">+</span>
                                        <kbd className="px-3 py-1 text-xl rounded-md bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Q</kbd>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Toggle Sound:</span>
                                    <div className="flex items-center gap-2">
                                        <kbd className="px-3 py-1 text-xl rounded-md bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Ctrl</kbd>
                                        <span className="text-gray-500">+</span>
                                        <kbd className="px-3 py-1 text-xl rounded-md bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-200">M</kbd>
                                    </div>
                                </div>
                            </div>
                            <hr className="border-t-2 border-dashed border-[#8D6E63]/50 dark:border-gray-500/50 my-5" />
                            <div className="flex items-center justify-center gap-2 text-xl">
                                <MailIcon className="w-7 h-7" />
                                <a href="mailto:admin@doodlekeep.dpdns.org" className="text-[#4DB6AC] dark:text-teal-400 hover:underline">
                                    admin@doodlekeep.dpdns.org
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        {viewingTest && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={() => setViewingTest(null)}>
                <div className="bg-[#323437] p-8 rounded-2xl w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setViewingTest(null)} className="absolute top-4 right-4 p-2 bg-gray-700 rounded-full text-gray-300 hover:bg-gray-600">
                        <CloseIcon className="w-8 h-8"/>
                    </button>
                    <Results 
                        results={viewingTest}
                        isModalView={true}
                        // Dummy props, not used in modal view
                        onRestart={() => {}}
                        highScores={highScores}
                        isNewHighScore={false}
                        onViewProfile={() => {}}
                    />
                </div>
            </div>
        )}
        </>
    );
};

export default Profile;
