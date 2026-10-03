// Laboratorio local: scroll nativo, siete estaciones y cámara sin bucle en reposo.
const desktop = matchMedia('(min-width: 900px)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;
const $ = selector => document.querySelector(selector);
const journey = $('#journey'), stage = $('#stage'), world = $('#world');
const route = $('#route'), light = $('#route-light'), cycle = $('#cycle-route');
const carrier = $('#carrier'), body = $('#carrier-body'), glyph = $('#carrier-glyph'), label = $('#carrier-label');
const farLayer = $('#far-layer'), transitLayer = $('#transit-layer'), packetLayer = $('#stream-packets');
const closing = $('#closing'), narrative = $('.narrative'), monitor = $('#monitor');
const eventToken = $('.event-token'), count = $('#stage-count'), meter = $('#progress-line'), progressLabel = $('#progress-label');
const copies = [...document.querySelectorAll('[data-step]')];
const nodes = [...document.querySelectorAll('[data-node]')];
const waypoints = [...document.querySelectorAll('.waypoints li')];
const centers = [[420,650],[1300,390],[2190,780],[3100,430],[4040,800],[5060,460],[5940,710]];
const arrival = [.16,.27,.38,.49,.60,.71,.82];
const dwell = .075, transfer = .035;
const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
const smooth = n => { n = clamp(n); return n * n * (3 - 2 * n); };
const mix = (a, b, n) => a + (b - a) * n;

// Muestreo único: ni mediciones de layout ni consultas geométricas SVG en cada frame.
function samplePath(path, steps) {
  const length = path.getTotalLength();
  return Array.from({ length: steps + 1 }, (_, i) => {
    const point = path.getPointAtLength(length * i / steps);
    return { x: point.x, y: point.y };
  });
}
function pointAt(points, fraction) {
  const position = clamp(fraction) * (points.length - 1);
  const i = Math.min(points.length - 2, Math.floor(position)), t = position - i;
  return { x: mix(points[i].x, points[i + 1].x, t), y: mix(points[i].y, points[i + 1].y, t) };
}
const length = route.getTotalLength(), cycleLength = cycle.getTotalLength();
const routePoints = samplePath(route, 1200), cyclePoints = samplePath(cycle, 500);
const eventPoints = samplePath($('#event-route'), 100);
const distances = centers.map(([x, y]) => {
  let best = 0, error = Infinity;
  routePoints.forEach((point, i) => {
    const delta = (point.x - x) ** 2 + (point.y - y) ** 2;
    if (delta < error) { error = delta; best = i / (routePoints.length - 1); }
  });
  return best;
});
light.style.strokeDasharray = `${length} ${length}`;
cycle.style.strokeDasharray = `${cycleLength} ${cycleLength}`;

// Un mismo paquete evoluciona durante el recorrido; no son siete mundos aislados.
const states = [
  { w:58,h:42,r:6,label:'CONTEXTO',glyph:[[-18,-9],[18,-9],[18,9],[-18,9],[-18,-9]] },
  { w:38,h:42,r:4,label:'DATOS',glyph:[[-11,-11],[11,-11],[-11,0],[11,0],[-11,11]] },
  { w:46,h:46,r:8,label:'DECISIÓN',glyph:[[-14,0],[0,-14],[14,0],[0,14],[-14,0]] },
  { w:48,h:48,r:5,label:'ARQUITECTURA',glyph:[[-13,-13],[13,-13],[13,13],[-13,13],[-13,-13]] },
  { w:50,h:40,r:5,label:'VALIDACIÓN',glyph:[[-15,0],[-5,10],[14,-11],[7,-4],[-5,10]] },
  { w:74,h:24,r:12,label:'EN USO',glyph:[[-23,0],[-8,0],[5,0],[22,0],[14,-6]] },
  { w:56,h:40,r:6,label:'EVOLUCIÓN',glyph:[[-18,9],[-9,3],[0,6],[8,-5],[18,-11]] }
];
const poses = [
  {zoom:1.32,x:.70,y:.62,angle:-2,copyX:7,copyY:17,copyW:35,shade:19},
  {zoom:1.38,x:.32,y:.59,angle:2.2,copyX:59,copyY:16,copyW:34,shade:81},
  {zoom:1.35,x:.69,y:.60,angle:-1.8,copyX:8,copyY:16,copyW:35,shade:20},
  {zoom:1.52,x:.68,y:.57,angle:1.4,copyX:9,copyY:13,copyW:35,shade:21},
  {zoom:1.38,x:.32,y:.60,angle:-2.4,copyX:59,copyY:15,copyW:34,shade:82},
  {zoom:1.42,x:.67,y:.59,angle:1.6,copyX:7,copyY:14,copyW:35,shade:19},
  {zoom:1.10,x:.50,y:.67,angle:0,copyX:29,copyY:11,copyW:42,shade:50}
];

// Arquitectura secundaria y soportes entre estaciones: SVG procedural, sin imágenes ni librerías.
const svgNS = 'http://www.w3.org/2000/svg';
function svg(tag, attributes, parent) {
  const element = document.createElementNS(svgNS, tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  parent.append(element);
  return element;
}
centers.forEach(([x, y], index) => {
  for (let k = 0; k < 5; k++) {
    const px = x - 370 + k * 176, py = y - 390 - (k % 2) * 115;
    svg('use', {href:'#distant-panel',class:'distant-structure',transform:`translate(${px} ${py}) skewY(${index % 2 ? -12 : 12}) scale(${.65 + k % 3 * .18})`}, farLayer);
    svg('path', {class:'secondary-wire',d:`M${px + 34} ${py + 150}V${py + 240}H${px + 180}`}, farLayer);
  }
});
const tunnels = centers.slice(0, -1).map((_, index) => {
  const group = svg('g', {}, transitLayer);
  for (let k = 0; k < 3; k++) {
    const point = pointAt(routePoints, mix(distances[index], distances[index + 1], .33 + k * .17));
    const arch = svg('g', {transform:`translate(${point.x} ${point.y}) rotate(${index % 2 ? -8 : 8})`}, group);
    svg('path', {class:'tunnel-support',d:'M-45 65V-180Q-45-227 0-227H70Q110-227 110-180V65'}, arch);
    svg('path', {class:'tunnel-ring',d:'M-40 65V-178Q-40-220 0-220H69Q103-220 103-178V65'}, arch);
    svg('path', {class:'tunnel-ring',opacity:'.3',d:'M-40-160H103M-40 40H103'}, arch);
  }
  return group;
});
const packets = Array.from({length:10}, (_, i) => svg('rect', {class:'stream-packet',x:-9,y:-3,width:i % 3 ? 18 : 28,height:6,rx:3}, packetLayer));

let width = 0, height = 0, travel = 1, start = 0;
let targetX = 0, targetY = 0, mouseX = 0, mouseY = 0, farX = 0, farY = 0;
let progress = 0, targetProgress = 0, frame = 0, lastTime = 0, activeStep = -1, enabled = false;
function measure() {
  width = stage.clientWidth; height = stage.clientHeight;
  start = journey.getBoundingClientRect().top + scrollY;
  travel = Math.max(1, journey.offsetHeight - height);
}
function requestFrame() {
  if (enabled && !frame && !document.hidden) frame = requestAnimationFrame(render);
}
function onScroll() {
  if (!enabled) return;
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
  const dt = lastTime ? Math.min(time - lastTime, 250) : 16;
  lastTime = time;
  const ease = 1 - Math.exp(-dt / 65), backgroundEase = 1 - Math.exp(-dt / 190);
  progress = mix(progress, targetProgress, ease);
  mouseX = mix(mouseX, targetX, ease); mouseY = mix(mouseY, targetY, ease);
  farX = mix(farX, targetX, backgroundEase); farY = mix(farY, targetY, backgroundEase);
  if (Math.abs(progress - targetProgress) < .00003) progress = targetProgress;

  let index = 0;
  for (let i = 1; i < arrival.length; i++) if (progress >= arrival[i]) index = i;
  const local = progress - arrival[index];
  const leg = index < 6 ? smooth((local - dwell) / transfer) : 0;
  const from = index, to = Math.min(6, index + 1), transit = 4 * leg * (1 - leg);
  const a = states[from], b = states[to], poseA = poses[from], poseB = poses[to];
  let fraction = mix(distances[from], distances[to], leg);
  if (progress < arrival[0]) fraction = distances[0] * smooth((progress - .10) / .06);
  if (progress > .91) fraction = mix(distances[6], 1, smooth((progress - .91) / .035));
  const point = pointAt(routePoints, fraction);
  const overview = smooth((progress - .92) / .065), finish = smooth((progress - .94) / .05);
  const cycleProgress = smooth((progress - .945) / .045);
  const signal = progress > .945 ? pointAt(cyclePoints, cycleProgress) : point;
  carrier.setAttribute('transform', `translate(${signal.x} ${signal.y})`);
  const bw = mix(a.w, b.w, leg), bh = mix(a.h, b.h, leg);
  for (const [key, value] of Object.entries({x:-bw / 2,y:-bh / 2,width:bw,height:bh,rx:mix(a.r,b.r,leg)})) body.setAttribute(key,value);
  glyph.setAttribute('d', a.glyph.map(([x,y], i) => `${i ? 'L' : 'M'}${mix(x,b.glyph[i][0],leg).toFixed(2)} ${mix(y,b.glyph[i][1],leg).toFixed(2)}`).join(''));
  label.textContent = leg > .5 ? b.label : a.label;
  light.style.strokeDashoffset = length * (1 - fraction);
  cycle.style.strokeDashoffset = cycleLength * (1 - cycleProgress);

  // La cámara no se desplaza durante la lectura; solo los planos secundarios responden al cursor.
  const scaleBase = Math.min(width / 1440, height / 900);
  const scale = scaleBase * mix(mix(poseA.zoom,poseB.zoom,leg) + .52 * transit,.195,overview);
  const cameraX = mix(point.x,3260,overview), cameraY = mix(point.y,670,overview);
  const focusX = mix(mix(poseA.x,poseB.x,leg),.5,overview) * width + mouseX * 9 * transit;
  const focusY = mix(mix(poseA.y,poseB.y,leg),.54,overview) * height + mouseY * 6 * transit;
  const angle = (mix(poseA.angle,poseB.angle,leg) + Math.sin(leg * Math.PI * 2) * 2.5) * (1 - overview);
  world.style.transform = `translate(${focusX}px,${focusY}px) rotate(${angle}deg) scale(${scale}) translate(${-cameraX}px,${-cameraY}px)`;
  farLayer.setAttribute('transform', `translate(${point.x * -.035 + farX * 18} ${farY * 12})`);
  tunnels.forEach((tunnel, i) => tunnel.style.opacity = i === index ? .28 + .57 * transit : .12);
  packets.forEach((packet, i) => {
    const offset = (progress * 1400 + i * 47) % 360 - 180;
    const packetFraction = clamp(fraction + offset / length);
    const p = pointAt(routePoints,packetFraction), next = pointAt(routePoints,Math.min(.999,packetFraction) + .001);
    const tangent = Math.atan2(next.y - p.y,next.x - p.x) * 180 / Math.PI;
    packet.setAttribute('transform',`translate(${p.x} ${p.y + (i % 2 ? 12 : -12)}) rotate(${tangent})`);
    packet.style.opacity = (1 - finish * .6) * (.4 + transit * .6);
  });

  const enter = smooth(progress / .125), open = smooth((progress - .032) / .085);
  const story = smooth((progress - .15) / .02) * (1 - smooth((progress - .915) / .025));
  const copyOpacity = (1 - smooth((local - .068) / .007)) * story;
  const titleOpacity = smooth((local - .018) / .009), textOpacity = smooth((local - .027) / .009);
  const zoom = mix(1,2.65,enter), screenCenter = .455 + .045 * enter;
  const props = {
    '--mx':mouseX.toFixed(4),'--my':mouseY.toFixed(4),'--fx':farX.toFixed(4),'--fy':farY.toFixed(4),
    '--parallax':1 - enter,'--monitor-scale':zoom,'--monitor-shift':`${height * .045 * enter}px`,
    '--room-opacity':1 - smooth((progress - .035) / .06),'--desk-away':`${enter * height * .18}px`,
    '--monitor-opacity':1 - smooth((progress - .10) / .035),'--screen-opacity':1 - open,
    '--intro-opacity':1 - smooth((progress - .025) / .055),'--wake':smooth(progress / .05),
    '--mask-top':`${Math.max(0,screenCenter - .215 * zoom + 13 * zoom / height) * 100}%`,
    '--mask-side':`${Math.max(0,(1 - .6 * zoom) / 2 + 13 * zoom / width) * 100}%`,
    '--mask-bottom':`${Math.max(0,1 - screenCenter - .215 * zoom + 23 * zoom / height) * 100}%`,
    '--mask-radius':`${mix(5,0,enter)}px`,'--system-opacity':open * (1 - finish * .5),
    '--portal-opacity':smooth((progress - .035) / .045) * (1 - smooth((progress - .12) / .04)),
    '--portal-scale':mix(.7,3.2,smooth((progress - .06) / .10)),
    '--entry-flash':4 * open * (1 - open) * .4,'--story-opacity':story,
    '--copy-x':`${poseA.copyX}%`,'--copy-y':`${poseA.copyY}%`,'--copy-width':`${poseA.copyW}%`,
    '--copy-opacity':copyOpacity,'--title-opacity':titleOpacity,'--text-opacity':textOpacity,
    '--title-shift':`${(1 - titleOpacity) * 16}px`,'--text-shift':`${(1 - textOpacity) * 12}px`,
    '--shade-x':`${mix(poseA.shade,poseB.shade,leg)}%`,
    '--light-x':`${mix(poseA.x,poseB.x,leg) * 100}%`,'--light-y':`${mix(poseA.y,poseB.y,leg) * 100}%`,
    '--light-angle':`${mix(index,to,leg) * 13}deg`,'--light-scale':mix(.92,1.15,smooth(progress)),
    '--floor-angle':`${-14 + mix(index,to,leg) * 4}deg`,'--grid-shift':`${point.y * -.12 + farY * 10}px`,
    '--wall-shift':`${point.x * -.025}px`,'--transit':transit,'--near-shift':`${Math.sin(progress * 32) * 90}px`,
    '--flow-offset':-progress * 1900,'--closing-opacity':finish,'--closing-y':`${(1 - finish) * 24}px`,
    '--meter-opacity':smooth(progress / .03)
  };
  for (const [key,value] of Object.entries(props)) stage.style.setProperty(key,value);

  if (index !== activeStep) {
    activeStep = index;
    count.textContent = `0${index + 1} / 07`;
    copies.forEach((copy,i) => { copy.classList.toggle('is-active',i === index); copy.setAttribute('aria-hidden',String(i !== index)); });
    waypoints.forEach((item,i) => { item.classList.toggle('is-active',i === index); item.classList.toggle('is-complete',i < index); });
    nodes.forEach((node,i) => { node.classList.toggle('is-active',i === index); node.classList.toggle('is-complete',i < index); });
  }
  nodes.forEach((node,i) => node.style.setProperty('--phase',smooth((progress - arrival[i]) / .032)));
  const eventPoint = pointAt(eventPoints,clamp((progress - arrival[5]) / dwell));
  eventToken.setAttribute('transform',`translate(${eventPoint.x} ${eventPoint.y})`);
  nodes[6].classList.toggle('is-complete',progress > .90);
  waypoints[6].classList.toggle('is-complete',progress > .90);
  closing.classList.toggle('is-visible',finish > .02);
  closing.inert = finish < .7;
  closing.setAttribute('aria-hidden',String(finish < .7));
  narrative.setAttribute('aria-hidden',String(copyOpacity * titleOpacity < .1));
  monitor.setAttribute('aria-hidden',String(progress > .13));
  meter.style.transform = `scaleX(${progress})`;
  progressLabel.textContent = progress > .94 ? 'COMPLETADO' : progress > .15 ? 'RECORRIDO' : 'ENTRANDO';

  if (Math.abs(progress - targetProgress) > .00003 || Math.abs(mouseX - targetX) > .001 || Math.abs(mouseY - targetY) > .001 || Math.abs(farX - targetX) > .001 || Math.abs(farY - targetY) > .001) requestFrame();
  else lastTime = 0;
}

function configure() {
  enabled = desktop.matches && !reduced.matches;
  root.classList.toggle('static-mode',reduced.matches);
  if (frame) cancelAnimationFrame(frame);
  frame = 0; lastTime = 0;
  if (!enabled) {
    closing.inert = false; closing.removeAttribute('aria-hidden'); narrative.removeAttribute('aria-hidden');
    copies.forEach(copy => copy.removeAttribute('aria-hidden'));
    return;
  }
  measure(); targetProgress = progress = clamp((scrollY - start) / travel);
  activeStep = -1; requestFrame();
}
addEventListener('scroll',onScroll,{passive:true});
addEventListener('pointermove',onPointer,{passive:true});
nodes.forEach(node => {
  node.addEventListener('pointerenter',() => node.classList.add('is-hovered'));
  node.addEventListener('pointerleave',() => node.classList.remove('is-hovered'));
});
root.addEventListener('pointerleave',resetPointer);
addEventListener('blur',resetPointer);
addEventListener('resize',() => { if (enabled) { measure(); onScroll(); } },{passive:true});
document.addEventListener('visibilitychange',() => {
  if (document.hidden) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
  else onScroll();
});
desktop.addEventListener('change',configure);
reduced.addEventListener('change',configure);
configure();
