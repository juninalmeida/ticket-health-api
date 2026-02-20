const TAU = Math.PI * 2;

const DEFAULT_OPTIONS = {
  canvasId: "bg-geometry",
  maxDpr: 1.8,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createStars(count, width, height) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: randomBetween(0.6, 1.9),
    alpha: randomBetween(0.08, 0.3),
    phase: randomBetween(0, TAU),
    speed: randomBetween(0.25, 0.7),
  }));
}

function createFieldNodes(count, width, height) {
  const centerX = width * 0.5;
  const centerY = height * 0.55;
  const radiusLimit = Math.min(width, height) * 0.43;

  return Array.from({ length: count }, () => {
    const angle = Math.random() * TAU;
    const radius = Math.pow(Math.random(), 0.72) * radiusLimit;

    return {
      baseX: centerX + Math.cos(angle) * radius,
      baseY: centerY + Math.sin(angle) * radius,
      phase: randomBetween(0, TAU),
      speed: randomBetween(0.1, 0.32),
      drift: randomBetween(1.2, 8.2),
      depth: randomBetween(-0.6, 0.75),
      size: randomBetween(0.9, 2.3),
    };
  });
}

function createCorePoints(count) {
  return Array.from({ length: count }, () => {
    const u = Math.random() * 2 - 1;
    const t = Math.random() * TAU;
    const s = Math.sqrt(1 - u * u);

    return {
      x: s * Math.cos(t),
      y: s * Math.sin(t),
      z: u,
    };
  });
}

function rotatePoint(point, angleX, angleY) {
  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);
  const rotX = point.x * cosY - point.z * sinY;
  const rotZ = point.x * sinY + point.z * cosY;

  const cosX = Math.cos(angleX);
  const sinX = Math.sin(angleX);

  return {
    x: rotX,
    y: point.y * cosX - rotZ * sinX,
    z: point.y * sinX + rotZ * cosX,
  };
}

function addMediaQueryListener(query, listener) {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", listener);
    return;
  }

  if (typeof query.addListener === "function") {
    query.addListener(listener);
  }
}

function removeMediaQueryListener(query, listener) {
  if (typeof query.removeEventListener === "function") {
    query.removeEventListener("change", listener);
    return;
  }

  if (typeof query.removeListener === "function") {
    query.removeListener(listener);
  }
}

