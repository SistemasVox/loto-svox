// ====================================================================
// PATH: src/services/gameGenerator/config.ts
// ====================================================================

export const GAME_SIZE = 15;
export const NUMBER_MIN = 1;
export const NUMBER_MAX = 25;
export const MAX_ATTEMPTS = 100;
export const BASIC_STRATEGY_MAX_DELAY = 10;
export const COLUMNS_PER_GAME = 5;
export const MAX_TRIES_MODIFY_COLUMN = 40;

export const PLUS_LOW_FREQ = 8;
export const PLUS_HIGH_FREQ = 8;
export const PLUS_MID_FREQ = 9;
export const PLUS_DELAYED = 5;
export const PLUS_LOW_PICK = 4;
export const PLUS_HIGH_PICK = 3;
export const PLUS_MID_PICK = 3;

export const PREMIUM_QUADS = [
  { min: 1, max: 6, qtde: 4 },
  { min: 7, max: 12, qtde: 4 },
  { min: 13, max: 18, qtde: 4 },
  { min: 19, max: 25, qtde: 3 }
];
export const PREMIUM_MAX_SUBS = 3;
