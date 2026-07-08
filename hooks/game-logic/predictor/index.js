/* =========================================
   predictorLogic.js
========================================= */

import { WORLD_CUP_2026_GROUPS } from "@/data/worldcup2026/groups";
import { FIFA_THIRD_TABLE } from "@/data/worldcup2026/thirdPlaceCombinations";

/* =========================================
   HELPERS
========================================= */

function createInitialMatches(groups) {
  const matches = {};

  for (const group of groups) {
    for (const match of group.matches) {
      matches[match.id] = {
        homeGoals: "",
        awayGoals: "",
      };
    }
  }

  return matches;
}

function isMatchValid(result) {
  return (
    result &&
    result.homeGoals !== "" &&
    result.awayGoals !== "" &&
    result.homeGoals !== undefined &&
    result.awayGoals !== undefined
  );
}

/* =========================================
   GROUP TABLE
========================================= */

function calculateGroupStandings(group, matches) {
  const table = {};

  for (const teamData of group.teams) {
    table[teamData.code] = {
      group: group.id,

      team: teamData.code,
      name: teamData.name,

      flagCode: teamData.flagCode,

      pts: 0,
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0,
      dg: 0,

      qualifiedAs: null,
      selectedRank: null,
    };
  }

  for (const match of group.matches) {
    const result = matches[match.id];
    if (!isMatchValid(result)) continue;

    const home = table[match.home];
    const away = table[match.away];

    const hg = Number(result.homeGoals);
    const ag = Number(result.awayGoals);

    home.pj++;
    away.pj++;

    home.gf += hg;
    home.gc += ag;

    away.gf += ag;
    away.gc += hg;

    home.dg = home.gf - home.gc;
    away.dg = away.gf - away.gc;

    if (hg > ag) {
      home.pg++;
      away.pp++;
      home.pts += 3;
    } else if (ag > hg) {
      away.pg++;
      home.pp++;
      away.pts += 3;
    } else {
      home.pe++;
      away.pe++;
      home.pts += 1;
      away.pts += 1;
    }
  }

  const sorted = Object.values(table).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.team.localeCompare(b.team);
  });

  sorted.forEach((team, index) => {
    if (index === 0) team.qualifiedAs = "first";
    else if (index === 1) team.qualifiedAs = "second";
    else if (index === 2) team.qualifiedAs = "third";
  });

  return sorted;
}

function buildStandings(groups, matches) {
  const standings = {};

  for (const group of groups) {
    standings[group.id] = calculateGroupStandings(group, matches);
  }

  return standings;
}

/* =========================================
   THIRD TABLE (DEBUG VERSION)
========================================= */

function buildThirdPlaceTable(standings, mode) {
  const thirds = [];

  console.log("[THIRD] buildThirdPlaceTable mode:", mode);

  for (const group of Object.values(standings)) {
    let thirdTeam = null;

    if (mode === "selector") {
      thirdTeam = group.find((t) => t.selectedRank === "3");
    }

    if (mode === "matches") {
      thirdTeam = group.find((t) => t.qualifiedAs === "third");
    }

    if (thirdTeam) {
      console.log("[THIRD] picked:", thirdTeam.team, "group:", thirdTeam.group);
      thirds.push(thirdTeam);
    }
  }

  const sorted = thirds.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.team.localeCompare(b.team);
  });

  console.log(
    "[THIRD] final sorted list:",
    sorted.map((t) => t.team),
  );

  return sorted;
}

/* =========================================
   QUALIFIED
========================================= */

function getQualifiedTeams(state) {
  const qualified = {};

  for (const [groupId, group] of Object.entries(state.standings)) {
    if (state.mode === "selector") {
      qualified[`${groupId}1`] = group.find((t) => t.selectedRank === "1");
      qualified[`${groupId}2`] = group.find((t) => t.selectedRank === "2");
      qualified[`${groupId}3`] = group.find((t) => t.selectedRank === "3");
    } else {
      qualified[`${groupId}1`] = group.find((t) => t.qualifiedAs === "first");
      qualified[`${groupId}2`] = group.find((t) => t.qualifiedAs === "second");
      qualified[`${groupId}3`] = group.find((t) => t.qualifiedAs === "third");
    }
  }

  return qualified;
}

/* =========================================
   MATCH
========================================= */

function createMatch(id, home, away, previousWinner = null) {
  return {
    id,
    home: home?.team || null,
    away: away?.team || null,
    homeFlag: home?.flagCode || null,
    awayFlag: away?.flagCode || null,
    winner:
      previousWinner === home?.team || previousWinner === away?.team
        ? previousWinner
        : null,
  };
}

