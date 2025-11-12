import { GoogleGenAI, Type } from "@google/genai";

// --- Gemini Service ---
async function generatePosterContent() {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const fetchedContentSchema = {
    type: Type.OBJECT,
    properties: {
      gapTopics: {
        type: Type.ARRAY,
        description: "A list of exactly 3 topics about AI governance black holes in space law. The topics must be: 'Outer Space Treaty (1967)', 'Current Laws/Guidelines', and 'Current uses of AI'.",
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The title of the topic." },
            details: { type: Type.STRING, description: "A detailed paragraph explaining the topic." },
            imagePrompt: { type: Type.STRING, description: "A short, descriptive prompt for a conceptual image." }
          },
          required: ["title", "details", "imagePrompt"]
        }
      },
      solutions: {
        type: Type.ARRAY,
        description: "A list of 4 solutions corresponding to 'Liability', 'Surveillance', 'Bias', and 'Unpredictable Autonomy'.",
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A short title for the solution." },
            description: { type: Type.STRING, description: "A detailed paragraph explaining the solution." }
          },
          required: ["title", "description"]
        }
      }
    },
    required: ["gapTopics", "solutions"]
  };
  
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const maxRetries = 3;
  let attempt = 0;
  let delay = 1000;

  while (attempt < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Generate content for a poster on 'AI Space Law'. For 'gapTopics', provide exactly 3 entries for 'Outer Space Treaty (1967)', 'Current Laws/Guidelines', and 'Current uses of AI', including details and an image prompt. For 'solutions', provide exactly 4 solutions for 'Liability', 'Surveillance', 'Bias', and 'Unpredictable Autonomy'. Follow the schema precisely.",
        config: {
          responseMimeType: "application/json",
          responseSchema: fetchedContentSchema,
        },
      });
      const data = JSON.parse(response.text.trim());
      if (!data.gapTopics || data.gapTopics.length < 3) throw new Error("API did not return 3 gap topics.");
      if (!data.solutions || data.solutions.length < 4) throw new Error("API did not return 4 solutions.");
      return data;
    } catch (error) {
      attempt++;
      console.error(`Error generating content (Attempt ${attempt}):`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        if (attempt >= maxRetries) {
          throw new Error("API quota exceeded. Please check your plan or try again later.");
        }
        await sleep(delay);
        delay *= 2;
      } else {
        throw new Error("Failed to fetch or parse poster content from Gemini API.");
      }
    }
  }
  throw new Error("Failed to fetch poster content after multiple retries.");
}


// --- Hardcoded Data ---
const problemsData = [
  { title: '1. The “Liability Black Hole”', description: '• As AI systems take over critical tasks like autonomous rendezvous and docking, accidents—such as satellite collisions or failed docking maneuvers—can occur without clear human oversight.\n• Current space law struggles to assign responsibility for these incidents.\n• This creates a “liability gap,” leaving victims without justice and letting bad actors evade accountability.\n (Bratu et al., 2021; Martin & Freeland, 2021; Pagallo et al., 2023).' },
  { title: '2. Security Threats "Gravity"', description: '• AI systems in space are vulnerable to cyberattacks, manipulation, and data breaches.\n• Consequences: These vulnerabilities can severely impact space assets and terrestrial infrastructure.\n• For example: A cyberattack manipulates an AI-controlled satellite’s navigation, causing it to collide with a critical communication satellite and disrupting global internet services for millions.\n (Weber & Franke, 2024; Oche et al., 2021; Thangavel et al., 2024; Gal et al., 2020)' },
  { title: '3. Built-in Bias "Inertia"', description: '• AI-powered satellites capture and analyze high-resolution images worldwide without consent or oversight, enabling mass collection, processing, and sale of sensitive data with few safeguards or regulations.\n• These AI systems inherit and amplify biases from training data, causing discriminatory outcomes like misidentification or disproportionate targeting of certain groups via space-based facial recognition.\n• This deepens inequalities and enables unjust surveillance or enforcement actions.\n (Yazici, 2025; Ghamisi et al., 2024; Izzo & Campanile, 2024; Kochupillai, 2021).' },
  { title: '4. Unpredictable Autonomy "Cluster"', description: '• Highly autonomous AI can make rapid, unpredictable and irreversible decisions without human intervention.\n• This unpredictability in high-stakes hinders risk assessment and legal accountability.\n• Humans may be powerless to prevent disasters caused by autonomous AI decisions.\n• Absence of clear, enforceable standards raises issues of compliance, fairness, and protection of fundamental rights.\n (Graham et al., 2024; Thangavel et al., 2024; Gal et al., 2020; Pagallo et al., 2023; Martin & Freeland, 2021).' }
];
const fallbackContent = {
  gapTopics: [
    { title: 'Outer Space Treaty (1967)', details: 'The Outer Space Treaty is the foundation of space law, but it was written long before AI. It doesn\'t address autonomous decision-making, leaving a gap in accountability when an AI causes an incident.', imagePrompt: 'An old, yellowed scroll representing the treaty, with a glowing, digital neural network pattern spreading across it, causing cracks.' },
    { title: 'Current Laws/Guidelines', details: 'Current regulations are a mix of national laws and non-binding international "soft laws." This patchwork approach creates inconsistencies and loopholes, failing to provide a clear, unified framework for AI governance in space.', imagePrompt: 'A tangled knot of different colored ropes and wires, with some frayed and broken ends, failing to contain a central, glowing AI core.' },
    { title: 'Current uses of AI', details: 'AI is already essential for satellite navigation, earth observation data analysis, and rover autonomy. The rapid pace of this technological integration is far outstripping the slow development of international law and policy.', imagePrompt: 'A sleek, futuristic satellite orbiting Earth, with visible data streams connecting it to a complex, glowing AI brain graphic.' }
  ],
  solutions: [
    { title: 'Adaptive Governance Framework', description: '' },
    { title: 'Tech Diplomacy & Standards', description: '' },
    { title: 'Meaningful Human Control', description: '' },
    { title: 'Binding Legal Frameworks', description: '' }
  ]
};

