export const GAME_MODES = {
  lives: {
    setup({ mode }) {
      return {
        lives: mode?.baseValue ?? 3,
      };
    },

    onInvalid({ state }) {
      const newLives = (state.lives || 0) - 1;

      if (newLives <= 0) {
        return { end: true, result: { win: false } };
      }

      return {
        state: { lives: newLives },
      };
    },
  },

  time: {
    setup({ mode }) {
      return {
        timeLeft: mode?.baseValue ?? 60,
      };
    },

    onTick({ state }) {
      const newTime = (state.timeLeft || 0) - 1;

      if (newTime <= 0) {
        return { end: true, result: { win: false } };
      }

      return {
        state: { timeLeft: newTime },
      };
    },
  },
};

export function getGameMode(type) {
  return GAME_MODES[type] || null;
}
