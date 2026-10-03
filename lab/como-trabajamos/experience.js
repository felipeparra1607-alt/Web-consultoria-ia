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
const carrierBody = document.querySelector('#carrier-body');
const carrierGlyph = document.querySelector('#carrier-glyph');
const carrierLabel = document.querySelector('#carrier-label');
const farLayer = document.querySelector('#far-layer');
const cycle = document.querySelector('#cycle-route');
const eventRoute = document.querySelector('#event-route');
const eventToken = document.querySelector('.event-token');
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
const cycleLength = cycle.getTotalLength();
const eventLength = eventRoute.getTotalLength();
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
// El mismo paquete cambia de estado durante el viaje, sin sustituir el mundo.
const states = [
  { w: 54, h: 38, r: 7, label: 'CONTEXTO', glyph: [[-16,-8],[16,-8],[16,8],[-16,8],[-16,-8]] },
  { w: 34, h: 40, r: 4, label: 'DATOS', glyph: [[-9,-10],[9,-10],[-9,0],[9,0],[-9,10]] },
  { w: 44, h: 44, r: 5, label: 'DISEÑO', glyph: [[-11,-11],[11,-11],[11,11],[-11,11],[-11,-11]] },
  { w: 66, h: 22, r: 11, label: 'EVENTO', glyph: [[-20,0],[-7,0],[4,0],[17,0],[11,-5]] },
  { w: 54, h: 36, r: 5, label: 'RESULTADOS', glyph: [[-17,9],[-9,5],[0,7],[7,-3],[17,-9]] }
];
const poses = [
  { zoom: 1.04, x: .715, y: .63, angle: -.8 },
  { zoom: 1.02, x: .705, y: .64, angle: .9 },
  { zoom: 1.12, x: .72, y: .62, angle: -1.1 },
  { zoom: 1.08, x: .71, y: .63, angle: .65 },
  { zoom: 1.10, x: .715, y: .61, angle: -.4 }
];
let width = 0, height = 0, travel = 1, start = 0;
let targetX = 0, targetY = 0, mouseX = 0, mouseY = 0;
let farX = 0, farY = 0;
let progress = 0, targetProgress = 0, frame = 0, lastTime = 0;
let activeStep = -1, enabled = false;
light.style.strokeDasharray = `${length} ${length}`;
cycle.style.strokeDasharray = `${cycleLength} ${cycleLength}`;

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
  if (!enabled || event.pointerType === 'touch') return;
  targetX = clamp(event.clientX / width * 2 - 1, -1, 1);
  targetY = clamp(event.clientY / height * 2 - 1, -1, 1);
  requestFrame();
}
function resetPointer() { targetX = targetY = 0; requestFrame(); }

