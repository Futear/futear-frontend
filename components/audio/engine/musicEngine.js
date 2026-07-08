import { useAudioStore } from "@/stores/useAudioStore";

class MusicEngine {
  audio = null;

  constructor() {
    if (typeof window === "undefined") return;

    this.audio = new Audio();

    this.audio.preload = "metadata";
    this.audio.crossOrigin = "anonymous";

    this.audio.addEventListener("play", () => {
      useAudioStore.getState().setPlaying(true);
    });

    this.audio.addEventListener("pause", () => {
      useAudioStore.getState().setPlaying(false);
    });

    this.audio.addEventListener("ended", () => {
      this.next();
    });
  }

  load(track) {
    if (!track) return;

    if (this.audio.src !== track.audioUrl) {
      this.audio.src = track.audioUrl;
    }

    useAudioStore.getState().setTrack(track);
  }

  async play() {
    try {
      await this.audio.play();
    } catch {}
  }

  pause() {
    this.audio.pause();
  }

  toggle() {
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  setVolume(volume) {
    this.audio.volume = volume;
  }

  seek(time) {
    this.audio.currentTime = time;
  }

  next() {
    const { queue, currentTrack } = useAudioStore.getState();

    if (!queue.length) return;

    const currentIndex = queue.findIndex((q) => q._id === currentTrack?._id);

    const nextIndex = (currentIndex + 1) % queue.length;

    const nextTrack = queue[nextIndex];

    this.load(nextTrack);

    this.play();
  }
}

export const musicEngine = new MusicEngine();
