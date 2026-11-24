/**
 * Smart Task & Timeline Planner Engine for HackathonHelper
 */

export const DOMAIN_TASKS_TEMPLATE = {
  Frontend: [
    { title: 'UI Design & Layout System', startHour: 3, endHour: 10, priority: 'critical', desc: 'Build responsive theme, design tokens, and base navigation.' },
    { title: 'React Components Development', startHour: 10, endHour: 24, priority: 'critical', desc: 'Implement modular views, forms, and interactive state containers.' },
    { title: 'Responsive Design & Polish', startHour: 28, endHour: 38, priority: 'high', desc: 'Mobile viewport testing, touch interactions, and animation tuning.' }
  ],
  Backend: [
    { title: 'Authentication & Security', startHour: 2, endHour: 8, priority: 'high', desc: 'OAuth sign-in, session tokens, and route protection guards.' },
    { title: 'Database Schema & Persistence', startHour: 5, endHour: 14, priority: 'critical', desc: 'Firestore collections, data models, indexing, and mock seeding.' },
    { title: 'API Development & Endpoints', startHour: 12, endHour: 26, priority: 'critical', desc: 'REST/WebSocket endpoints, error handling, and payload validators.' }
  ],
  ML: [
    { title: 'Data Preprocessing & Cleaning', startHour: 4, endHour: 12, priority: 'high', desc: 'Ingest datasets, normalize feature vectors, and split test sets.' },
    { title: 'Model Training & Prompt Tuning', startHour: 12, endHour: 26, priority: 'critical', desc: 'Fine-tune LLM prompts and train predictive inference pipelines.' },
    { title: 'Evaluation & Inference API', startHour: 24, endHour: 34, priority: 'critical', desc: 'Benchmark latency, evaluate metrics, and expose inference endpoint.' }
  ],
  'UI/UX': [
    { title: 'Wireframing & User Journey', startHour: 0, endHour: 6, priority: 'critical', desc: 'Map persona flows, screen architectures, and pitch slide layout.' },
    { title: 'Interactive Prototyping', startHour: 6, endHour: 16, priority: 'high', desc: 'Create high-fidelity Figma components and user testing artifacts.' },
    { title: 'Usability Testing & Refinement', startHour: 26, endHour: 36, priority: 'medium', desc: 'Run user walkthroughs, identify friction points, and polish UX.' }
  ],
  DevOps: [
    { title: 'CI/CD Pipeline Setup', startHour: 8, endHour: 16, priority: 'medium', desc: 'Automated test workflows and continuous deployment staging triggers.' },
    { title: 'Cloud Deployment & Hosting', startHour: 30, endHour: 38, priority: 'critical', desc: 'Deploy live frontend/backend instances to cloud with public URLs.' },
    { title: 'Monitoring & Health Checks', startHour: 36, endHour: 44, priority: 'high', desc: 'Setup uptime pings, log aggregation, and fallback redundancy.' }
  ]
};

export const MILESTONES = [
  {
    id: 'm1',
    title: 'Milestone 1: Blueprint & Architecture Lock',
    targetHour: 6,
    domain: 'Kickoff',
    desc: 'Wireframing finalized, tech stack locked, database schema initialized.',
    color: '#6366f1'
  },
  {
    id: 'm2',
    title: 'Milestone 2: Core Engine & Model Sprints',
    targetHour: 20,
    domain: 'MVP Development',
    desc: 'ML models training, core React components functioning, backend CRUD ready.',
    color: '#a855f7'
  },
  {
    id: 'm3',
    title: 'Milestone 3: Full-Stack Integration',
    targetHour: 32,
    domain: 'System Integration',
    desc: 'Frontend connected to backend APIs, model inference verified end-to-end.',
    color: '#00d2ff'
  },
  {
    id: 'm4',
    title: 'Milestone 4: Cloud Deployment & Code Freeze',
    targetHour: 40,
    domain: 'DevOps & QA',
    desc: 'Live deployment verified on cloud, responsive testing, feature freeze.',
    color: '#00f5d4'
  },
  {
    id: 'm5',
    title: 'Milestone 5: Video Demo & Pitch Submission',
    targetHour: 48,
    domain: 'Final Submission',
    desc: '3-minute demo recorded, GitHub README polished, submission portal locked.',
    color: '#f43f5e'
  }
];

export const DOMAIN_COLORS = {
  Frontend: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/40', bar: '#6366f1' },
  Backend: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', bar: '#10b981' },
  ML: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/40', bar: '#ec4899' },
  'UI/UX': { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40', bar: '#f59e0b' },
  DevOps: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/40', bar: '#00f5d4' }
};

/**
 * Generate 48-hour timeline tasks assigned to team members
 */
export function generateSquadTimeline(squadMembers = [], projectName = 'Hackathon Project') {
  // Real active members or self as lead
  const defaultSquad = [
    { displayName: 'You (Leader)', preferredRole: 'FullStack', skills: ['React', 'Python', 'FastAPI'] }
  ];

  const activeMembers = squadMembers.length > 0 ? squadMembers : defaultSquad;

  // Best-match team member for each domain
  const findBestAssignee = (domain) => {
    const matched = activeMembers.find(m => {
      const role = (m.preferredRole || '').toLowerCase();
      const dom = domain.toLowerCase();
      if (dom === 'ui/ux' && (role.includes('design') || role.includes('ui'))) return true;
      if (dom === 'frontend' && (role.includes('front') || role.includes('full'))) return true;
      if (dom === 'backend' && (role.includes('back') || role.includes('full'))) return true;
      if (dom === 'ml' && (role.includes('ml') || role.includes('ai'))) return true;
      if (dom === 'devops' && (role.includes('devops') || role.includes('cloud') || role.includes('back'))) return true;
      return false;
    });

    return matched ? matched.displayName : activeMembers[0].displayName;
  };

  const allTasks = [];
  let taskIdCounter = 1;

  Object.entries(DOMAIN_TASKS_TEMPLATE).forEach(([domain, taskList]) => {
    const assignee = findBestAssignee(domain);
    taskList.forEach(t => {
      allTasks.push({
        id: `task-${taskIdCounter++}`,
        domain,
        title: t.title,
        desc: t.desc,
        startHour: t.startHour,
        endHour: t.endHour,
        duration: t.endHour - t.startHour,
        priority: t.priority,
        status: t.startHour === 0 || t.startHour <= 4 ? 'in-progress' : 'pending',
        assignee
      });
    });
  });

  // Sort by start hour ascending
  allTasks.sort((a, b) => a.startHour - b.startHour);

  return allTasks;
}
