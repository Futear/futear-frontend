// lib/gameLogicRegistry.js

const REGISTRY = {
  wordle: () => import("@/hooks/game-logic/wordle").then((m) => m.wordleLogic),

  teamBuilder: () =>
    import("@/hooks/game-logic/teamBuilder").then((m) => m.teamBuilderLogic),

  grid: () => import("@/hooks/game-logic/grid").then((m) => m.gridLogic),

  guess: () => import("@/hooks/game-logic/guess").then((m) => m.guessLogic),

  shirt: () => import("@/hooks/game-logic/shirt").then((m) => m.shirtLogic),

  moreOrLess: () =>
    import("@/hooks/game-logic/moreOrLess").then((m) => m.moreOrLessLogic),

  career: () => import("@/hooks/game-logic/career").then((m) => m.careerLogic),

  top: () => import("@/hooks/game-logic/top").then((m) => m.topLogic),

  // predictor: () =>
  //   import("@/hooks/game-logic/predictor").then((m) => m.predictorLogic),
};

export async function getGameLogic(key) {
  const loader = REGISTRY[key];

  if (!loader) {
    throw new Error(`Game logic "${key}" no registrada`);
  }

  return loader();
}
