/**
 * Athul S  -  Portfolio Logic, Modal Handlers & Dual-Theme System
 * Zero bloat, production-ready, accessible.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeSystem();

  if (window.lucide) {
    lucide.createIcons();
  }

  initMobileDrawer();
  initProjectFilters();
  initKeyboardAccessibility();
  initScrollSpy();
});

/* -------------------------------------------------------------
 * 1. Dual-Theme System (Light & Dark Mode)
 * -----------------------------------------------------------*/
window.toggleTheme = function() {
  const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
};

function initThemeSystem() {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.toggleTheme();
    });
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  }

  localStorage.setItem('theme', theme);
  updateThemeTooltips(theme);
}

function updateThemeTooltips(theme) {
  const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
  toggleButtons.forEach(btn => {
    if (btn.classList.contains('has-tooltip')) {
      btn.setAttribute('data-tooltip', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }
  });
}

/* -------------------------------------------------------------
 * 2. Mobile Drawer Navigation
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
 * 4. Project Detail Modal Data & Handler
 * -----------------------------------------------------------*/
const projectDetails = {
  chaakra: {
    title: 'Chaakra: Real-Time IoT GPS Bus Tracking Platform',
    duration: '10/2025  -  05/2026',
    category: 'Embedded IoT &bull; Microcontroller Firmware',
    tags: ['ESP32-WROOM-32', 'u-blox Neo-6M GPS', 'React Native', 'Firebase Realtime DB', 'Leaflet Maps', 'UART2'],
    repoUrl: 'https://github.com/athuls-engineer/chakraa-smart-bus-tracking-system',
    description: 'An end-to-end connected vehicle tracking and seat booking solution connecting physical microcontroller hardware to real-time cloud databases and cross-platform mobile mapping.',
    highlights: [
      'Engineered onboard microcontroller firmware using ESP32 paired with u-blox GPS modules over hardware UART2.',
      'Achieved live tracking refresh intervals under 5 seconds across multiple concurrent vehicles.',
      'Integrated Leaflet maps for live route geometry, dynamic ETA estimation, and seat booking on React Native.',
      'Optimized backend state synchronization with dynamic Firebase listeners to reduce cellular network payload.'
    ],
    architecture: `[ESP32 + u-blox GPS Module on Bus]
          | (NMEA Sentence Ingestion via UART2 @ 9600 Baud)
          v
  [Firebase Realtime Database]
          | (Dynamic WebSocket Listeners <5s)
          v
  [React Native Mobile App (Leaflet Maps + Live Route Routing)]`,
    pinouts: [
      { signal: 'ESP32 UART2 Rx (GPIO 16)', pin: 'Neo-6M GPS Module Tx' },
      { signal: 'ESP32 UART2 Tx (GPIO 17)', pin: 'Neo-6M GPS Module Rx' },
      { signal: 'VCC / Regulated Logic', pin: '3.3V LDO Regulator (AMS1117)' },
      { signal: 'Cloud Sync Cadence', pin: '< 5 Seconds WebSocket Polling' }
    ]
  },

  fpga: {
    title: 'Basys 3 FPGA Candy Vending Machine Controller',
    duration: '02/2025  -  03/2025',
    category: 'Digital VLSI Design &bull; Verilog HDL',
    tags: ['Verilog HDL', 'Xilinx Basys 3 (Artix-7)', 'FSM Controller', 'Switch Debounce', 'BCD Converter', '7-Segment Multiplexer'],
    description: 'A modular digital hardware state machine engineered in Verilog HDL to orchestrate asynchronous coin inputs, credit accumulation, product validation, and multiplexed 7-segment display output.',
    highlights: [
      'Constructed 6 modular Verilog HDL blocks: FSM controller, switch debounce filter, BCD converter, clock divider, and 7-segment display driver.',
      'Simulated and verified vending logic with 3 coin inputs (INR 5, INR 10) and 4 item outputs, achieving real-time response <1s.',
      'Mapped complete physical pin constraints (XDC) targeting the Xilinx Artix-7 XC7A35T FPGA chip.'
    ],
    architecture: `[Coin Push Buttons] --> [Debounce Filter Module (20ms shift reg)]
                                      |
                                      v
                             [FSM Control Core] <--> [Clock Prescaler (100MHz -> 1kHz)]
                                      |
                +---------------------+---------------------+
                v                                           v
      [Item Dispense Drivers]                    [BCD Converter & 7-Segment Mux]`,
    pinouts: [
      { signal: '7-Segment Cathodes (CA..CG)', pin: 'Basys 3 Pins W7, W6, U8, V5, U5, V8, U7' },
      { signal: 'Display Anodes (AN0..AN3)', pin: 'Basys 3 Pins W4, V4, U4, U2' },
      { signal: 'Coin Input Buttons', pin: 'BTNC (Reset), BTNU (INR 5 Coin), BTND (INR 10 Coin)' },
      { signal: '100 MHz Master Oscillator', pin: 'Basys 3 Pin W5 (Prescaled to 1 kHz display refresh)' }
    ]
  },

  antenna: {
    title: '5.8 GHz Automotive V2V Microstrip Patch Antenna',
    duration: '11/2024  -  01/2025',
    category: 'RF Engineering &bull; High-Frequency Electromagnetics',
    tags: ['Ansys HFSS', '5.8 GHz DSRC Band', 'Microstrip Patch', 'Return Loss (S11)', 'Radiation Efficiency', 'V2V Telematics'],
    description: 'An ultra-compact 2.5 × 2.5 cm microstrip patch antenna designed for next-generation Vehicle-to-Vehicle (V2V) dedicated short-range communications (DSRC).',
    highlights: [
      'Designed a 2.5 × 2.5 cm antenna prototype operating at 5.8 GHz for dedicated short-range vehicular communication.',
      'Achieved >85% radiation efficiency and <10 ms simulated latency in vehicular propagation environments.',
      'Simulated antenna performance parameters including return loss (S11 = -18.4 dB), gain, and radiation pattern using Ansys HFSS.'
    ],
    architecture: `[Vehicle Transceiver] -- (50Ω Microstrip Inset Feed) --> [2.5 x 2.5 cm Patch @ 5.8 GHz]
                                                                      |
                                                      (>85% Efficiency, S11 = -18.4 dB)
                                                                      v
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
    duration: '12/2024  -  12/2024',
    category: 'Embedded Systems &bull; Bare-Metal Firmware',
    tags: ['ATmega328 AVR', 'LM35 Sensor', 'Embedded C', 'HD44780 LCD', 'Timer1 CTC', 'ADC Prescaling'],
    description: 'A standalone embedded data acquisition unit engineered for continuous, high-accuracy ambient temperature recording, signal conditioning, and local LCD display.',
    highlights: [
      'Logged temperature every 10 seconds with ±0.5°C accuracy over continuous 24-hour validation cycles using LM35 + ATmega328.',
      'Achieved 100% data integrity with continuous LCD telemetry updates over a 4-bit HD44780 parallel bus.',
      'Developed bare-metal embedded C firmware utilizing Timer1 CTC mode interrupts for periodic ADC conversions.'
    ],
    architecture: `[LM35 Temp Transducer] -- (Analog mV Signal) --> [ATmega328 ADC0 (10-Bit)]
                                                              |
                                                 (Timer1 CTC Interrupts every 10s)
                                                              v
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
    title: 'EdgeVision: Edge AI Surveillance & Low-Light Enhancement',
    duration: '04/2025  -  08/2026',
    category: 'Edge AI &bull; Computer Vision &bull; Security',
    tags: ['Python 3.10+', 'OpenCV', 'CLAHE Algorithm', 'FastAPI', 'HOG + Linear SVM', 'Telegram Bot API'],
    repoUrl: 'https://github.com/athuls-engineer/edgevision-iot',
    description: 'An Edge AI surveillance monitor designed for low-light environments with adaptive contrast limited histogram equalization (CLAHE) on luminance channels, real-time pedestrian detection, and Telegram alert dispatch.',
    highlights: [
      'Engineered real-time person detection pipeline using OpenCV HOG + Linear SVM and Haar cascade verification.',
      'Integrated Adaptive CLAHE on Luminance channel for clear detection in dim lighting (<15 lux).',
      'Automated JPEG evidence capture to local storage with configurable dwell-time heuristics.',
      'Implemented real-time Telegram Bot API dispatcher delivering intrusion photo alerts straight to smartphones within 500ms.'
    ],
    architecture: `[ Camera Source / ESP32-CAM ]
                 |
                 v
    [ Low-Light CLAHE Equalization ]
                 |
                 v
    [ HOG Pedestrian + Haar Face SVM ]
                 |
    +------------+------------+
    v                         v
[ MJPEG Live Stream ]    [ Security Engine -> Telegram Bot (<500ms) ]`,
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
    category: 'Web Application &bull; Real-Time Telemetry',
    tags: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Canvas Graphics', 'PWA'],
    repoUrl: 'https://github.com/athuls-engineer/tesla-fsd-tracker',
    liveUrl: 'fsd/',
    description: 'An interactive web dashboard tracking cumulative Tesla Full Self-Driving (Supervised) fleet miles across 2M+ vehicles in 12 countries, highlighting milestone progression and 7.4x safety benchmarks.',
    highlights: [
      'Engineered client-side real-time telemetry model calculating fleet mileage accumulation.',
      'Built interactive 3D perception visualizer and statistical milestone growth curves.',
      'Deployed as an accessible, standalone PWA sub-app on GitHub Pages at /fsd.'
    ],
    architecture: `[Fleet Milestone Baseline] --> [Real-Time Poisson & Linear Model]
                                          |
                                          v
                               [React + Tailwind UI View]
                                          |
                     +--------------------+--------------------+
                     v                                         v
           [Live Odometer Counter]               [Canvas Perception Visualizer]`,
    pinouts: [
      { signal: 'Deployment Subpath', pin: 'athuls-engineer.github.io/fsd/' },
      { signal: 'State Management', pin: 'React 18 Hooks + LocalStorage Cache' },
      { signal: 'Rendering Engine', pin: 'HTML5 Canvas + SVG Graphs' }
    ]
  },
  aegisguard: {
    title: 'AegisGuard: Rootless Local Android DNS Sinkhole',
    duration: 'Open Source',
    category: 'Android Engineering &bull; Systems Security',
    tags: ['Java', 'Android SDK', 'VpnService API', 'DNS RFC 1035', 'Blocklist Parser', 'Multi-Threading'],
    repoUrl: 'https://github.com/athuls-engineer/aegisguard-android',
    description: 'High-performance Android network privacy tool leveraging Android\'s local VpnService to capture and inspect DNS requests on UDP port 53. Completely local on-device operation with zero remote server forwarding and zero battery overhead.',
    highlights: [
      'Implemented custom RFC 1035 packet parser in pure Java to inspect DNS header flags and domain labels.',
      'Employs optimized in-memory Trie/HashSet matching against 100,000+ domain telemetry rules in <2ms.',
      'Zero-root requirement; encapsulates local TUN interface socket to cleanly drop tracking endpoints.',
      'Runs as an uninterrupted foreground service with adaptive wake-lock management.'
    ],
    architecture: `[Android Applications] --> [UDP Port 53 DNS Queries]
                                      |
                                      v
                           [Android TUN Interface]
                                      |
                                      v
                          [AegisGuard VpnService]
                                      |
                     +----------------+----------------+
                     | (Blocklist Match)               | (Clean Request)
                     v                                 v
          [Local 0.0.0.0 Sinkhole]          [Forward to Upstream DNS (1.1.1.1)]`,
    pinouts: [
      { signal: 'Kernel Interface', pin: 'Android VpnService Builder (TUN fd)' },
      { signal: 'Query Parser', pin: 'RFC 1035 UDP Header Byte Inspector' },
      { signal: 'Memory Footprint', pin: '< 18 MB Resident RAM via Compressed Trie' },
      { signal: 'Lookup Latency', pin: '< 1.8 ms Average In-Memory Decision Time' }
    ]
  },
  samm: {
    title: 'SAMM: High-Performance Desktop Mod Manager',
    duration: 'Open Source',
    category: 'Desktop Systems &bull; Rust Systems Architecture',
    tags: ['Rust', 'Tauri v2', 'React', 'TypeScript', 'Virtual File System', 'SHA-256'],
    repoUrl: 'https://github.com/athuls-engineer/samm',
    description: 'Cross-platform desktop application architected in Rust and React via Tauri v2 for managing high-volume game modification directories, featuring automated cyclic conflict resolution, SHA-256 hash validation, and virtual directory symlink deployment.',
    highlights: [
      'Engineered multithreaded file scanner in Rust utilizing rayon for instantaneous indexing across thousands of files.',
      'Implemented NTFS junction and Unix symlink virtualization to prevent physical file duplication.',
      'Built dependency tree graph validator to detect and resolve ordering conflicts before launch.',
      'Clean reactive UI with real-time IPC bridges and sub-30ms startup latency.'
    ],
    architecture: `[React + TypeScript UI] <== (Tauri v2 IPC Bridge) ==> [Rust Core Engine]
                                                                  |
                                              +-------------------+-------------------+
                                              v                                       v
                                   [Rayon File Indexer]                    [Virtual FS Linker]
                                              |                                       |
                                              v                                       v
                                    [SHA-256 Checksums]                    [NTFS / Unix Symlinks]`,
    pinouts: [
      { signal: 'Core Backend', pin: 'Rust 2021 Edition + Tauri v2 Runtime' },
      { signal: 'Concurrency Engine', pin: 'Rayon Work-Stealing Parallel Iterators' },
      { signal: 'Virtual FS', pin: 'NTFS Junctions & Symlinks (Zero Copy)' },
      { signal: 'Hashing Speed', pin: '> 850 MB/s Hardware-Accelerated SHA-256' }
    ]
  }
};

function openProjectModal(projectId) {
  const modal = document.getElementById('project-modal');
  const content = document.getElementById('modal-content');
  const data = projectDetails[projectId];

  if (!modal || !content || !data) return;

  const githubSvg = `<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/></svg>`;

  content.innerHTML = `
    <div class="border-b border-slate-200 dark:border-white/[0.08] pb-4">
      <div class="flex items-center justify-between gap-2 mb-2">
        <span class="text-xs font-mono px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 font-semibold">${data.category}</span>
        <span class="text-xs font-mono text-slate-500 dark:text-slate-400">${data.duration}</span>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
        <h3 class="text-xl sm:text-2xl font-heading font-bold text-slate-900 dark:text-white">${data.title}</h3>
        <div class="flex items-center gap-2 shrink-0">
          ${data.liveUrl ? `
            <a href="${data.liveUrl}" class="px-3.5 py-1.5 rounded-lg text-xs font-mono text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:opacity-90 font-semibold transition-all flex items-center gap-1.5 shadow">
              <span>Live App</span>
              <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
            </a>
          ` : ''}
          ${data.repoUrl ? `
            <a href="${data.repoUrl}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-1.5 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-base-800 hover:bg-slate-200 dark:hover:bg-white dark:hover:text-black border border-slate-200 dark:border-white/[0.1] transition-all flex items-center gap-1.5">
              ${githubSvg}
              <span>GitHub</span>
            </a>
          ` : ''}
        </div>
      </div>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 font-normal leading-relaxed">${data.description}</p>
    </div>

    <div>
      <h4 class="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Technical Highlights & Implementation</h4>
      <ul class="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
        ${data.highlights.map(h => `<li class="flex items-start gap-2"><span class="text-emerald-500 font-bold mt-0.5">&bull;</span><span>${h}</span></li>`).join('')}
      </ul>
    </div>

    ${data.pinouts ? `
    <div>
      <h4 class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <i data-lucide="cpu" class="w-3.5 h-3.5"></i>
        <span>Hardware Pinout & Physical Signal Mapping</span>
      </h4>
      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-base-950 border border-slate-200 dark:border-white/[0.08] text-xs font-mono">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
          ${data.pinouts.map(p => `
            <div class="flex items-center justify-between p-2 rounded bg-white dark:bg-base-900 border border-slate-200 dark:border-white/[0.04]">
              <span class="text-slate-500 dark:text-slate-400 font-medium">${p.signal}</span>
              <span class="text-slate-900 dark:text-white font-bold">${p.pin}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    ` : ''}

    <div>
      <h4 class="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">System Architecture Flow</h4>
      <pre class="p-3.5 rounded-xl bg-slate-900 text-slate-200 dark:bg-base-950 dark:text-slate-300 border border-slate-800 dark:border-white/[0.08] text-xs font-mono overflow-x-auto leading-relaxed">${data.architecture}</pre>
    </div>

    <div class="pt-2 border-t border-slate-200 dark:border-white/[0.08]">
      <h4 class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Technologies & Tooling</h4>
      <div class="flex flex-wrap gap-2">
        ${data.tags.map(tag => `<span class="tech-pill">${tag}</span>`).join('')}
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
        statusDiv.className = 'text-xs font-mono text-center p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 block';
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
      statusDiv.className = 'text-xs font-mono text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-300 block';
      statusDiv.innerHTML = `Email service unavailable. <a href="${mailtoLink}" class="underline font-bold text-slate-900 dark:text-white hover:underline">Click here to send via your email client</a>.`;
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
        link.classList.add('text-blue-600', 'dark:text-white', 'bg-blue-50', 'dark:bg-white/[0.08]', 'font-semibold');
        link.classList.remove('text-slate-600', 'dark:text-slate-300');
      } else {
        link.classList.remove('text-blue-600', 'dark:text-white', 'bg-blue-50', 'dark:bg-white/[0.08]', 'font-semibold');
        link.classList.add('text-slate-600', 'dark:text-slate-300');
      }
    });
  });
}
