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
 * 9. Contact Form Handler (Async Dispatch with Fallback)
 * -----------------------------------------------------------*/
async function handleContactSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('contact-submit-btn');
  const btnText = document.getElementById('contact-btn-text');
  const statusDiv = document.getElementById('contact-status');

  const name = document.getElementById('sender-name')?.value.trim() || '';
  const email = document.getElementById('sender-email')?.value.trim() || '';
  const subject = document.getElementById('msg-subject')?.value.trim() || '';
  const body = document.getElementById('msg-body')?.value.trim() || '';

  if (!name || !email || !body) return;

  if (btn) btn.disabled = true;
  if (btnText) btnText.textContent = 'Dispatching Telemetry...';

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        access_key: 'a0a038bf-2775-430b-b184-7a33a36db5f6',
        name: name,
        email: email,
        subject: `[Portfolio Direct] ${subject}`,
        message: body,
        to: 'athuls2580@gmail.com'
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      if (statusDiv) {
        statusDiv.className = 'text-xs font-mono text-center p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 block';
        statusDiv.innerHTML = '✓ Message dispatched successfully! Received at <strong>athuls2580@gmail.com</strong>. I will respond within 24 hours.';
      }
      showToast('Message sent to Athul S!');
      document.getElementById('contact-form')?.reset();
    } else {
      throw new Error(result.message || 'Dispatch error');
    }
  } catch (err) {
    console.warn('Direct web dispatch fallback activated:', err);
    const formattedBody = `Sender: ${name} (${email})\n\nMessage:\n${body}`;
    const mailtoLink = `mailto:athuls2580@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formattedBody)}`;
    if (statusDiv) {
      statusDiv.className = 'text-xs font-mono text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 block';
      statusDiv.innerHTML = `Direct dispatch unavailable. <a href="${mailtoLink}" class="underline font-bold text-white hover:text-amber-200">Click here to open email client</a>.`;
    }
    showToast('Fallback email ready');
    window.location.href = mailtoLink;
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.textContent = 'Send Message to Athul S';
    if (window.lucide) lucide.createIcons();
  }
}

/* -------------------------------------------------------------
 * 9B. Interactive CLAHE Low-Light Filter Toggle
 * -----------------------------------------------------------*/