// --- Main Application Logic ---
document.addEventListener('DOMContentLoaded', async () => {
    
    // --- DOM Element Selectors ---
    const animatedBg = document.getElementById('animated-background');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessageContainer = document.getElementById('error-message-container');
    const mainContentContainer = document.getElementById('main-content-container');
    const bottomContentContainer = document.getElementById('bottom-content-container');
    const problemContentContainer = document.getElementById('problem-content-container');
    const exploreRisksBtn = document.getElementById('explore-risks-btn');
    const modalRoot = document.getElementById('modal-root');
    const gapsDiagramSectionContainer = document.getElementById('gaps-diagram-section-container');
    const solutionSolarSystemSectionContainer = document.getElementById('solution-solar-system-section-container');

    // --- State Variables ---
    let isRisksExplored = false;

    // --- Render Functions ---

    function renderAnimatedBackground() {
        const starLayersData = [
            { count: 150, size: '1px', speed: 0.01 },
            { count: 70, size: '2px', speed: 0.025 },
            { count: 30, size: '3px', speed: 0.04 },
        ];
        starLayersData.forEach(layer => {
            const layerDiv = document.createElement('div');
            layerDiv.className = "absolute left-0 right-0 h-[200%] top-[-50%]";
            layerDiv.style.transform = `translateY(0px)`;
            
            const stars = Array.from({ length: layer.count * 2 }).map(() => ({
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 5 + 3}s`,
                animationDelay: `${Math.random() * 3}s`,
            }));

            stars.forEach(star => {
                const starDiv = document.createElement('div');
                starDiv.className = "absolute bg-white rounded-full";
                starDiv.style.width = layer.size;
                starDiv.style.height = layer.size;
                starDiv.style.top = star.top;
                starDiv.style.left = star.left;
                starDiv.style.animation = `twinkle ${star.animationDuration} ease-in-out infinite`;
                starDiv.style.animationDelay = star.animationDelay;
                layerDiv.appendChild(starDiv);
            });
            animatedBg.appendChild(layerDiv);
        });
        
        window.addEventListener('scroll', () => {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                animatedBg.childNodes.forEach((layerDiv, i) => {
                    if (layerDiv instanceof HTMLElement) {
                       layerDiv.style.transform = `translateY(${scrollY * starLayersData[i].speed}px)`;
                    }
                });
            });
        }, { passive: true });
    }
    
    function renderProblemGrid() {
        let activePlanet = null;
        let showAllPlanets = false;

        const keywords = ["Liability", "Security", "Bias", "Autonomy"];
        const planetColorConfig = [
          { bg: 'bg-slate-500', border: 'border-slate-300', shadow: 'shadow-slate-400/50', ping: 'bg-slate-400', text: 'text-white' },
          { bg: 'bg-amber-200', border: 'border-amber-100', shadow: 'shadow-amber-300/50', ping: 'bg-amber-100', text: 'text-white' },
          { bg: 'bg-sky-600', border: 'border-sky-300', shadow: 'shadow-sky-500/50', ping: 'bg-sky-400', text: 'text-white' },
          { bg: 'bg-red-700', border: 'border-red-400', shadow: 'shadow-red-500/50', ping: 'bg-red-500', text: 'text-white' },
        ];
        const orbitConfig = [
          { size: 'w-64 h-64 md:w-80 md:h-80', duration: '30s' },
          { size: 'w-80 h-80 md:w-[28rem] md:h-[28rem]', duration: '50s', delay: '-5s' },
          { size: 'w-96 h-96 md:w-[36rem] md:h-[36rem]', duration: '75s', delay: '-15s' },
          { size: 'w-[28rem] h-[28rem] md:w-[44rem] md:h-[44rem]', duration: '100s', delay: '-25s' },
        ];

        const tooltipContentHTML = (problem) => `
            <h4 class="mb-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">${problem.title}</h4>
            <p class="text-sm text-gray-300 leading-relaxed whitespace-pre-line">${problem.description}</p>
        `;

        const solarSystemHTML = `
          <div class="relative flex items-center justify-center w-full min-h-[500px] md:min-h-[800px]">
            <div id="problem-sun" role="button" tabindex="0" class="relative z-10 flex flex-col items-center justify-center w-40 h-40 text-center bg-gray-200 rounded-full cursor-pointer md:w-48 md:h-48 transition-transform hover:scale-105 animate-sun-glow">
              <h3 class="text-xl font-bold text-gray-800 md:text-2xl">AI Main Risks</h3>
            </div>
            ${problemsData.map((problem, index) => `
              <div class="absolute rounded-full pointer-events-none orbit-trail ${orbitConfig[index].size}" style="animation: spin ${orbitConfig[index].duration} linear infinite; animation-delay: ${orbitConfig[index].delay ?? '0s'}; z-index: ${20 + (problemsData.length - 1 - index)};">
                <div class="absolute" style="top: 50%; left: 0%; transform: translate(-50%, -50%);">
                  <div class="pointer-events-auto w-20 h-20 md:w-24 md:h-24" style="animation: spin ${orbitConfig[index].duration} linear infinite reverse; animation-delay: ${orbitConfig[index].delay ?? '0s'};">
                    <div class="planet-container relative flex items-center justify-center w-full h-full transition-transform duration-300 cursor-pointer" data-index="${index}">
                      <div class="ping-indicator absolute w-full h-full ${planetColorConfig[index].ping} rounded-full opacity-0"></div>
                      <div class="relative z-10 flex flex-col items-center justify-center w-16 h-16 p-1 text-center ${planetColorConfig[index].text} ${planetColorConfig[index].bg} border-2 ${planetColorConfig[index].border} rounded-full shadow-lg md:w-20 md:h-20 ${planetColorConfig[index].shadow}">
                        <span class="text-lg font-bold leading-tight md:text-xl">${index + 1}</span>
                        <span class="mt-1 text-[10px] uppercase tracking-wider md:text-xs">${keywords[index]}</span>
                      </div>
                    </div>
                    <div class="tooltip absolute z-30 p-4 w-64 border rounded-lg shadow-xl border-purple-500/30 bg-black/50 backdrop-blur-md left-full ml-4 top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out opacity-0 scale-95 invisible">
                      ${tooltipContentHTML(problem)}
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
            <div id="problem-grid-tooltips" class="absolute inset-0 z-30 grid grid-cols-2 grid-rows-2 gap-4 p-4 pointer-events-none invisible">
                ${problemsData.map((problem, index) => {
                    const alignmentClasses = [
                        'justify-self-start self-start',
                        'justify-self-end self-start',
                        'justify-self-start self-end',
                        'justify-self-end self-end'
                    ][index];
                    return `<div class="p-4 w-80 border rounded-lg shadow-xl border-purple-500/30 bg-black/50 backdrop-blur-md transition-all duration-300 ease-in-out pointer-events-auto opacity-0 scale-95 invisible ${alignmentClasses}">${tooltipContentHTML(problem)}</div>`;
                }).join('')}
            </div>
          </div>
        `;

        const mobileGridHTML = `
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            ${problemsData.map(problem => `
              <div class="flex flex-col p-6 border border-purple-500/20 bg-black/30 backdrop-blur-md rounded-xl shadow-lg shadow-purple-500/10 transition-all duration-300 hover:border-purple-500/50 hover:shadow-purple-500/20 hover:-translate-y-1">
                <div class="flex items-center gap-4 mb-3">
                   <h3 class="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">${problem.title}</h3>
                </div>
                <p class="text-gray-300 leading-relaxed text-base whitespace-pre-line">${problem.description}</p>
              </div>
            `).join('')}
          </div>
        `;

        problemContentContainer.innerHTML = `
            <div class="animate-fade-in">
                <div class="hidden md:block">${solarSystemHTML}</div>
                <div class="block md:hidden">${mobileGridHTML}</div>
            </div>
        `;
        
        const sun = problemContentContainer.querySelector('#problem-sun');
        if (!sun) return;

        const planets = problemContentContainer.querySelectorAll('.planet-container');
        const gridTooltipsContainer = problemContentContainer.querySelector('#problem-grid-tooltips');
        const gridTooltips = gridTooltipsContainer.querySelectorAll(':scope > div');

        function toggleAllTooltips(show) {
            showAllPlanets = show;
            gridTooltipsContainer.classList.toggle('invisible', !show);
            gridTooltips.forEach(tip => {
                tip.classList.toggle('opacity-100', show);
                tip.classList.toggle('scale-100', show);
                tip.classList.toggle('visible', show);
                tip.classList.toggle('opacity-0', !show);
                tip.classList.toggle('scale-95', !show);
                tip.classList.toggle('invisible', !show);
            });
        }
        
        sun.addEventListener('click', () => {
            activePlanet = null;
            planets.forEach(p => {
                p.classList.remove('scale-110');
                p.querySelector('.ping-indicator').classList.add('opacity-0');
                p.nextElementSibling.classList.add('opacity-0', 'scale-95', 'invisible');
                p.nextElementSibling.classList.remove('opacity-100', 'scale-100', 'visible');
            });
            toggleAllTooltips(!showAllPlanets);
        });

        planets.forEach(planet => {
            planet.addEventListener('click', (e) => {
                e.stopPropagation();
                // FIX: Cast planet to HTMLElement to access dataset property.
                const index = parseInt((planet as HTMLElement).dataset.index);
                const tooltip = planet.nextElementSibling;
                const ping = planet.querySelector('.ping-indicator');

                if (activePlanet === index) {
                    activePlanet = null;
                    planet.classList.remove('scale-110');
                    ping.classList.add('opacity-0');
                    tooltip.classList.add('opacity-0', 'scale-95', 'invisible');
                    tooltip.classList.remove('opacity-100', 'scale-100', 'visible');
                } else { 
                    if(activePlanet !== null) {
                        const prevPlanet = problemContentContainer.querySelector(`.planet-container[data-index="${activePlanet}"]`);
                        prevPlanet.classList.remove('scale-110');
                        prevPlanet.querySelector('.ping-indicator').classList.add('opacity-0');
                        prevPlanet.nextElementSibling.classList.add('opacity-0', 'scale-95', 'invisible');
                        prevPlanet.nextElementSibling.classList.remove('opacity-100', 'scale-100', 'visible');
                    }
                    activePlanet = index;
                    showAllPlanets = false;
                    toggleAllTooltips(false);

                    planet.classList.add('scale-110');
                    ping.classList.remove('opacity-0');
                    tooltip.classList.remove('opacity-0', 'scale-95', 'invisible');
                    tooltip.classList.add('opacity-100', 'scale-100', 'visible');
                }
            });
        });
        
        document.body.addEventListener('click', (e) => {
           // FIX: Cast e.target to Node as contains() expects a Node.
           if (!problemContentContainer.contains(e.target as Node)) {
               toggleAllTooltips(false);
               if(activePlanet !== null) {
                   const prevPlanet = problemContentContainer.querySelector(`.planet-container[data-index="${activePlanet}"]`);
                   if(prevPlanet) {
                     prevPlanet.classList.remove('scale-110');
                     prevPlanet.querySelector('.ping-indicator').classList.add('opacity-0');
                     prevPlanet.nextElementSibling.classList.add('opacity-0', 'scale-95', 'invisible');
                     prevPlanet.nextElementSibling.classList.remove('opacity-100', 'scale-100', 'visible');
                     activePlanet = null;
                   }
               }
           } 
        });
    }

    function renderGapsDiagram(topics) {
        let isGapsExplored = false;

        const introHTML = `
            <div class="flex flex-col items-center gap-4 mb-8 text-center">
                <div class="w-16 h-16 text-cyan-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
                </div>
                <h2 class="text-2xl font-bold text-transparent sm:text-3xl bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">
                    The Gaps: AI Governance Black Hole
                </h2>
                <p class="max-w-2xl mt-1 text-gray-400">Key challenges in current space law that create a governance vacuum for AI.</p>
            </div>
            <div class="flex flex-col items-center justify-center p-8 my-8 text-center border border-purple-500/20 bg-black/30 backdrop-blur-md rounded-xl shadow-lg shadow-purple-500/10">
                <p class="max-w-xl mb-8 text-lg text-gray-300">
                    Explore the legal black hole where current regulations fail to capture the risks of autonomous systems in space.
                </p>
                <button id="explore-gaps-btn" class="px-8 py-3 font-bold text-white uppercase transition-all duration-300 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg shadow-lg hover:from-cyan-400 hover:to-purple-500 hover:shadow-cyan-500/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-cyan-400 animate-pulse-bounce">
                    Explore Gaps
                </button>
            </div>
            <div id="gaps-diagram-content" class="hidden"></div>
        `;
        gapsDiagramSectionContainer.innerHTML = introHTML;
        const exploreGapsBtn = document.getElementById('explore-gaps-btn');
        const gapsDiagramContent = document.getElementById('gaps-diagram-content');

        exploreGapsBtn.addEventListener('click', () => {
            isGapsExplored = !isGapsExplored;
            gapsDiagramContent.classList.toggle('hidden', !isGapsExplored);
            exploreGapsBtn.textContent = isGapsExplored ? 'Hide Gaps' : 'Explore Gaps';
            exploreGapsBtn.classList.toggle('animate-pulse-bounce', !isGapsExplored);
        });
        
        const orderedTopics = [
            topics.find(t => t.title.includes('Outer Space Treaty')),
            topics.find(t => t.title.includes('Current Laws')),
            topics.find(t => t.title.includes('Current uses of AI')),
        ].filter(Boolean);

        function getLines(title) {
          if (title.includes('Outer Space Treaty')) return ['Outer Space', 'Treaty (1967)'];
          if (title.includes('Current Laws')) return ['Current Laws', '& Guidelines'];
          if (title.includes('Current uses')) return ['Current Uses', 'of AI'];
          return title.split(' ');
        }
        
        const diagramHTML = `
            <div class="animate-fade-in">
                <div class="relative flex items-center justify-center w-full p-4 py-12">
                    <div class="relative w-full max-w-sm sm:max-w-md md:max-w-lg aspect-square">
                        <svg viewBox="0 0 300 300" class="w-full h-full relative z-10 overflow-visible">
                            <defs>
                                <radialGradient id="blackHoleGradient" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stop-color="#000000" /><stop offset="85%" stop-color="#000000" /><stop offset="100%" stop-color="#2d0a31" /></radialGradient>
                                <linearGradient id="accretionGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#22d3ee" stop-opacity="0.8" /><stop offset="50%" stop-color="#8b5cf6" stop-opacity="0.5" /><stop offset="100%" stop-color="#000000" stop-opacity="0" /></linearGradient>
                                <filter id="glow-strong"><feGaussianBlur stdDeviation="4" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                                <filter id="glow-soft"><feGaussianBlur stdDeviation="2" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
                            </defs>
                            <g class="animate-spin-slow" style="transform-origin: 150px 150px;"><circle cx="150" cy="150" r="145" fill="url(#accretionGradient)" opacity="0.2" style="mix-blend-mode: screen;"></circle><circle cx="150" cy="150" r="120" stroke="url(#accretionGradient)" stroke-width="1" opacity="0.3" stroke-dasharray="10 20"></circle><circle cx="150" cy="150" r="100" stroke="purple" stroke-width="0.5" opacity="0.3"></circle></g>
                            <circle cx="150" cy="150" r="73" fill="url(#blackHoleGradient)" filter="url(#glow-soft)"></circle>
                            <circle cx="150" cy="150" r="75" fill="none" stroke="#22d3ee" class="animate-photon-ring" filter="url(#glow-strong)"></circle>
                            <text x="150" y="150" text-anchor="middle" dy=".3em" class="font-bold text-transparent fill-white/90 tracking-[0.3em] text-lg pointer-events-none drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">GAPS</text>
                            
                            ${orderedTopics.map((topic, index) => {
                                const rotation = index * 120;
                                const lines = getLines(topic.title);
                                const midAngleDeg = -30;
                                const midAngleRad = midAngleDeg * (Math.PI / 180);
                                const textRadius = 115;
                                const textX = 150 + textRadius * Math.cos(midAngleRad);
                                const textY = 150 + textRadius * Math.sin(midAngleRad);
                                const textCounterRotation = -rotation;

                                return `
                                <g class="cursor-pointer gap-segment" transform="rotate(${rotation} 150 150)" data-index="${index}" role="button" tabindex="0">
                                    <g style="animation: hover-float 6s ease-in-out infinite; animation-delay: ${index * -2}s">
                                        <g class="group transition-all duration-500 hover:filter hover:drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">
                                            <title>${topic.title}</title>
                                            <path d="M 150 2 A 148 148 0 0 1 278.2 224 L 215 187.5 A 75 75 0 0 0 150 75 Z" class="fill-transparent stroke-cyan-500/30 stroke-[1px] transition-all duration-300 group-hover:stroke-cyan-300 group-hover:stroke-[2px] group-hover:fill-cyan-500/10"></path>
                                            <g transform="rotate(${textCounterRotation} ${textX} ${textY})">
                                                <text x="${textX}" y="${textY}" text-anchor="middle" class="text-xs font-bold tracking-wider text-cyan-100 uppercase transition-all duration-300 fill-current sm:text-sm group-hover:text-white group-hover:drop-shadow-[0_0_5px_black]" style="pointer-events: none;">
                                                    ${lines.map((line, i) => {
                                                        const baseDy = 1.2;
                                                        const initialDy = -(lines.length - 1) / 2 * baseDy;
                                                        const dy = i === 0 ? `${initialDy}em` : `${baseDy}em`;
                                                        return `<tspan x="${textX}" dy="${dy}">${line}</tspan>`;
                                                    }).join('')}
                                                </text>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                                `;
                            }).join('')}
                        </svg>
                    </div>
                </div>
            </div>`;
        gapsDiagramContent.innerHTML = diagramHTML;
        
        gapsDiagramContent.querySelectorAll('.gap-segment').forEach(seg => {
            seg.addEventListener('click', () => {
                // FIX: Cast seg to HTMLElement to access dataset property.
                const index = parseInt((seg as HTMLElement).dataset.index);
                handleSegmentClick(orderedTopics[index]);
            });
        });
        
        function parseBoldText(text) {
            return text.split('**').map((part, index) => 
                index % 2 === 1 ? `<strong>${part}</strong>` : part
            ).join('');
        }

        function handleSegmentClick(topic) {
            let detailsContent;
            
            // Override content for specific topics
            if (topic.title.includes('Outer Space Treaty')) {
                const treatyContent = [
                  '- The exploration and use of outer space shall benefit all of mankind',
                  '- Outer space shall be free for exploration and use by all States',
                  '- Outer space is not subject to national appropriation by claim of sovereignty',
                  '- States shall not place nuclear weapons or weapons of mass destruction in outer space',
                  '- All celestial bodies shall be used exclusively for peaceful purposes',
                  '- Astronauts shall be regarded as the envoys of mankind',
                  '- States shall be responsible for governmental or non-governmental national space activities',
                  '- States shall be liable for damage caused by their space objects',
                  '- States shall avoid harmful contamination of space and celestial bodies',
                ].join('\n');
                topic.details = treatyContent;
            } else if (topic.title.includes('Current Laws')) {
                const lawsContent = [
                  '**NASAs’s Framework for Ethical Use of Artificial Intelligence:**\nIdentifies 6 core principles that any AI system used by NASA should satisfy - fairness, explainability and transparency, accountability, security and safety, societally beneficial, scientifically and technically robust',
                  '**ESA’s Missions Operations A2I Roadmap:**\nOutlines how AI can be applied across mission operations in regards to automated health monitoring, decisions and planning, modelling and simulations, content and data generation, data handling and governance',
                  '**DLR’s Institute for AI Safety and Security:**\nWorks on reliability and resilience, safety and security by design, transparency and traceability, data quality and governance, human-centricity and social acceptance',
                  "**Soft laws** are principles that aren't legally binding, but many space agencies have no publicly visible full AI ethics policy with a set of key principles let alone a legally binding framework for the use of AI"
                ].join('\n\n');
                 topic.details = lawsContent;
            } else if (topic.title.includes('Current uses of AI')) {
                const usesContent = [
                    '**ESA’S HERA PLANETARY DEFENSE MISSION:**\nThis mission will use AI to steer itself through asteroids, build a model of surroundings and make decisions onboard',
                    '**DLR’S CIMON (CREW INTERACTIVE MOBILE COMPANION):**\nAn AI assistant that supports astronauts in daily tasks onboard the ISS. It is able to see, speak, hear, understand and even fly',
                    '**JAXA’S EPSILON ROCKET:**\nThe first launch vehicle to incorporate an AI driven autonomous operation system for pre-launch decision making.',
                    '**JAXA’S INT-BALL:**\nAn intelligent, free-flying, spherical camera drone with autonomous navigation and remote control to assist astronauts with routine photography tasks'
                ].join('\n\n');
                topic.details = usesContent;
            }

            // Render logic based on topic title
            if (topic.title.includes('Outer Space Treaty')) {
                detailsContent = `<div class="space-y-4">${topic.details.split('\n').map((line, index) => `
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-cyan-500/10 last:border-b-0">
                        <p class="flex-1 text-base text-gray-300 sm:text-lg leading-relaxed">${line.replace(/^- /, '')}</p>
                        <div class="flex flex-shrink-0 w-full sm:w-28 h-20 bg-white/5 border border-dashed border-cyan-500/30 rounded-md transition-colors hover:border-cyan-500/60 overflow-hidden">
                            <img src="/assets/images/img-${index + 1}.jpg" alt="Illustration for Outer Space Treaty principle ${index + 1}" class="w-full h-full object-cover" />
                        </div>
                    </div>`).join('')}</div>`;
            } else if (topic.title.includes('Current Laws')) {
                 const sections = topic.details.split('\n\n');
                 const frameworks = sections.slice(0, 3).map((framework, index) => {
                      const [title, ...descriptionParts] = framework.split('\n');
                      return `
                        <div class="relative p-4 overflow-hidden border rounded-lg bg-white/5 border-white/10">
                          <div class="relative z-10 flex flex-col sm:flex-row gap-4 justify-between items-start">
                            <div class="flex-1">
                                <p class="text-lg font-bold text-cyan-200">${parseBoldText(title)}</p>
                                <p class="mt-2 text-sm text-gray-300 sm:text-base">${parseBoldText(descriptionParts.join('\n'))}</p>
                            </div>
                             <div class="flex flex-shrink-0 w-full sm:w-28 h-20 bg-white/5 border border-dashed border-cyan-500/30 rounded-md transition-colors hover:border-cyan-500/60 mt-2 sm:mt-0 overflow-hidden">
                                <img src="/assets/images/img-${10 + index}.jpg" alt="${title.split(':')[0].replace(/\*\*/g, '')}" class="w-full h-full object-cover" />
                            </div>
                          </div>
                        </div>`;
                 }).join('');
                 const softLaw = sections.length > 3 ? `<div class="p-4 mt-4 border-l-2 border-purple-400 bg-purple-900/20"><p class="text-gray-300 italic">${parseBoldText(sections[3])}</p></div>` : '';
                 detailsContent = `<div class="space-y-6">${frameworks}${softLaw}</div>`;
            } else if (topic.title.includes('Current uses of AI')) {
                detailsContent = `<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">${topic.details.split('\n\n').map((useCase, index) => {
                    const [title, ...descriptionParts] = useCase.split('\n');
                    return `
                      <div class="p-5 bg-[#0c0a1d] border border-cyan-500/30 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-shadow duration-300 flex flex-col">
                        <div class="flex-1">
                            <h4 class="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 mb-2 leading-tight">${parseBoldText(title)}</h4>
                            <p class="text-sm text-gray-300 leading-relaxed mb-4">${descriptionParts.join('\n')}</p>
                        </div>
                        <div class="w-full h-24 bg-white/5 border border-dashed border-cyan-500/30 rounded-md overflow-hidden">
                            <img src="/assets/images/img-${13 + index}.jpg" alt="${title.split(':')[0].replace(/\*\*/g, '')}" class="w-full h-full object-cover" />
                        </div>
                      </div>`;
                }).join('')}</div>`;
            } else {
                 detailsContent = `<div class="grid gap-6 md:grid-cols-2"><div class="space-y-4 text-base text-gray-300 sm:text-lg leading-relaxed">${topic.details.split('\n').map(p=>`<p>${p}</p>`).join('')}</div><div class="flex flex-col items-center justify-center p-4 border border-dashed rounded-lg border-gray-500/50 bg-black/20"><p class="mb-2 text-sm text-center text-gray-400">Conceptual Image:</p><p class="text-center text-gray-200 italic">"${topic.imagePrompt}"</p></div></div>`;
            }

            const modalHTML = `
                <div class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-container" role="dialog" aria-modal="true">
                  <div class="absolute inset-0 bg-transparent backdrop-blur-md modal-bg"></div>
                  <div class="relative flex flex-col w-full max-w-2xl max-h-[90vh] bg-[#0c0a1d] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(103,232,249,0.15)] transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in-scale" style="animation-fill-mode: forwards">
                    <div class="flex items-start justify-between flex-shrink-0 p-6 border-b sm:p-8 border-cyan-500/20">
                        <h3 class="pr-8 text-xl font-bold text-transparent sm:text-2xl bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">${topic.title}</h3>
                        <button class="flex-shrink-0 w-8 h-8 text-gray-400 transition-colors hover:text-white close-modal-btn" aria-label="Close toolkit">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div class="p-6 sm:p-8 overflow-y-auto custom-scrollbar">${detailsContent}</div>
                  </div>
                </div>`;
            
            modalRoot.innerHTML = modalHTML;
            document.body.classList.add('modal-open');
            
            const closeModal = () => {
                modalRoot.innerHTML = '';
                document.body.classList.remove('modal-open');
            };

            modalRoot.querySelector('.close-modal-btn').addEventListener('click', closeModal);
            modalRoot.querySelector('.modal-bg').addEventListener('click', closeModal);
            window.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal() }, { once: true });
        }
    }

    function renderSolutionSolarSystem(solutions) {
        let isSolutionsExplored = false;
        
        const introHTML = `
            <div class="flex flex-col items-center gap-4 mb-16 text-center">
                <div class="w-16 h-16 text-cyan-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c-1.255 0-2.42-.154-3.563-.437m7.126 12.911a7.5 7.5 0 0 1 7.5 0c1.255 0 2.42.154 3.563.437m-18.126-3.563a12.06 12.06 0 0 1 4.5 0m-3.75-2.311a7.5 7.5 0 0 1 7.5 0c1.255 0 2.42.154 3.563.437m-7.126-12.911a7.5 7.5 0 0 1 7.5 0" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 18a.75.75 0 0 0 .75-.75V11.25a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 .75.75Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 6.75a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6.375 9.75a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M16.875 9.75a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M9 3.75a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5h-6Z" /></svg>
                </div>
                <h2 class="text-2xl font-bold text-transparent sm:text-3xl bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">The Solutions: Charting a New Course</h2>
                <p class="max-w-2xl mt-1 text-gray-400">Deployable strategies to safeguard the future of space operations.</p>
            </div>
            <div class="flex flex-col items-center justify-center p-8 my-8 text-center border border-purple-500/20 bg-black/30 backdrop-blur-md rounded-xl shadow-lg shadow-purple-500/10">
                <p class="max-w-xl mb-8 text-lg text-gray-300">To address these critical risks, a multi-faceted framework is required, blending legal reforms, technical standards, and international cooperation to ensure AI is a force for good in space.</p>
                <button id="explore-solutions-btn" class="px-8 py-3 font-bold text-white uppercase transition-all duration-300 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg shadow-lg hover:from-cyan-400 hover:to-purple-500 hover:shadow-cyan-500/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-cyan-400 animate-pulse-bounce">
                    Explore Solutions
                </button>
            </div>
            <div id="solutions-diagram-content" class="hidden"></div>
        `;
        solutionSolarSystemSectionContainer.innerHTML = introHTML;

        const exploreSolutionsBtn = document.getElementById('explore-solutions-btn');
        const solutionsDiagramContent = document.getElementById('solutions-diagram-content');
        
        exploreSolutionsBtn.addEventListener('click', () => {
            isSolutionsExplored = !isSolutionsExplored;
            solutionsDiagramContent.classList.toggle('hidden', !isSolutionsExplored);
            exploreSolutionsBtn.textContent = isSolutionsExplored ? 'Hide Solutions' : 'Explore Solutions';
            exploreSolutionsBtn.classList.toggle('animate-pulse-bounce', !isSolutionsExplored);
        });

        const keywords = ["Liability", "Security", "Bias", "Autonomy"];
        const planetColorConfig = [
            { bg: 'bg-slate-500', border: 'border-slate-300', shadow: 'shadow-slate-400/50', text: 'text-white' },
            { bg: 'bg-amber-200', border: 'border-amber-100', shadow: 'shadow-amber-300/50', text: 'text-white' },
            { bg: 'bg-sky-600', border: 'border-sky-300', shadow: 'shadow-sky-500/50', text: 'text-white' },
            { bg: 'bg-red-700', border: 'border-red-400', shadow: 'shadow-red-500/50', text: 'text-white' },
        ];
        const orbitConfig = [
            { size: 'w-64 h-64 md:w-80 md:h-80', duration: '30s', delay: '0s' },
            { size: 'w-80 h-80 md:w-[28rem] md:h-[28rem]', duration: '50s', delay: '-5s' },
            { size: 'w-96 h-96 md:w-[36rem] md:h-[36rem]', duration: '75s', delay: '-15s' },
            { size: 'w-[28rem] h-[28rem] md:w-[44rem] md:h-[44rem]', duration: '100s', delay: '-25s' },
        ];
        
        const diagramHTML = `
            <div class="animate-fade-in">
              <div class="relative flex items-center justify-center w-full min-h-[500px] md:min-h-[800px]">
                <div id="solution-sun" role="button" tabindex="0" class="relative z-10 flex flex-col items-center justify-center w-40 h-40 text-center bg-gray-200 rounded-full cursor-pointer md:w-48 md:h-48 animate-sun-glow transition-transform hover:scale-105 animate-pop-bounce">
                  <h3 class="text-xl font-bold text-gray-800 md:text-2xl">Solutions Framework</h3>
                </div>
                ${problemsData.map((problem, index) => {
                    const color = planetColorConfig[index];
                    const satelliteOrbitDuration = `${(index + 2) * 5}s`;
                    return `
                    <div class="absolute rounded-full pointer-events-none solution-orbit-trail ${orbitConfig[index].size}" style="animation: spin ${orbitConfig[index].duration} linear infinite; animation-delay: ${orbitConfig[index].delay}">
                      <div class="absolute" style="top: 50%; left: 0%; transform: translate(-50%, -50%);">
                        <div class="w-20 h-20 md:w-24 md:h-24" style="animation: spin ${orbitConfig[index].duration} linear infinite reverse; animation-delay: ${orbitConfig[index].delay}">
                          <div class="relative flex items-center justify-center w-full h-full pointer-events-none">
                            <div class="relative z-10 grid place-items-center w-16 h-16 p-1 text-center ${color.text} ${color.bg} border-2 ${color.border} rounded-full shadow-lg md:w-20 md:h-20 ${color.shadow}">
                              <div class="z-10 flex flex-col items-center justify-center col-start-1 row-start-1 pointer-events-none">
                                <span class="text-lg font-bold leading-tight md:text-xl">${index + 1}</span>
                                <span class="mt-1 text-[10px] uppercase tracking-wider md:text-xs">${keywords[index]}</span>
                              </div>
                              <div class="absolute col-start-1 row-start-1 w-32 h-32 md:w-40 md:h-40 border border-dashed border-cyan-500/30 rounded-full pointer-events-none" style="animation: spin ${satelliteOrbitDuration} linear infinite">
                                <div class="solution-satellite absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 p-1 text-cyan-300 transition-transform duration-300 cursor-pointer pointer-events-auto hover:scale-125 hover:text-cyan-100" style="animation: spin ${satelliteOrbitDuration} linear infinite reverse" data-index="${index}">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /><path stroke-linecap="round" stroke-linejoin="round" d="m15.5 14-4-4m4-4-4 4" /></svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  `}).join('')}
                <div id="solution-grid-tooltips" class="absolute inset-0 z-30 grid grid-cols-1 md:grid-cols-2 grid-rows-4 md:grid-rows-2 gap-8 p-8 pointer-events-none invisible">
                  ${solutions.map((solution, index) => {
                      const alignmentClasses = ['md:justify-self-start md:self-start justify-self-center self-center','md:justify-self-end md:self-start justify-self-center self-center','md:justify-self-start md:self-end justify-self-center self-center','md:justify-self-end md:self-end justify-self-center self-center'][index];
                      return `<div class="p-6 w-full max-w-xs md:max-w-md md:w-96 border rounded-xl shadow-2xl border-cyan-500/30 bg-black/80 backdrop-blur-md transition-all duration-500 ease-in-out pointer-events-auto opacity-0 scale-95 invisible translate-y-8 ${alignmentClasses}">
                                <h3 class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 mb-4">${solution.title}</h3>
                                <p class="text-sm text-gray-300 leading-relaxed whitespace-pre-line">${solution.description}</p>
                              </div>`;
                  }).join('')}
                </div>
              </div>
            </div>`;
        solutionsDiagramContent.innerHTML = diagramHTML;

        // Add event listeners
        solutionsDiagramContent.querySelectorAll('.solution-satellite').forEach(sat => {
            sat.addEventListener('click', (e) => {
                e.stopPropagation();
                // FIX: Cast sat to HTMLElement to access dataset property.
                const index = parseInt((sat as HTMLElement).dataset.index);
                showSolutionModal(solutions[index]);
            });
        });
        
        let showAllSolutions = false;
        const solutionSun = solutionsDiagramContent.querySelector('#solution-sun');
        const solutionTooltipsContainer = solutionsDiagramContent.querySelector('#solution-grid-tooltips');
        const solutionTooltips = solutionTooltipsContainer.querySelectorAll(':scope > div');

        solutionSun.addEventListener('click', () => {
            showAllSolutions = !showAllSolutions;
            solutionTooltipsContainer.classList.toggle('invisible', !showAllSolutions);
            solutionTooltips.forEach(tip => {
                tip.classList.toggle('opacity-100', showAllSolutions);
                tip.classList.toggle('scale-100', showAllSolutions);
                tip.classList.toggle('visible', showAllSolutions);
                tip.classList.toggle('translate-y-0', showAllSolutions);
                tip.classList.toggle('opacity-0', !showAllSolutions);
                tip.classList.toggle('scale-95', !showAllSolutions);
                tip.classList.toggle('invisible', !showAllSolutions);
                tip.classList.toggle('translate-y-8', !showAllSolutions);
            });
        });
    }

    function showSolutionModal(solution) {
        let contentHTML = '';
        if (solution.title.toLowerCase().includes('adaptive governance') ||
            solution.title.toLowerCase().includes('tech diplomacy') ||
            solution.title.toLowerCase().includes('meaningful human control') ||
            solution.title.toLowerCase().includes('binding legal')) {
            const imgIndex = ['adaptive', 'tech', 'meaningful', 'binding'].findIndex(s => solution.title.toLowerCase().includes(s));
            contentHTML = `
                <div class="flex flex-col gap-6">
                    <div>
                        <h3 class="text-2xl sm:text-3xl pr-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 mb-6">${solution.title}</h3>
                        <p class="text-lg sm:text-xl text-gray-300 leading-relaxed whitespace-pre-line">${solution.description}</p>
                    </div>
                    <div class="w-full h-48 bg-white/5 border border-dashed border-cyan-500/30 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                        <img src="/assets/images/img-${17 + imgIndex}.jpg" alt="Conceptual image for ${solution.title}" class="w-full h-full object-cover" />
                    </div>
                </div>`;
        } else {
            contentHTML = `
                <h3 class="text-2xl sm:text-3xl pr-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 mb-4">${solution.title}</h3>
                <p class="text-lg sm:text-xl text-gray-300 leading-relaxed whitespace-pre-line">${solution.description}</p>`;
        }

        const modalHTML = `
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
              <div class="absolute inset-0 bg-black/70 backdrop-blur-sm modal-bg"></div>
              <div class="relative w-full max-w-4xl p-8 sm:p-12 bg-gradient-to-br from-[#100a2d] to-[#0c0a1d] border-2 border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/20 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in-scale" style="animation-fill-mode: forwards">
                <button class="absolute top-4 right-4 w-8 h-8 text-gray-400 transition-colors hover:text-white close-modal-btn" aria-label="Close toolkit">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
                ${contentHTML}
              </div>
            </div>`;
        
        modalRoot.innerHTML = modalHTML;
        document.body.classList.add('modal-open');

        const closeModal = () => {
            modalRoot.innerHTML = '';
            document.body.classList.remove('modal-open');
        };

        modalRoot.querySelector('.close-modal-btn').addEventListener('click', closeModal);
        modalRoot.querySelector('.modal-bg').addEventListener('click', closeModal);
        window.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal() }, { once: true });
    }

    // --- Event Handlers ---
    exploreRisksBtn.addEventListener('click', () => {
        isRisksExplored = !isRisksExplored;
        problemContentContainer.classList.toggle('hidden', !isRisksExplored);
        exploreRisksBtn.textContent = isRisksExplored ? 'Hide Risks' : 'Explore Risks';
        exploreRisksBtn.classList.toggle('animate-pulse-bounce', !isRisksExplored);
    });

    // --- Initial Load ---
    
    renderAnimatedBackground();
    
    let posterContent = null;
    let fetchError = null;

    try {
        posterContent = await generatePosterContent();
    } catch (err) {
        fetchError = err.message || 'An unknown error occurred. Displaying default poster content.';
        posterContent = fallbackContent;
    } finally {
        if (posterContent) {
            const solutions = posterContent.solutions;
            if(solutions.length > 0) solutions[0] = { title: 'Adaptive Governance Framework', description: '• Developing responsible AI for autonomous space systems requires integrating ethical governance with secure technical design.\n• As autonomy increases, exemplified by systems like lethal autonomous weapons already used in the military, questions of accountability, transparency, and compliance with international law become critical.' };
            if(solutions.length > 1) solutions[1] = { title: 'Tech Diplomacy & Standards', description: '• AI and sensing technologies are often multi-use, export control frameworks such as the Wassenaar Arrangement and US/EU transfer controls must guide system design to prevent misuse.\n• Ongoing policy initiatives, including the EU AI Act, OECD Responsible AI guidelines, IEEE procurement standards, and U.S. federal acquisition rules further emphasize transparency, risk management, and clarity of liability in automated decision systems.' };
            if(solutions.length > 2) solutions[2] = { title: 'Meaningful Human Control', description: '• Incorporate clearly defined decision thresholds and human control oversight, with regulatory reviews triggered when autonomous performance exceeds previously defined limits.\n• Technical safeguards must be equally robust with end-to-end encryption, authenticated command pathways, tampering resistant logging, and layered access controls to protect mission data and ensure traceability of decisions.' };
            if(solutions.length > 3) solutions[3] = { title: 'Binding Legal Frameworks', description: '• Within space law, the Outer Space Treaty and GDPR principles reinforce state responsibility, data minimization, and continuous supervision of private actors.\n• Together, these legal and technical measures establish a secure, accountable, and ethically grounded framework for deploying AI in space while maintaining meaningful human oversight.' };
        }
    }
    
    // --- Render Page ---
    
    loadingSpinner.classList.add('hidden');

    if (fetchError) {
        errorMessageContainer.textContent = fetchError;
        errorMessageContainer.classList.remove('hidden');
    }

    if (posterContent) {
        mainContentContainer.classList.remove('hidden');
        bottomContentContainer.classList.remove('hidden');

        renderProblemGrid();
        renderGapsDiagram(posterContent.gapTopics);
        renderSolutionSolarSystem(posterContent.solutions);
    }
    
    // --- References Section Toggle ---
    const referencesToggle = document.getElementById('references-toggle');
    const referencesContent = document.getElementById('references-content');
    const referencesChevron = document.getElementById('references-chevron');

    if (referencesToggle && referencesContent && referencesChevron) {
        referencesToggle.addEventListener('click', () => {
            referencesContent.classList.toggle('hidden');
            referencesChevron.classList.toggle('rotate-180');
        });
    }
});