/* =========================================
   THIRD ASSIGNMENTS (FULL DEBUG)
========================================= */

function createThirdAssignments(state) {
  console.log("========== [THIRD ASSIGN DEBUG START] ==========");

  const standingsMap = {};

  for (const group of Object.values(state.standings)) {
    for (const team of group) {
      standingsMap[team.team] = team;
    }
  }

  console.log("[THIRD] bestThirds input:", state.bestThirds);

  const thirdByGroup = {};

  for (const teamCode of state.bestThirds) {
    const team = standingsMap[teamCode];
    if (!team) continue;

    console.log("[THIRD] mapping team -> group:", team.team, team.group);
    thirdByGroup[team.group.toUpperCase()] = team;
  }

  console.log("[THIRD] grouped thirdByGroup:", thirdByGroup);

  // ===============================
  // BUILD KEY FROM SELECTED THIRDS
  // ===============================

  const groupSet = new Set();

  for (const teamCode of state.bestThirds) {
    const team = standingsMap[teamCode];

    if (!team) {
      console.warn("[THIRD] missing team for key build:", teamCode);
      continue;
    }

    if (!team.group) {
      console.warn("[THIRD] team has no group:", teamCode);
      continue;
    }

    groupSet.add(team.group.toUpperCase());
  }

  const key = Array.from(groupSet).sort().join("");

  console.log("[THIRD] GROUP SET FROM BEST THIRDS:", Array.from(groupSet));
  console.log("[THIRD] FINAL KEY (FIXED):", key);

  console.log("[THIRD] computed key:", key);

  const table = FIFA_THIRD_TABLE[key];

  if (!table) {
    console.warn("[THIRD] NO TABLE FOUND FOR KEY:", key);
    console.log("[THIRD] Available keys:", Object.keys(FIFA_THIRD_TABLE));
    return {};
  }

  console.log("[THIRD] FIFA table found:", table);

  const MATCH_SLOT_BY_POSITION = {
    1: 79,
    2: 85,
    3: 81,
    4: 74,
    5: 82,
    6: 77,
    7: 87,
    8: 80,
  };

  const assignments = {};

  for (let pos = 1; pos <= 8; pos++) {
    const groupLetter = table[pos];
    const matchId = MATCH_SLOT_BY_POSITION[pos];

    const team = Object.values(thirdByGroup).find(
      (t) => t.group.toUpperCase() === groupLetter,
    );

    console.log(
      `[THIRD MAP FIXED] pos=${pos}`,
      "groupLetter=",
      groupLetter,
      "matchId=",
      matchId,
      "team=",
      team?.team || null,
    );

    if (!team || !matchId) continue;

    assignments[matchId] = team;
  }

  console.log("[THIRD] FINAL assignments:", assignments);
  console.log("========== [THIRD ASSIGN DEBUG END] ==========");

  return assignments;
}

/* =========================================
   BRACKET
========================================= */

function normalizeTeam(team) {
  if (!team) {
    return {
      team: null,
      name: null,
      flagCode: null,
    };
  }

  // SI VIENE ANIDADO
  // { team: { team,name,flagCode } }

  if (typeof team === "object" && typeof team.team === "object") {
    return {
      team: team.team || null,
      name: team.name || team.team || null,
      flagCode: team.flagCode || null,
    };
  }

  // NORMAL
  // { team,name,flagCode }

  if (typeof team === "object" && team.team) {
    return {
      team: team.team,
      name: typeof team.name === "string" ? team.name : team.team,
      flagCode: team.flagCode || null,
    };
  }

  // STRING

  return {
    team,
    name: team,
    flagCode: null,
  };
}

