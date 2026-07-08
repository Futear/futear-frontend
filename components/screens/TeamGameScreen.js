"use client";

import { useRef, useEffect, useState } from "react";
import { AlertCircle, User, Heart, Clock } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import PlayerAutocomplete from "@/components/player-autocomplete";
import CoachAutocomplete from "@/components/coach-autocomplete";
import { FORMATIONS_DESKTOP, FORMATIONS_MOBILE } from "@/constants/formations";
import GameModeIndicator from "@/components/GameModeIndicator";
import { fetchSearchGlobal } from "@/lib/fetchSearchGlobal";
import { validateRelation } from "@/lib/relationValidator";

export default function TeamGameScreen(props) {
  const {
    gameType,
    timeLeft,
    lives,
    formation,
    positions,
    coach,
    currentTarget,
    needsCoach,
    usedTargets,
    usedPlayers,
    playerInput,
    coachInput,
    isSubmitting,
    gameOver,
    gameWon,
    errorMessage,
    currentPlayer,
    availablePositions,
    selectedPosition,
    gameStartTime,
    onPlayerInputChange,
    onCoachInputChange,
    onPlayerSubmit,
    onCoachSubmit,
    onPositionSelect,
    onPlayerSelect,
    onConfirmPosition,
    formatTime,
    gameLogic,
    positionErrorMessage,
    cachedPlayers = [], // Add cachedPlayers prop
    cachedCoaches = [], // Add cachedCoaches prop
    mode,
    state,
    isGlobal,
    hideCoach,
    context,
    game, // 🔥 PASAMOS EL OBJETO COMPLETO PARA DISPATCH DESDE EL SCREEN
    gameDefinition,
  } = props;

  const playerInputRef = useRef(null);
  const coachInputRef = useRef(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [isPlayerValid, setIsPlayerValid] = useState(false);
  const [isCoachValid, setIsCoachValid] = useState(false);
  const inputRef = useRef(null);
  const autoFocus = useState(true);

  const selectedFormationLayout = isMobile
    ? FORMATIONS_MOBILE[formation]
    : FORMATIONS_DESKTOP[formation];

  useEffect(() => {
    if (!needsCoach && !currentPlayer && playerInputRef.current) {
      playerInputRef.current.focus();
    }
  }, [currentTarget, needsCoach, currentPlayer]);

  useEffect(() => {
    if (needsCoach && coachInputRef.current) {
      coachInputRef.current.focus();
    }
  }, [needsCoach, currentTarget]);

  const getVacantPositions = () =>
    positions.filter((pos) => !pos.player).map((pos) => pos.position);

  const getTargetName = () =>
    currentTarget?.shortName || currentTarget?.name || "";

  const getTargetLogo = () => currentTarget?.logoUrl;

  const getTargetCountry = () =>
    gameType === "league"
      ? currentTarget?.country
      : currentTarget?.league?.country;

  const handleSubmitTrigger = () => {
    if (isPlayerValid && !isSubmitting) {
      handleSubmit({ preventDefault: () => {} });
    }
  };

  const handleSubmitTriggerCoach = () => {
    if (isCoachValid && !isSubmitting) {
      const syntheticEvent = { preventDefault: () => {} };
      onCoachSubmit(syntheticEvent);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPlayerValid || isSubmitting) return;

    // 🔥 Llamamos al engine
    const result = onPlayerSubmit();

    // 🔥 leer del state REAL (no del return)
    if (!result?.state?.pendingValidation) return;

    try {
      const { player, targetId, availablePositions } =
        result.state.pendingValidation;

      const valid = await validateRelation({
        type: "player-league",
        entityAId: player._id,
        entityBId: targetId,
        endpoint: `${process.env.NEXT_PUBLIC_BASE_URL}/api/relation/player-league`,
      });
      console.log("🧪 dispatch result:", result);

      if (valid) {
        game.dispatch({
          type: "BACKEND_VALIDATION_SUCCESS",
          payload: {
            player,
            position: availablePositions[0],
          },
        });
      } else {
        game.dispatch({
          type: "BACKEND_VALIDATION_FAIL",
        });
      }
    } catch (err) {
      console.error("❌ backend validation error", err);
    }
  };

  const handleCoachSelect = (coach) => {
    // setCoach(coach);
  };

  const handlePlayerSelect = async (player) => {
    if (!player) return;

    // 🔥 GLOBAL MODE
    if (isGlobal) {
      onPlayerSelect(player);
      setIsPlayerValid(true);
      return;
    }

    // 🧱 NORMAL MODE
    onPlayerSelect(player);
    setIsPlayerValid(true);
  };

  useEffect(() => {
    if (!positionErrorMessage) return;

    const t = setTimeout(() => {
      // limpiamos desde arriba (engine)
      // trigger fake input reset
      if (onPlayerInputChange) {
        onPlayerInputChange("");
      }
    }, 2500);

    return () => clearTimeout(t);
  }, [positionErrorMessage]);
  // --- Focus automático ---
  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  if (!currentTarget && !gameOver) {
    return (
      <>
        <div className="h-full flex items-center justify-center bg-[var(--panel-bg)] text-[var(--panel-text)]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-[var(--error-icon)]" />
            <p className="mb-4">{errorMessage || "Error al cargar el juego"}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-md hover:opacity-90 bg-[var(--panel-button-bg)] text-[var(--panel-button-text)]"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="h-[calc(100vh-64px)] max-h-screen flex flex-col md:flex-row">
        {/* Campo de fútbol */}
        <div className="w-full md:w-1/2 flex items-center justify-center relative h-[40%] md:h-full p-2 md:p-4">
          {/* Este div ahora controla la dirección flex para el campo y el DT */}
          <div className="flex flex-row items-center justify-center gap-2 h-[80%] w-full">
            {/* Campo de juego */}
            <div
              className="relative rounded-xl p-1 md:p-2
              w-[90%] max-w-[250px] sm:max-w-[300px] md:max-w-[350px] aspect-[4/2.5] md:w-auto md:h-[80%] lg:h-full md:aspect-[3/4] flex-shrink-0 border-2 border-opacity-80"
              style={{
                backgroundColor: "var(--team-field-bg)",
                borderColor: "var(--team-field-border)",
              }}
            >
              <div
                className="absolute inset-0 rounded-xl"
                style={{ backgroundColor: "var(--team-field-bg)" }}
              >
                {/* Líneas del campo */}
                {/* Center line */}
                <div
                  className={`absolute ${
                    !isMobile
                      ? "top-1/2 left-0 right-0 h-0.5 transform -translate-y-1/2"
                      : "top-0 bottom-0 left-1/2 w-0.5 transform -translate-x-1/2"
                  }`}
                  style={{
                    backgroundColor: "var(--team-field-line)",
                    opacity: "var(--team-field-line-opacity)",
                  }}
                ></div>
                {/* Center circle */}
                <div
                  className="absolute left-1/2 top-1/2 w-16 h-16 md:w-24 md:h-24 border-2 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    borderColor: "var(--team-field-line)",
                    opacity: "var(--team-field-line-opacity)",
                  }}
                ></div>
                {/* Penalty boxes */}
                <div
                  className={`absolute border-2 ${
                    isMobile
                      ? "top-1/2 left-0 h-24 w-10 transform -translate-y-1/2"
                      : "bottom-0 left-1/2 w-32 h-12 transform -translate-x-1/2"
                  }`}
                  style={{
                    borderColor: "var(--team-field-line)",
                    opacity: "var(--team-field-line-opacity)",
                  }}
                ></div>
                <div
                  className={`absolute border-2 ${
                    isMobile
                      ? "top-1/2 right-0 h-24 w-10 transform -translate-y-1/2"
                      : "top-0 left-1/2 w-32 h-12 transform -translate-x-1/2"
                  }`}
                  style={{
                    borderColor: "var(--team-field-line)",
                    opacity: "var(--team-field-line-opacity)",
                  }}
                ></div>
                {/* Jugadores */}
                {positions.map((posData, index) => {
                  // Find the corresponding layout position for the current player's position
                  // We need to find the Nth occurrence if there are multiple players with the same position string
                  const layoutMatches = selectedFormationLayout.filter(
                    (layout) => layout.position === posData.position,
                  );

                  const occurrenceIndex = positions
                    .slice(0, index)
                    .filter((p) => p.position === posData.position).length;

                  const layoutPosition = layoutMatches[occurrenceIndex];

                  // 🔥 NUNCA descartar
                  const displayX = layoutPosition?.x ?? posData.x ?? 50;
                  const displayY = layoutPosition?.y ?? posData.y ?? 50;
                  const zIndex = layoutPosition?.z ?? posData.z ?? 1;

                  return (
                    <div
                      key={`${posData.position}-${index}`} // Use index in the key for uniqueness
                      className={`absolute w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 transform -translate-x-1/2 -translate-y-1/2`}
                      style={{
                        left: `${displayX}%`,
                        top: `${displayY}%`,
                        zIndex: zIndex,
                      }}
                    >
                      <div className="relative w-full h-full">
                        <div className="absolute inset-0 rounded-full shadow-md overflow-hidden border-2 bg-[var(--team-player-empty-bg)] border-[var(--team-player-empty-border)]">
                          {posData.player ? (
                            posData.player.profileImage ? (
                              <img
                                src={
                                  posData.player.profileImage ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg"
                                }
                                alt={posData.player.fullName}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg";
                                  e.currentTarget.onerror = null;
                                }}
                                width={56}
                                height={56}
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center rounded-full border-2 
                                  bg-[var(--team-player-empty-bg)] border-[var(--team-player-empty-border)]"
                              >
                                <User className="h-4 w-4 md:h-5 md:w-5 text-[var(--team-player-empty-text)]" />
                              </div>
                            )
                          ) : (
                            <div className="w-full h-full flex items-center justify-center rounded-full">
                              <span className="text-[8px] md:text-[10px] font-bold text-[var(--team-player-empty-text)]">
                                {posData.position}
                              </span>
                            </div>
                          )}
                        </div>
                        {posData.target?.logoUrl && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full p-0.5 shadow-md">
                            <img
                              src={posData.target.logoUrl}
                              alt={posData.target.shortName || ""}
                              className="w-full h-full object-contain rounded-full"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                                e.currentTarget.onerror = null;
                              }}
                              width={24}
                              height={24}
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* DT */}
            {/* DT */}
            {!hideCoach && (
              <div className="flex flex-col items-center justify-center min-w-[40px] md:min-w-[120px] h-auto md:h-full ml-2 md:ml-0 lg:ml-4">
                <div className="w-10 h-10 md:w-14 md:h-14 mb-1 md:mb-2 flex-shrink-0">
                  <div className="relative w-full h-full">
                    <div
                      className="absolute inset-0 rounded-full shadow-md overflow-hidden border-2 border-[var(--circle-border)]"
                      style={{
                        backgroundColor: coach?.profileImage
                          ? "transparent"
                          : "",
                      }}
                    >
                      {coach?.profileImage ? (
                        <img
                          src={coach.profileImage || "/placeholder.svg"}
                          alt={coach.fullName}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                            e.currentTarget.onerror = null;
                          }}
                          width={56}
                          height={56}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center rounded-full bg-[var(--circle-empty-bg)]">
                          <User className="h-5 w-5 md:h-6 md:w-6 text-[var(--team-player-empty-text)]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] md:text-xs font-bold text-center max-w-[60px] md:max-w-[100px] leading-tight">
                  {coach ? `DT: ${coach.fullName}` : "DT: ?"}
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Panel de control */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-1 px-3 md:p-3 h-[60%] max-h-[60%] md:h-full md:max-h-full bg-[var(--panel-bg)]">
          <h3 className="hidden md:block text-xl md:text-2xl font-bold mb-1 md:mb-2 text-[var(--panel-title)]">
            {gameDefinition.presentation.title}
          </h3>
          {/* Indicadores de modo de juego */}
          <div className="w-full max-w-md md:mb-2">
            <div className="flex justify-center gap-2 md:gap-4">
              <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-4">
                <GameModeIndicator
                  mode={mode}
                  state={state}
                  onTimeEnd={() => {
                    game.dispatch({
                      type: "TIME_END",
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="w-full max-w-md">
            {/* Target actual */}
            <div className="p-2 md:p-3 rounded-xl shadow-lg mb-2 md:mb-3 bg-[var(--panel-card-bg)]">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-lg p-1 md:p-2 flex items-center justify-center mb-1 md:mb-2">
                  {getTargetLogo() ? (
                    <img
                      src={getTargetLogo() || "/placeholder.svg"}
                      alt={getTargetName()}
                      className="object-contain"
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-8 h-8 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center">
                      <span className="text-sm md:text-base font-bold">
                        {getTargetName().substring(0, 2)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 md:flex-col md:gap-0">
                  <h2 className="text-sm md:text-lg font-bold text-[var(--panel-card-title)]">
                    {getTargetName()}
                  </h2>
                  <p
                    className="text-xs md:text-sm"
                    style={{
                      color: "var(--panel-card-text)",
                      opacity: 0.8,
                    }}
                  >
                    {getTargetCountry()}
                  </p>
                </div>
                <p
                  className="text-xs md:text-sm mt-1"
                  style={{
                    color: "var(--panel-card-text)",
                    opacity: 0.8,
                  }}
                >
                  {needsCoach
                    ? "Elige Director Técnico"
                    : `${getVacantPositions().length} posiciones restantes`}
                </p>
              </div>
            </div>

            {/* Conditional rendering for Player/Coach input vs. Position Selector */}
            {needsCoach ? (
              // Coach Input Form
              <div className="p-2 md:p-3 rounded-xl shadow-lg bg-[var(--panel-card-bg)]">
                <form onSubmit={onCoachSubmit}>
                  <div className="mb-1 md:mb-3">
                    <CoachAutocomplete
                      value={coachInput}
                      onChange={onCoachInputChange}
                      onCoachSelect={handleCoachSelect}
                      placeholder={`Director Técnico para ${getTargetName()}...`}
                      disabled={isSubmitting}
                      onValidSelectionChange={(v) => setIsCoachValid(v)}
                      onSubmitTrigger={handleSubmitTriggerCoach}
                      cachedCoaches={cachedCoaches}
                      isGlobal={isGlobal} // 🔥
                      autoFocus={true}
                      fetchCoaches={(params) =>
                        fetchSearchGlobal({ ...params, type: "coach" })
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!isCoachValid || isSubmitting}
                    className="w-full py-1.5 md:py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors hover:opacity-90 text-xs md:text-base bg-[var(--panel-button-bg)] text-[var(--panel-button-text)]"
                  >
                    {isSubmitting ? "Validando..." : "Agregar Director Técnico"}
                  </button>
                </form>
              </div>
            ) : currentPlayer && availablePositions.length > 0 ? (
              // Position Selector UI
              <div className="w-full max-w-md mb-2 md:mb-3">
                <div className="p-2 md:p-3 rounded-xl shadow-lg bg-[var(--panel-card-bg)]">
                  <h4 className="font-bold mb-1 md:mb-2 text-center text-xs md:text-sm text-[var(--panel-card-title)]">
                    {currentPlayer.shortName}:
                  </h4>
                  <div className="flex flex-wrap justify-center gap-1 md:gap-2 mb-1 md:mb-2">
                    {availablePositions.map((pos) => (
                      <label
                        key={pos}
                        className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-lg cursor-pointer hover:opacity-90 transition-opacity bg-[var(--panel-button-bg)]"
                      >
                        <input
                          type="radio"
                          name="position"
                          value={pos}
                          checked={selectedPosition === pos}
                          onChange={() => onPositionSelect(pos)}
                          className="h-2.5 w-2.5 md:h-3 md:w-3"
                        />
                        <span className="text-xs md:text-sm font-bold text-[var(--panel-button-text)]">
                          {pos}
                        </span>
                      </label>
                    ))}
                  </div>
                  <button
                    ref={inputRef}
                    onClick={onConfirmPosition}
                    className="w-full py-1 rounded-lg hover:opacity-90 font-medium text-xs md:text-sm bg-[var(--panel-button-bg)] text-[var(--panel-button-text)] 
    focus:outline-none
    focus-visible:outline-none
    focus-visible:ring-0"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            ) : (
              // Player Input Form (shown when not needing coach AND no player is currently being positioned)
              <div className="p-2 md:p-3 rounded-xl shadow-lg bg-[var(--panel-card-bg)]">
                <form onSubmit={handleSubmit}>
                  <div className="mb-1 md:mb-3">
                    <PlayerAutocomplete
                      value={playerInput}
                      onChange={onPlayerInputChange}
                      onPlayerSelect={handlePlayerSelect}
                      placeholder={`Jugador para ${getTargetName()}...`}
                      disabled={isSubmitting}
                      onValidSelectionChange={(v) => setIsPlayerValid(v)}
                      onSubmitTrigger={handleSubmitTrigger}
                      cachedPlayers={cachedPlayers}
                      isGlobal={isGlobal}
                      autoFocus={true}
                      fetchPlayers={(params) =>
                        fetchSearchGlobal({ ...params, type: "player" })
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!isPlayerValid || isSubmitting}
                    className="w-full py-1.5 md:py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors hover:opacity-90 text-xs md:text-base bg-[var(--panel-button-bg)] text-[var(--panel-button-text)]"
                  >
                    {isSubmitting ? "Validando..." : "Agregar Jugador"}
                  </button>
                  {positionErrorMessage && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-800 dark:text-white text-sm font-medium">
                        {positionErrorMessage}
                      </p>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
