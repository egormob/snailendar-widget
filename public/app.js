const root = document.getElementById("app");

if (root) {
  root.innerHTML = `
    <div class="wrap">
      <svg viewBox="-500 -500 1000 1000" role="img" aria-label="Календарь-сейф">
        <defs>
          <radialGradient id="plateGrad" cx="0" cy="0" r="1">
            <stop offset="0" stop-color="var(--metal-mid)" />
            <stop offset=".6" stop-color="var(--metal)" />
            <stop offset="1" stop-color="#111" />
          </radialGradient>
          <radialGradient id="goldRingGrad" cx="0" cy="0" r="1">
            <stop offset="0" stop-color="#f6d47a" />
            <stop offset=".5" stop-color="var(--gold)" />
            <stop offset="1" stop-color="#7e611f" />
          </radialGradient>
          <radialGradient id="knobGrad" cx="-0.1" cy="-0.1" r="1">
            <stop offset="0" stop-color="#bdbfc2" />
            <stop offset=".6" stop-color="var(--safe-center)" />
            <stop offset="1" stop-color="#6e7074" />
          </radialGradient>
          <filter id="bevel" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b" />
            <feSpecularLighting
              in="b"
              surfaceScale="4"
              specularConstant=".6"
              specularExponent="20"
              lighting-color="#ffffff"
              result="s"
            >
              <fePointLight x="-200" y="-200" z="200" />
            </feSpecularLighting>
            <feComposite in="s" in2="SourceAlpha" operator="in" result="spec" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="spec" />
            </feMerge>
          </filter>
        </defs>

        <circle class="bg-plate" r="480"></circle>
        <circle class="ring-gold" r="460"></circle>

        <g id="seasons">
          <path class="season-band" fill="var(--winter)" d="" id="season-w"></path>
          <path class="season-band" fill="var(--spring)" d="" id="season-sp"></path>
          <path class="season-band" fill="var(--summer)" d="" id="season-su"></path>
          <path class="season-band" fill="var(--autumn)" d="" id="season-au"></path>
        </g>

        <g id="dial"></g>

        <circle class="track" r="250"></circle>

        <g id="rotor">
          <g id="snakes"></g>
          <circle class="knob" r="110"></circle>
          <circle class="knob" r="60" fill="none" stroke="var(--gold-deep)" stroke-width="5"></circle>
        </g>
      </svg>
      <div class="hint">Потяни за ручку или змейку — поворот по неделям с тихим «щелчком»</div>
    </div>
  `;

  const svg = root.querySelector("svg");
  const dial = root.querySelector("#dial");
  const snakesG = root.querySelector("#snakes");

  if (!svg || !dial || !snakesG) {
    throw new Error("Snailendar markup failed to render");
  }

  const weeks = 52;
  const stepDeg = 360 / weeks;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const svgNS = "http://www.w3.org/2000/svg";

  const arc = (r, a0, a1) => {
    const point = (angle) => [
      r * Math.cos(toRad(angle - 90)),
      r * Math.sin(toRad(angle - 90)),
    ];
    const [x0, y0] = point(a0);
    const [x1, y1] = point(a1);
    const large = ((a1 - a0) % 360) > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  };

  const createLine = (rIn, rOut, angle, className) => {
    const line = document.createElementNS(svgNS, "line");
    const x1 = rIn * Math.cos(toRad(angle - 90));
    const y1 = rIn * Math.sin(toRad(angle - 90));
    const x2 = rOut * Math.cos(toRad(angle - 90));
    const y2 = rOut * Math.sin(toRad(angle - 90));
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("class", className);
    return line;
  };

  const createText = (x, y, content, angle) => {
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("class", "month-label");
    text.setAttribute("transform", `rotate(${angle - 90} ${x} ${y})`);
    text.textContent = content;
    return text;
  };

  const monthsRu = [
    "ЯНВАРЬ",
    "ФЕВРАЛЬ",
    "МАРТ",
    "АПРЕЛЬ",
    "МАЙ",
    "ИЮНЬ",
    "ИЮЛЬ",
    "АВГУСТ",
    "СЕНТЯБРЬ",
    "ОКТЯБРЬ",
    "НОЯБРЬ",
    "ДЕКАБРЬ",
  ];
  const monthAngle = 360 / monthsRu.length;

  for (let i = 0; i < monthsRu.length; i += 1) {
    const angle = i * monthAngle;
    dial.appendChild(createLine(430, 460, angle, "month-tick"));
  }

  for (let i = 0; i < weeks; i += 1) {
    const angle = i * stepDeg;
    dial.appendChild(createLine(446, 458, angle, "week-tick"));
  }

  for (let i = 0; i < monthsRu.length; i += 1) {
    const angle = i * monthAngle + monthAngle / 2;
    const rLabel = 410;
    const x = rLabel * Math.cos(toRad(angle - 90));
    const y = rLabel * Math.sin(toRad(angle - 90));
    dial.appendChild(createText(x, y, monthsRu[i], angle));
  }

  const seasonSpec = [
    { id: "season-w", startDeg: 300, span: 90 },
    { id: "season-sp", startDeg: 30, span: 90 },
    { id: "season-su", startDeg: 120, span: 90 },
    { id: "season-au", startDeg: 210, span: 90 },
  ];

  seasonSpec.forEach((spec) => {
    const segment = root.querySelector(`#${spec.id}`);
    if (!segment) return;
    const outerRadius = 310;
    const innerRadius = 280;
    const start = spec.startDeg;
    const end = spec.startDeg + spec.span;
    const outer = arc(outerRadius, start, end);
    const inner = arc(innerRadius, end, start).replace("M", "L");
    segment.setAttribute("d", `${outer} ${inner} Z`);
  });

  const snakes = [
    { cls: "ruby", start: 49, len: 2 },
    { cls: "ruby", start: 25, len: 2 },
    { cls: "silver", start: 3, len: 6 },
    { cls: "silver", start: 16, len: 6 },
    { cls: "silver", start: 29, len: 6 },
    { cls: "silver", start: 42, len: 6 },
    { cls: "gold", start: 30, len: 4 },
    { cls: "gold", start: 0, len: 3 },
  ];
  const snakeRadius = 250;

  snakes.forEach((snake) => {
    const start = snake.start * stepDeg;
    const end = (snake.start + snake.len) * stepDeg;
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", arc(snakeRadius, start, end));
    path.setAttribute("class", `snake ${snake.cls}`);
    path.dataset.draggable = "1";
    snakesG.appendChild(path);
  });

  const rotor = root.querySelector("#rotor");
  if (!rotor) {
    throw new Error("Rotor element missing");
  }

  let rot = 0;
  let dragging = false;
  let startAngle = 0;
  let baseRot = 0;
  let lastSnapIndex = 0;
  let audioCtx = null;

  const toAngle = (evt) => {
    const point = svg.createSVGPoint();
    const source = evt.touches ? evt.touches[0] : evt;
    point.x = source.clientX;
    point.y = source.clientY;
    const cursor = point.matrixTransform(svg.getScreenCTM().inverse());
    return (Math.atan2(cursor.y, cursor.x) * 180) / Math.PI + 90;
  };

  const tick = () => {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "square";
      osc.frequency.value = 1000;
      gain.gain.value = 0.01;
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      setTimeout(() => osc.stop(), 22);
    } catch (error) {
      // Audio may be unavailable or blocked; ignore errors silently.
    }
  };

  const begin = (evt) => {
    dragging = true;
    startAngle = toAngle(evt);
    baseRot = rot;
    lastSnapIndex = Math.round(rot / stepDeg);
    evt.preventDefault();
  };

  const move = (evt) => {
    if (!dragging) return;
    const delta = toAngle(evt) - startAngle;
    rot = baseRot + delta;
    rotor.setAttribute("transform", `rotate(${rot})`);
    const snapIndex = Math.round(rot / stepDeg);
    if (snapIndex !== lastSnapIndex) {
      lastSnapIndex = snapIndex;
      tick();
    }
    evt.preventDefault();
  };

  const end = () => {
    if (!dragging) return;
    dragging = false;
    rot = Math.round(rot / stepDeg) * stepDeg;
    rotor.setAttribute("transform", `rotate(${rot})`);
    tick();
  };

  const interactives = root.querySelectorAll(".knob, .snake");
  interactives.forEach((el) => {
    el.addEventListener("pointerdown", begin, { passive: false });
    el.addEventListener("touchstart", begin, { passive: false });
  });

  window.addEventListener("pointermove", move, { passive: false });
  window.addEventListener("touchmove", move, { passive: false });
  window.addEventListener("pointerup", end);
  window.addEventListener("touchend", end);

  document.addEventListener(
    "touchmove",
    (evt) => {
      if (dragging) {
        evt.preventDefault();
      }
    },
    { passive: false }
  );
}
