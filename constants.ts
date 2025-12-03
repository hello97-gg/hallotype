import { Difficulty, KeySound } from './types';

export const TIME_OPTIONS: number[] = [15, 30, 60, 120];
export const DIFFICULTY_OPTIONS: Difficulty[] = [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard];
export const KEY_SOUND_OPTIONS: KeySound[] = ['off', 'beep', 'click', 'pop', 'sine', 'sawtooth', 'square', 'triangle', 'mechanical', 'rubber dome', 'spooky'];


const EASY_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think",
  "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day"
];

const MEDIUM_WORDS = [
  "about", "above", "across", "action", "active", "advice", "afraid", "always", "animal", "appear", "around", "arrive", "artist", "autumn", "avenue",
  "balance", "become", "before", "behind", "believe", "between", "bicycle", "bottom", "branch", "breathe", "bridge", "bright", "business", "button",
  "camera", "capital", "careful", "center", "change", "circle", "climate", "collect", "common", "compare", "complete", "connect", "consider", "contain", "continue",
  "country", "create", "credit", "current", "danger", "decide", "decrease", "depend", "design", "develop", "different", "difficult", "discover", "distance", "divide",
  "double", "dream", "early", "earth", "effect", "either", "energy", "engine", "enough", "entire", "escape", "evening", "example", "except", "excite",
  "exercise", "explain", "express", "family", "famous", "figure", "finish", "flower", "follow", "foreign", "forest", "forward", "friend", "future", "garden"
];

const HARD_WORDS = [
  "aberration", "abnegation", "acrimonious", "alacrity", "amalgamate", "ambivalent", "anachronistic", "antediluvian", "antithesis", "apocryphal", "approbation",
  "archetypal", "ascetic", "assiduous", "auspicious", "benevolent", "bilk", "bombastic", "brazen", "bucolic", "cacophony", "cajole", "calumny",
  "camaraderie", "capitulate", "capricious", "catharsis", "caustic", "chicanery", "circumspect", "clandestine", "cognizant", "compunction", "conflagration",
  "conundrum", "corpulent", "credulity", "cupidity", "dearth", "debacle", "demagogue", "deprecate", "deride", "desultory", "diaphanous",
  "dichotomy", "didactic", "diffident", "dilatory", "disparate", "ebullient", "efficacious", "effrontery", "emollient", "enervate", "ephemeral",
  "equanimity", "erudite", "eschew", "esoteric", "evanescent", "exacerbate", "exculpate", "exigent", "expedient", "fastidious", "fatuous",
  "fecund", "flagrant", "gregarious", "hegemony", "iconoclast", "idiosyncratic", "impecunious", "impetuous", "incandescent", "inchoate", "incontrovertible"
];


export const WORD_LISTS: Record<Difficulty, string[]> = {
  [Difficulty.Easy]: EASY_WORDS,
  [Difficulty.Medium]: MEDIUM_WORDS,
  [Difficulty.Hard]: HARD_WORDS,
};