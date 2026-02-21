export function createBackgroundGeometry() {
  if (typeof THREE === "undefined") return () => {};
  const canvas = document.getElementById("bg-geometry");
  if (!canvas) return () => {};

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 0, 10);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const geometry = new THREE.IcosahedronGeometry(3.5, 1);
  const material = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    opacity: 0.15,
    transparent: true,
  });
  const monolith = new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    material,
  );
  scene.add(monolith);

  let mouseX = 0,
    mouseY = 0;
  let targetX = 0,
    targetY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  function onMouseMove(event) {
    targetX = (event.clientX - windowHalfX) * 0.0005;
    targetY = (event.clientY - windowHalfY) * 0.0005;
  }
  document.addEventListener("mousemove", onMouseMove);

  const clock = new THREE.Clock();
  let rafId;

  function animate() {
    const elapsed = clock.getElapsedTime();

    mouseX += (targetX - mouseX) * 0.05;
    mouseY += (targetY - mouseY) * 0.05;

    monolith.rotation.y = elapsed * 0.05 + mouseX;
    monolith.rotation.x = mouseY;

    const scale = 1 + Math.sin(elapsed * 0.3) * 0.02;
    monolith.scale.set(scale, scale, scale);

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }

  animate();

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", onResize);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("mousemove", onMouseMove);
    renderer.dispose();
  };
}
