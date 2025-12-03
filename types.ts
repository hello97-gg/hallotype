// Fix: Import React to provide types for React.FC and React.SVGProps.
import React from 'react';

export enum GameState {
  Loading = 'loading',
  Waiting = 'waiting',
  Settings = 'settings',
  Running = 'running',
  Finished = 'finished',
  Profile = 'profile',
  Leaderboard = 'leaderboard',
  MultiplayerLobby = 'multiplayer_lobby',
}

export enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

export interface TestResult {
  wpm: number;
  accuracy: number;
}

export interface TestGraphDataPoint {
  time: number;
  wpm: number;
  raw: number;
  errors: number;
}

export interface TestCharStats {
  correct: number;
  incorrect: number;
  missed: number;
  extra: number;
}

export interface TestHistoryItem extends TestResult {
  errors: number;
  totalChars: number;
  timeLimit: number;
  difficulty: Difficulty;
  timestamp: number;
  // new fields
  rawWpm: number;
  consistency: number;
  charStats: TestCharStats;
  graphData: TestGraphDataPoint[];
}


export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  ringClass: string; // Tailwind CSS class for the ring color
  type: 'wpm' | 'accuracy' | 'testsCompleted';
  threshold: number;
}

export interface UnlockedAchievements {
  [id: string]: number; // key: achievementId, value: timestamp
}

export interface EquippedItems {
  achievementId: string | null;
}


export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  wpm: number;
  timeLimit?: number;
  equippedAchievement?: {
    id: string;
    name: string;
    ringClass: string;
  };
}

export type FontSize = 'sm' | 'md' | 'lg';
export type LayoutMode = 'default' | 'minimal';
export type MinimalLayoutWidth = 'normal' | 'large' | 'xlarge';

export type SoundType = 'keypress' | 'error' | 'tick' | 'complete';
export type KeySound = 'off' | 'click' | 'beep' | 'pop' | 'sine' | 'sawtooth' | 'square' | 'triangle' | 'mechanical' | 'rubber dome' | 'spooky';

export interface MultiplayerPlayer {
  uid: string;
  displayName: string;
  photoURL: string;
  status: 'joined' | 'typing' | 'finished';
  wpm: number;
  accuracy: number;
  progress: number; // 0-100
}

export interface MultiplayerRoom {
  roomId: string;
  hostId: string;
  status: 'waiting' | 'running' | 'finished';
  createdAt: number; // timestamp
  startTime?: number; // timestamp
  timeLimit: number;
  difficulty: Difficulty;
  words: string;
  players: Record<string, MultiplayerPlayer>;
}