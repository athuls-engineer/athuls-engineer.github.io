// Athul S — Precision Hardware Logic & Real Project Telemetry Engines

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  // Mobile Drawer Toggle
  initMobileDrawer();

  // Project Engineering Telemetry Rig (HFSS S11, Vivado Logic Analyzer, NMEA GPS, 24h DAQ)
  initTelemetryRig();

  // Transit Radar Simulation
  initTransitRadar();

  // Virtual Microcontroller LCD Stream
  initVirtualLcd();

  // Keyboard accessibility (Escape key to close modals)
  initKeyboardAccessibility();

  // ScrollSpy for Active Navigation Link
  initScrollSpy();
});

/* -------------------------------------------------------------
 * 1. Mobile Drawer Navigation
 * -----------------------------------------------------------*/
function initMobileDrawer() {
  const toggleBtn = document.getElementById('mobile-toggle-btn');
  const drawer = document.getElementById('mobile-drawer');

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.toggle('hidden');
    });

    document.querySelectorAll('.mobile-link').forEach((link) => {
      link.addEventListener('click', () => {
        drawer.classList.add('hidden');
      });
    });
  }
}

/* -------------------------------------------------------------
 * 2. Precision Project Telemetry Rig (Real Engineering Plots)
 * -----------------------------------------------------------*/
let scopeMode = 'rf';
let sweepTime = 0;
let sweepSpeed = 1.0;
let scopeZoom = 1.0;

function initTelemetryRig() {
  const canvas = document.getElementById('oscilloscope-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Sliders
  const speedSlider = document.getElementById('scope-speed-slider');
  const speedLabel = document.getElementById('scope-speed-label');
  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      sweepSpeed = parseFloat(e.target.value);
      if (speedLabel) speedLabel.textContent = `${sweepSpeed.toFixed(1)}x`;
    });
  }

  const ampSlider = document.getElementById('scope-amp-slider');
  const ampLabel = document.getElementById('scope-amp-label');
  if (ampSlider) {
    ampSlider.addEventListener('input', (e) => {
      scopeZoom = parseFloat(e.target.value);
      if (ampLabel) ampLabel.textContent = `${scopeZoom.toFixed(1)}x`;
    });
  }

  function render() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (scopeMode === 'rf') {
      renderHfssPlot(ctx, w, h);
    } else if (scopeMode === 'fpga') {
      renderVivadoLogicAnalyzer(ctx, w, h);
    } else if (scopeMode === 'gps') {
      renderNmeaGpsStream(ctx, w, h);
    } else {
      renderLmdAqPlot(ctx, w, h);
    }

    sweepTime += 0.02 * sweepSpeed;
    requestAnimationFrame(render);
  }

  render();
}

