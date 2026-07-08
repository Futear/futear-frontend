// /stores/useAudioStore.js

import { create } from "zustand";

let audio = null;

const getAudio = () => {
  if (!audio) {
    audio = new Audio();
    audio.preload = "metadata";
  }

  return audio;
};

export const useAudioStore = create((set, get) => ({
  initialized: false,

  currentScope: null,

  playlist: [],

  currentTrackIndex: 0,

  isPlaying: false,

  volume: 0.5,

  progress: 0,

  duration: 0,

  hasUserInteracted: false,

  initialize: () => {
    if (get().initialized) return;

    const player = getAudio();

    player.volume = get().volume;

    player.addEventListener("play", () => set({ isPlaying: true }));

    player.addEventListener("pause", () => set({ isPlaying: false }));

    player.addEventListener("ended", () => {
      get().next();
    });

    player.addEventListener("timeupdate", () => {
      set({
        progress: (player.currentTime / player.duration) * 100,
        duration: player.duration || 0,
      });
    });

    set({ initialized: true });
  },

  setScopePlaylist: async (scopeSlug) => {
    const currentScope = get().currentScope;

    if (currentScope === scopeSlug) return;

    const res = await fetch(
      `/api/audio/playlist?scope=${scopeSlug || "global"}`,
    );

    const playlist = await res.json();

    set({
      playlist,
      currentTrackIndex: 0,
      currentScope: scopeSlug,
    });

    const player = getAudio();

    if (playlist.length > 0) {
      player.src = playlist[0].audioUrl;

      if (get().hasUserInteracted) {
        player.play();
      }
    }
  },

  startExperience: async () => {
    set({ hasUserInteracted: true });

    const player = getAudio();

    try {
      await player.play();
    } catch {}
  },

  togglePlay: async () => {
    const player = getAudio();

    if (player.paused) {
      await player.play();
    } else {
      player.pause();
    }
  },

  next: async () => {
    const { playlist, currentTrackIndex } = get();

    if (!playlist.length) return;

    const nextIndex = (currentTrackIndex + 1) % playlist.length;

    const track = playlist[nextIndex];

    const player = getAudio();

    player.src = track.audioUrl;

    await player.play();

    set({
      currentTrackIndex: nextIndex,
    });
  },
}));
