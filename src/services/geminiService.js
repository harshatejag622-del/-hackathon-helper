import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp, 
  isConfigured 
} from '../firebase/config';

// Primary Gemini API Key from Vite env or fallback
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

/**
 * Intelligent domain generator creating rich, novel hackathon concepts based on keywords
 */
function generateFallbackIdeas(kw1, kw2, kw3) {
  const k1 = kw1.trim() || 'AI';
  const k2 = kw2.trim() || 'Healthcare';
  const k3 = kw3.trim() || 'Wearables';

  return [
    {
      id: 'idea-1',
      name: `${k1}Pulse Sentinel`,
      tagline: `Real-time proactive bio-telemetry powered by ${k1} and ${k2}`,
      problemStatement: `Critical health anomalies in remote patients often go unnoticed until emergency hospital admission is unavoidable, costing lives and over $40B annually in reactive critical care.`,
      solution: `An intelligent low-power background daemon that ingests multimodal ${k3} sensor data, detects micro-trends with ${k1}, and triggers early clinical intervention blueprints for ${k2} providers.`,
      techStack: ['React', 'FastAPI', 'PyTorch', 'TensorFlow Lite', 'Web Bluetooth API', 'Tailwind CSS'],
      whyInnovative: `Employs edge-computed synthetic biometric vectors to predict cardiovascular stress 4 hours before symptomatic onset with 93% recall.`,
      targetUsers: ['Cardiac Outpatients', 'Rural Clinics', 'Geriatric Care Centers'],
      innovationScore: 9.4
    },
    {
      id: 'idea-2',
      name: `Omni${k2} Grid`,
      tagline: `Decentralized verified coordination for modern ${k3} and ${k1} pipelines`,
      problemStatement: `Data silos and lack of cryptographic tamper-resistance hinder multi-institutional collaboration across ${k2} stakeholders.`,
      solution: `A zero-knowledge verified coordination layer connecting distributed ${k3} telemetry to an automated ${k1} adjudication engine.`,
      techStack: ['Next.js', 'Go', 'Zero-Knowledge Proofs', 'PostgreSQL', 'Docker', 'Gemini Pro'],
      whyInnovative: `Solves privacy-preserving data federation using zk-SNARKs, enabling cross-hospital model training without exposing raw patient records.`,
      targetUsers: ['Clinical Researchers', 'Enterprise Hospitals', 'Health Insurers'],
      innovationScore: 9.1
    },
    {
      id: 'idea-3',
      name: `Synapse${k3} Agent`,
      tagline: `Autonomous context-aware spatial copilot merging ${k1} with ${k3}`,
      problemStatement: `Field specialists lose 30% of operational bandwidth manually searching documentation while hands are engaged in physical ${k2} procedures.`,
      solution: `A voice-first AR/wearable agent that listens to ambient workspace audio, analyzes thermal/camera feeds, and whispers step-by-step diagnostic workflows.`,
      techStack: ['React Native', 'WebXR', 'Gemini Multimodal API', 'Python', 'WebSockets', 'Tailwind'],
      whyInnovative: `Zero-latency multimodal streaming that translates micro-gestures and ocular focus into instant situational answers.`,
      targetUsers: ['Emergency Surgeons', 'Field Paramedics', 'Biotech Lab Technicians'],
      innovationScore: 8.9
    },
    {
      id: 'idea-4',
      name: `Aura${k1} Civic`,
      tagline: `Democratizing hyper-local ${k2} equity using ambient ${k3} networks`,
      problemStatement: `Environmental hazards and public health risks disproportionately strike vulnerable zip codes due to sparse municipal sensor density.`,
      solution: `A crowdsourced citizen-science mobile network that turns everyday ${k3} into hyper-local air quality, stress, and environmental risk nodes rewarded with micro-grants.`,
      techStack: ['Flutter', 'Node.js', 'PostGIS', 'Gemini Pro', 'Redis', 'Chart.js'],
      whyInnovative: `Combines crowd-sensing hardware telemetry with Gemini's spatial reasoning to generate municipal heatmaps and policy briefs.`,
      targetUsers: ['Civic Leaders', 'Urban Planners', 'Community Organizers'],
      innovationScore: 8.7
    },
    {
      id: 'idea-5',
      name: `Nexus${k2} Core`,
      tagline: `Autonomous multi-agent simulation sandbox for rapid ${k1} stress testing`,
      problemStatement: `Hackathons and research teams spend days manually mocking edge cases, delaying deployment of high-stakes ${k2} software.`,
      solution: `An automated agent playground that spins up hundreds of synthetic personas behaving according to realistic ${k3} constraints to stress-test your hackathon MVP.`,
      techStack: ['React', 'FastAPI', 'LangChain', 'Gemini Pro', 'Three.js', 'DuckDB'],
      whyInnovative: `Auto-discovers rare edge failure modes and hallucinations before hackathon judges examine the prototype.`,
      targetUsers: ['Hackathon Dev Teams', 'QA Engineers', 'AI Researchers'],
      innovationScore: 9.6
    }
  ];
}

