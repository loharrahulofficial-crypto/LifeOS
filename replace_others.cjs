const fs = require('fs');

const run = () => {
    // 1. PomodoroTimer.jsx
    let pomo = fs.readFileSync('s:/App project/src/components/PomodoroTimer.jsx', 'utf8');
    if (!pomo.includes('IconMap')) {
      pomo = pomo.replace(/import \{ PRESETS, DEFAULT_SETTINGS/g, "import { IconMap } from '../utils/IconMap';\nimport { PRESETS, DEFAULT_SETTINGS");
    }
    
    // Replace emojis
    pomo = pomo.replace(/'🎯 Focus'/g, "'Focus'");
    pomo = pomo.replace(/'☕ Short Break'/g, "'Short Break'");
    pomo = pomo.replace(/'🌴 Long Break'/g, "'Long Break'");
    pomo = pomo.replace(/🎯/g, "<IconMap name='focus' size={24} />");
    pomo = pomo.replace(/☕/g, "<IconMap name='coffee' size={24} />");
    pomo = pomo.replace(/🌴/g, "<IconMap name='tree' size={24} />");
    pomo = pomo.replace(/>🔔</g, "><IconMap name='bell' size={18} /><");
    pomo = pomo.replace(/>🔇</g, "><IconMap name='bellOff' size={18} /><");
    pomo = pomo.replace(/>🎧</g, "><IconMap name='music' size={18} /><");
    pomo = pomo.replace(/>🌧</g, "><IconMap name='cloudRain' size={18} /><");
    pomo = pomo.replace(/>🌊</g, "><IconMap name='waves' size={18} /><");
    pomo = pomo.replace(/>🧠</g, "><IconMap name='brain' size={18} /><");
    pomo = pomo.replace(/>⚙/g, "><IconMap name='settings' size={18} /><");
    
    fs.writeFileSync('s:/App project/src/components/PomodoroTimer.jsx', pomo);

    // 2. NutritionLog.jsx
    let nut = fs.readFileSync('s:/App project/src/components/NutritionLog.jsx', 'utf8');
    if (!nut.includes('IconMap')) {
      nut = nut.replace(/import \{ NUTRIENT_GOALS \} from '\\.\\.\\/data\\/nutritionDbs';/g, "import { NUTRIENT_GOALS } from '../data/nutritionDbs';\nimport { IconMap } from '../utils/IconMap';");
    }
    
    nut = nut.replace(/>🔥</g, "><IconMap name='flame' size={24} /><");
    nut = nut.replace(/🥩/g, "<IconMap name='beef' size={20} />");
    nut = nut.replace(/🍞/g, "<IconMap name='wheat' size={20} />");
    nut = nut.replace(/🥑/g, "<IconMap name='grape' size={20} />");
    nut = nut.replace(/🥬/g, "<IconMap name='leaf' size={20} />");
    nut = nut.replace(/>💧</g, "><IconMap name='water' size={20} /><");
    nut = nut.replace(/>⚖</g, "><IconMap name='scale' size={20} /><");
    nut = nut.replace(/>✕</g, "><IconMap name='x' size={14} /><");
    nut = nut.replace(/>🥗</g, "><IconMap name='food' size={20} /><");
    nut = nut.replace(/>⚙</g, "><IconMap name='settings' size={20} /><");
    nut = nut.replace(/>🌍</g, "><IconMap name='globe' size={20} /><");
    nut = nut.replace(/>🔍</g, "><IconMap name='search' size={20} /><");
    nut = nut.replace(/>📝</g, "><IconMap name='edit' size={20} /><");
    nut = nut.replace(/>📊</g, "><IconMap name='barChart2' size={20} /><");
    nut = nut.replace(/>🎯</g, "><IconMap name='target' size={20} /><");
    nut = nut.replace(/>🍴</g, "><IconMap name='utensils' size={20} /><");
    nut = nut.replace(/>✓</g, "><IconMap name='check' size={14} /><");

    fs.writeFileSync('s:/App project/src/components/NutritionLog.jsx', nut);

    // 3. StatsPanel.jsx
    let stat = fs.readFileSync('s:/App project/src/components/StatsPanel.jsx', 'utf8');
    if (!stat.includes('IconMap')) {
      stat = stat.replace(/import React from 'react';/, "import React from 'react';\nimport { IconMap } from '../utils/IconMap';");
    }

    stat = stat.replace(/>📈</g, "><IconMap name='trendingUp' size={24} /><");
    stat = stat.replace(/>🔥</g, "><IconMap name='flame' size={24} /><");
    stat = stat.replace(/>🎯</g, "><IconMap name='target' size={24} /><");
    stat = stat.replace(/>⚡</g, "><IconMap name='zap' size={24} /><");
    stat = stat.replace(/>📊</g, "><IconMap name='barChart2' size={24} /><");
    stat = stat.replace(/>🏆</g, "><IconMap name='trophy' size={24} /><");
    stat = stat.replace(/>👑</g, "><IconMap name='crown' size={24} /><");

    fs.writeFileSync('s:/App project/src/components/StatsPanel.jsx', stat);
    console.log('Other modules updated.');
};
run();
