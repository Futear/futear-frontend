function normalize(str) {
  return str
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s/g, "")
    .toUpperCase();
}

function evaluate(guess, word) {
  const g = normalize(guess);
  const w = normalize(word);

  return g.split("").map((l, i) => {
    if (l === w[i]) return { letter: guess[i], status: "correct" };
    if (w.includes(l)) return { letter: guess[i], status: "present" };
    return { letter: guess[i], status: "absent" };
  });
}

export const wordleLogic = {
  setup: ({ content }) => {
    const words = content?.words || [];
    const unifiedWord = words.join(" ");

    return {
      state: {
        word: unifiedWord,
        words,
        attempts: [],
        currentGuess: "",
        maxAttempts: 6,
        gameOver: false,
        gameWon: false,
      },
      context: { content },
    };
  },

  resolver: ({ action, state, context }) => {
    if (state.gameOver) return null;
    const targetLength = normalize(state.word).length;

    switch (action.type) {
      case "ADD_LETTER":
        if (state.currentGuess.length < targetLength) {
          return {
            state: {
              ...state,
              currentGuess: state.currentGuess + action.payload,
            },
          };
        }

        return null;

      case "REMOVE_LETTER":
        return {
          state: {
            ...state,
            currentGuess: state.currentGuess.slice(0, -1),
          },
        };

      case "SUBMIT_GUESS": {
        if (state.currentGuess.length !== targetLength) return null;

        const evalRes = evaluate(state.currentGuess, state.word);

        const attempts = [
          ...state.attempts,
          {
            guess: state.currentGuess.toUpperCase(),
            evaluation: evalRes,
          },
        ];

        const won = normalize(state.currentGuess) === normalize(state.word);

        const lost = attempts.length >= state.maxAttempts;

        if (won || lost) {
          const content = context?.content;

          const type = content?.type; // "player" | "club" | "nationalTeam"

          let entity = null;
          let meta = {};
          let stats = {};

          if (type === "player") {
            entity = content.player;

            meta = {
              displayName: content.player.fullName,
              image: content.player.profileImage,
              positions: content.player.positions || [],
              nationalities: content.player.nationalities || [],
              club: content.player.currentClub ?? null,
            };

            stats = content.player.stats ?? {};
          }

          if (type === "club") {
            entity = content.club;

            meta = {
              displayName: content.club.name,
              image: content.club.logo,
              country: content.club.country,
              confederation: content.club.confederation,
            };

            stats = {};
          }

          if (type === "nationalTeam") {
            entity = content.nationalTeam;

            meta = {
              displayName: content.nationalTeam.name,
              image:
                content.nationalTeam.logo || content.nationalTeam.flagImage,
              country: content.nationalTeam.country?.name,
              confederation: content.nationalTeam.confederation,
              fifaRanking: content.nationalTeam.fifaRanking,
              code: content.nationalTeam.country?.code,
            };

            stats = {};
          }

          return {
            phase: "END",
            state: {
              ...state,
              attempts,
              currentGuess: "",
              gameOver: true,
              gameWon: won,
            },
            result: {
              win: won,
              gameData: {
                attempts,
                word: state.word,
                words: state.words,
                maxAttempts: state.maxAttempts,
                won,

                type, // 🔥 CLAVE
                entity, // 🔥 SIEMPRE UNIFICADO
                stats, // 🔥 SIEMPRE PLANO
                meta, // 🔥 SIEMPRE DISPLAY
              },
            },
          };
        }

        return {
          state: {
            ...state,
            attempts,
            currentGuess: "",
          },
        };
      }
    }

    return null;
  },
};