function createKO(id, home, away, previousData = {}, mode = "selector") {
  const h = normalizeTeam(home);
  const a = normalizeTeam(away);

  const validTeams = [h.team, a.team].filter(Boolean);

  // =========================================
  // VALIDATE PREVIOUS WINNER
  // =========================================

  let winner = validTeams.includes(previousData?.winner)
    ? previousData.winner
    : null;

  // =========================================
  // VALIDATE PREVIOUS RESULTS
  // =========================================

  let homeGoals = previousData?.homeGoals ?? "";
  let awayGoals = previousData?.awayGoals ?? "";

  let homePens = previousData?.homePens ?? "";
  let awayPens = previousData?.awayPens ?? "";

  // Si cambia alguno de los equipos,
  // limpiamos resultados anteriores

  const previousTeamsKey = previousData?.teamsKey || null;
  const currentTeamsKey = `${h.team || "null"}-${a.team || "null"}`;

  const teamsChanged = previousTeamsKey && previousTeamsKey !== currentTeamsKey;

  if (teamsChanged) {
    winner = null;

    homeGoals = "";
    awayGoals = "";

    homePens = "";
    awayPens = "";
  }

  // =========================================
  // AUTO WINNER MATCHES MODE
  // =========================================

  if (mode === "matches" && homeGoals !== "" && awayGoals !== "") {
    const hg = Number(homeGoals);
    const ag = Number(awayGoals);

    if (hg > ag) {
      winner = h.team;
    } else if (ag > hg) {
      winner = a.team;
    } else {
      const hp = Number(homePens);
      const ap = Number(awayPens);

      if (homePens !== "" && awayPens !== "") {
        if (hp > ap) {
          winner = h.team;
        } else if (ap > hp) {
          winner = a.team;
        } else {
          winner = null;
        }
      } else {
        winner = null;
      }
    }
  }

  return {
    id,

    teamsKey: currentTeamsKey,

    home: h.team,
    away: a.team,

    homeName: h.name,
    awayName: a.name,

    homeFlag: h.flagCode,
    awayFlag: a.flagCode,

    homeGoals,
    awayGoals,

    homePens,
    awayPens,

    winner,
  };
}

function extractWinner(match) {
  const winnerCode =
    typeof match?.winner === "object" ? match.winner?.team : match?.winner;

  if (!winnerCode) return null;

  if (winnerCode === match.home) {
    return {
      team: match.home,
      name: match.homeName,
      flagCode: match.homeFlag,
    };
  }

  if (winnerCode === match.away) {
    return {
      team: match.away,
      name: match.awayName,
      flagCode: match.awayFlag,
    };
  }

  return null;
}

function pairWinners(matches, ids, previousResults = {}, mode) {
  const result = [];

  for (let i = 0; i < ids.length; i++) {
    const m1 = matches[i * 2];
    const m2 = matches[i * 2 + 1];

    const winner1 = extractWinner(m1);
    const winner2 = extractWinner(m2);

    result.push(
      createKO(ids[i], winner1, winner2, previousResults[ids[i]], mode),
    );
  }

  return result;
}

