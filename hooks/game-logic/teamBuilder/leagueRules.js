import { normalizeId, weightedShuffle } from "./utilsCore";

/* =========================
   HELPERS ROBUSTOS
========================= */

function playerPlayedInLeague(player, leagueId) {
  if (!player?.leagues?.length) return false;

  return player.leagues.some((l) => normalizeId(l) === normalizeId(leagueId));
}

function playerFitsPositions(player, vacantPositions) {
  return player.positions?.some((pos) => vacantPositions.includes(pos));
}

function getValidPlayers({ players, leagueId, vacantPositions, usedPlayers }) {
  return players.filter((p) => {
    if (usedPlayers.includes(p._id)) return false;

    if (!playerPlayedInLeague(p, leagueId)) return false;

    if (!playerFitsPositions(p, vacantPositions)) return false;

    return true;
  });
}

/* =========================
   RULES
========================= */

export const leagueRules = {
  getBaseData({ scopeId, players, clubs, competitions, coaches, context }) {
    const isGlobal = context === "global";

    console.group("📦 getBaseData");
    console.log("context:", context);
    console.log("isGlobal:", isGlobal);
    console.log("players:", players?.length);
    console.log("coaches:", coaches?.length);
    console.groupEnd();

    return {
      isGlobal,
      players: players || [],
      coaches: coaches || [],
      leagues: competitions || [],
      clubs: clubs || [],
    };
  },

  /* =========================
     NEXT TARGET
  ========================= */
  getNextTarget({ baseData, usedTargets, usedPlayers, vacantPositions }) {
    const { leagues, players, isGlobal } = baseData;

    const availableLeagues = leagues.filter(
      (l) => !usedTargets.some((t) => normalizeId(t) === normalizeId(l._id)),
    );

    const shuffled = weightedShuffle(availableLeagues);

    for (const league of shuffled) {
      const leagueId = league._id;

      // =========================
      // 🔥 GLOBAL FIX
      // =========================
      if (isGlobal) {
        return league;
      }

      // =========================
      // 🧠 NORMAL LOGIC (SIN TOCAR)
      // =========================
      const validPlayers = getValidPlayers({
        players,
        leagueId,
        vacantPositions,
        usedPlayers,
      });

      if (validPlayers.length === 0) continue;

      let canContinue = false;

      for (const player of validPlayers) {
        for (const pos of player.positions || []) {
          if (!vacantPositions.includes(pos)) continue;

          const newRemaining = vacantPositions.filter((p) => p !== pos);
          const newUsedPlayers = [...usedPlayers, player._id];
          const newUsedTargets = [...usedTargets, leagueId];

          if (newRemaining.length === 0) {
            canContinue = true;
            break;
          }

          const hasNext = leagues.some((nextLeague) => {
            if (
              newUsedTargets.some(
                (t) => normalizeId(t) === normalizeId(nextLeague._id),
              )
            )
              return false;

            const nextValid = getValidPlayers({
              players,
              leagueId: nextLeague._id,
              vacantPositions: newRemaining,
              usedPlayers: newUsedPlayers,
            });

            return nextValid.length > 0;
          });

          if (hasNext) {
            canContinue = true;
            break;
          }
        }

        if (canContinue) break;
      }

      if (canContinue) return league;
    }

    return null;
  },

  /* =========================
     NEXT COACH TARGET
  ========================= */
  getNextCoachTarget({ baseData, usedTargets }) {
    const { leagues, coaches } = baseData;

    const shuffled = weightedShuffle(leagues);

    for (const league of shuffled) {
      if (usedTargets.some((t) => normalizeId(t) === normalizeId(league._id)))
        continue;

      const valid = coaches.filter((c) =>
        c.leagues?.some((l) => normalizeId(l) === normalizeId(league._id)),
      );

      if (valid.length > 0) return league;
    }

    return null;
  },

  validatePlayer({
    input,
    currentTarget,
    usedPlayers,
    vacantPositions,
    datasets,
    selectedPlayer,
    isGlobal,
  }) {
    const normalize = (t) =>
      t
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
    const players = datasets.players || [];
    let player = null;
    console.group("🧠 validatePlayer");
    console.log("isGlobal:", isGlobal);
    console.log("input:", input);
    console.log("selectedPlayer:", selectedPlayer?._id);
    console.log("dataset players:", players.length);
    console.log("currentTarget:", currentTarget?._id);
    /* ========================= RESOLVE PLAYER ========================= */
    if (isGlobal) {
      console.log("🌍 GLOBAL MODE");
      if (!selectedPlayer) {
        console.warn("❌ No selectedPlayer");
        console.groupEnd();
        return { valid: false, type: "hard", message: "Jugador inválido" };
      }
      player = selectedPlayer;
      console.log("✅ Using selectedPlayer:", player._id);
    } else {
      console.log("🏟️ SCOPE MODE");
      const matches = players.filter((p) => {
        const full = normalize(p.fullName);
        const short = normalize(p.shortName);
        return full === normalize(input) || short === normalize(input);
      });
      console.log("matches:", matches.length);
      if (matches.length !== 1) {
        console.warn("❌ Invalid or ambiguous");
        console.groupEnd();
        return {
          valid: false,
          type: "hard",
          message: "Jugador inválido o ambiguo",
        };
      }
      player = matches[0];
    }
    /* ========================= KNOWN PLAYER (en dataset) ========================= */ const datasetPlayer =
      players.find((p) => normalizeId(p._id) === normalizeId(player._id));
    const isKnownPlayer = !!datasetPlayer;
    console.log("🧩 isKnownPlayer:", isKnownPlayer);
    /* ========================= REPEAT ========================= */ if (
      usedPlayers.includes(player._id)
    ) {
      console.warn("❌ Repeated player");
      console.groupEnd();
      return { valid: false, type: "hard", message: "Jugador repetido" };
    }
    /* ========================= POSITION ========================= */ const available =
      player.positions?.filter((pos) => vacantPositions.includes(pos));
    console.log("🎯 available:", available);
    if (!available?.length) {
      console.warn("❌ No valid positions");
      console.groupEnd();
      return { valid: false, type: "soft", message: "Posición inválida" };
    }
    /* ========================= LEAGUE CHECK (CORRECTO) ========================= */
    if (isGlobal) {
      if (datasetPlayer) {
        console.log("📦 Using dataset player for validation");
        const played = playerPlayedInLeague(datasetPlayer, currentTarget._id);
        console.log("🏆 played (dataset):", played);
        if (!played) {
          console.warn("❌ Did NOT play");
          console.groupEnd();
          return {
            valid: false,
            type: "hard",
            message: "No jugó en esta liga",
          };
        }
        console.log("✅ Known + played → VALID");
        console.groupEnd();
        return { valid: true, player, availablePositions: available };
      }
      // 🔥 PLAYER DESCONOCIDO → NO VALIDAR ACÁ
      console.log("🌐 Unknown player → SKIP league check → backend required");
      console.groupEnd();
      return {
        valid: true,
        player,
        availablePositions: available,
        needsBackendValidation: true,
      };
    }
    /* ========================= 🔒 SCOPE MODE ========================= */ const played =
      playerPlayedInLeague(player, currentTarget._id);
    console.log("🏆 played:", played);
    if (!played) {
      console.warn("❌ Did NOT play");
      console.groupEnd();
      return { valid: false, type: "hard", message: "No jugó en esta liga" };
    }
    console.log("✅ Scope valid");
    console.groupEnd();
    return { valid: true, player, availablePositions: available };
  },

  /* =========================
     VALIDATE COACH
  ========================= */
  validateCoach({ input, currentTarget, datasets, selectedCoach, isGlobal }) {
    const normalize = (t) =>
      t
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    const coaches = datasets.coaches || [];
    let coach = null;

    console.group("🧠 validateCoach");
    console.log("isGlobal:", isGlobal);
    console.log("input:", input);
    console.log("selectedCoach:", selectedCoach?._id);

    /* ========================= RESOLVE COACH ========================= */

    if (isGlobal) {
      if (!selectedCoach) {
        console.warn("❌ No selectedCoach");
        console.groupEnd();
        return { valid: false, type: "hard", message: "Coach inválido" };
      }

      coach = selectedCoach;
    } else {
      const matches = coaches.filter((c) => {
        const full = normalize(c.fullName);
        const short = normalize(c.shortName);
        return full === normalize(input) || short === normalize(input);
      });

      if (matches.length !== 1) {
        console.warn("❌ Invalid or ambiguous");
        console.groupEnd();
        return {
          valid: false,
          type: "hard",
          message: "Coach inválido o ambiguo",
        };
      }

      coach = matches[0];
    }

    /* ========================= DATASET CHECK ========================= */

    const datasetCoach = coaches.find(
      (c) => normalizeId(c._id) === normalizeId(coach._id),
    );

    const isKnownCoach = !!datasetCoach;

    console.log("🧩 isKnownCoach:", isKnownCoach);

    /* ========================= GLOBAL ========================= */

    if (isGlobal) {
      if (datasetCoach) {
        const valid = datasetCoach.leagues?.some(
          (l) => normalizeId(l) === normalizeId(currentTarget._id),
        );

        if (!valid) {
          console.warn("❌ Did NOT coach here");
          console.groupEnd();
          return {
            valid: false,
            type: "hard",
            message: "No dirigió en esta liga",
          };
        }

        console.log("✅ Known coach valid");
        console.groupEnd();
        return { valid: true, coach };
      }

      // 🔥 UNKNOWN → BACKEND
      console.log("🌐 Unknown coach → backend required");
      console.groupEnd();

      return {
        valid: true,
        coach,
        needsBackendValidation: true,
      };
    }

    /* ========================= SCOPE ========================= */

    const valid = coach.leagues?.some(
      (l) => normalizeId(l) === normalizeId(currentTarget._id),
    );

    if (!valid) {
      console.warn("❌ Did NOT coach here");
      console.groupEnd();
      return {
        valid: false,
        type: "hard",
        message: "No dirigió en esta liga",
      };
    }

    console.log("✅ Scope valid");
    console.groupEnd();

    return { valid: true, coach };
  },

  /* =========================
     FAIL SUGGESTIONS
  ========================= */
  getPossiblePlayersOnFail({ state, datasets }) {
    const players = datasets.players || [];

    if (!state?.currentTarget) return [];

    const vacantPositions =
      state.positions?.filter((p) => !p.player).map((p) => p.position) || [];

    return players
      .filter((p) => {
        if (state.usedPlayers.includes(p._id)) return false;

        if (!playerPlayedInLeague(p, state.currentTarget._id)) return false;

        return playerFitsPositions(p, vacantPositions);
      })
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  },

  /* =========================
     NEW: COACH FAIL SUGGESTIONS
  ========================= */
  getPossibleCoachesOnFail({ state, datasets }) {
    const coaches = datasets.coaches || [];

    if (!state?.currentTarget) return [];

    return coaches
      .filter((c) =>
        c.leagues?.some(
          (l) => normalizeId(l) === normalizeId(state.currentTarget._id),
        ),
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  },
};
