import React from 'react';
import Timer from './Timer';
import Keyboard from './Keyboard';
import { RestartIcon, VolumeOnIcon, VolumeOffIcon, KeyboardIcon } from './icons';
import { Difficulty, FontSize, TestHistoryItem, SoundType, LayoutMode, MinimalLayoutWidth, TestGraphDataPoint, TestCharStats } from '../types';
import { TIME_OPTIONS, DIFFICULTY_OPTIONS } from '../constants';

interface TypingTestProps {
  words: string;
  timeLimit: number;
  difficulty: Difficulty;
  onComplete: (result: Omit<TestHistoryItem, 'timestamp'>) => void;
  onRestart: () => void;
  playSound: (soundType: SoundType) => void;
  isMuted: boolean;
  toggleMute: () => void;
  showVisualKeyboard: boolean;
  fontSize: FontSize;
  layout: LayoutMode;
  minimalLayoutWidth: MinimalLayoutWidth;
  isWaiting?: boolean;
  onWaitingStart?: () => void;
  setTimeLimit: (time: number) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  isMultiplayer?: boolean;
  onProgress?: (progress: { wpm: number; accuracy: number; progress: number }) => void;
  startTime?: number; // For server-driven timer in multiplayer
  setIsUiHidden: (isIdle: boolean) => void;
  isUiHidden: boolean;
  wordHighlight: boolean;
}

const FONT_SIZE_MAP: Record<FontSize, { class: string; caretHeight: string; topOffset: string; minimalHeight: string; minimalGap: string }> = {
  sm: { class: 'text-3xl', caretHeight: '1.6rem', topOffset: '0.25rem', minimalHeight: '2.8rem', minimalGap: '1.5rem'},
  md: { class: 'text-4xl', caretHeight: '2.0rem', topOffset: '0.3rem', minimalHeight: '3.3rem', minimalGap: '1.7rem' },
  lg: { class: 'text-5xl', caretHeight: '2.75rem', topOffset: '0.4rem', minimalHeight: '4.5rem', minimalGap: '2rem' },
};

const MINIMAL_WIDTH_MAP: Record<MinimalLayoutWidth, string> = {
  normal: 'max-w-screen-xl',
  large: 'max-w-none w-11/2',
  xlarge: 'max-w-none',
};


