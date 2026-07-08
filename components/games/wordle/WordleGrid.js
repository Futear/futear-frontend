"use client";

export default function WordleGrid({
  attempts,
  currentGuess,
  maxAttempts,
  gameOver,
  word,
}) {
  const rows = [];

  /* =================================
     RESPONSIVE SPACING
  ================================= */

  const GAP_MOBILE = 4;
  const GAP_DESKTOP = 8;

  const WORD_SPACE_MOBILE = 8;
  const WORD_SPACE_DESKTOP = 12;

  /* tamaño máximo de celda */

  const MAX_CELL_MOBILE = 24;
  const MAX_CELL_DESKTOP = 52;
  const words = word.split(" ");

  const wordChars = words.join("").split("");

  /* =================================
     🔥 DETECTAR MULTI-WORD (SIN TOCAR word)
  ================================= */

  // Detecta cambios de mayúscula tipo "AtleticoMadrid"
  const splitIndexes = [];

  let accumulated = 0;

  words.forEach((w, index) => {
    accumulated += w.length;

    if (index < words.length - 1) {
      splitIndexes.push(accumulated);
    }
  });

  /* =================================
     STATUS STYLE
  ================================= */

  const getEvaluatedStyles = (status) => {
    switch (status) {
      case "correct":
        return "bg-green-500 border-green-500 text-white";
      case "present":
        return "bg-yellow-500 border-yellow-500 text-white";
      case "absent":
        return "bg-gray-500 border-gray-500 text-white";
      default:
        return "bg-gray-200 dark:bg-gray-700 border-gray-400";
    }
  };

  /* =================================
     BUILD ROW
  ================================= */

  function buildRow(guess = "", evaluation = []) {
    const letters = guess.split("");
    let letterIndex = 0;

    /* 👇 columnas con separación extra */
    const columns = [];

    wordChars.forEach((c, i) => {
      columns.push(
        `minmax(0, clamp(${MAX_CELL_MOBILE}px, 6vw, ${MAX_CELL_DESKTOP}px))`,
      );

      // 👇 inserta columna separadora
      if (splitIndexes.includes(i + 1)) {
        columns.push(
          `clamp(${WORD_SPACE_MOBILE}px,2vw,${WORD_SPACE_DESKTOP}px)`,
        );
      }
    });

    return (
      <div
        className="grid w-full justify-center"
        style={{
          gridTemplateColumns: columns.join(" "),
          gap: `clamp(${GAP_MOBILE}px,1vw,${GAP_DESKTOP}px)`,
        }}
      >
        {wordChars.map((char, i) => {
          const letter = letters[letterIndex] || "";
          const evalItem = evaluation[letterIndex];
          letterIndex++;

          return (
            <div key={i} className="contents">
              <div
                className={`
                  border-2
                  w-full
                  aspect-square
                  flex items-center justify-center
                  font-bold uppercase
                  text-[10px] max-sm:leading-[10px] sm:text-sm md:text-base
                  ${getEvaluatedStyles(evalItem?.status)}
                `}
              >
                {letter}
              </div>

              {/* 👇 separador visual */}
              {splitIndexes.includes(i + 1) && <div />}
            </div>
          );
        })}
      </div>
    );
  }

  /* =================================
     ATTEMPTS
  ================================= */

  attempts.forEach((attempt, index) => {
    rows.push(
      <div key={index}>{buildRow(attempt.guess, attempt.evaluation)}</div>,
    );
  });

  /* =================================
     CURRENT GUESS
  ================================= */

  if (!gameOver && attempts.length < maxAttempts) {
    rows.push(<div key="current">{buildRow(currentGuess)}</div>);
  }

  /* =================================
     EMPTY ROWS
  ================================= */

  const remainingRows = maxAttempts - attempts.length - (gameOver ? 0 : 1);

  for (let i = 0; i < remainingRows; i++) {
    rows.push(<div key={`empty-${i}`}>{buildRow()}</div>);
  }

  return (
    <div className="space-y-2 sm:space-y-3 w-full max-w-lg mx-auto">{rows}</div>
  );
}
