let worker;

function getWorker() {
  if (!worker) {
    worker = new Worker(
      new URL("../workers/contentWorker.js", import.meta.url),
    );
  }

  return worker;
}

export function fetchContents({ context, scopeId, games }) {
  return new Promise((resolve, reject) => {
    const w = getWorker();

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Worker timeout"));
    }, 10000);

    const handler = (event) => {
      const { type, payload } = event.data;

      if (type === "SUCCESS") {
        clearTimeout(timeout);
        cleanup();
        resolve(payload);
      }

      if (type === "ERROR") {
        clearTimeout(timeout);
        cleanup();
        reject(new Error(payload.message));
      }
    };

    const cleanup = () => {
      w.removeEventListener("message", handler);
    };

    w.addEventListener("message", handler);

    w.postMessage({
      type: "FETCH_CONTENTS",
      payload: {
        context,
        scopeId,
        games,
      },
    });
  });
}
