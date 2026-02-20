const DEFAULT_DURATION_MS = 1500;
const EXIT_DURATION_MS = 300;

const STAGES = [
  { at: 0, text: "Estabelecendo conexão segura..." },
  { at: 20, text: "Sincronizando suporte tecnológico 24h..." },
  { at: 45, text: "Carregando módulos da base Saúde Ta ON..." },
  { at: 75, text: "Inicializando interface gráfica..." },
  { at: 95, text: "Sistema pronto." },
];

function getStageText(progress) {
  for (let index = STAGES.length - 1; index >= 0; index -= 1) {
    if (progress >= STAGES[index].at) {
      return STAGES[index].text;
    }
  }

  return STAGES[0].text;
}

function easeOutCubic(value) {
  return 1 - (1 - value) ** 3;
}

export function runStartupLoader(durationMs = DEFAULT_DURATION_MS) {
  const loaderEl = document.getElementById("startup-loader");
  const fillEl = document.getElementById("loader-fill");
  const percentEl = document.getElementById("loader-percent");
  const statusEl = document.getElementById("loader-status");
  const bodyEl = document.body;

  if (!loaderEl || !fillEl || !percentEl || !statusEl || !bodyEl) {
    return Promise.resolve();
  }

  bodyEl.classList.add("is-loading");

  return new Promise((resolve) => {
    const progressDuration = Math.max(durationMs - EXIT_DURATION_MS, 1);
    const startedAt = performance.now();

    function finish() {
      fillEl.style.width = "100%";
      percentEl.textContent = "100%";
      statusEl.textContent = "Acesso concedido.";

      loaderEl.classList.add("startup-loader--hide");

      window.setTimeout(() => {
        loaderEl.setAttribute("hidden", "");
        bodyEl.classList.remove("is-loading");
        resolve();
      }, EXIT_DURATION_MS);
    }

    function tick(now) {
      const elapsed = now - startedAt;
      const progressRatio = Math.min(elapsed / progressDuration, 1);
      const easedRatio = easeOutCubic(progressRatio);
      const progress = Math.floor(easedRatio * 100);

      fillEl.style.width = `${progress}%`;
      percentEl.textContent = `${progress}%`;
      statusEl.textContent = getStageText(progress);

      if (progressRatio >= 1) {
        finish();
        return;
      }

      window.requestAnimationFrame(tick);
    }

    window.requestAnimationFrame(tick);
  });
}
