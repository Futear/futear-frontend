class AmbientEngine {
  audio = null;

  constructor() {
    this.audio = new Audio();

    this.audio.loop = true;
    this.audio.volume = 0.3;
  }

  set(src) {
    if (this.audio.src !== src) {
      this.audio.src = src;
    }
  }

  play() {
    this.audio.play().catch(() => {});
  }

  stop() {
    this.audio.pause();
  }
}

export const ambientEngine = new AmbientEngine();
