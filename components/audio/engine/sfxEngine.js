class SFXEngine {
  cache = {};

  play(src, volume = 1) {
    if (!src) return;

    let audio = this.cache[src];

    if (!audio) {
      audio = new Audio(src);

      audio.preload = "auto";

      this.cache[src] = audio;
    }

    const clone = audio.cloneNode();

    clone.volume = volume;

    clone.play().catch(() => {});
  }
}

export const sfxEngine = new SFXEngine();