let isClaheActive = true;
function toggleClaheFilter() {
  isClaheActive = !isClaheActive;
  const feed = document.getElementById('clahe-feed-display');
  const badge = document.getElementById('clahe-status-badge');
  const btnText = document.getElementById('clahe-toggle-text');
  if (!feed || !badge) return;

  if (isClaheActive) {
    feed.style.filter = 'contrast(1.4) brightness(1.2) saturate(1.1)';
    badge.textContent = 'CLAHE: ACTIVE (Dynamic Equalization)';
    badge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold';
    if (btnText) btnText.textContent = 'Disable CLAHE (View Raw 12 Lux Feed)';
  } else {
    feed.style.filter = 'contrast(0.7) brightness(0.4) saturate(0.8)';
    badge.textContent = 'RAW LOW-LIGHT: OFF (12 Lux Dim Feed)';
    badge.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.08] text-slate-400 border border-white/[0.1]';
    if (btnText) btnText.textContent = 'Activate CLAHE Low-Light Enhancement';
  }
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
    repoUrl: 'https://github.com/athuls-engineer/chakraa-smart-bus-tracking-system',
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
  [React Native Mobile App (Leaflet Maps + ETA Router)]`,
    pinouts: [
      { signal: 'ESP32 UART2 Rx (GPIO 16)', pin: 'Neo-6M GPS Module Tx' },
      { signal: 'ESP32 UART2 Tx (GPIO 17)', pin: 'Neo-6M GPS Module Rx' },
      { signal: 'VCC / Regulated Logic', pin: '3.3V LDO Regulator (AMS1117)' },
      { signal: 'Cloud Sync Cadence', pin: '< 5 Seconds WebSocket Polling' }
    ]
  },

  edgevision: {
    title: 'VisionSentinel: Edge AI Surveillance & CLAHE Gateway',
    duration: '04/2025 – 08/2026',
    category: 'Edge AI &bull; Computer Vision &bull; IoT Telemetry',
    tags: ['Python 3.10+', 'OpenCV', 'CLAHE Algorithm', 'FastAPI', 'HOG + Linear SVM', 'Telegram Bot API'],
    repoUrl: 'https://github.com/athuls-engineer/edgevision-iot',
    description: 'A production-ready Edge AI surveillance monitor that transforms standard webcams and ESP32-CAM nodes into intelligent security monitors with real-time low-light enhancement and instant smartphone photo alerts.',
    highlights: [
      'Engineered real-time person and face detection pipeline using OpenCV HOG + Linear SVM and Haar cascades.',
      'Developed Adaptive CLAHE (Contrast Limited Adaptive Histogram Equalization) on Luminance channel for clear detection in dim lighting (<15 lux).',
      'Automated high-res watermarked JPEG evidence capture to secure local storage with dwell-time heuristics.',
      'Implemented real-time Telegram Bot API dispatcher delivering intrusion photo alerts straight to smartphones within 500ms.'
    ],
    architecture: `[ Physical Camera / ESP32-CAM ]
                     │
                     ▼
       [ OpenCV Video Ingestion Loop ]
                     │
                     ▼
  [ Low-Light CLAHE Histogram Equalization ]
                     │
                     ▼
  [ Real AI Detector (HOG Person + Haar Face + MOG2) ]
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
[ MJPEG Live Stream ]    [ Security Trigger Engine ]
(Web UI /video_feed)              │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
             [ Save Evidence ] [ Audible ] [ Telegram Bot ]
             (evidence/*.jpg)  (Siren/Beep) (Photo Alert)`,
    pinouts: [
      { signal: 'Video Input Source', pin: 'UVC Webcam / RTSP IP Stream / ESP32-CAM' },
      { signal: 'Low-Light Equalizer', pin: 'Adaptive CLAHE (clipLimit=2.0, tileGrid=8x8)' },
      { signal: 'Vision Inference Engine', pin: 'HOG Pedestrian SVM + Haar Cascades' },
      { signal: 'Telemetry Dispatch', pin: 'Telegram Bot API (<500ms latency)' }
    ]
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
     [Item Dispense Drivers]                      [BCD Converter & 7-Segment]`,
    pinouts: [
      { signal: '7-Segment Cathodes (CA..CG)', pin: 'Basys 3 Pins W7, W6, U8, V5, U5, V8, U7' },
      { signal: 'Display Anodes (AN0..AN3)', pin: 'Basys 3 Pins W4, V4, U4, U2' },
      { signal: 'Coin Input Buttons', pin: 'BTNC (Reset), BTNU (₹5 Coin), BTND (₹10 Coin)' },
      { signal: '100 MHz Master Oscillator', pin: 'Basys 3 Pin W5 (Prescaled to 1 kHz display refresh)' }
    ]
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
                                               [Peer Vehicle V2V Node]`,
    pinouts: [
      { signal: 'Dielectric Substrate', pin: 'Rogers RT/duroid 5880 (εr = 2.2)' },
      { signal: 'Dielectric Thickness (h)', pin: '1.575 mm' },
      { signal: 'Patch Radiator Geometry', pin: '2.50 cm × 2.50 cm Microstrip' },
      { signal: 'Resonance Center / Return Loss', pin: '5.80 GHz (S11 = -18.4 dB, VSWR < 1.3)' }
    ]
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
                                                   [16x2 LCD Screen Display]`,
    pinouts: [
      { signal: 'LM35 Analog Vout', pin: 'ATmega328 ADC0 (Pin 23 / PC0)' },
      { signal: 'HD44780 Register Select (RS)', pin: 'PORTD Pin 2 (PD2)' },
      { signal: 'HD44780 Enable Strobe (EN)', pin: 'PORTD Pin 3 (PD3)' },
      { signal: 'HD44780 Data 4-bit Bus', pin: 'PORTD Pin 4..7 (PD4..PD7)' },
      { signal: 'Sampling Trigger Interrupt', pin: 'Timer 1 CTC Mode (10s Periodic Flag)' }
    ]
  }
};

function openProjectModal(projectId) {
  const modal = document.getElementById('project-modal');
  const content = document.getElementById('modal-content');
  const data = projectDetails[projectId];

  if (!modal || !content || !data) return;

  content.innerHTML = `
    <div class="border-b border-white/[0.08] pb-4">
      <div class="flex items-center justify-between gap-2 mb-2">
        <span class="text-xs font-mono px-2.5 py-0.5 rounded bg-white/[0.06] text-white border border-white/[0.1] font-semibold">${data.category}</span>
        <span class="text-xs font-mono text-slate-400">${data.duration}</span>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
        <h3 class="text-2xl font-heading font-bold text-white">${data.title}</h3>
        ${data.repoUrl ? `
          <a href="${data.repoUrl}" target="_blank" rel="noopener noreferrer" class="self-start sm:self-auto px-3.5 py-1.5 rounded-lg text-xs font-mono text-black bg-white hover:bg-slate-200 font-semibold transition-all flex items-center gap-1.5 shrink-0 shadow-lg shadow-white/10">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/></svg>
            <span>View Source Code</span>
            <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
          </a>
        ` : ''}
      </div>
      <p class="text-xs sm:text-sm text-slate-300 mt-2 font-light leading-relaxed">${data.description}</p>
    </div>

    <div>
      <h4 class="text-xs font-mono font-bold text-white uppercase tracking-wider mb-2">Technical Highlights</h4>
      <ul class="space-y-2 text-xs sm:text-sm text-slate-300">
        ${data.highlights.map(h => `<li class="flex items-start gap-2"><span class="text-emerald-400 mt-0.5">&bull;</span><span>${h}</span></li>`).join('')}
      </ul>
    </div>

    ${data.pinouts ? `
    <div>
      <h4 class="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <i data-lucide="cpu" class="w-3.5 h-3.5"></i>
        <span>Hardware Pinout & Physical Signal Mapping</span>
      </h4>
      <div class="p-3.5 rounded-xl bg-black border border-white/[0.08] text-xs font-mono">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
          ${data.pinouts.map(p => `<div class="flex items-center justify-between p-2 rounded bg-base-950 border border-white/[0.04]"><span class="text-slate-400 font-medium">${p.signal}</span><span class="text-white font-bold">${p.pin}</span></div>`).join('')}
        </div>
      </div>
    </div>
    ` : ''}

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

    ${data.repoUrl ? `
    <div class="pt-3 border-t border-white/[0.08] flex items-center justify-between">
      <span class="text-xs font-mono text-slate-400">Official Open Source Repository</span>
      <a href="${data.repoUrl}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-white text-black hover:bg-slate-200 transition-all flex items-center gap-2">
        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/></svg>
        <span>Open on GitHub</span>
        <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
      </a>
    </div>
    ` : ''}
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
