/**
 * Athul S — Portfolio Logic & Architecture Showcase
 * Fast, lightweight, zero bloat, production-ready.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  initMobileDrawer();
  initArchitectureInspector();
  initProjectFilters();
  initKeyboardAccessibility();
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
 * 2. Architecture & Hardware Signal Flow Inspector
 * -----------------------------------------------------------*/
const architectureData = {
  chaakra: {
    title: 'Chaakra: Real-Time IoT GPS Bus Telematics',
    subtitle: 'ESP32 + u-blox Neo-6M GPS → Firebase Realtime DB → React Native',
    specs: [
      { label: 'Microcontroller', value: 'ESP32-WROOM-32 (Dual Core 240MHz)' },
      { label: 'GPS Sensor Interface', value: 'u-blox Neo-6M via Hardware UART2 (9600 Baud)' },
      { label: 'Telemetry Sync Cadence', value: '< 5 Seconds WebSocket Push' },
      { label: 'Cloud Protocol', value: 'HTTPS / Firebase REST & Dynamic Listeners' },
      { label: 'Mobile App Engine', value: 'React Native + Leaflet Mapping' }
    ],
    flow: [
      { step: '01. Ingestion', desc: 'Neo-6M GPS acquires NMEA $GPGGA/$GPRMC sentences' },
      { step: '02. Parsing & Filter', desc: 'ESP32 firmware parses coordinates, speed & heading' },
      { step: '03. Cloud Dispatch', desc: 'Secure JSON payload posted to Firebase Realtime DB' },
      { step: '04. Mobile Sync', desc: 'React Native client renders live bus location & ETA' }
    ],
    codeSnippet: `// ESP32 UART2 GPS Ingestion Loop
HardwareSerial gpsSerial(2); // GPIO16(RX), GPIO17(TX)
TinyGPSPlus gps;

void syncTelemetryTask(void *pvParameters) {
  while (true) {
    while (gpsSerial.available() > 0) {
      if (gps.encode(gpsSerial.read()) && gps.location.isValid()) {
        pushToFirebase(gps.location.lat(), gps.location.lng(), gps.speed.kmph());
      }
    }
    vTaskDelay(pdMS_TO_TICKS(4000)); // 4-second refresh cycle
  }
}`
  },

  fpga: {
    title: 'Basys 3 FPGA Vending Machine Controller',
    subtitle: '6-Module Verilog RTL Architecture on Xilinx Artix-7 (XC7A35T)',
    specs: [
      { label: 'Target FPGA Board', value: 'Digilent Basys 3 (Xilinx Artix-7)' },
      { label: 'Master Clock Input', value: '100 MHz Oscillator (Pin W5)' },
      { label: 'Internal Clock Prescaler', value: '100 MHz → 1 kHz Display Refresh' },
      { label: 'State Machine Model', value: 'Moore/Mealy FSM (IDLE, ACCUM, DISPENSE, REFUND)' },
      { label: 'I/O Peripherals', value: '3 Buttons (Debounced), 4 Anodes, 7 Cathodes' }
    ],
    flow: [
      { step: '01. Debounce Unit', desc: 'Clean mechanical push button jitter (20ms shift reg)' },
      { step: '02. FSM Controller', desc: 'Transitions credit balance across ₹5 / ₹10 increments' },
      { step: '03. BCD Conversion', desc: 'Converts binary balance to 2-digit binary coded decimal' },
      { step: '04. 7-Seg Multiplexer', desc: 'Cycles display anodes at 1 kHz for persistence of vision' }
    ],
    codeSnippet: `// Verilog FSM State Transition Core
always @(posedge clk or posedge rst) begin
  if (rst) state <= S_IDLE;
  else case (state)
    S_IDLE:   if (coin_5 || coin_10) state <= S_ACCUM;
    S_ACCUM:  if (balance >= ITEM_PRICE) state <= S_DISPENSE;
    S_DISPENSE: begin
      dispense_out <= 1'b1;
      state <= (balance > ITEM_PRICE) ? S_REFUND : S_IDLE;
    end
    S_REFUND:   state <= S_IDLE;
  endcase
end`
  },

  antenna: {
    title: '5.8 GHz Automotive V2V Patch Antenna',
    subtitle: 'Microstrip Electromagnetics Simulation in Ansys HFSS',
    specs: [
      { label: 'Operational Frequency', value: '5.80 GHz (DSRC Automotive Band)' },
      { label: 'Form Factor Dimensions', value: '25.0 mm × 25.0 mm Microstrip' },
      { label: 'Substrate Material', value: 'Rogers RT/duroid 5880 (εr = 2.2, h = 1.575mm)' },
      { label: 'Return Loss (S11)', value: '-18.4 dB @ 5.80 GHz Center Resonance' },
      { label: 'Simulated Efficiency', value: '> 85% Radiation Efficiency (VSWR < 1.3:1)' }
    ],
    flow: [
      { step: '01. Substrate Selection', desc: 'Low loss tangent (tan δ = 0.0009) for 5.8GHz RF' },
      { step: '02. Analytical Sizing', desc: 'Calculated patch width & length with fringing field offset' },
      { step: '03. Feed Impedance', desc: '50-Ohm inset microstrip feed line for impedance match' },
      { step: '04. HFSS 3D Solver', desc: 'Finite Element Method simulation of S11, Gain & VSWR' }
    ],
    codeSnippet: `// Key Physical RF Parameters (5.8 GHz Resonance)
Target Frequency:    f0 = 5.80 GHz
Substrate Permittivity:  eps_r = 2.20
Effective Permittivity: eps_eff = 2.11
Patch Width (W):     25.0 mm
Patch Length (L):    25.0 mm
Substrate Height (h): 1.575 mm
Measured Return Loss: S11 = -18.4 dB (Target < -10 dB met)
VSWR:                1.28:1`
  },

  logger: {
    title: 'ATmega328 Ambient Temperature DAQ',
    subtitle: 'Bare-Metal Embedded C Acquisition with HD44780 16×2 LCD',
    specs: [
      { label: 'Microcontroller', value: 'Microchip ATmega328P (16MHz External Crystal)' },
      { label: 'Transducer Sensor', value: 'Texas Instruments LM35 (10 mV / °C)' },
      { label: 'Sampling Timing Engine', value: 'Timer1 CTC Mode (10-Second Interrupt Trigger)' },
      { label: 'ADC Accuracy', value: '10-Bit Successive Approximation (±0.5°C)' },
      { label: 'Display Bus Interface', value: 'HD44780 LCD in 4-bit Nibble Mode' }
    ],
    flow: [
      { step: '01. Periodic Timer1', desc: '16-bit Timer1 fires ISR(TIMER1_COMPA_vect) every 10s' },
      { step: '02. ADC Conversion', desc: 'ADC0 reads analog mV, averaging 8 consecutive samples' },
      { step: '03. Scale Conversion', desc: 'Converts ADC integer to calibrated Celsius floating point' },
      { step: '04. LCD Strobe', desc: 'Sends formatted character array to HD44780 over 4-bit bus' }
    ],
    codeSnippet: `// Bare-Metal Timer1 CTC Sampling Interrupt (10-second cadence)
ISR(TIMER1_COMPA_vect) {
  uint16_t raw_adc = adc_read_averaged(0, 8);
  float temp_celsius = (raw_adc * 5.0 / 1024.0) * 100.0;
  
  char lcd_buffer[16];
  snprintf(lcd_buffer, sizeof(lcd_buffer), "TEMP: %.1f C", temp_celsius);
  lcd_set_cursor(0, 0);
  lcd_print_string(lcd_buffer);
}`
  }
};

