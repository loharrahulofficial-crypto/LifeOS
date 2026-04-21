import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

// Per-level title — every level gets its own unique name & color
const LEVEL_TITLES = [
  // 1-10: Beginner arc
  { title: "Lost Soul",          color: "#6b7280" },  // 1
  { title: "Awakening",         color: "#71717a" },  // 2
  { title: "Wanderer",          color: "#78716c" },  // 3
  { title: "Seeker",            color: "#94a3b8" },  // 4
  { title: "Novice Hunter",     color: "#94a3b8" },  // 5
  { title: "Iron Will",         color: "#7dd3fc" },  // 6
  { title: "Rising Star",       color: "#38bdf8" },  // 7
  { title: "Challenger",        color: "#0ea5e9" },  // 8
  { title: "Brave Soul",        color: "#0284c7" },  // 9
  { title: "Awakened",          color: "#22d3ee" },  // 10

  // 11-20: Bronze arc
  { title: "Bronze Fighter",    color: "#a78bfa" },  // 11
  { title: "Apprentice",        color: "#8b5cf6" },  // 12
  { title: "Ember Knight",      color: "#7c3aed" },  // 13
  { title: "Shadow Striker",    color: "#6d28d9" },  // 14
  { title: "Chain Breaker",     color: "#5b21b6" },  // 15
  { title: "Spirit Warrior",    color: "#4ade80" },  // 16
  { title: "Green Ronin",       color: "#22c55e" },  // 17
  { title: "Forest Walker",     color: "#16a34a" },  // 18
  { title: "Earth Guard",       color: "#15803d" },  // 19
  { title: "Fierce Warrior",    color: "#2dd4bf" },  // 20

  // 21-30: Silver arc
  { title: "Silver Fang",       color: "#fbbf24" },  // 21
  { title: "Storm Rider",       color: "#f59e0b" },  // 22
  { title: "Thunder Step",      color: "#d97706" },  // 23
  { title: "Volt Striker",      color: "#b45309" },  // 24
  { title: "War Hound",         color: "#92400e" },  // 25
  { title: "Iron Phantom",      color: "#fb923c" },  // 26
  { title: "Blazing Fist",      color: "#f97316" },  // 27
  { title: "Crimson Edge",      color: "#ef4444" },  // 28
  { title: "Red Specter",       color: "#dc2626" },  // 29
  { title: "Elite Hunter",      color: "#facc15" },  // 30

  // 31-40: Gold arc
  { title: "Gold Sentinel",     color: "#eab308" },  // 31
  { title: "Dusk Phantom",      color: "#ca8a04" },  // 32
  { title: "Night Blade",       color: "#a16207" },  // 33
  { title: "Shadow King",       color: "#854d0e" },  // 34
  { title: "Cursed Knight",     color: "#ec4899" },  // 35
  { title: "Blood Ronin",       color: "#db2777" },  // 36
  { title: "Chaos Bringer",     color: "#be185d" },  // 37
  { title: "Void Walker",       color: "#9d174d" },  // 38
  { title: "Demon Eye",         color: "#831843" },  // 39
  { title: "Rogue Slayer",      color: "#e879f9" },  // 40

  // 41-50: Platinum arc
  { title: "Phantom Lord",      color: "#d946ef" },  // 41
  { title: "Ethereal Fighter",  color: "#c026d3" },  // 42
  { title: "Soul Reaper",       color: "#a21caf" },  // 43
  { title: "Rift Caller",       color: "#86198f" },  // 44
  { title: "Master Shinobi",    color: "#fb923c" },  // 45
  { title: "Dragon Claw",       color: "#f97316" },  // 46
  { title: "War God Initiate",  color: "#ea580c" },  // 47
  { title: "Infernal Blade",    color: "#c2410c" },  // 48
  { title: "Titan Guard",       color: "#9a3412" },  // 49
  { title: "Storm Sovereign",   color: "#7c2d12" },  // 50

  // 51-60: Diamond arc
  { title: "Diamond Edge",      color: "#06b6d4" },  // 51
  { title: "Astral Knight",     color: "#0891b2" },  // 52
  { title: "Celestial Striker", color: "#0e7490" },  // 53
  { title: "Star Crusher",      color: "#155e75" },  // 54
  { title: "Radiant Duelist",   color: "#67e8f9" },  // 55
  { title: "Nova Sentinel",     color: "#22d3ee" },  // 56
  { title: "Cosmo Blade",       color: "#a5f3fc" },  // 57
  { title: "Void Emperor",      color: "#14b8a6" },  // 58
  { title: "Cosmos Walker",     color: "#0d9488" },  // 59
  { title: "Grandmaster",       color: "#a78bfa" },  // 60

  // 61-70: Master arc
  { title: "Purple Monarch",    color: "#9333ea" },  // 61
  { title: "Ancient Warrior",   color: "#7e22ce" },  // 62
  { title: "Eternal Phantom",   color: "#6b21a8" },  // 63
  { title: "Abyss Lord",        color: "#581c87" },  // 64
  { title: "Transcendent",      color: "#f0abfc" },  // 65
  { title: "Forbidden One",     color: "#e879f9" },  // 66
  { title: "Cursed Sovereign",  color: "#d946ef" },  // 67
  { title: "Wrath Incarnate",   color: "#c026d3" },  // 68
  { title: "Destruction God",   color: "#a21caf" },  // 69
  { title: "Mythical Hero",     color: "#ec4899" },  // 70

  // 71-80: Legendary arc
  { title: "Myth Slayer",       color: "#f43f5e" },  // 71
  { title: "Calamity Bringer",  color: "#e11d48" },  // 72
  { title: "Chaos Incarnate",   color: "#be123c" },  // 73
  { title: "Demon Lord",        color: "#9f1239" },  // 74
  { title: "Undying Titan",     color: "#881337" },  // 75
  { title: "Blood God",         color: "#fca5a5" },  // 76
  { title: "Eternal Sovereign", color: "#f87171" },  // 77
  { title: "Domain Master",     color: "#ef4444" },  // 78
  { title: "Ascended Being",    color: "#dc2626" },  // 79
  { title: "Legendary Being",   color: "#ef4444" },  // 80

  // 81-90: God arc
  { title: "God-Touched",       color: "#fde68a" },  // 81
  { title: "Divine Warrior",    color: "#fcd34d" },  // 82
  { title: "Heaven Pierce",     color: "#fbbf24" },  // 83
  { title: "Solar God",         color: "#f59e0b" },  // 84
  { title: "Pantheon Guard",    color: "#d97706" },  // 85
  { title: "Apex Predator",     color: "#b45309" },  // 86
  { title: "Beyond Legend",     color: "#92400e" },  // 87
  { title: "Chaos God",         color: "#7c2d12" },  // 88
  { title: "Supreme Being",     color: "#fef3c7" },  // 89
  { title: "Absolute Ruler",    color: "#fed7aa" },  // 90

  // 91-99+: Protocol God arc
  { title: "World Ender",       color: "#ff6b6b" },  // 91
  { title: "Void God",          color: "#ee5a24" },  // 92
  { title: "Primordial",        color: "#e55039" },  // 93
  { title: "Origin Breaker",    color: "#c0392b" },  // 94
  { title: "Forbidden God",     color: "#922b21" },  // 95
  { title: "System Override",   color: "#641e16" },  // 96
  { title: "Law Destroyer",     color: "#ff4757" },  // 97
  { title: "Limit Breaker",     color: "#ff6348" },  // 98
  { title: "God of Protocol",   color: "#b91c1c" },  // 99
];