function buildBracket(state) {
  const q = getQualifiedTeams(state);

  const previousBracket = state.bracket || {};

  const previousResults = {};

  for (const stage of [
    "round32",
    "round16",
    "quarters",
    "semis",
    "final",
    "thirdPlace",
  ]) {
    for (const match of previousBracket?.[stage] || []) {
      previousResults[match.id] = {
        winner: match.winner || null,
        homeGoals: match.homeGoals ?? "",
        awayGoals: match.awayGoals ?? "",
        homePens: match.homePens ?? "",
        awayPens: match.awayPens ?? "",

        teamsKey: match.teamsKey || null,
      };
    }
  }

  const thirdMap =
    state.bestThirds?.length > 0 ? createThirdAssignments(state) : {};

  /* =========================
     ROUND OF 32
  ========================= */

  const round32 = [
    createKO(74, q.E1, thirdMap?.[74], previousResults[74], state.mode),
    createKO(77, q.I1, thirdMap?.[77], previousResults[77], state.mode),
    createKO(73, q.A2, q.B2, previousResults[73], state.mode),
    createKO(75, q.F1, q.C2, previousResults[75], state.mode),

    createKO(83, q.K2, q.L2, previousResults[83], state.mode),
    createKO(84, q.H1, q.J2, previousResults[84], state.mode),
    createKO(81, q.D1, thirdMap?.[81], previousResults[81], state.mode),
    createKO(82, q.G1, thirdMap?.[82], previousResults[82], state.mode),

    createKO(76, q.C1, q.F2, previousResults[76], state.mode),
    createKO(78, q.E2, q.I2, previousResults[78], state.mode),
    createKO(79, q.A1, thirdMap?.[79], previousResults[79], state.mode),
    createKO(80, q.L1, thirdMap?.[80], previousResults[80], state.mode),

    createKO(86, q.J1, q.H2, previousResults[86], state.mode),
    createKO(88, q.D2, q.G2, previousResults[88], state.mode),
    createKO(85, q.B1, thirdMap?.[85], previousResults[85], state.mode),
    createKO(87, q.K1, thirdMap?.[87], previousResults[87], state.mode),
  ];

  /* =========================
     ROUND 16
  ========================= */

  const round16 = pairWinners(
    round32,
    [89, 90, 91, 92, 93, 94, 95, 96],
    previousResults,
    state.mode,
  );

  /* =========================
     QUARTERS
  ========================= */

  const quarters = pairWinners(
    round16,
    [97, 98, 99, 100],
    previousResults,
    state.mode,
  );

  /* =========================
     SEMIS
  ========================= */

  const semis = pairWinners(quarters, [101, 102], previousResults, state.mode);

  /* =========================
     FINAL
  ========================= */

  /* =========================
   FINAL
========================= */

  const finalist1 =
    semis?.[0]?.winner === semis?.[0]?.home
      ? {
          team: semis?.[0]?.home,
          name: semis?.[0]?.homeName,
          flagCode: semis?.[0]?.homeFlag,
        }
      : semis?.[0]?.winner === semis?.[0]?.away
        ? {
            team: semis?.[0]?.away,
            name: semis?.[0]?.awayName,
            flagCode: semis?.[0]?.awayFlag,
          }
        : null;

  const finalist2 =
    semis?.[1]?.winner === semis?.[1]?.home
      ? {
          team: semis?.[1]?.home,
          name: semis?.[1]?.homeName,
          flagCode: semis?.[1]?.homeFlag,
        }
      : semis?.[1]?.winner === semis?.[1]?.away
        ? {
            team: semis?.[1]?.away,
            name: semis?.[1]?.awayName,
            flagCode: semis?.[1]?.awayFlag,
          }
        : null;

  const final = [
    createKO(104, finalist1, finalist2, previousResults[104], state.mode),
  ];

  /* =========================
   THIRD PLACE
========================= */

  function extractLoser(match) {
    if (!match?.winner) return null;

    const winnerCode =
      typeof match.winner === "object" ? match.winner?.team : match.winner;

    if (!winnerCode) return null;

    if (winnerCode === match.home) {
      return {
        team: match.away,
        name: match.awayName,
        flagCode: match.awayFlag,
      };
    }

    if (winnerCode === match.away) {
      return {
        team: match.home,
        name: match.homeName,
        flagCode: match.homeFlag,
      };
    }

    return null;
  }

  const semi1Loser = extractLoser(semis?.[0]);
  const semi2Loser = extractLoser(semis?.[1]);

  // Evita que un finalista aparezca en el 3° puesto

  const finalists = [finalist1?.team, finalist2?.team].filter(Boolean);

  const validSemi1Loser = finalists.includes(semi1Loser?.team)
    ? null
    : semi1Loser;

  const validSemi2Loser = finalists.includes(semi2Loser?.team)
    ? null
    : semi2Loser;

  const thirdPlace = [
    createKO(
      105,
      validSemi1Loser,
      validSemi2Loser,
      previousResults[105],
      state.mode,
    ),
  ];

  return {
    round32,
    round16,
    quarters,
    semis,
    final,
    thirdPlace,
  };
}

/* =========================================
   ENGINE
========================================= */