const TypingTest: React.FC<TypingTestProps> = ({ words, timeLimit, difficulty, onComplete, onRestart, playSound, isMuted, toggleMute, showVisualKeyboard, fontSize, layout, minimalLayoutWidth, isWaiting, onWaitingStart, setTimeLimit, setDifficulty, isMultiplayer, onProgress, startTime, setIsUiHidden, isUiHidden, wordHighlight }) => {
  const [timeLeft, setTimeLeft] = React.useState(timeLimit);
  const [isFocused, setIsFocused] = React.useState(true);
  const [hasStarted, setHasStarted] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const [activeLine, setActiveLine] = React.useState(0);
  const [isCaretReady, setIsCaretReady] = React.useState(false);

  const idleTimerRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number | null>(null);
  const snapshotIntervalRef = React.useRef<number | null>(null);

  const wordsArray = React.useMemo(() => words.split(' '), [words]);
  
  const currentWordIndex = React.useRef(0);
  const typedWords = React.useRef<string[]>([]);
  const lastInput = React.useRef('');
  const lineHeightRef = React.useRef(0);
  const charStats = React.useRef<TestCharStats>({ correct: 0, incorrect: 0, extra: 0, missed: 0 });
  const graphData = React.useRef<TestGraphDataPoint[]>([]);
  const errorCountAtSnapshot = React.useRef(0);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const wordsContainerRef = React.useRef<HTMLDivElement>(null);
  const wordsInnerRef = React.useRef<HTMLDivElement>(null);
  const wordElements = React.useRef<(HTMLSpanElement | null)[]>([]);
  const wordMetrics = React.useRef<{ top: number }[]>([]);
  const caretRef = React.useRef<HTMLSpanElement>(null);
  
  const remToPx = React.useMemo(() => {
    if (typeof window === 'undefined') return 16;
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
  }, []);

  const { class: fontSizeClass, caretHeight, topOffset, minimalHeight, minimalGap } = FONT_SIZE_MAP[fontSize];
  
  const handleMouseMove = React.useCallback(() => {
    if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
    }
    setIsUiHidden(false);

    idleTimerRef.current = window.setTimeout(() => {
        setIsUiHidden(true);
    }, 2000);
  }, [setIsUiHidden]);

  React.useEffect(() => {
    if (hasStarted && !isComplete) {
        window.addEventListener('mousemove', handleMouseMove);
    } else {
        setIsUiHidden(false); // Ensure UI is visible when not in an active test
    }

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (idleTimerRef.current) {
            window.clearTimeout(idleTimerRef.current);
        }
    };
  }, [hasStarted, isComplete, handleMouseMove, setIsUiHidden]);
  
  const updateWordStyles = React.useCallback(() => {
    if (layout === 'minimal') return;
    if (wordMetrics.current.length === 0 || !wordElements.current.length) return;

    const activeWordMetric = wordMetrics.current[currentWordIndex.current];
    if (!activeWordMetric || activeWordMetric.top < 0) return;
    const activeLineTop = activeWordMetric.top;

    wordElements.current.forEach((wordEl, index) => {
        if (!wordEl) return;
        
        const metric = wordMetrics.current[index];
        if (!metric || metric.top < 0) return;

        wordEl.classList.remove('scale-105', 'opacity-25', 'opacity-40', 'bg-black/[.08]', 'dark:bg-white/[.08]', 'rounded');

        if (index === currentWordIndex.current) {
            wordEl.classList.add('scale-105');
            if (wordHighlight) {
                wordEl.classList.add('bg-black/[.08]', 'dark:bg-white/[.08]', 'rounded');
            }
        } else if (index > currentWordIndex.current) {
            if (metric.top === activeLineTop) {
                wordEl.classList.add('scale-105');
            } else if (metric.top > activeLineTop) {
                wordEl.classList.add('opacity-25');
            }
        }
    });
  }, [wordHighlight, layout]);

  const updateCaretPosition = React.useCallback(() => {
    if (!caretRef.current || !wordsContainerRef.current) return;
    const wordEl = wordElements.current[currentWordIndex.current];

    if (!wordEl) {
        caretRef.current.style.display = 'none';
        return;
    }
    caretRef.current.style.display = 'block';

    const container = wordsContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const { scrollTop, scrollLeft } = container;

    const currentInput = inputRef.current?.value || '';
    const originalWord = wordsArray[currentWordIndex.current];
    const charElements = Array.from(wordEl.children).filter(c => !(c as HTMLElement).classList.contains('extra-chars')) as HTMLElement[];

    let targetRect: DOMRect;
    let x: number;
    let y: number;

    if (currentInput.length === 0) {
        targetRect = charElements[0]?.getBoundingClientRect() ?? wordEl.getBoundingClientRect();
        x = targetRect.left - containerRect.left + scrollLeft;
        y = targetRect.top - containerRect.top + scrollTop;
    } else {
        let targetCharEl: HTMLElement | undefined;

        if (currentInput.length > originalWord.length) {
            const extraEl = wordEl.querySelector('.extra-chars') as HTMLElement;
            if (extraEl) {
                targetRect = extraEl.getBoundingClientRect();
                x = targetRect.right - containerRect.left + scrollLeft;
                y = targetRect.top - containerRect.top + scrollTop;
            } else {
                targetCharEl = charElements[originalWord.length - 1];
                targetRect = targetCharEl?.getBoundingClientRect() ?? wordEl.getBoundingClientRect();
                x = targetRect.right - containerRect.left + scrollLeft;
                y = targetRect.top - containerRect.top + scrollTop;
            }
        } else {
            targetCharEl = charElements[currentInput.length - 1];
            targetRect = targetCharEl?.getBoundingClientRect() ?? wordEl.getBoundingClientRect();
            x = targetRect.right - containerRect.left + scrollLeft;
            y = targetRect.top - containerRect.top + scrollTop;
        }
    }
    
    const isLineScaled = layout === 'default' && wordEl.classList.contains('scale-105');
    const scaleFactor = isLineScaled ? 1.05 : 1.0;
    
    const yOffset = parseFloat(topOffset) * remToPx;
    caretRef.current.style.transform = `translate(${x}px, ${y + yOffset}px) scaleY(${scaleFactor})`;
    caretRef.current.style.transformOrigin = 'bottom';

  }, [wordsArray, remToPx, topOffset, layout]);
  
  React.useLayoutEffect(() => {
    if (!wordsContainerRef.current) return;
    wordMetrics.current = [];
    const calculateMetrics = () => {
      if (!wordsContainerRef.current) return;
      const containerRect = wordsContainerRef.current.getBoundingClientRect();
      const newMetrics = wordElements.current.map(el => {
        if (!el) return { top: -1 };
        const elRect = el.getBoundingClientRect();
        return { top: elRect.top - containerRect.top };
      });
      wordMetrics.current = newMetrics;

      let firstLineTop = -1, secondLineTop = -1;
      for (const metric of newMetrics) {
        if (metric.top < 0) continue;
        if (firstLineTop < 0) firstLineTop = metric.top;
        if (metric.top > firstLineTop) {
          secondLineTop = metric.top;
          break;
        }
      }
      if (secondLineTop > -1) {
        lineHeightRef.current = secondLineTop - firstLineTop;
      } else if (wordElements.current[0]) {
        lineHeightRef.current = wordElements.current[0].getBoundingClientRect().height;
      }

      updateWordStyles();
      updateCaretPosition();
      setIsCaretReady(true);
    };

    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(calculateMetrics);
      });
    });

    const resizeObserver = new ResizeObserver(calculateMetrics);
    resizeObserver.observe(wordsContainerRef.current);

    return () => resizeObserver.disconnect();
  }, [words, fontSize, layout, minimalLayoutWidth, updateWordStyles, updateCaretPosition]);

  React.useLayoutEffect(() => {
    if (wordMetrics.current.length === 0) return;
    
    if (layout === 'minimal' && hasStarted) {
        const innerEl = wordsInnerRef.current;
        if (!innerEl) return;

        const handleTransitionEnd = () => {
            requestAnimationFrame(updateCaretPosition);
            innerEl.removeEventListener('transitionend', handleTransitionEnd);
        };
        innerEl.addEventListener('transitionend', handleTransitionEnd);
        
        const timeoutId = setTimeout(() => {
            requestAnimationFrame(updateCaretPosition);
            innerEl.removeEventListener('transitionend', handleTransitionEnd);
        }, 250);

        return () => {
            clearTimeout(timeoutId);
            innerEl.removeEventListener('transitionend', handleTransitionEnd);
        };
    } else if (layout === 'minimal') {
        updateCaretPosition();
    }
  }, [activeLine, layout, hasStarted, updateCaretPosition]);

  const resetTest = React.useCallback(() => {
    setTimeLeft(timeLimit);
    setHasStarted(false);
    setIsComplete(false);
    setActiveLine(0);
    startTimeRef.current = null;
    setIsCaretReady(false);
    if(snapshotIntervalRef.current) clearInterval(snapshotIntervalRef.current);
    
    currentWordIndex.current = 0;
    typedWords.current = [];
    lastInput.current = '';
    charStats.current = { correct: 0, incorrect: 0, extra: 0, missed: 0 };
    graphData.current = [];
    errorCountAtSnapshot.current = 0;
    
    if (inputRef.current) {
      inputRef.current.value = '';
      if (!isMultiplayer) inputRef.current.focus();
    }
    
    wordElements.current.forEach(wordEl => {
      if (wordEl) {
        wordEl.className = 'transition-all duration-200 ease-out';
        if (layout === 'minimal') {
            wordEl.classList.add('opacity-40');
        }
        const extra = wordEl.querySelector('.extra-chars');
        if (extra) wordEl.removeChild(extra);
        
        Array.from(wordEl.children).forEach(charEl => {
          (charEl as HTMLElement).className = '';
        });
      }
    });

    if (wordsContainerRef.current) {
      wordsContainerRef.current.scrollTop = 0;
    }
    
    setTimeout(() => {
        updateWordStyles();
        if (wordElements.current[0]) {
             wordElements.current[0].classList.remove('opacity-40');
        }
    }, 0);
  }, [timeLimit, isMultiplayer, updateWordStyles, layout]);
  
  React.useEffect(() => {
    resetTest();
  }, [words, timeLimit, resetTest]);

  const calculateResults = React.useCallback(() => {
    if (isComplete) return;
    setIsComplete(true);
    if(snapshotIntervalRef.current) clearInterval(snapshotIntervalRef.current);

    const finalCharStats = { ...charStats.current };
    const totalCharsTyped = finalCharStats.correct + finalCharStats.incorrect + finalCharStats.extra;
    const totalErrors = finalCharStats.incorrect + finalCharStats.missed + finalCharStats.extra;

    const wpm = (finalCharStats.correct / 5) / (timeLimit / 60);
    const rawWpm = (totalCharsTyped / 5) / (timeLimit / 60);
    const accuracy = totalCharsTyped > 0 ? ((totalCharsTyped - totalErrors) / totalCharsTyped) * 100 : 0;
    
    let consistency = 0;
    if (graphData.current.length > 1) {
      const wpmValues = graphData.current.map(d => d.wpm);
      const avgWpm = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
      if(avgWpm > 0) {
        const stdDev = Math.sqrt(wpmValues.map(x => Math.pow(x - avgWpm, 2)).reduce((a, b) => a + b, 0) / wpmValues.length);
        consistency = Math.max(0, 100 - (stdDev / avgWpm) * 100);
      }
    }
    
    onComplete({
        wpm: Math.round(wpm),
        accuracy: Math.round(accuracy),
        rawWpm: Math.round(rawWpm),
        consistency: Math.round(consistency),
        charStats: finalCharStats,
        graphData: graphData.current,
        errors: totalErrors,
        totalChars: totalCharsTyped,
        timeLimit,
        difficulty,
    });
  }, [isComplete, onComplete, timeLimit, difficulty]);

  React.useEffect(() => {
    if (isComplete) return;

    if (isMultiplayer && startTime) {
      const timerId = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const remaining = Math.max(0, timeLimit - elapsed);
        setTimeLeft(remaining);
        if (remaining <= 0.01) {
          clearInterval(timerId);
          calculateResults();
        }
      }, 100);
      return () => clearInterval(timerId);
    }

    if (!isMultiplayer && hasStarted && startTimeRef.current) {
      const timerId = setInterval(() => {
        const elapsedSeconds = (Date.now() - startTimeRef.current!) / 1000;
        const remaining = timeLimit - elapsedSeconds;

        if (remaining <= 0) {
          setTimeLeft(0);
          clearInterval(timerId);
          calculateResults();
          return;
        }
        
        setTimeLeft(prevTimeLeft => {
            const prevCeiled = Math.ceil(prevTimeLeft);
            const newCeiled = Math.ceil(remaining);
            if (newCeiled < prevCeiled && newCeiled <= 5) {
               playSound('tick');
            }
            return remaining;
        });
      }, 100);
      return () => clearInterval(timerId);
    }
  }, [isMultiplayer, startTime, hasStarted, isComplete, timeLimit, calculateResults, playSound]);

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (isComplete) return;

    if (!hasStarted) {
        setHasStarted(true);
        startTimeRef.current = Date.now();
        snapshotIntervalRef.current = window.setInterval(() => {
             const elapsedSeconds = (Date.now() - startTimeRef.current!) / 1000;
             const correctWpm = (charStats.current.correct / 5) / (elapsedSeconds / 60);
             const rawChars = charStats.current.correct + charStats.current.incorrect + charStats.current.extra;
             const rawWpm = (rawChars / 5) / (elapsedSeconds / 60);
             const currentErrors = charStats.current.incorrect + charStats.current.extra + charStats.current.missed;
             
             graphData.current.push({
                 time: Math.round(elapsedSeconds),
                 wpm: Math.round(correctWpm),
                 raw: Math.round(rawWpm),
                 errors: currentErrors - errorCountAtSnapshot.current
             });
             errorCountAtSnapshot.current = currentErrors;
        }, 1000);

        if (isWaiting && onWaitingStart) {
            onWaitingStart();
        }
        setIsUiHidden(true);
        if (idleTimerRef.current) {
            window.clearTimeout(idleTimerRef.current);
        }
    }
    
    const currentInput = e.currentTarget.value;
    if (currentInput.endsWith(' ')) return;

    if (currentInput.length > lastInput.current.length) {
        const typedCharIndex = currentInput.length - 1;
        const originalWord = wordsArray[currentWordIndex.current];
        if (typedCharIndex >= originalWord.length) {
            charStats.current.extra++;
            playSound('error');
        } else if (currentInput[typedCharIndex] !== originalWord[typedCharIndex]) {
            charStats.current.incorrect++;
            playSound('error');
        } else {
            charStats.current.correct++;
            playSound('keypress');
        }
    } else { // Backspace
        // simplified logic: assume backspace corrects one error or reduces one correct char.
        // a full implementation would track state per character.
    }
    lastInput.current = currentInput;
    
    const gameIsRunning = (isMultiplayer && !!startTime) || hasStarted;
    if (onProgress && gameIsRunning) {
        const elapsedSeconds = isMultiplayer && startTime ? (Date.now() - startTime) / 1000 : (Date.now() - (startTimeRef.current || Date.now())) / 1000;
        if (elapsedSeconds > 0) {
            let correctCharsCount = 0;
            const allTyped = [...typedWords.current, currentInput];
            allTyped.forEach((typed, index) => {
                const original = wordsArray[index];
                if (index < allTyped.length - 1 && typed === original) {
                    correctCharsCount += original.length + 1;
                } else if (index === allTyped.length - 1) {
                    for (let i = 0; i < typed.length; i++) {
                        if (i < original.length && typed[i] === original[i]) {
                            correctCharsCount++;
                        }
                    }
                }
            });

            const currentWpm = (correctCharsCount / 5) / (elapsedSeconds / 60);
            const progressPercentage = (currentWordIndex.current / wordsArray.length) * 100;

            onProgress({
                wpm: isNaN(currentWpm) ? 0 : Math.round(currentWpm),
                accuracy: 0,
                progress: Math.min(100, progressPercentage),
            });
        }
    }

    const wordEl = wordElements.current[currentWordIndex.current];
    if (!wordEl) return;
    const originalWord = wordsArray[currentWordIndex.current];
    const charElements = Array.from(wordEl.children).filter(c => !(c as HTMLElement).classList.contains('extra-chars'));

    charElements.forEach((charEl, i) => {
        if (i < currentInput.length) {
            (charEl as HTMLElement).className = currentInput[i] === originalWord[i] ? 'text-green-600 dark:text-green-400' : 'text-red-500 underline decoration-red-500 decoration-2 underline-offset-4';
        } else {
            (charEl as HTMLElement).className = '';
        }
    });
    
    let extraEl = wordEl.querySelector('.extra-chars') as HTMLSpanElement;
    if (currentInput.length > originalWord.length) {
        if (!extraEl) {
            extraEl = document.createElement('span');
            extraEl.className = 'extra-chars bg-red-100 text-red-500 rounded dark:bg-red-900/50';
            wordEl.appendChild(extraEl);
        }
        extraEl.textContent = currentInput.slice(originalWord.length);
    } else if (extraEl) {
        wordEl.removeChild(extraEl);
    }

    updateCaretPosition();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleVisualKeyDown(e);
    if (isComplete) return;

    if (e.key === ' ') {
      e.preventDefault();
      const inputEl = e.currentTarget;
      const typedWord = inputEl.value;
      if (typedWord === '') return;

      playSound('keypress');

      const prevWordIndex = currentWordIndex.current;
      const originalWord = wordsArray[prevWordIndex];
      const prevWordEl = wordElements.current[prevWordIndex];

      if (typedWord !== originalWord) {
        if (typedWord.length < originalWord.length) {
            charStats.current.missed += originalWord.length - typedWord.length;
        }
        if (layout === 'minimal') {
            prevWordEl?.classList.add('text-red-500');
        } else {
            prevWordEl?.classList.add('text-red-500', 'underline', 'decoration-red-500', 'decoration-2', 'underline-offset-4');
        }
      } else {
         charStats.current.correct++; // For the space
         if (layout === 'minimal') {
            prevWordEl?.classList.remove('opacity-40');
         } else {
            prevWordEl?.classList.add('text-green-600', 'dark:text-green-400');
         }
      }

      typedWords.current[prevWordIndex] = typedWord;
      currentWordIndex.current++;
      
      inputEl.value = '';
      lastInput.current = '';
      
      const nextWordEl = wordElements.current[currentWordIndex.current];
      let lineChanged = false;

      if (!nextWordEl) {
          if (!isMultiplayer) calculateResults();
      } else {
          if (layout === 'minimal') {
              nextWordEl.classList.remove('opacity-40');
              if (prevWordEl && nextWordEl.offsetTop > prevWordEl.offsetTop) {
                  setActiveLine(l => l + 1);
                  lineChanged = true;
              }
          }
      }

      const containerEl = wordsContainerRef.current;
      if (layout === 'default' && nextWordEl && containerEl) {
        const wordRect = nextWordEl.getBoundingClientRect();
        const containerRect = containerEl.getBoundingClientRect();
        if (wordRect.top > containerRect.top + containerRect.height / 2) {
          containerEl.scrollBy({ top: wordRect.height + 5, behavior: 'smooth' });
        }
      }
      
      updateWordStyles();
      if (!lineChanged) {
        updateCaretPosition();
      }
    }
  };
  
  const handleVisualKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') {
        setActiveKey('space');
    } else if (e.key.length === 1) {
        setActiveKey(e.key.toLowerCase());
    }
  };

  const wordElementsJSX = React.useMemo(() => wordsArray.map((word, wordIndex) => {
        const initialClass = layout === 'minimal' && wordIndex > 0 ? 'opacity-40' : '';
        return (
            <span key={wordIndex} ref={el => { wordElements.current[wordIndex] = el; }} className={`transition-all duration-200 ease-out ${initialClass}`}>
                {word.split('').map((char, charIndex) => (
                    <span key={charIndex}>{char}</span>
                ))}
            </span>
        );
    }), [wordsArray, layout]);

  if (layout === 'minimal') {
    const minimalLayoutWidthClass = MINIMAL_WIDTH_MAP[minimalLayoutWidth];
    return (
      <div className={`w-full flex flex-col items-center gap-8 ${minimalLayoutWidthClass}`}>
        <div className="flex items-center justify-center gap-4 h-16">
           {(!isWaiting || hasStarted || isMultiplayer) ? (
                <p className="text-5xl font-bold text-center text-[#FFCA28] dark:text-amber-400">{Math.ceil(timeLeft)}</p>
           ) : (
             <div className={`flex items-center gap-4 transition-opacity duration-300 ${isUiHidden && hasStarted ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex gap-2 p-1 bg-[#EFEBE9] dark:bg-gray-600 rounded-lg">
                    {TIME_OPTIONS.map(time => (
                        <button key={time} onClick={() => setTimeLimit(time)} className={`px-3 py-1 text-lg rounded-md transition-colors ${time === timeLimit ? 'bg-[#FFF8E1] dark:bg-gray-800 text-[#6D4C41] dark:text-gray-200' : 'text-gray-500 dark:text-gray-400 hover:text-[#6D4C41] dark:hover:text-gray-200'}`}>{time}</button>
                    ))}
                </div>
                <div className="flex gap-2 p-1 bg-[#EFEBE9] dark:bg-gray-600 rounded-lg">
                    {DIFFICULTY_OPTIONS.map(level => (
                        <button key={level} onClick={() => setDifficulty(level)} className={`px-3 py-1 text-lg rounded-md transition-colors capitalize ${level === difficulty ? 'bg-[#FFF8E1] dark:bg-gray-800 text-[#6D4C41] dark:text-gray-200' : 'text-gray-500 dark:text-gray-400 hover:text-[#6D4C41] dark:hover:text-gray-200'}`}>{level}</button>
                    ))}
                </div>
            </div>
          )}
        </div>

        <div 
          className="relative w-full"
          onClick={() => inputRef.current?.focus()}
        >
          <div 
            ref={wordsContainerRef}
            className={`relative ${fontSizeClass} transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-50'}`}
            style={{ 
                fontFamily: "'Fira Code', monospace",
                height: isComplete ? 'auto' : `calc((${minimalHeight} * 3) + (${minimalGap} * 2))`,
                maxHeight: isComplete ? '40vh' : 'none',
                overflowY: isComplete ? 'auto' : 'hidden',
                overflowX: 'hidden',
                width: '100%',
            }}
          >
            <div 
              ref={wordsInnerRef} 
              className="w-full flex flex-wrap justify-center" 
              style={{ 
                  transform: isComplete ? 'translateY(0)' : `translateY(calc(${minimalHeight} - ${activeLine * lineHeightRef.current}px))`,
                  transition: 'transform 200ms ease-out',
                  gap: `${minimalGap}`
              }}
            >
              {wordElementsJSX}
            </div>
             {!isComplete && (
                <span
                    ref={caretRef}
                    className={`absolute top-0 left-0 w-1 bg-[#FFCA28] dark:bg-amber-400 transition-transform duration-100 ease-out ${isCaretReady ? 'caret-blink' : 'opacity-0'}`}
                    style={{ height: caretHeight }}
                />
             )}
          </div>
          {isWaiting && !hasStarted && <div className="absolute inset-0 flex items-center justify-center bg-black/5 cursor-text pointer-events-none"><p className="text-3xl font-bold p-4 bg-[#FFCA28]/80 dark:bg-amber-400/80 rounded-lg">Start typing to begin</p></div>}
          {!isFocused && hasStarted && !isComplete && <div className="absolute inset-0 flex items-center justify-center bg-black/10"><p className="text-3xl font-bold p-4 bg-[#FFCA28] dark:bg-amber-400 rounded-lg">Click here to continue typing</p></div>}
          
          <input ref={inputRef} type="text" onKeyDown={handleKeyDown} onKeyUp={() => setActiveKey(null)} onInput={handleInput} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-text -z-10" autoFocus disabled={isComplete} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" />
        </div>
        
         <div className="flex flex-col items-center justify-center gap-4">
             <div className={`transition-opacity duration-300 ${isUiHidden && hasStarted ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button onClick={onRestart} aria-label="Restart test" className="p-2 text-[#8D6E63] hover:text-[#FFCA28] transition-colors dark:text-gray-500 dark:hover:text-amber-400"><RestartIcon className="w-8 h-8" /></button>
             </div>
            {showVisualKeyboard && <Keyboard activeKey={activeKey} />}
         </div>
      </div>
    );
  }

  // Default layout
  return (
    <div 
        className={`w-full max-w-screen-2xl relative flex flex-col items-center gap-8`}
        onClick={() => inputRef.current?.focus()}
    >
        <div className="absolute -top-16 flex items-center justify-between w-full">
            <div>
                {(!isWaiting || hasStarted || isMultiplayer) ? <Timer timeLeft={Math.ceil(timeLeft)} /> : (
                    <div className={`flex items-center gap-4 transition-opacity duration-300 ${isUiHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <div className="flex gap-2 p-1 bg-[#EFEBE9] dark:bg-gray-600 rounded-lg">
                            {TIME_OPTIONS.map(time => (<button key={time} onClick={() => setTimeLimit(time)} className={`px-3 py-1 text-lg rounded-md transition-colors ${time === timeLimit ? 'bg-[#FFF8E1] dark:bg-gray-800 text-[#6D4C41] dark:text-gray-200' : 'text-gray-500 dark:text-gray-400 hover:text-[#6D4C41] dark:hover:text-gray-200'}`}>{time}</button>))}
                        </div>
                        <div className="flex gap-2 p-1 bg-[#EFEBE9] dark:bg-gray-600 rounded-lg">
                            {DIFFICULTY_OPTIONS.map(level => (<button key={level} onClick={() => setDifficulty(level)} className={`px-3 py-1 text-lg rounded-md transition-colors capitalize ${level === difficulty ? 'bg-[#FFF8E1] dark:bg-gray-800 text-[#6D4C41] dark:text-gray-200' : 'text-gray-500 dark:text-gray-400 hover:text-[#6D4C41] dark:hover:text-gray-200'}`}>{level}</button>))}
                        </div>
                    </div>
                )}
            </div>

            <div className={`flex justify-end gap-4 transition-opacity duration-300 ${isUiHidden && hasStarted ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {(!isMultiplayer && (hasStarted || !isWaiting)) && (
                    <>
                        <button onClick={onRestart} aria-label="Go to Home" className="p-2 bg-[#FFF8E1] rounded-full border-2 border-[#8D6E63] text-[#8D6E63] hover:bg-[#EFEBE9] transition-colors dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-600"><KeyboardIcon className="w-8 h-8" /></button>
                        <button onClick={onRestart} aria-label="Restart test" className="p-2 bg-[#FFF8E1] rounded-full border-2 border-[#8D6E63] text-[#8D6E63] hover:bg-[#EFEBE9] transition-colors dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-600"><RestartIcon className="w-8 h-8" /></button>
                    </>
                )}
                 <button onClick={toggleMute} aria-label={isMuted ? "Unmute sounds" : "Mute sounds"} className="p-2 bg-[#FFF8E1] rounded-full border-2 border-[#8D6E63] text-[#8D6E63] hover:bg-[#EFEBE9] transition-colors dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-600">
                    {isMuted ? <VolumeOffIcon className="w-8 h-8" /> : <VolumeOnIcon className="w-8 h-8" />}
                </button>
            </div>
        </div>
      <div 
        ref={wordsContainerRef}
        className={`w-full bg-[#FFF8E1] dark:bg-gray-700 p-8 rounded-2xl border-2 border-[#8D6E63] dark:border-gray-500 ${fontSizeClass} leading-loose tracking-wide transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-50'} max-h-[20rem] overflow-y-auto scrollbar-hide relative flex flex-wrap justify-center gap-x-8 gap-y-6`}
        style={{ fontFamily: "'Fira Code', monospace" }}
      >
        <span ref={caretRef} className={`absolute top-0 left-0 w-1 bg-[#FFCA28] dark:bg-amber-400 transition-transform duration-100 ease-out ${isCaretReady ? 'caret-blink' : 'opacity-0'}`} style={{ height: caretHeight }} />
        {wordElementsJSX}
      </div>
      {showVisualKeyboard && <Keyboard activeKey={activeKey} />}
      {isWaiting && !hasStarted && <div className="absolute inset-0 flex items-center justify-center bg-black/10 cursor-text pointer-events-none"><p className="text-3xl font-bold p-4 bg-[#FFCA28] dark:bg-amber-400 rounded-lg">Start typing to begin</p></div>}
      {!isFocused && hasStarted && !isComplete && <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/10"><p className="text-3xl font-bold p-4 bg-[#FFCA28] dark:bg-amber-400 rounded-lg">Click here to continue typing</p></div>}
      <input ref={inputRef} type="text" onKeyDown={handleKeyDown} onKeyUp={() => setActiveKey(null)} onInput={handleInput} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-text" autoFocus disabled={isComplete} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" />
    </div>
  );
};

export default TypingTest;