let activeArchitectureKey = 'chaakra';

function initArchitectureInspector() {
  const tabButtons = document.querySelectorAll('.arch-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      setArchitectureView(view);
    });
  });

  setArchitectureView('chaakra');
}

function setArchitectureView(key) {
  const data = architectureData[key];
  if (!data) return;

  activeArchitectureKey = key;

  // Update tabs
  document.querySelectorAll('.arch-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-view') === key) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update title & subtitle
  const titleEl = document.getElementById('arch-title');
  const subEl = document.getElementById('arch-subtitle');
  if (titleEl) titleEl.textContent = data.title;
  if (subEl) subEl.textContent = data.subtitle;

  // Update specs grid
  const specsContainer = document.getElementById('arch-specs-list');
  if (specsContainer) {
    specsContainer.innerHTML = data.specs.map(s => `
      <div class="flex items-center justify-between p-2.5 rounded-lg bg-base-950/80 border border-white/[0.05] text-xs font-mono">
        <span class="text-slate-400">${s.label}</span>
        <span class="text-white font-medium">${s.value}</span>
      </div>
    `).join('');
  }

  // Update architecture flow steps
  const flowContainer = document.getElementById('arch-flow-steps');
  if (flowContainer) {
    flowContainer.innerHTML = data.flow.map(f => `
      <div class="diagram-node">
        <div class="text-[11px] font-bold text-signal-blue mb-1">${f.step}</div>
        <div class="text-xs text-slate-300 leading-snug">${f.desc}</div>
      </div>
    `).join('');
  }

  // Update code preview
  const codeEl = document.getElementById('arch-code-snippet');
  if (codeEl) {
    codeEl.textContent = data.codeSnippet;
  }
}

