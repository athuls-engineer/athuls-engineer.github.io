// Athul S — Precision Hardware Logic & Laboratory Oscilloscope Engines

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  // Mobile Drawer Toggle
  initMobileDrawer();

  // Oscilloscope Simulator (Laboratory Phosphor Trace)
  initOscilloscope();

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
 * 2. Oscilloscope Engine (Laboratory Phosphor Display)
 * -----------------------------------------------------------*/
let scopeMode = 'rf';
let scopePhase = 0;
let scopeSpeed = 1.0;
let scopeAmp = 1.0;

function initOscilloscope() {
  const canvas = document.getElementById('oscilloscope-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Knobs
  const speedSlider = document.getElementById('scope-speed-slider');
  const speedLabel = document.getElementById('scope-speed-label');
  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      scopeSpeed = parseFloat(e.target.value);
      if (speedLabel) speedLabel.textContent = `${scopeSpeed.toFixed(1)}x`;
    });
  }

  const ampSlider = document.getElementById('scope-amp-slider');
  const ampLabel = document.getElementById('scope-amp-label');
  if (ampSlider) {
    ampSlider.addEventListener('input', (e) => {
      scopeAmp = parseFloat(e.target.value);
      if (ampLabel) ampLabel.textContent = `${scopeAmp.toFixed(1)}x`;
    });
  }

  function render() {
    const w = canvas.width;
    const h = canvas.height;
    const centerY = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Phosphor glow styling
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#34D399';  // Classic Lab Phosphor Green
    ctx.shadowColor = 'rgba(52, 211, 153, 0.6)';

    ctx.beginPath();

    const points = 160;
    const step = w / points;

    for (let i = 0; i <= points; i++) {
      const x = i * step;
      let y = centerY;
      const normalizedX = (i / points) * Math.PI * 8;

      if (scopeMode === 'rf') {
        // High frequency RF Carrier with AM modulation envelope
        const carrier = Math.sin(normalizedX * 3.5 + scopePhase);
        const envelope = 0.5 + 0.5 * Math.sin(normalizedX * 0.5 + scopePhase * 0.3);
        y = centerY + carrier * envelope * (h * 0.32) * scopeAmp;
      } else if (scopeMode === 'scada') {
        // Digital square pulse train (Modbus telemetry)
        const sq = Math.sin(normalizedX * 1.5 + scopePhase);
        const val = sq > 0.1 ? 1 : (sq < -0.1 ? -1 : 0);
        y = centerY + val * (h * 0.3) * scopeAmp;
      } else if (scopeMode === 'gps') {
        // UART Serial data pulses (GPS NMEA sentence)
        const pulse = Math.sin(normalizedX * 2 + scopePhase) + Math.cos(normalizedX * 4 + scopePhase * 1.5);
        y = centerY + (pulse > 0.5 ? 1 : (pulse < -0.5 ? -1 : 0)) * (h * 0.28) * scopeAmp;
      } else {
        // Analog DAQ reading with thermal jitter (LM35)
        const analog = Math.sin(normalizedX * 0.8 + scopePhase * 0.5) * 0.6;
        const jitter = (Math.random() - 0.5) * 0.08;
        y = centerY + (analog + jitter) * (h * 0.3) * scopeAmp;
      }

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();

    scopePhase += 0.08 * scopeSpeed;
    requestAnimationFrame(render);
  }

  render();
}

function setScopeMode(mode) {
  scopeMode = mode;
  document.querySelectorAll('.scope-mode-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
  });

  const statusEl = document.getElementById('scope-status');
  const freqEl = document.getElementById('scope-freq-val');

  if (mode === 'rf') {
    if (statusEl) statusEl.textContent = '5.8 GHz RF WAVEFORM';
    if (freqEl) freqEl.textContent = '5.80 GHz';
  } else if (mode === 'scada') {
    if (statusEl) statusEl.textContent = 'SCADA MODBUS IEC-60870';
    if (freqEl) freqEl.textContent = '19.2 kbaud';
  } else if (mode === 'gps') {
    if (statusEl) statusEl.textContent = 'NMEA-0183 GPS STREAM';
    if (freqEl) freqEl.textContent = '9600 bps';
  } else {
    if (statusEl) statusEl.textContent = 'LM35 ANALOG ADC DAQ';
    if (freqEl) freqEl.textContent = '100 Hz';
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
