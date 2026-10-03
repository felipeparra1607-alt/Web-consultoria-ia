// Cámara y circuito locales: scroll nativo, sin interceptar rueda ni teclado.
const desktop = matchMedia('(min-width: 900px)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;
const journey = document.querySelector('#journey');
const stage = document.querySelector('#stage');
const world = document.querySelector('#world');
const route = document.querySelector('#route');
const light = document.querySelector('#route-light');
const carrier = document.querySelector('#carrier');
const closing = document.querySelector('#closing');
const narrative = document.querySelector('.narrative');
const monitor = document.querySelector('#monitor');
const copies = [...document.querySelectorAll('[data-step]')];
const nodes = [...document.querySelectorAll('[data-node]')];
const waypoints = [...document.querySelectorAll('.waypoints li')];
const count = document.querySelector('#stage-count');
const meter = document.querySelector('#progress-line');
const progressLabel = document.querySelector('#progress-label');
const centers = [[400, 540], [950, 330], [1520, 650], [2160, 390], [2730, 560]];
const length = route.getTotalLength();
// Medidas SVG calculadas una vez. No se consulta el layout durante cada frame.
const distances = centers.map(([x, y]) => {
  let best = 0, error = Infinity;
  for (let i = 0; i <= 800; i++) {
    const d = length * i / 800, p = route.getPointAtLength(d);
    const delta = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (delta < error) { error = delta; best = d; }
  }
  return best;
});
const arrival = [.255, .39, .525, .66, .795];
const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const smooth = n => { n = clamp(n); return n * n * (3 - 2 * n); };
const mix = (a, b, n) => a + (b - a) * n;
let width = 0, height = 0, travel = 1, start = 0;
let targetX = 0, targetY = 0, mouseX = 0, mouseY = 0;
let progress = 0, targetProgress = 0, frame = 0, lastTime = 0;
let activeStep = -1, enabled = false;
light.style.strokeDasharray = `${length} ${length}`;

function measure() {
  width = stage.clientWidth;
  height = stage.clientHeight;
  start = journey.getBoundingClientRect().top + scrollY;
  travel = Math.max(1, journey.offsetHeight - height);
}
function requestFrame() {
  if (enabled && !frame && !document.hidden) frame = requestAnimationFrame(render);
}
function onScroll() {
  targetProgress = clamp((scrollY - start) / travel);
  requestFrame();
}
function onPointer(event) {
  // No parallax después de entrar en el sistema.
  if (targetProgress > .21 || event.pointerType === 'touch') return;
  targetX = clamp(event.clientX / width * 2 - 1, -1, 1);
  targetY = clamp(event.clientY / height * 2 - 1, -1, 1);
  requestFrame();
}
function resetPointer() { targetX = targetY = 0; requestFrame(); }

function render(time) {
  frame = 0;
  if (!enabled) return;
  const dt = lastTime ? Math.min(time - lastTime, 64) : 16;
  lastTime = time;
  const ease = 1 - Math.exp(-dt / 65);
  progress = mix(progress, targetProgress, ease);
  mouseX = mix(mouseX, targetX, ease);
  mouseY = mix(mouseY, targetY, ease);
  if (Math.abs(progress - targetProgress) < .00005) progress = targetProgress;

  const enter = smooth(progress / .23);
  const open = smooth((progress - .105) / .13);
  const finish = smooth((progress - .905) / .08);
  const story = smooth((progress - .215) / .04) * (1 - smooth((progress - .895) / .045));
  const zoom = mix(1, 2.65, enter);
  const screenCenter = .455 + .045 * enter;
  // El marco se expande hasta salir por los bordes, mientras su contenido abre una máscara coincidente.
  const props = {
    '--mx': mouseX.toFixed(4), '--my': mouseY.toFixed(4),
    '--parallax': (1 - enter).toFixed(4),
    '--monitor-scale': zoom, '--monitor-shift': `${height * .045 * enter}px`,
    '--room-opacity': 1 - smooth((progress - .085) / .13),
    '--desk-away': `${enter * height * .18}px`,
    '--monitor-opacity': 1 - smooth((progress - .165) / .065),
    '--screen-opacity': 1 - open,
    '--intro-opacity': 1 - smooth((progress - .075) / .10),
    '--mask-top': `${Math.max(0, screenCenter - .215 * zoom + 13 * zoom / height) * 100}%`,
    '--mask-side': `${Math.max(0, (1 - .6 * zoom) / 2 + 13 * zoom / width) * 100}%`,
    '--mask-bottom': `${Math.max(0, 1 - screenCenter - .215 * zoom + 23 * zoom / height) * 100}%`,
    '--mask-radius': `${mix(5, 0, enter)}px`,
    '--system-opacity': open * (1 - finish * .92), '--story-opacity': story,
    '--closing-opacity': finish, '--closing-y': `${(1 - finish) * 24}px`,
    '--meter-opacity': smooth(progress / .07)
  };
  for (const [key, value] of Object.entries(props)) stage.style.setProperty(key, value);

  let index = 0;
  for (let i = 1; i < arrival.length; i++) if (progress >= arrival[i] - .024) index = i;
  let distance = distances[0];
  for (let i = 0; i < 4; i++) {
    if (progress >= arrival[i]) {
      // Cada nodo tiene un breve tramo de permanencia antes del siguiente viaje.
      const leg = smooth((progress - arrival[i] - .055) / (arrival[i + 1] - arrival[i] - .055));
      distance = mix(distances[i], distances[i + 1], leg);
    }
  }
  if (progress >= .85) distance = mix(distances[4], length, smooth((progress - .85) / .055));
  const point = route.getPointAtLength(distance);
  carrier.setAttribute('transform', `translate(${point.x} ${point.y})`);
  light.style.strokeDashoffset = length - distance;
  const scale = Math.min(width / 1440, height / 900) * mix(.88, 1.06, open) * (1 - finish * .16);
  // Un único mundo: la cámara acompaña la señal, no sustituye cinco pantallas.
  const cameraX = width * .715 - point.x * scale;
  const cameraY = height * .51 - point.y * scale;
  world.style.transform = `translate(${cameraX}px, ${cameraY}px) scale(${scale})`;

  if (index !== activeStep) {
    activeStep = index;
    count.textContent = `0${index + 1} / 05`;
    copies.forEach((copy, i) => { copy.classList.toggle('is-active', i === index); copy.setAttribute('aria-hidden', String(i !== index)); });
    waypoints.forEach((item, i) => { item.classList.toggle('is-active', i === index); item.classList.toggle('is-complete', i < index); });
    nodes.forEach((node, i) => {
      node.classList.toggle('is-active', i === index);
      node.classList.toggle('is-complete', i < index);
      if (i > index) node.style.setProperty('--activation', 0);
    });
  }
  nodes[index].style.setProperty('--activation', smooth((progress - arrival[index] + .018) / .06));
  nodes[4].classList.toggle('is-complete', progress > .87);
  waypoints[4].classList.toggle('is-complete', progress > .87);
  closing.classList.toggle('is-visible', finish > .02);
  closing.inert = finish < .7;
  closing.setAttribute('aria-hidden', String(finish < .7));
  narrative.setAttribute('aria-hidden', String(story < .1));
  monitor.setAttribute('aria-hidden', String(progress > .19));
  meter.style.transform = `scaleX(${progress})`;
  progressLabel.textContent = progress > .91 ? 'COMPLETADO' : progress > .23 ? 'RECORRIDO' : 'ENTRANDO';

  if (Math.abs(progress - targetProgress) > .00005 || Math.abs(mouseX - targetX) > .001 || Math.abs(mouseY - targetY) > .001) requestFrame();
  else lastTime = 0; // Sin bucle de animación en reposo.
}

function configure() {
  enabled = desktop.matches && !reduced.matches;
  root.classList.toggle('static-mode', reduced.matches);
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  lastTime = 0;
  if (!enabled) {
    closing.inert = false;
    closing.removeAttribute('aria-hidden');
    narrative.removeAttribute('aria-hidden');
    copies.forEach(copy => copy.removeAttribute('aria-hidden'));
    return;
  }
  measure();
  targetProgress = progress = clamp((scrollY - start) / travel);
  activeStep = -1;
  requestFrame();
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('pointermove', onPointer, { passive: true });
document.documentElement.addEventListener('pointerleave', resetPointer);
addEventListener('blur', resetPointer);
addEventListener('resize', () => { if (enabled) { measure(); onScroll(); } }, { passive: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; } else requestFrame(); });
desktop.addEventListener('change', configure);
reduced.addEventListener('change', configure);
configure();