/* -------------------------------------------------------------
 * 3. Project Filter System
 * -----------------------------------------------------------*/
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter || card.classList.contains(filter)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* -------------------------------------------------------------
 * 4. Project Modal Data & Handler
 * -----------------------------------------------------------*/
const projectDetails = {
  chaakra: {
    title: 'Chaakra: Real-Time IoT GPS Bus Tracking & Booking',
    duration: '10/2025 – 05/2026',
    category: 'Embedded IoT &bull; Mobile Architecture &bull; Telemetry',
    tags: ['ESP32', 'u-blox Neo-6M GPS', 'React Native', 'Firebase Realtime DB', 'Leaflet Maps', 'UART2'],
    repoUrl: 'https://github.com/athuls-engineer/chakraa-smart-bus-tracking-system',
    description: 'An end-to-end smart transit solution connecting hardware microcontroller telematics with high-concurrency cloud synchronization and interactive cross-platform mapping.',
    highlights: [
      'Engineered onboard microcontroller telemetry nodes using ESP32 paired with u-blox GPS modules over hardware UART2.',
      'Achieved live tracking refresh intervals under 5 seconds across multiple concurrent buses.',
      'Integrated Leaflet maps for live route geometry, dynamic ETA estimation, and seat booking on React Native.',
      'Optimized backend state synchronization with dynamic Firebase listeners to reduce network data overhead.'
    ],
    architecture: `[ESP32 + GPS Module on Bus]
          │ (Wi-Fi / Cellular Data Packet via UART2)
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

  fpga: {
    title: 'FPGA Candy Vending Machine Controller (Basys 3)',
    duration: '02/2025 – 03/2025',
    category: 'Digital VLSI Design &bull; Verilog HDL',
    tags: ['Verilog HDL', 'Xilinx Basys 3 (Artix-7)', 'FSM Controller', 'Switch Debounce', 'BCD Converter', '7-Segment Multiplexer'],
    description: 'A modular, high-reliability digital hardware state machine engineered in Verilog HDL to orchestrate asynchronous coin inputs, credit accumulation, product validation, and multi-digit 7-segment display output.',
    highlights: [
      'Constructed 6 modular Verilog HDL blocks: FSM controller, switch debounce filter, BCD converter, clock divider, and 7-segment display driver.',
      'Simulated and verified vending logic with 3 coin inputs (₹5, ₹10) and 4 item outputs, achieving real-time response <1s.',
      'Implemented full XDC pin constraint mapping targeting the Xilinx Artix-7 XC7A35T FPGA chip.'
    ],
    architecture: `[Coin Push Buttons] ──> [Debounce Filter Module (20ms)]
                                      │
                                      ▼
                             [FSM Control Core] <──> [Clock Prescaler (100MHz -> 1kHz)]
                                      │
                ┌─────────────────────┴─────────────────────┐
                ▼                                           ▼
      [Item Dispense Drivers]                    [BCD Converter & 7-Segment Mux]`,
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
    description: 'An ultra-compact 2.5 × 2.5 cm microstrip patch antenna designed for next-generation Vehicle-to-Vehicle (V2V) cooperative collision avoidance and DSRC band communications.',
    highlights: [
      'Designed a 2.5 × 2.5 cm antenna prototype operating at 5.8 GHz for dedicated short-range communications (DSRC).',
      'Achieved >85% radiation efficiency and <10 ms latency in dense vehicular simulation environments.',
      'Simulated antenna performance parameters including return loss (S11 = -18.4 dB), gain, and radiation pattern using Ansys HFSS.'
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
    category: 'Embedded Systems &bull; Bare-Metal Firmware',
    tags: ['ATmega328 AVR', 'LM35 Sensor', 'Embedded C', 'HD44780 LCD', 'Timer1 CTC', 'ADC Prescaling'],
    description: 'A standalone embedded data acquisition unit engineered for continuous, high-accuracy ambient temperature recording, signal conditioning, and local LCD display.',
    highlights: [
      'Logged temperature every 10 seconds with ±0.5°C accuracy over 24-hour cycles using LM35 + ATmega328.',
      'Achieved 100% data integrity with continuous LCD telemetry updates over a 4-bit HD44780 parallel bus.',
      'Developed bare-metal embedded C firmware utilizing Timer1 CTC mode interrupts for power-efficient periodic ADC conversions.'
    ],
    architecture: `[LM35 Temp Transducer] ── (Analog mV Signal) ──> [ATmega328 ADC0 (10-Bit)]
                                                              │
                                                 (Timer1 CTC Interrupts every 10s)
                                                              ▼
                                                   [HD44780 16x2 LCD Display]`,
    pinouts: [
      { signal: 'LM35 Analog Vout', pin: 'ATmega328 ADC0 (Pin 23 / PC0)' },
      { signal: 'HD44780 Register Select (RS)', pin: 'PORTD Pin 2 (PD2)' },
      { signal: 'HD44780 Enable Strobe (EN)', pin: 'PORTD Pin 3 (PD3)' },
      { signal: 'HD44780 Data 4-bit Bus', pin: 'PORTD Pin 4..7 (PD4..PD7)' },
      { signal: 'Sampling Trigger Interrupt', pin: 'Timer 1 CTC Mode (10s Periodic Flag)' }
    ]
  },

  edgevision: {
    title: 'VisionSentinel: Edge AI Surveillance & Low-Light CLAHE',
    duration: '04/2025 – 08/2026',
    category: 'Edge AI &bull; Computer Vision &bull; Security Telemetry',
    tags: ['Python 3.10+', 'OpenCV', 'CLAHE Algorithm', 'FastAPI', 'HOG + Linear SVM', 'Telegram Bot API'],
    repoUrl: 'https://github.com/athuls-engineer/edgevision-iot',
    description: 'A production-grade Edge AI surveillance gateway converting standard webcams and ESP32-CAM nodes into intelligent security monitors with real-time low-light contrast equalization and instant smartphone photo alerts.',
    highlights: [
      'Engineered real-time person detection pipeline using OpenCV HOG + Linear SVM and Haar cascades.',
      'Integrated Adaptive CLAHE (Contrast Limited Adaptive Histogram Equalization) on Luminance channel for robust detection in dim lighting (<15 lux).',
      'Automated high-res JPEG evidence capture to local storage with configurable dwell-time heuristics.',
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
  [ Vision Inference (HOG Pedestrian + Haar Cascades) ]
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
[ MJPEG Live Stream ]    [ Security Trigger Engine ]
(Web UI /video_feed)              │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
             [ Save Evidence ] [ Alert Tone ] [ Telegram Bot (<500ms) ]`,
    pinouts: [
      { signal: 'Video Input Source', pin: 'UVC Webcam / RTSP IP Stream / ESP32-CAM' },
      { signal: 'Low-Light Equalizer', pin: 'Adaptive CLAHE (clipLimit=2.0, tileGrid=8x8)' },
      { signal: 'Vision Inference Engine', pin: 'HOG Pedestrian SVM + Haar Cascades' },
      { signal: 'Telemetry Dispatch', pin: 'Telegram Bot API (<500ms latency)' }
    ]
  },

  fsd: {
    title: 'Tesla FSD Fleet Telemetry & Safety Benchmark',
    duration: '2026',
    category: 'Full-Stack Web &bull; Telemetry Analytics',
    tags: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Canvas Graphics', 'OpenGraph'],
    repoUrl: 'https://github.com/athuls-engineer/tesla-fsd-tracker',
    liveUrl: 'fsd/',
    description: 'A live interactive dashboard tracking cumulative Tesla Full Self-Driving (Supervised) fleet miles across 2M+ vehicles in 12 countries, highlighting milestone progression and 7.4x safety benchmarks.',
    highlights: [
      'Engineered client-side real-time telemetry model calculating fleet mileage accumulation.',
      'Built interactive 3D perception visualizer and statistical milestone growth curves.',
      'Deployed as an accessible, standalone PWA sub-app on GitHub Pages at /fsd.'
    ],
    architecture: `[Fleet Milestone Baseline] ──> [Real-Time Poisson & Linear Model]
                                          │
                                          ▼
                               [React + Tailwind UI View]
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
           [Live Odometer Counter]               [Canvas Perception Visualizer]`,
    pinouts: [
      { signal: 'Deployment Subpath', pin: 'athuls-engineer.github.io/fsd/' },
      { signal: 'State Management', pin: 'React 18 Hooks + LocalStorage Cache' },
      { signal: 'Rendering Engine', pin: 'HTML5 Canvas + SVG Graphs' }
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
        <h3 class="text-xl sm:text-2xl font-heading font-bold text-white">${data.title}</h3>
        <div class="flex items-center gap-2 shrink-0">
          ${data.liveUrl ? `
            <a href="${data.liveUrl}" class="px-3.5 py-1.5 rounded-lg text-xs font-mono text-black bg-white hover:bg-slate-200 font-semibold transition-all flex items-center gap-1.5 shadow">
              <span>Live App</span>
              <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
            </a>
          ` : ''}
          ${data.repoUrl ? `
            <a href="${data.repoUrl}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-1.5 rounded-lg text-xs font-mono text-slate-200 bg-base-800 hover:bg-white hover:text-black border border-white/[0.1] transition-all flex items-center gap-1.5">
              <i data-lucide="github" class="w-3.5 h-3.5"></i>
              <span>GitHub</span>
            </a>
          ` : ''}
        </div>
      </div>
      <p class="text-xs sm:text-sm text-slate-300 mt-2 font-light leading-relaxed">${data.description}</p>
    </div>

    <div>
      <h4 class="text-xs font-mono font-bold text-white uppercase tracking-wider mb-2">Technical Highlights & Implementation</h4>
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
      <div class="p-3.5 rounded-xl bg-base-950 border border-white/[0.08] text-xs font-mono">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
          ${data.pinouts.map(p => `
            <div class="flex items-center justify-between p-2 rounded bg-base-900 border border-white/[0.04]">
              <span class="text-slate-400 font-medium">${p.signal}</span>
              <span class="text-white font-bold">${p.pin}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    ` : ''}

    <div>
      <h4 class="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">System Architecture Flow</h4>
      <pre class="p-3.5 rounded-xl bg-base-950 border border-white/[0.08] text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">${data.architecture}</pre>
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

/* -------------------------------------------------------------
 * 5. Resume Modal
 * -----------------------------------------------------------*/
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

/* -------------------------------------------------------------
 * 6. Modal Dismiss Listeners & Keyboard Accessibility
 * -----------------------------------------------------------*/
function initKeyboardAccessibility() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProjectModal();
      closeResumeModal();
    }
  });

  window.addEventListener('click', (e) => {
    const projectModal = document.getElementById('project-modal');
    const resumeModal = document.getElementById('resume-modal');
    if (e.target === projectModal) closeProjectModal();
    if (e.target === resumeModal) closeResumeModal();
  });
}