export function createBackgroundGeometry(options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const canvas = document.getElementById(settings.canvasId);

  if (!(canvas instanceof HTMLCanvasElement)) {
    return () => {};
  }

  const ctx = canvas.getContext("2d", { alpha: true });

  if (!ctx) {
    return () => {};
  }

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointerQuery = window.matchMedia("(pointer: fine)");

  let width = 1;
  let height = 1;
  let dpr = 1;
  let elapsed = 0;
  let lastFrame = 0;

  let stars = [];
  let fieldNodes = [];
  let corePoints = [];

  let fieldThreshold = 145;
  let coreRadius = 140;

  const pointer = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0 };

  let rafId = 0;

  function drawStars() {
    for (const star of stars) {
      const twinkle = 0.45 + Math.sin(elapsed * star.speed + star.phase) * 0.35;
      const alpha = clamp(star.alpha * twinkle, 0.03, 0.34);

      ctx.fillStyle = `rgba(148, 181, 216, ${alpha})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
  }

  function drawField() {
    const points = [];
    const pointerShiftX = pointer.x * 26;
    const pointerShiftY = pointer.y * 18;
    const driftScale = reduceMotionQuery.matches ? 0 : 1;

    for (const node of fieldNodes) {
      const waveX = Math.cos(elapsed * node.speed + node.phase) * node.drift * driftScale;
      const waveY = Math.sin(elapsed * node.speed + node.phase * 1.1) * node.drift * driftScale;

      points.push({
        x: node.baseX + waveX + pointerShiftX * node.depth,
        y: node.baseY + waveY + pointerShiftY * node.depth,
        size: node.size,
      });
    }

    for (let i = 0; i < points.length; i += 1) {
      const a = points[i];

      for (let j = i + 1; j < points.length; j += 1) {
        const b = points[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);

        if (dist > fieldThreshold) {
          continue;
        }

        const alpha = Math.pow(1 - dist / fieldThreshold, 1.5) * 0.22;

        ctx.strokeStyle = `rgba(24, 145, 209, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (const point of points) {
      ctx.fillStyle = "rgba(68, 191, 255, 0.42)";
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.size, 0, TAU);
      ctx.fill();
    }
  }

  function drawCore() {
    const projected = [];

    const centerX = width * 0.53;
    const centerY = height * 0.55;

    const angleX = elapsed * 0.13 - pointer.y * 0.6;
    const angleY = elapsed * 0.18 + pointer.x * 0.9;

    for (const point of corePoints) {
      const rotated = rotatePoint(point, angleX, angleY);
      const depth = 1 + rotated.z * 0.52;
      const scale = coreRadius / depth;

      projected.push({
        x: centerX + rotated.x * scale + pointer.x * 24,
        y: centerY + rotated.y * scale + pointer.y * 16,
        z: rotated.z,
      });
    }

    const maxDistance = coreRadius * 0.95;

    for (let i = 0; i < projected.length; i += 1) {
      const a = projected[i];

      for (let j = i + 1; j < projected.length; j += 1) {
        const b = projected[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);

        if (dist > maxDistance) {
          continue;
        }

        const alpha = Math.pow(1 - dist / maxDistance, 1.6) * 0.3;

        ctx.strokeStyle = `rgba(16, 114, 172, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (const point of projected) {
      const pointAlpha = 0.12 + (point.z + 1) * 0.12;
      ctx.fillStyle = `rgba(53, 168, 238, ${pointAlpha})`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 1.1, 0, TAU);
      ctx.fill();
    }
  }

  function drawScene() {
    ctx.clearRect(0, 0, width, height);
    drawStars();
    drawField();
    drawCore();
  }

  function resizeScene() {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    dpr = Math.min(window.devicePixelRatio || 1, settings.maxDpr);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const area = width * height;

    let starCount = clamp(Math.round(area / 22000), 40, 130);
    let nodeCount = clamp(Math.round(area / 30000), 24, 70);
    let coreCount = clamp(Math.round(area / 62000), 14, 30);

    if (width < 560) {
      starCount = Math.round(starCount * 0.78);
      nodeCount = Math.round(nodeCount * 0.72);
      coreCount = Math.round(coreCount * 0.76);
    }

    stars = createStars(starCount, width, height);
    fieldNodes = createFieldNodes(nodeCount, width, height);
    corePoints = createCorePoints(coreCount);

    fieldThreshold = clamp(Math.min(width, height) * 0.2, 110, 175);
    coreRadius = Math.min(width, height) * 0.28;

    drawScene();
  }

  function setPointerTarget(clientX, clientY) {
    const nx = (clientX / width) * 2 - 1;
    const ny = (clientY / height) * 2 - 1;

    pointerTarget.x = clamp(nx, -1, 1);
    pointerTarget.y = clamp(ny, -1, 1);
  }

  function resetPointerTarget() {
    pointerTarget.x = 0;
    pointerTarget.y = 0;
  }

  function onPointerMove(event) {
    if (reduceMotionQuery.matches || !finePointerQuery.matches) {
      return;
    }

    setPointerTarget(event.clientX, event.clientY);
  }

  function onPointerOut(event) {
    if (event.relatedTarget === null) {
      resetPointerTarget();
    }
  }

  function onVisibilityChange() {
    if (document.hidden) {
      resetPointerTarget();
    }
  }

  function step(timestamp) {
    if (!lastFrame) {
      lastFrame = timestamp;
    }

    const delta = Math.min(64, timestamp - lastFrame);
    lastFrame = timestamp;

    elapsed += delta * 0.001;

    pointer.x += (pointerTarget.x - pointer.x) * 0.055;
    pointer.y += (pointerTarget.y - pointer.y) * 0.055;

    drawScene();

    rafId = window.requestAnimationFrame(step);
  }

  function startLoop() {
    if (rafId) {
      return;
    }

    lastFrame = 0;
    rafId = window.requestAnimationFrame(step);
  }

  function stopLoop() {
    if (!rafId) {
      return;
    }

    window.cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function onMotionPreferenceChange() {
    pointer.x = 0;
    pointer.y = 0;
    resetPointerTarget();

    if (reduceMotionQuery.matches) {
      stopLoop();
      drawScene();
      return;
    }

    startLoop();
  }

  resizeScene();

  if (!reduceMotionQuery.matches) {
    startLoop();
  }

  window.addEventListener("resize", resizeScene);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerout", onPointerOut, { passive: true });
  window.addEventListener("blur", resetPointerTarget);
  document.addEventListener("visibilitychange", onVisibilityChange);

  addMediaQueryListener(reduceMotionQuery, onMotionPreferenceChange);

  return () => {
    stopLoop();

    window.removeEventListener("resize", resizeScene);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerout", onPointerOut);
    window.removeEventListener("blur", resetPointerTarget);
    document.removeEventListener("visibilitychange", onVisibilityChange);

    removeMediaQueryListener(reduceMotionQuery, onMotionPreferenceChange);
  };
}
