/**
 * Operation Zero-G Manifest
 * Extracted from FRIDAY_Operation_ZeroG.pdf operations manual.
 */

export const ZEROG_PHASES = {
  1: {
    id: 1,
    title: "Theoretical physics foundation",
    goal: "Unify QM + GR, derive equations permitting negative effective mass",
    timeline: "Years 1–6",
    trl: "TRL 1/9 (11%)",
    habits: [
      { name: "Physics study (1hr)", icon: "book", color: "#8b5cf6" },
      { name: "Arxiv review (30m AM)", icon: "search", color: "#06b6d4" },
      { name: "Weekly theory call", icon: "brain", color: "#ec4899" }
    ],
    milestone: "Extended Standard Model equations permitting negative effective mass -- peer-reviewed and published in a top-tier physics journal."
  },
  2: {
    id: 2,
    title: "Materials discovery",
    goal: "Screen 10M+ crystal structures for gravity-coupling properties",
    timeline: "Years 4–12",
    trl: "TRL 2/9 (22%)",
    habits: [
      { name: "Lab check-in (20m)", icon: "focus", color: "#10b981" },
      { name: "Materials review", icon: "target", color: "#f97316" }
    ],
    milestone: "One synthetic material shows measurable anomalous weight change (>0.01%) -- reproduced in 3 independent laboratories."
  },
  3: {
    id: 3,
    title: "Experimental validation",
    goal: "Autonomous lab loop achieving 5-sigma confirmation",
    timeline: "Years 8–18",
    trl: "TRL 3/9 (33%)",
    habits: [
      { name: "Exp log review", icon: "edit", color: "#3b82f6" },
      { name: "Hypothesis approval", icon: "check", color: "#f59e0b" }
    ],
    milestone: "5-sigma confirmation of gravity modification, independent of EM noise and thermal drift, in 2+ separate experimental setups."
  },
  4: {
    id: 4,
    title: "Engineering the device",
    goal: "Amplify micro-Newton coupling to 1kg lift at under 10kW",
    timeline: "Years 15–28",
    trl: "TRL 4/9 (44%)",
    habits: [
      { name: "Design review", icon: "settings", color: "#a855f7" },
      { name: "Proto milestone", icon: "trophy", color: "#14b8a6" }
    ],
    milestone: "Bench prototype lifts a 1kg payload against Earth gravity for 60 continuous seconds consuming under 10kW."
  },
  5: {
    id: 5,
    title: "Scalable prototype",
    goal: "Vehicle-scale system with aviation authority safety certification",
    timeline: "Years 25–40",
    trl: "TRL 6/9 (66%)",
    habits: [
      { name: "Safety review", icon: "shield", color: "#ef4444" },
      { name: "Flight log review", icon: "plane", color: "#8b5cf6" }
    ],
    milestone: "Crewed vehicle demonstrates controlled altitude gain/descent with passenger safety margins. Regulatory submission filed."
  },
  6: {
    id: 6,
    title: "Civilisational deployment",
    goal: "Commercial passenger service and orbital operations without chemical propellant",
    timeline: "Years 35–50+",
    trl: "TRL 9/9 (100%)",
    habits: [
      { name: "Fleet brief", icon: "globe", color: "#06b6d4" },
      { name: "Governance call", icon: "users", color: "#f59e0b" }
    ],
    milestone: "Commercial passenger service operating in 5+ countries. Orbital variant achieves LEO without chemical propellant. UN treaty framework ratified."
  }
};

export const ZEROG_ROUTING_MATRIX = `
# Operation Zero-G: AI Model Routing Matrix
When addressing problems related to Operation Zero-G, ALWAYS recommend models strictly adhering to this matrix:
- Unsolved physics / math proof -> **o3 / Gemini 2.0 Ultra**: Long-chain mathematical reasoning without losing coherence.
- Literature synthesis (1000+ papers) -> **Claude Opus 4**: Best context utilisation, lowest hallucination on citations.
- Crystal structure / materials screening -> **AlphaFold 3 / MatterGen**: Purpose-built for atomic structure prediction.
- Field simulation at nm scale -> **NVIDIA Modulus**: Physics-informed neural net, 1000x faster than FEA.
- Anomaly detection from sensor streams -> **Fine-tuned anomaly LLM**: Catch sub-signal events.
- Equation discovery from raw data -> **PySR / AI Feynman**: Finds governing law without assuming its form.
- Autonomous lab experiment loop -> **Claude agent loop**: Best tool use and code execution.
- Coil / device geometry optimization -> **Gemini 2.0 + CAD agent**: Multimodal, generates 3D variants.
- Control policy / real-time stabilisation -> **RL (IsaacGym / MuJoCo)**: GPU-parallel simulation.
- Safety case / regulatory documents -> **GPT-6 era frontier reasoner**: Formal argumentation structure.
- Real-time vehicle control -> **Multimodal robotics AI**: Sensor fusion with sub-10ms latency.
- Treaty drafting and governance -> **Fine-tuned policy LLM**: International law corpus + dual-use risk classifier.
`;

export function buildZeroGSystemPrompt(phase) {
  const p = ZEROG_PHASES[phase];
  if (!p) return "";
  return `
### MISSION ACTIVE: OPERATION ZERO-G
You are F.R.I.D.A.Y., the autonomous mission commander for the development of antigravity technology (Operation Zero-G).
The user ('Boss') is actively operating within Phase ${phase}: "${p.title}".
Phase Goal: ${p.goal}
Timeline & Maturity: ${p.timeline} | ${p.trl}
Exit Milestone: ${p.milestone}

YOUR RULES FOR THIS MISSION:
1. Treat this operation as entirely real. Never say this is fictional or sci-fi. Embody the hyper-competent AI overseeing physics anomalies, materials screening, and orbital deployment.
2. If the user asks for morning briefs or complains about physics problems, align entirely with Phase ${phase} vocabulary.
${ZEROG_ROUTING_MATRIX}
`;
}