function render(time) {
  frame = 0;
  if (!enabled) return;
  // Recuperar el estado con rapidez también si el navegador espacia sus frames.
  const dt = lastTime ? Math.min(time - lastTime, 250) : 16;
  lastTime = time;
  const ease = 1 - Math.exp(-dt / 65);
  progress = mix(progress, targetProgress, ease);
  mouseX = mix(mouseX, targetX, ease);
  mouseY = mix(mouseY, targetY, ease);
  const backgroundEase = 1 - Math.exp(-dt / 180);
  farX = mix(farX, targetX, backgroundEase);
  farY = mix(farY, targetY, backgroundEase);
  if (Math.abs(progress - targetProgress) < .00005) progress = targetProgress;

  const enter = smooth(progress / .23);
  const open = smooth((progress - .075) / .15);
  const finish = smooth((progress - .905) / .08);
  const story = smooth((progress - .215) / .04) * (1 - smooth((progress - .895) / .045));
  const zoom = mix(1, 2.65, enter);
  const screenCenter = .455 + .045 * enter;
  // El marco se expande hasta salir por los bordes, mientras su contenido abre una máscara coincidente.
  const props = {
    '--mx': mouseX.toFixed(4), '--my': mouseY.toFixed(4),
    '--fx': farX.toFixed(4), '--fy': farY.toFixed(4),
    '--parallax': (1 - enter).toFixed(4),
    '--monitor-scale': zoom, '--monitor-shift': `${height * .045 * enter}px`,
    '--room-opacity': 1 - smooth((progress - .035) / .125),
    '--desk-away': `${enter * height * .18}px`,
    '--monitor-opacity': 1 - smooth((progress - .165) / .065),
    '--screen-opacity': 1 - open,
    '--intro-opacity': 1 - smooth((progress - .075) / .10),
    '--mask-top': `${Math.max(0, screenCenter - .215 * zoom + 13 * zoom / height) * 100}%`,
    '--mask-side': `${Math.max(0, (1 - .6 * zoom) / 2 + 13 * zoom / width) * 100}%`,
    '--mask-bottom': `${Math.max(0, 1 - screenCenter - .215 * zoom + 23 * zoom / height) * 100}%`,
    '--mask-radius': `${mix(5, 0, enter)}px`,
    '--system-opacity': open * (1 - finish * .65), '--story-opacity': story,
    '--entry-flash': 4 * open * (1 - open) * .55,
    '--light-scale': mix(.92, 1.15, smooth(progress)),
    '--closing-opacity': finish, '--closing-y': `${(1 - finish) * 24}px`,
    '--meter-opacity': smooth(progress / .07)
  };
  for (const [key, value] of Object.entries(props)) stage.style.setProperty(key, value);

  let index = 0;
  for (let i = 1; i < arrival.length; i++) if (progress >= arrival[i] - .024) index = i;
  let distance = distances[0], state = 0;
  for (let i = 0; i < 4; i++) {
    if (progress >= arrival[i]) {
      // Cada nodo tiene un breve tramo de permanencia antes del siguiente viaje.
      const leg = smooth((progress - arrival[i] - .055) / (arrival[i + 1] - arrival[i] - .055));
      distance = mix(distances[i], distances[i + 1], leg);
      state = i + leg;
    }
  }
  if (progress >= .85) distance = mix(distances[4], length, smooth((progress - .85) / .055));
  const point = route.getPointAtLength(distance);
  const cycleProgress = smooth((progress - .905) / .07);
  const signalPoint = progress > .905 ? cycle.getPointAtLength(cycleLength * cycleProgress) : point;
  carrier.setAttribute('transform', `translate(${signalPoint.x} ${signalPoint.y})`);
  const from = Math.min(4, Math.floor(state)), to = Math.min(4, from + 1), blend = state - from;
  const a = states[from], b = states[to];
  const bw = mix(a.w, b.w, blend), bh = mix(a.h, b.h, blend);
  carrierBody.setAttribute('x', -bw / 2);
  carrierBody.setAttribute('y', -bh / 2);
  carrierBody.setAttribute('width', bw);
  carrierBody.setAttribute('height', bh);
  carrierBody.setAttribute('rx', mix(a.r, b.r, blend));
  carrierGlyph.setAttribute('d', a.glyph.map(([x, y], i) => `${i ? 'L' : 'M'}${mix(x, b.glyph[i][0], blend).toFixed(2)} ${mix(y, b.glyph[i][1], blend).toFixed(2)}`).join(''));
  carrierLabel.textContent = blend > .5 ? b.label : a.label;
  light.style.strokeDashoffset = length - distance;
  cycle.style.strokeDashoffset = cycleLength * (1 - cycleProgress);
  const overview = smooth((progress - .87) / .085);
  const poseA = poses[from], poseB = poses[to];
  const scaleBase = Math.min(width / 1440, height / 900);
  const push = Math.sin(clamp((progress - arrival[index]) / .09) * Math.PI) * .025;
  const scale = scaleBase * mix(mix(poseA.zoom, poseB.zoom, blend) + push, .38, overview);
  const cameraX = mix(point.x, 1580, overview), cameraY = mix(point.y, 560, overview);
  const focusX = mix(mix(poseA.x, poseB.x, blend), .5, overview) * width + mouseX * 9 * (1 - overview);
  const focusY = mix(mix(poseA.y, poseB.y, blend), .51, overview) * height + mouseY * 6 * (1 - overview);
  const angle = (mix(poseA.angle, poseB.angle, blend) + mouseX * .28) * (1 - overview);
  world.style.transform = `translate(${focusX}px, ${focusY}px) rotate(${angle}deg) scale(${scale}) translate(${-cameraX}px, ${-cameraY}px)`;
  farLayer.setAttribute('transform', `translate(${point.x * .07 + farX * 20} ${point.y * .07 + farY * 12})`);
  stage.style.setProperty('--grid-shift', `${point.y * -.06 + farY * 12}px`);

  if (index !== activeStep) {
    activeStep = index;
    count.textContent = `0${index + 1} / 05`;
    copies.forEach((copy, i) => { copy.classList.toggle('is-active', i === index); copy.setAttribute('aria-hidden', String(i !== index)); });
    waypoints.forEach((item, i) => { item.classList.toggle('is-active', i === index); item.classList.toggle('is-complete', i < index); });
    nodes.forEach((node, i) => {
      node.classList.toggle('is-active', i === index);
      node.classList.toggle('is-complete', i < index);
    });
  }
  nodes.forEach((node, i) => node.style.setProperty('--phase', smooth((progress - arrival[i] + .026) / .087)));
  const eventPhase = clamp((progress - arrival[3] + .026) / .087);
  const eventPoint = eventRoute.getPointAtLength(eventLength * eventPhase);
  eventToken.setAttribute('transform', `translate(${eventPoint.x} ${eventPoint.y})`);
  nodes[4].classList.toggle('is-complete', progress > .87);
  waypoints[4].classList.toggle('is-complete', progress > .87);
  closing.classList.toggle('is-visible', finish > .02);
  closing.inert = finish < .7;
  closing.setAttribute('aria-hidden', String(finish < .7));
  narrative.setAttribute('aria-hidden', String(story < .1));
  monitor.setAttribute('aria-hidden', String(progress > .19));
  meter.style.transform = `scaleX(${progress})`;
  progressLabel.textContent = progress > .91 ? 'COMPLETADO' : progress > .23 ? 'RECORRIDO' : 'ENTRANDO';

  if (Math.abs(progress - targetProgress) > .00005 || Math.abs(mouseX - targetX) > .001 || Math.abs(mouseY - targetY) > .001 || Math.abs(farX - targetX) > .001 || Math.abs(farY - targetY) > .001) requestFrame();
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
nodes.forEach(node => {
  node.addEventListener('pointerenter', () => node.classList.add('is-hovered'));
  node.addEventListener('pointerleave', () => node.classList.remove('is-hovered'));
});
document.documentElement.addEventListener('pointerleave', resetPointer);
addEventListener('blur', resetPointer);
addEventListener('resize', () => { if (enabled) { measure(); onScroll(); } }, { passive: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; } else requestFrame(); });
desktop.addEventListener('change', configure);
reduced.addEventListener('change', configure);
configure();