/* --- View 1: Ansys HFSS S11 Return Loss Curve (5.8 GHz Patch) --- */
function renderHfssPlot(ctx, w, h) {
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;
  const plotW = w - padLeft - padRight;
  const plotH = h - padTop - padBottom;

  // Grid Lines & Labels
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#64748B';
  ctx.font = '9px "JetBrains Mono", monospace';

  // Y-axis: 0 dB, -5 dB, -10 dB, -15 dB, -20 dB
  const yTicks = [
    { db: ' 0dB', norm: 0.1 },
    { db: '-10dB', norm: 0.5 },
    { db: '-20dB', norm: 0.9 }
  ];

  yTicks.forEach(t => {
    const y = padTop + t.norm * plotH;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(w - padRight, y);
    ctx.stroke();
    ctx.fillText(t.db, 8, y + 3);
  });

  // -10 dB Reference Threshold Line (VSWR 2:1 Limit)
  const threshY = padTop + 0.5 * plotH;
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(padLeft, threshY);
  ctx.lineTo(w - padRight, threshY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#F59E0B';
  ctx.fillText('VSWR < 2:1 MATCH', w - 120, threshY - 4);

  // X-axis: 5.60 GHz -> 6.00 GHz
  const xTicks = ['5.60', '5.70', '5.80 GHz', '5.90', '6.00'];
  xTicks.forEach((txt, idx) => {
    const x = padLeft + (idx / 4) * plotW;
    ctx.fillStyle = idx === 2 ? '#34D399' : '#64748B';
    ctx.fillText(txt, x - 12, h - 10);
  });

  // Actual S11 Return Loss Curve (Lorentzian Resonant Notch @ 5.80 GHz = -18.4 dB)
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#34D399';
  ctx.shadowColor = 'rgba(52, 211, 153, 0.7)';
  ctx.shadowBlur = 8;

  const points = 120;
  for (let i = 0; i <= points; i++) {
    const normX = i / points; // 0 to 1 (5.6 GHz to 6.0 GHz)
    const freq = 5.60 + normX * 0.40;
    const px = padLeft + normX * plotW;

    // S11 formula modeling the 5.8 GHz microstrip patch return loss notch
    const deltaF = (freq - 5.80) / 0.035;
    const notch = 1 / (1 + deltaF * deltaF);
    const s11_db = -3.2 - 15.2 * notch * scopeZoom; // -3.2dB base down to -18.4dB notch
    const py = padTop + (-s11_db / 22.0) * plotH;

    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Scanning Marker at Resonance (5.80 GHz)
  const resX = padLeft + 0.5 * plotW;
  const resY = padTop + (18.4 / 22.0) * plotH;

  ctx.beginPath();
  ctx.arc(resX, resY, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(resX, resY, 10 + Math.sin(sweepTime * 4) * 2, 0, Math.PI * 2);
  ctx.strokeStyle = '#34D399';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Resonant Tag
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.fillText('PEAK: -18.4 dB @ 5.80 GHz', resX - 55, resY - 14);
}

/* --- View 2: Basys 3 FPGA Vivado Logic Analyzer (Digital Waveforms) --- */
function renderVivadoLogicAnalyzer(ctx, w, h) {
  const padLeft = 85;
  const padRight = 15;
  const plotW = w - padLeft - padRight;
  const channels = [
    { name: 'CLK_100M', color: '#94A3B8' },
    { name: 'RST_N',    color: '#60A5FA' },
    { name: 'COIN_IN',  color: '#F59E0B' },
    { name: 'FSM_BUS',  color: '#34D399' },
    { name: 'DISPENSE', color: '#FF5E3A' }
  ];

  const rowHeight = (h - 20) / channels.length;

  channels.forEach((ch, idx) => {
    const yBase = 15 + idx * rowHeight;
    const yHigh = yBase + 4;
    const yLow = yBase + rowHeight - 6;

    // Channel label tag
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(8, yBase + 2, 70, rowHeight - 6);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.strokeRect(8, yBase + 2, 70, rowHeight - 6);
    ctx.fillStyle = ch.color;
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillText(ch.name, 14, yBase + (rowHeight / 2) + 2);

    // Channel baseline divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.moveTo(padLeft, yLow + 3);
    ctx.lineTo(w - padRight, yLow + 3);
    ctx.stroke();

    // Waveform rendering
    ctx.strokeStyle = ch.color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();

    const tOffset = sweepTime * 35;

    for (let x = 0; x <= plotW; x += 2) {
      const px = padLeft + x;
      const t = (x + tOffset);
      let val = 0;

      if (idx === 0) {
        // Clock 100MHz (square periodic)
        val = (Math.floor(t / 10) % 2 === 0) ? 1 : 0;
      } else if (idx === 1) {
        // Reset Active Low (High most of the time)
        val = (Math.floor(t / 140) % 10 === 0) ? 0 : 1;
      } else if (idx === 2) {
        // Coin input pulse (intermittent ₹5/₹10 triggers)
        const cycle = Math.floor(t / 80) % 4;
        val = (cycle === 1 && (t % 80 < 22)) ? 1 : 0;
      } else if (idx === 3) {
        // FSM Bus States (IDLE -> ACCUM -> READY -> DISP)
        const stateIdx = Math.floor(t / 70) % 4;
        val = stateIdx / 3;
      } else {
        // Dispense Pulse
        const cycle = Math.floor(t / 140) % 3;
        val = (cycle === 2 && (t % 140 < 25)) ? 1 : 0;
      }

      const py = yLow - val * (yLow - yHigh);
      if (x === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  });

  // Logic Analyzer Cursor Time Bar
  const cursorX = padLeft + (plotW * 0.55);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(cursorX, 10);
  ctx.lineTo(cursorX, h - 10);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '8px "JetBrains Mono", monospace';
  ctx.fillText('T = 142.5 µs', cursorX + 4, 18);
}

/* --- View 3: Chaakra IoT Real NMEA-0183 Live GPS Packet Stream --- */
function renderNmeaGpsStream(ctx, w, h) {
  ctx.fillStyle = '#060709';
  ctx.fillRect(0, 0, w, h);

  // Background GPS Grid
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 25) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Raw NMEA Stream Feed
  const lines = [
    { raw: '$GPRMC,071422.00,A,0955.8741,N,07616.0318,E,54.2,142.0,290826,,,A*7A', type: 'RMC ACTIVE' },
    { raw: '$GPGGA,071422.00,0955.8741,N,07616.0318,E,1,08,0.9,24.2,M,-2.4,M,,*41', type: '3D FIX (8 SATS)' },
    { raw: '$GPVTG,142.0,T,,M,54.2,N,100.4,K,A*3A', type: 'SPEED: 54.2 km/h' },
    { raw: '$GPGSA,A,3,04,05,09,12,24,28,17,19,,,,,1.4,0.9,1.1*36', type: 'HDOP: 0.90 [EXCELLENT]' }
  ];

  ctx.font = '10px "JetBrains Mono", monospace';
  lines.forEach((l, idx) => {
    const yPos = 28 + idx * 30;

    // Stream Badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fillRect(10, yPos - 12, w - 20, 22);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeRect(10, yPos - 12, w - 20, 22);

    ctx.fillStyle = '#34D399';
    ctx.fillText(l.raw, 18, yPos + 3);

    ctx.fillStyle = '#94A3B8';
    ctx.fillText(l.type, w - 140, yPos + 3);
  });

  // Telemetry Ping Sweep Indicator
  const pingY = h - 14;
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.arc(20, pingY, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#E2E8F0';
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.fillText('LIVE ESP32 SERIAL DAQ: 9600 BAUD | REFRESH < 5s | ROUTE: KOCHI -> TRIVANDRUM', 32, pingY + 3);
}

/* --- View 4: Microcontroller LM35 24-Hour Thermal DAQ Curve --- */
function renderLmdAqPlot(ctx, w, h) {
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;
  const plotW = w - padLeft - padRight;
  const plotH = h - padTop - padBottom;

  // Grid Lines & Labels
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#64748B';
  ctx.font = '9px "JetBrains Mono", monospace';

  // Y-axis: 20°C -> 35°C
  const yTicks = [
    { t: '35°C', norm: 0.0 },
    { t: '30°C', norm: 0.33 },
    { t: '25°C', norm: 0.66 },
    { t: '20°C', norm: 1.0 }
  ];

  yTicks.forEach(t => {
    const y = padTop + t.norm * plotH;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(w - padRight, y);
    ctx.stroke();
    ctx.fillText(t.t, 10, y + 3);
  });

  // X-axis: 00:00 -> 24:00
  const timeLabels = ['00h', '06h', '12h (Noon)', '18h', '24h'];
  timeLabels.forEach((txt, idx) => {
    const x = padLeft + (idx / 4) * plotW;
    ctx.fillText(txt, x - 12, h - 10);
  });

  // Temperature Profile (Ambient thermal variation with ATmega328 ADC samples)
  ctx.beginPath();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = '#34D399';
  ctx.shadowColor = 'rgba(52, 211, 153, 0.6)';
  ctx.shadowBlur = 6;

  const points = 100;
  for (let i = 0; i <= points; i++) {
    const normX = i / points;
    const px = padLeft + normX * plotW;

    // Temperature curve: 24.2°C morning, 32.1°C noon peak, 26.0°C night
    const thermalCycle = Math.sin((normX - 0.25) * Math.PI * 2);
    const baseTemp = 27.5 + 4.5 * thermalCycle;
    const adcQuantization = (Math.sin(i * 12) * 0.15); // ADC quantization steps
    const currentTemp = baseTemp + adcQuantization;

    // Map 20°C..35°C to plot height
    const normY = 1.0 - ((currentTemp - 20) / 15);
    const py = padTop + normY * plotH;

    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Active Sampling Point Marker
  const sampleNorm = (sweepTime * 0.15) % 1.0;
  const sampleX = padLeft + sampleNorm * plotW;
  const sampleCycle = Math.sin((sampleNorm - 0.25) * Math.PI * 2);
  const sampleTemp = (27.5 + 4.5 * sampleCycle).toFixed(1);
  const sampleY = padTop + (1.0 - ((sampleTemp - 20) / 15)) * plotH;

  ctx.beginPath();
  ctx.arc(sampleX, sampleY, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sampleX, sampleY, 9, 0, Math.PI * 2);
  ctx.strokeStyle = '#34D399';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Live Sample Tag
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.fillText(`T = ${sampleTemp}°C (±0.5°C)`, sampleX - 35, sampleY - 12);
}

/* -------------------------------------------------------------
 * 2.1 Mode Selector & Dynamic HUD Telemetry Switcher
 * -----------------------------------------------------------*/
function setScopeMode(mode) {
  scopeMode = mode;
  document.querySelectorAll('.scope-mode-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
  });

  const statusEl = document.getElementById('scope-status');
  const hudLeft = document.getElementById('scope-hud-left');
  const hudCenter = document.getElementById('scope-hud-center');
  const hudRight = document.getElementById('scope-hud-right');

  if (mode === 'rf') {
    if (statusEl) statusEl.textContent = 'ANSYS HFSS S11 RETURN LOSS';
    if (hudLeft) hudLeft.innerHTML = 'PARAM: <strong class="text-white">S11 (dB)</strong>';
    if (hudCenter) hudCenter.innerHTML = 'RESONANCE: <strong class="text-signal-emerald">5.80 GHz (-18.4 dB)</strong>';
    if (hudRight) hudRight.innerHTML = 'VSWR: <strong class="text-white">1.28:1</strong>';
  } else if (mode === 'fpga') {
    if (statusEl) statusEl.textContent = 'XILINX VIVADO LOGIC ANALYZER';
    if (hudLeft) hudLeft.innerHTML = 'CHANNELS: <strong class="text-white">5 DIGITAL BUS</strong>';
    if (hudCenter) hudCenter.innerHTML = 'CLOCK: <strong class="text-signal-emerald">100 MHz (BASYS 3)</strong>';
    if (hudRight) hudRight.innerHTML = 'RESPONSE: <strong class="text-white">&lt;1.0s FSM</strong>';
  } else if (mode === 'gps') {
    if (statusEl) statusEl.textContent = 'CHAAKRA NMEA-0183 LIVE GPS';
    if (hudLeft) hudLeft.innerHTML = 'LAT: <strong class="text-white">9.9312° N</strong>';
    if (hudCenter) hudCenter.innerHTML = 'SYNC: <strong class="text-signal-emerald">&lt;5s FIREBASE</strong>';
    if (hudRight) hudRight.innerHTML = 'LNG: <strong class="text-white">76.2673° E</strong>';
  } else {
    if (statusEl) statusEl.textContent = 'LM35 24-HOUR THERMAL DAQ';
    if (hudLeft) hudLeft.innerHTML = 'RANGE: <strong class="text-white">20°C – 35°C</strong>';
    if (hudCenter) hudCenter.innerHTML = 'ACCURACY: <strong class="text-signal-emerald">±0.5°C</strong>';
    if (hudRight) hudRight.innerHTML = 'RATE: <strong class="text-white">10s SAMPLE</strong>';
  }
}

/* -------------------------------------------------------------
 * 3. Basys 3 FPGA Vending Machine Simulator
 * -----------------------------------------------------------*/
let fpgaBalance = 0;
const ITEM_PRICE = 15;

function insertCoin(amount) {
  fpgaBalance += amount;
  updateFpgaDisplay();
}

function updateFpgaDisplay() {
  const balanceDisplay = document.getElementById('fpga-balance-display');
  const statusText = document.getElementById('fpga-status-text');
  const stateBadge = document.getElementById('fsm-state-badge');
  const dispenseBtn = document.getElementById('fsm-dispense-btn');

  if (balanceDisplay) {
    balanceDisplay.textContent = `₹${fpgaBalance.toFixed(2)}`;
  }

  if (fpgaBalance >= ITEM_PRICE) {
    if (statusText) statusText.textContent = 'READY TO DISPENSE';
    if (statusText) statusText.className = 'text-xs font-mono text-signal-emerald font-bold';
    if (stateBadge) stateBadge.textContent = 'STATE: READY';
    if (stateBadge) stateBadge.className = 'px-2 py-0.5 rounded bg-white/10 text-signal-emerald font-mono text-[10px] font-bold';
    if (dispenseBtn) dispenseBtn.removeAttribute('disabled');
  } else if (fpgaBalance > 0) {
    if (statusText) statusText.textContent = `NEED ₹${(ITEM_PRICE - fpgaBalance).toFixed(2)} MORE`;
    if (statusText) statusText.className = 'text-xs font-mono text-slate-300';
    if (stateBadge) stateBadge.textContent = 'STATE: ACCUMULATE';
    if (stateBadge) stateBadge.className = 'px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold';
    if (dispenseBtn) dispenseBtn.setAttribute('disabled', 'true');
  } else {
    if (statusText) statusText.textContent = 'INSERT COIN';
    if (statusText) statusText.className = 'text-xs font-mono text-slate-400';
    if (stateBadge) stateBadge.textContent = 'STATE: IDLE';
    if (stateBadge) stateBadge.className = 'px-2 py-0.5 rounded bg-white/[0.08] text-white font-mono text-[10px]';
    if (dispenseBtn) dispenseBtn.setAttribute('disabled', 'true');
  }
}

function dispenseCandy() {
  if (fpgaBalance < ITEM_PRICE) return;

  const change = fpgaBalance - ITEM_PRICE;
  const statusText = document.getElementById('fpga-status-text');
  const stateBadge = document.getElementById('fsm-state-badge');

  if (stateBadge) stateBadge.textContent = 'STATE: DISPENSE';
  if (statusText) {
    statusText.textContent = change > 0 ? `DISPENSED! CHANGE: ₹${change}` : 'DISPENSED! THANK YOU';
    statusText.className = 'text-xs font-mono text-signal-emerald font-bold';
  }

  showToast(change > 0 ? `Product Dispatched! Change: ₹${change}` : 'Product Dispatched successfully');

  setTimeout(() => {
    fpgaBalance = 0;
    updateFpgaDisplay();
  }, 2200);
}

function resetFpga() {
  fpgaBalance = 0;
  updateFpgaDisplay();
  showToast('FPGA State Machine Reset');
}

/* -------------------------------------------------------------
 * 4. Chaakra IoT Live Transit Radar Simulation
 * -----------------------------------------------------------*/
function initTransitRadar() {
  const canvas = document.getElementById('transit-radar-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let busProgress = 0;

  const waypoints = [
    { x: 0.15, y: 0.75, name: 'Kochi Hub' },
    { x: 0.45, y: 0.55, name: 'Alappuzha' },
    { x: 0.75, y: 0.35, name: 'Kollam' },
    { x: 0.90, y: 0.20, name: 'Trivandrum Terminus' },
  ];

  function drawRadar() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Route path line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);

    waypoints.forEach((pt, idx) => {
      const px = pt.x * w;
      const py = pt.y * h;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Waypoint Hubs
    waypoints.forEach((pt) => {
      const px = pt.x * w;
      const py = pt.y * h;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#64748B';
      ctx.fill();
    });

    // Moving bus node
    const totalSegments = waypoints.length - 1;
    const segIndex = Math.min(Math.floor(busProgress * totalSegments), totalSegments - 1);
    const segT = (busProgress * totalSegments) - segIndex;

    const p0 = waypoints[segIndex];
    const p1 = waypoints[segIndex + 1];

    const busX = (p0.x + (p1.x - p0.x) * segT) * w;
    const busY = (p0.y + (p1.y - p0.y) * segT) * h;

    // Pulse sweep
    ctx.beginPath();
    ctx.arc(busX, busY, 20, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Active Node
    ctx.beginPath();
    ctx.arc(busX, busY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#FFFFFF';
    ctx.fill();

    busProgress += 0.0015;
    if (busProgress > 1) busProgress = 0;

    requestAnimationFrame(drawRadar);
  }

  drawRadar();

  setInterval(() => {
    const latEl = document.getElementById('radar-lat');
    const lngEl = document.getElementById('radar-lng');
    const pingBadge = document.getElementById('transit-ping-badge');

    if (latEl && lngEl) {
      const baseLat = 9.9312 - (busProgress * 1.4);
      const baseLng = 76.2673 + (busProgress * 0.7);
      latEl.textContent = `${baseLat.toFixed(4)}° N`;
      lngEl.textContent = `${baseLng.toFixed(4)}° E`;
    }

    if (pingBadge) {
      const ping = (1.8 + Math.random() * 2.0).toFixed(1);
      pingBadge.textContent = `PING: ${ping}s`;
    }
  }, 3000);
}

/* -------------------------------------------------------------
 * 5. Virtual Microcontroller 16x2 Backlit LCD
 * -----------------------------------------------------------*/
function initVirtualLcd() {
  const line1 = document.getElementById('lcd-line-1');
  if (!line1) return;

  setInterval(() => {
    const temp = (27.2 + (Math.random() * 0.8)).toFixed(1);
    line1.textContent = `TEMP: ${temp} C  [OK]`;
  }, 2500);
}

/* -------------------------------------------------------------
 * 6. ScrollSpy for Active Navigation Links
 * -----------------------------------------------------------*/
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${current}`) {
        link.classList.add('text-white', 'bg-white/[0.08]');
        link.classList.remove('text-slate-300');
      } else {
        link.classList.remove('text-white', 'bg-white/[0.08]');
        link.classList.add('text-slate-300');
      }
    });
  });
}

/* -------------------------------------------------------------
 * 7. Keyboard Accessibility (Escape to Close Modals)
 * -----------------------------------------------------------*/
function initKeyboardAccessibility() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProjectModal();
      closeResumeModal();
    }
  });
}

/* -------------------------------------------------------------
 * 8. Copy to Clipboard with Toast
 * -----------------------------------------------------------*/
function copyToClipboard(text, message = 'Copied to clipboard!') {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(message);
    }).catch(() => fallbackCopy(text, message));
  } else {
    fallbackCopy(text, message);
  }
}

function fallbackCopy(text, message) {
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  showToast(message);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove('-translate-y-20', 'opacity-0', 'pointer-events-none');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.add('-translate-y-20', 'opacity-0', 'pointer-events-none');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 2400);
}

/* -------------------------------------------------------------
 * 9. Contact Form Handler (Mailto Trigger)
 * -----------------------------------------------------------*/
function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('sender-name').value;
  const email = document.getElementById('sender-email').value;
  const subject = document.getElementById('msg-subject').value;
  const body = document.getElementById('msg-body').value;

  const formattedBody = `Sender: ${name} (${email})\n\nMessage:\n${body}`;
  const mailtoLink = `mailto:athuls2580@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formattedBody)}`;

  window.location.href = mailtoLink;
  showToast('Opening default email client...');
}

/* -------------------------------------------------------------
 * 10. Project Detail Modal Data & Handler
 * -----------------------------------------------------------*/
const projectDetails = {
  chaakra: {
    title: 'Chaakra: IoT-Based GPS Bus Tracking & Booking System',
    duration: '10/2025 – 05/2026',
    category: 'IoT &bull; Mobile Architecture &bull; Cloud Telemetry',
    tags: ['ESP32', 'Neo-6M GPS Module', 'React Native', 'Firebase Realtime DB', 'Leaflet Maps'],
    description: 'An intelligent real-time fleet transit solution bridging bare-metal microcontroller telematics with high-concurrency cloud listeners and dynamic mobile mapping.',
    highlights: [
      'Engineered onboard microcontroller telemetry nodes using ESP32 paired with GPS modules.',
      'Achieved live tracking refresh intervals under 5 seconds across multiple concurrent buses.',
      'Integrated Leaflet maps for live route geometry, dynamic ETA estimation, and ticket booking on React Native.',
      'Optimized backend state synchronization with dynamic Firebase listeners.'
    ],
    architecture: `[ESP32 + GPS Module on Bus] 
          │ (Wi-Fi / Cellular Data Packet)
          ▼
  [Firebase Realtime Database] 
          │ (Dynamic WebSocket Listeners <5s)
          ▼
  [React Native Mobile App (Leaflet Maps + ETA Router)]`
  },

  fpga: {
    title: 'FPGA Candy Vending Machine Controller (Basys 3)',
    duration: '02/2025 – 03/2025',
    category: 'Digital VLSI Design &bull; Verilog HDL',
    tags: ['Verilog HDL', 'Xilinx Basys 3 (Artix-7)', 'FSM Controller', 'Switch Debounce', 'BCD Converter', '7-Segment Display'],
    description: 'A modular, high-reliability digital hardware state machine engineered in Verilog HDL to orchestrate asynchronous coin inputs, credit accumulation, product validation, and multi-display output.',
    highlights: [
      'Constructed 6 modular Verilog HDL blocks: FSM controller, switch debounce filter, BCD converter, clock divider, and 7-segment display driver.',
      'Simulated and verified vending logic with 3 coin inputs and 4 item outputs, achieving real-time response <1s.',
      'Implemented and verified FSM-based vending control logic using Verilog simulation testbenches.'
    ],
    architecture: `[Coin Sensors / Buttons] ──> [Debounce Filter Module]
                                      │
                                      ▼
                             [FSM Control Core] <──> [Clock Prescaler]
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
     [Item Dispense Drivers]                      [BCD Converter & 7-Segment]`
  },

  antenna: {
    title: '5.8 GHz Compact Automotive Antenna for V2V Systems',
    duration: '11/2024 – 01/2025',
    category: 'RF Engineering &bull; High-Frequency Electromagnetics',
    tags: ['Ansys HFSS', '5.8 GHz DSRC Band', 'Microstrip Patch', 'Return Loss (S11)', 'Radiation Efficiency', 'V2V Telematics'],
    description: 'An ultra-compact 2.5 × 2.5 cm microstrip patch antenna designed for next-generation Vehicle-to-Vehicle (V2V) cooperative collision avoidance and DSRC band telemetry.',
    highlights: [
      'Designed a 2.5 × 2.5 cm antenna prototype operating at 5.8 GHz for V2V communication.',
      'Achieved >85% radiation efficiency and <10 ms latency in dense vehicular simulation environments.',
      'Simulated antenna performance parameters including return loss, gain, and radiation pattern using Ansys HFSS.'
    ],
    architecture: `[Vehicle Transceiver] ── (50Ω Microstrip Feed) ──> [2.5 x 2.5 cm Patch @ 5.8 GHz]
                                                              │
                                              (>85% Efficiency, <10ms Latency)
                                                              ▼
                                               [Peer Vehicle V2V Node]`
  },

  logger: {
    title: 'Microcontroller Precision Temperature Data Logger',
    duration: '12/2024 – 12/2024',
    category: 'Embedded Systems &bull; Bare-Metal DAQ',
    tags: ['ATmega328 AVR', 'LM35 Sensor', 'Embedded C', '16x2 LCD', 'ADC Prescaling', 'Hardware Timers'],
    description: 'A standalone embedded data acquisition unit engineered for continuous, high-accuracy ambient temperature recording, signal conditioning, and local LCD display.',
    highlights: [
      'Logged temperature every 10 seconds with ±0.5°C accuracy over 24-hour cycles using LM35 + ATmega328.',
      'Achieved 100% data integrity and built a 16x2 LCD for live readings and status.',
      'Developed embedded C logic for periodic sensor acquisition and real-time LCD display updates.'
    ],
    architecture: `[LM35 Temp Transducer] ── (Analog mV Signal) ──> [ATmega328 ADC Channel]
                                                              │
                                                 (Embedded C Timer Interrupts)
                                                              ▼
                                                   [16x2 LCD Screen Display]`
  }
};

function openProjectModal(projectId) {
  const modal = document.getElementById('project-modal');
  const content = document.getElementById('modal-content');
  const data = projectDetails[projectId];

  if (!modal || !content || !data) return;

  content.innerHTML = `
    <div class="border-b border-white/[0.08] pb-4">
      <div class="flex items-center justify-between gap-2 mb-1.5">
        <span class="text-xs font-mono px-2.5 py-0.5 rounded bg-white/[0.06] text-white border border-white/[0.1] font-semibold">${data.category}</span>
        <span class="text-xs font-mono text-slate-400">${data.duration}</span>
      </div>
      <h3 class="text-2xl font-heading font-bold text-white mt-2">${data.title}</h3>
      <p class="text-xs sm:text-sm text-slate-300 mt-2 font-light leading-relaxed">${data.description}</p>
    </div>

    <div>
      <h4 class="text-xs font-mono font-bold text-white uppercase tracking-wider mb-2">Technical Highlights</h4>
      <ul class="space-y-2 text-xs sm:text-sm text-slate-300">
        ${data.highlights.map(h => `<li class="flex items-start gap-2"><span class="text-slate-400 mt-0.5">&bull;</span><span>${h}</span></li>`).join('')}
      </ul>
    </div>

    <div>
      <h4 class="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">System Architecture / Flow</h4>
      <pre class="p-3.5 rounded-xl bg-black border border-white/[0.08] text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">${data.architecture}</pre>
    </div>

    <div class="pt-2 border-t border-white/[0.08]">
      <h4 class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Technologies & Tooling</h4>
      <div class="flex flex-wrap gap-2">
        ${data.tags.map(tag => `<span class="tech-badge">${tag}</span>`).join('')}
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');

  if (window.lucide) {
    lucide.createIcons();
  }
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function openResumeModal() {
  const modal = document.getElementById('resume-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) {
      lucide.createIcons();
    }
  }
}

function closeResumeModal() {
  const modal = document.getElementById('resume-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

window.addEventListener('click', (e) => {
  const projectModal = document.getElementById('project-modal');
  const resumeModal = document.getElementById('resume-modal');
  if (e.target === projectModal) closeProjectModal();
  if (e.target === resumeModal) closeResumeModal();
});