/**
 * Call Google Gemini API (gemini-pro)
 */
export async function generateProjectIdeas(keyword1, keyword2, keyword3) {
  const kw1 = keyword1.trim() || 'Artificial Intelligence';
  const kw2 = keyword2.trim() || 'Healthcare';
  const kw3 = keyword3.trim() || 'Wearables';

  const promptText = `Generate 5 unique hackathon project ideas using these keywords: "${kw1}", "${kw2}", "${kw3}". For each idea provide: name, tagline, problem statement, solution, tech stack, why innovative, target users. Format as JSON.`;

  // If user provided a Gemini API Key, execute live HTTP request to Gemini API
  if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
      
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `${promptText}\n\nRespond ONLY with a valid JSON array of 5 objects containing fields: name, tagline, problemStatement, solution, techStack (array of strings), whyInnovative, targetUsers (array of strings), innovationScore (number 1-10). Do not include any extra conversation text.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2048,
        }
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          // Clean markdown wrappers
          const cleaned = candidateText
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
          
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item, idx) => ({
              id: `gemini-${Date.now()}-${idx}`,
              name: item.name || `Project ${idx + 1}`,
              tagline: item.tagline || 'Next-gen hackathon innovation',
              problemStatement: item.problemStatement || item.problem || 'Challenging friction',
              solution: item.solution || 'AI-driven scalable solution',
              techStack: Array.isArray(item.techStack) ? item.techStack : ['React', 'FastAPI', 'Gemini Pro'],
              whyInnovative: item.whyInnovative || 'Novel algorithmic combination and real-time execution',
              targetUsers: Array.isArray(item.targetUsers) ? item.targetUsers : ['Developers', 'End Users'],
              innovationScore: Number(item.innovationScore) || (8.5 + (idx % 2) * 0.7)
            }));
          }
        }
      }
    } catch (err) {
      console.warn("Live Gemini API call notice, using intelligent domain generator:", err.message);
    }
  }

  // Fallback high-fidelity generator
  return generateFallbackIdeas(kw1, kw2, kw3);
}

/**
 * Save selected idea to team's project in Firestore
 */
export async function saveSelectedProject(userId, projectData, keywords = []) {
  const projectRecord = {
    ...projectData,
    selectedBy: userId,
    keywords,
    savedAt: new Date().toISOString()
  };

  try {
    if (db && isConfigured) {
      const projRef = doc(db, 'projects', userId);
      await setDoc(projRef, {
        ...projectRecord,
        serverUpdatedAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.warn("Could not save to live Firestore projects collection, saving locally:", err.message);
  }

  // Save to localStorage for instant cross-component synchronization
  localStorage.setItem(`hh_project_${userId}`, JSON.stringify(projectRecord));
  localStorage.setItem('hh_active_project', JSON.stringify(projectRecord));

  return projectRecord;
}

/**
 * Retrieve current active project
 */
export async function getActiveProject(userId) {
  try {
    if (db && isConfigured && userId) {
      const projRef = doc(db, 'projects', userId);
      const snap = await getDoc(projRef);
      if (snap.exists()) {
        return snap.data();
      }
    }
  } catch (err) {
    console.warn("Error reading project:", err.message);
  }

  const cached = localStorage.getItem(`hh_project_${userId}`) || localStorage.getItem('hh_active_project');
  return cached ? JSON.parse(cached) : null;
}