// Get rank for a given level
function getRank(level) {
  const idx = Math.min(level - 1, LEVEL_TITLES.length - 1);
  return LEVEL_TITLES[Math.max(0, idx)];
}


export function useLevelSystem() {
  const [xp, setXP] = useLocalStorage('lifeos-gamify-xp', 0);
  const [stats, setStats] = useLocalStorage('lifeos-gamify-stats', {
    str: 10, // Gym
    int: 10, // Focus
    agi: 10, // Habits
    vit: 10, // Nutrition
  });

  const level = useMemo(() => {
    // Basic scaling: level 1 = 0 XP, level 2 = 100 XP, level 3 = 300 XP, level 4 = 600 XP (n*(n+1)/2 * 100)
    // Formula: XP = (L * (L - 1) / 2) * 100 
    // Solving for L: L^2 - L - 2*XP/100 = 0 -> L = (1 + sqrt(1 + 8*XP/100)) / 2
    return Math.max(1, Math.floor((1 + Math.sqrt(1 + 8 * (xp / 100))) / 2));
  }, [xp]);

  const currentLevelXP = useMemo(() => {
    return (level * (level - 1) / 2) * 100;
  }, [level]);

  const nextLevelXP = useMemo(() => {
    return ((level + 1) * level / 2) * 100;
  }, [level]);

  const progressPercent = useMemo(() => {
    const totalNeeded = nextLevelXP - currentLevelXP;
    const currentProgress = xp - currentLevelXP;
    return Math.min(100, Math.max(0, (currentProgress / totalNeeded) * 100));
  }, [xp, currentLevelXP, nextLevelXP]);

  const rank = useMemo(() => getRank(level), [level]);

  const addXP = useCallback((amount) => {
    setXP(prev => prev + amount);
  }, [setXP]);

  const updateStat = useCallback((statName, amount) => {
    setStats(prev => ({
      ...prev,
      [statName]: prev[statName] + amount
    }));
  }, [setStats]);

  return {
    xp,
    level,
    rank,
    stats,
    currentLevelXP,
    nextLevelXP,
    progressPercent,
    addXP,
    updateStat
  };
}
