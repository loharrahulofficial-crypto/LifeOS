const fs = require('fs');
let code = fs.readFileSync('s:/App project/src/components/GymTracker.jsx', 'utf8');

code = code.replace(/import \{ createPortal \} from 'react-dom';/, "import { createPortal } from 'react-dom';\nimport { IconMap } from '../utils/IconMap';");

// StatCard rendering
code = code.replace(/<div style={{ fontSize: '1\\.4rem', marginBottom: '0\\.2rem' }}>\{icon\}<\/div>/g, 
  "<div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.3rem', color: 'var(--accent)' }}><IconMap name={icon} size={24} /></div>");

// getRank icons
code = code.replace(/icon: '🔥'/g, "icon: 'legendary'");
code = code.replace(/icon: '🔮'/g, "icon: 'master'");
code = code.replace(/icon: '💎'/g, "icon: 'diamond'");
code = code.replace(/icon: '💠'/g, "icon: 'platinum'");
code = code.replace(/icon: '🥇'/g, "icon: 'gold'");
code = code.replace(/icon: '🥈'/g, "icon: 'silver'");
code = code.replace(/icon: '🪵'/g, "icon: 'wood'");

// Muscle group fallbacks: {MUSCLE_GROUPS[m]?.icon || '🏋️'} -> IconMap
code = code.replace(/\{MUSCLE_GROUPS\[([^\]]+)\]\?\\.icon \|\| '🏋️'\}/g, "<IconMap name={MUSCLE_GROUPS[$1]?.icon || 'gym'} size={24} />");
code = code.replace(/\{mg\?\\.icon \|\| '🏋️'\}/g, "<IconMap name={mg?.icon || 'gym'} size={24} />");
code = code.replace(/\{mg\.icon\}/g, "<IconMap name={mg.icon} size={48} />");
code = code.replace(/\{MUSCLE_GROUPS\[exInfo\.muscle\]\?\\.icon \|\| '🏋️'\}/g, "<IconMap name={MUSCLE_GROUPS[exInfo.muscle]?.icon || 'gym'} size={24} />");

// Search & buttons
code = code.replace(/'🔍 Search/g, "'Search");
code = code.replace(/>🔍</g, "><IconMap name='focus' size={48} /><");
code = code.replace(/>⊕/g, "><IconMap name='focus' size={18} />");
code = code.replace(/>✓</g, "><IconMap name='tasks' size={14} /><");
code = code.replace(/>○</g, "><IconMap name='home' size={14} /><");
code = code.replace(/>✕</g, "><IconMap name='focus' size={14} /><"); 
code = code.replace(/>⏱ Rest/g, "><IconMap name='focus' size={14} /> Rest");
code = code.replace(/>📝 Add notes/g, ">Add notes");
code = code.replace(/>🏁 Finish Workout/g, "><IconMap name='tasks' size={18} /> Finish Workout");
code = code.replace(/>🏆</g, "><IconMap name='gold' size={48} /><");
code = code.replace(/>🏁 Finish/g, "><IconMap name='tasks' size={18} /> Finish");
code = code.replace(/>▶ Start Workout/g, "><IconMap name='focus' size={18} /> Start Workout");
code = code.replace(/>💾 Save Workout Plan/g, "><IconMap name='tasks' size={18} /> Save Workout Plan");
code = code.replace(/>🏆 PERSONAL RECORDS/g, ">Personal Records");
code = code.replace(/>🌟</g, "><IconMap name='star' size={40} /><");

// Template icons
code = code.replace(/\{t\.icon\}/g, "<IconMap name={t.icon} size={24} />");
code = code.replace(/\{template\.icon\}/g, "<IconMap name={template.icon} size={24} />");

// Start Empty Session
code = code.replace(/icon: '⚡'/g, "icon: 'zap'");

// Replace {n.icon} in UI
code = code.replace(/>\{n\.icon\}</g, "><IconMap name={n.icon} size={16} /><");

// NAV array
code = code.replace(/icon: '📈'/g, "icon: 'stats'");
code = code.replace(/icon: '🏠'/g, "icon: 'home'");
code = code.replace(/icon: '📋'/g, "icon: 'tasks'");
code = code.replace(/icon: '🔍'/g, "icon: 'focus'");
code = code.replace(/icon: '📊'/g, "icon: 'habits'"); 
code = code.replace(/icon: '⚡'/g, "icon: 'zap'");

// Specific StatCards
code = code.replace(/icon="🏋️"/g, 'icon="gym"');
code = code.replace(/icon="🔥"/g, 'icon="core"');
code = code.replace(/icon="📊"/g, 'icon="stats"');
code = code.replace(/icon="✅"/g, 'icon="tasks"');

fs.writeFileSync('s:/App project/src/components/GymTracker.jsx', code);
console.log('Replacements done in GymTracker.jsx');