export const predictorLogic = {
  setup: () => {
    const initialMatches = createInitialMatches(WORLD_CUP_2026_GROUPS);

    const initialStandings = buildStandings(
      WORLD_CUP_2026_GROUPS,
      initialMatches,
    );

    const baseState = {
      mode: "matches",
      groups: WORLD_CUP_2026_GROUPS,
      matches: initialMatches,
      standings: initialStandings,
      thirdPlaceTeams: [],
      bestThirds: [],
      bracket: null,
    };

    const stateWithThirds = {
      ...baseState,
      thirdPlaceTeams: buildThirdPlaceTable(initialStandings, "matches"),
    };

    const bracket = buildBracket(stateWithThirds);

    return {
      state: {
        ...stateWithThirds,
        bracket,
      },
      context: {},
    };
  },

  resolver: ({ action, state }) => {
    switch (action.type) {
      case "SET_MATCH_RESULT": {
        const updatedMatches = {
          ...state.matches,
          [action.payload.matchId]: {
            homeGoals: action.payload.homeGoals,
            awayGoals: action.payload.awayGoals,
          },
        };

        const updatedStandings = buildStandings(state.groups, updatedMatches);

        const thirdPlaceTeams = buildThirdPlaceTable(
          updatedStandings,
          "matches",
        );

        const autoBestThirds = thirdPlaceTeams
          .filter((t) => t.qualifiedAs === "third")
          .slice(0, 8)
          .map((t) => t.team);

        const updated = {
          ...state,
          matches: updatedMatches,
          standings: updatedStandings,
          thirdPlaceTeams,
          bestThirds: autoBestThirds,
        };

        return {
          state: {
            ...updated,
            bracket: buildBracket(updated),
          },
        };
      }

      case "SET_MODE": {
        const thirdPlaceTeams = buildThirdPlaceTable(
          state.standings,
          action.payload,
        );

        const updated = {
          ...state,
          mode: action.payload,
          thirdPlaceTeams,
        };

        return {
          state: {
            ...updated,
            bracket: buildBracket(updated),
          },
        };
      }

      case "TOGGLE_GROUP_SELECT": {
        const { groupId, team } = action.payload;

        const updatedStandings = applySelection(state.standings, groupId, team);

        const thirdPlaceTeams = buildThirdPlaceTable(
          updatedStandings,
          "selector",
        );

        const validThirds = thirdPlaceTeams.map((t) => t.team);

        const cleanedBestThirds = state.bestThirds.filter((t) =>
          validThirds.includes(t),
        );

        const updated = {
          ...state,
          standings: updatedStandings,
          thirdPlaceTeams,
          bestThirds: cleanedBestThirds,
        };

        return {
          state: {
            ...updated,
            bracket: buildBracket(updated),
          },
        };
      }

      case "TOGGLE_BEST_THIRD": {
        const team = action.payload.team;

        const exists = state.bestThirds.includes(team);

        let updatedThirds = [];

        if (exists) {
          updatedThirds = state.bestThirds.filter((t) => t !== team);
        } else {
          if (state.bestThirds.length >= 8) return null;
          updatedThirds = [...state.bestThirds, team];
        }

        const updated = {
          ...state,
          bestThirds: updatedThirds,
        };

        return {
          state: {
            ...updated,
            bracket: buildBracket(updated),
          },
        };
      }

      case "SET_BRACKET_WINNER": {
        const { stage, matchId, winner } = action.payload;

        const updatedBracket = structuredClone(state.bracket);

        const matches = updatedBracket?.[stage];

        if (!matches) {
          return { state };
        }

        const match = matches.find((m) => m.id === matchId);

        if (!match) {
          return { state };
        }

        const normalizedWinner =
          typeof winner === "object" ? winner?.team || null : winner;

        match.winner =
          match.winner === normalizedWinner ? null : normalizedWinner;

        const updatedState = {
          ...state,
          bracket: updatedBracket,
        };

        return {
          state: {
            ...updatedState,
            bracket: buildBracket(updatedState),
          },
        };
      }

      case "SET_BRACKET_RESULT": {
        const { stage, matchId, homeGoals, awayGoals, homePens, awayPens } =
          action.payload;

        const updatedBracket = structuredClone(state.bracket);

        const matches = updatedBracket?.[stage];

        if (!matches) {
          return { state };
        }

        const match = matches.find((m) => m.id === matchId);

        if (!match) {
          return { state };
        }

        match.homeGoals = homeGoals;
        match.awayGoals = awayGoals;

        match.homePens = homePens;
        match.awayPens = awayPens;

        const hg = Number(homeGoals);
        const ag = Number(awayGoals);

        if (homeGoals !== "" && awayGoals !== "") {
          if (hg > ag) {
            match.winner = match.home;
          } else if (ag > hg) {
            match.winner = match.away;
          } else {
            const hp = Number(homePens);
            const ap = Number(awayPens);

            if (homePens !== "" && awayPens !== "") {
              if (hp > ap) {
                match.winner = match.home;
              } else if (ap > hp) {
                match.winner = match.away;
              } else {
                match.winner = null;
              }
            } else {
              match.winner = null;
            }
          }
        } else {
          match.winner = null;
        }

        const updatedState = {
          ...state,
          bracket: updatedBracket,
        };

        return {
          state: {
            ...updatedState,
            bracket: buildBracket(updatedState),
          },
        };
      }

      case "RESET_PREDICTOR":
        return predictorLogic.setup();

      default:
        return null;
    }
  },
};

/* =========================================
   SELECTOR
========================================= */

function applySelection(standings, groupId, teamCode) {
  const group = standings[groupId];
  if (!group) return standings;

  const updated = group.map((team) => ({ ...team }));
  const clicked = updated.find((t) => t.team === teamCode);

  if (!clicked) return standings;

  if (clicked.selectedRank) {
    clicked.selectedRank = null;
  } else {
    const selected = updated
      .filter((t) => t.selectedRank)
      .sort((a, b) => Number(a.selectedRank) - Number(b.selectedRank));

    if (selected.length >= 3) return standings;

    clicked.selectedRank = String(selected.length + 1);
  }

  const selectedTeams = updated
    .filter((t) => t.selectedRank)
    .sort((a, b) => Number(a.selectedRank) - Number(b.selectedRank));

  selectedTeams.forEach((team, index) => {
    team.selectedRank = String(index + 1);
  });

  return {
    ...standings,
    [groupId]: updated,
  };
}