/* -------------------------------------------------------------
 * 7. Clipboard Copy Helper
 * -----------------------------------------------------------*/
function copyToClipboard(text, message = 'Copied to clipboard!') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(message);
    }).catch(() => {
      fallbackCopy(text, message);
    });
  } else {
    fallbackCopy(text, message);
  }
}

function fallbackCopy(text, message) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(message);
  } catch (err) {
    showToast('Failed to copy');
  }
  document.body.removeChild(textArea);
}

let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove('opacity-0', '-translate-y-20');
  toast.classList.add('opacity-100', 'translate-y-0');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', '-translate-y-20');
  }, 2600);
}

/* -------------------------------------------------------------
 * 8. Contact Form Handler (Web3Forms + Mailto Fallback)
 * -----------------------------------------------------------*/
async function handleContactSubmit(event) {
  event.preventDefault();
  const btn = document.getElementById('contact-submit-btn');
  const btnText = document.getElementById('contact-btn-text');
  const statusDiv = document.getElementById('contact-status');

  const name = document.getElementById('sender-name')?.value.trim() || '';
  const email = document.getElementById('sender-email')?.value.trim() || '';
  const subject = document.getElementById('msg-subject')?.value.trim() || '';
  const body = document.getElementById('msg-body')?.value.trim() || '';

  if (!name || !email || !body) return;

  if (btn) btn.disabled = true;
  if (btnText) btnText.textContent = 'Sending message...';

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
        subject: `[Portfolio Inquiry] ${subject}`,
        message: body,
        to: 'athuls2580@gmail.com'
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      if (statusDiv) {
        statusDiv.className = 'text-xs font-mono text-center p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 block';
        statusDiv.innerHTML = 'Message delivered successfully! I will get back to you shortly.';
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
      statusDiv.innerHTML = `Email dispatch service unavailable. <a href="${mailtoLink}" class="underline font-bold text-white hover:text-amber-200">Click here to send via your email client</a>.`;
    }
    showToast('Opening email client...');
    window.location.href = mailtoLink;
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.textContent = 'Send Message';
    if (window.lucide) lucide.createIcons();
  }
}

/* -------------------------------------------------------------
 * 9. ScrollSpy for Navigation Active Indicator
 * -----------------------------------------------------------*/
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) {
        link.classList.add('text-white', 'bg-white/[0.08]');
        link.classList.remove('text-slate-400');
      } else {
        link.classList.remove('text-white', 'bg-white/[0.08]');
        link.classList.add('text-slate-400');
      }
    });
  });
}
