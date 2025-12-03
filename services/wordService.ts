
import { Difficulty } from '../types';
import { WORD_LISTS } from '../constants';

export const generateWords = (count: number, difficulty: Difficulty): string => {
  const wordList = WORD_LISTS[difficulty];
  let words = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    words.push(wordList[randomIndex]);
  }
  return words.join(' ');
};
