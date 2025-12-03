import { Achievement } from './types';
import { ZapIcon, TargetIcon, AwardIcon, GhostIcon, PumpkinIcon, SkullIcon, BatIcon, SpiderIcon, CandyIcon, CauldronIcon, WitchHatIcon, CoffinIcon, MoonStarsIcon, EyeIcon, FlameIcon } from './components/icons';

export const ACHIEVEMENTS: Achievement[] = [
  // WPM Achievements
  { id: 'WPM_50', name: 'Warming Up', description: 'Reach 50 WPM.', icon: ZapIcon, ringClass: 'ring-gray-400', type: 'wpm', threshold: 50 },
  { id: 'WPM_75', name: 'Speedy Fingers', description: 'Reach 75 WPM.', icon: ZapIcon, ringClass: 'ring-blue-400', type: 'wpm', threshold: 75 },
  { id: 'WPM_100', name: 'Typing Titan', description: 'Reach 100 WPM.', icon: ZapIcon, ringClass: 'ring-purple-500', type: 'wpm', threshold: 100 },
  { id: 'WPM_125', name: 'Velocity Virtuoso', description: 'Reach 125 WPM.', icon: ZapIcon, ringClass: 'ring-amber-400', type: 'wpm', threshold: 125 },

  // Accuracy Achievements
  { id: 'ACC_98', name: 'Sharp Shooter', description: 'Achieve 98% accuracy.', icon: TargetIcon, ringClass: 'ring-green-500', type: 'accuracy', threshold: 98 },
  { id: 'ACC_100', name: 'Perfect Typist', description: 'Achieve 100% accuracy.', icon: TargetIcon, ringClass: 'ring-teal-400', type: 'accuracy', threshold: 100 },
  
  // Completion Achievements
  { id: 'TESTS_1', name: 'First Doodle', description: 'Complete your first test.', icon: AwardIcon, ringClass: 'ring-slate-300', type: 'testsCompleted', threshold: 1 },
  { id: 'TESTS_10', name: 'Persistent Pecker', description: 'Complete 10 tests.', icon: AwardIcon, ringClass: 'ring-slate-400', type: 'testsCompleted', threshold: 10 },
  { id: 'TESTS_50', name: 'Dedicated Doodler', description: 'Complete 50 tests.', icon: AwardIcon, ringClass: 'ring-rose-500', type: 'testsCompleted', threshold: 50 },

  // 🎃 Halloween Achievements
  { id: 'HALLOWEEN_GHOST', name: 'Ghostly Typist', description: 'Type 66 WPM on Halloween mode.', icon: GhostIcon, ringClass: 'ring-purple-400', type: 'wpm', threshold: 66 },
  { id: 'HALLOWEEN_PUMPKIN', name: 'Pumpkin King', description: 'Reach 80 WPM with spooky passages.', icon: PumpkinIcon, ringClass: 'ring-orange-500', type: 'wpm', threshold: 80 },
  { id: 'HALLOWEEN_SKULL', name: 'Skeleton Crew', description: 'Complete 13 tests during spooky season.', icon: SkullIcon, ringClass: 'ring-gray-300', type: 'testsCompleted', threshold: 13 },
  { id: 'HALLOWEEN_BAT', name: 'Night Crawler', description: 'Achieve 95% accuracy in the dark.', icon: BatIcon, ringClass: 'ring-violet-600', type: 'accuracy', threshold: 95 },
  { id: 'HALLOWEEN_SPIDER', name: 'Web Weaver', description: 'Complete 31 tests this October.', icon: SpiderIcon, ringClass: 'ring-gray-600', type: 'testsCompleted', threshold: 31 },
  { id: 'HALLOWEEN_CANDY', name: 'Trick or Type', description: 'Reach 100 WPM on Halloween.', icon: CandyIcon, ringClass: 'ring-pink-400', type: 'wpm', threshold: 100 },
  { id: 'HALLOWEEN_CAULDRON', name: 'Potion Master', description: 'Complete 5 tests with 100% accuracy.', icon: CauldronIcon, ringClass: 'ring-green-600', type: 'accuracy', threshold: 100 },
  { id: 'HALLOWEEN_WITCH', name: 'Witch\'s Apprentice', description: 'Type 90 WPM in spooky mode.', icon: WitchHatIcon, ringClass: 'ring-indigo-500', type: 'wpm', threshold: 90 },
  { id: 'HALLOWEEN_COFFIN', name: 'Undead Typist', description: 'Complete 66 tests total.', icon: CoffinIcon, ringClass: 'ring-stone-500', type: 'testsCompleted', threshold: 66 },
  { id: 'HALLOWEEN_MOON', name: 'Midnight Typer', description: 'Reach 75 WPM after dark.', icon: MoonStarsIcon, ringClass: 'ring-blue-300', type: 'wpm', threshold: 75 },
  { id: 'HALLOWEEN_EYE', name: 'All-Seeing', description: 'Achieve 99% accuracy.', icon: EyeIcon, ringClass: 'ring-red-400', type: 'accuracy', threshold: 99 },
  { id: 'HALLOWEEN_FLAME', name: 'Soul Burner', description: 'Reach 120 WPM on Halloween.', icon: FlameIcon, ringClass: 'ring-orange-600', type: 'wpm', threshold: 120 },
];

export const getAchievementById = (id: string | null | undefined): Achievement | undefined => {
  if (!id) return undefined;
  return ACHIEVEMENTS.find(ach => ach.id === id);
}