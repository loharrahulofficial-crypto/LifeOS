import React from 'react';
import { 
  Home, Activity, Target, Dumbbell, Shield, Flame, 
  Swords, HeartPulse, Zap, Trophy, Medal, Crown,
  Repeat, CheckSquare, Crosshair, Dna, BarChart2, Bot,
  Award, Star, Hexagon, Component, Shirt, Orbit, BookOpen,
  Droplet, Sun, Moon, Palette, Music, Edit, Brain, Pill, 
  CheckCircle, Apple, Coffee, Utensils, MoonStar, Footprints, DollarSign,
  Beef, Wheat, Grape, Leaf, Scale, TreePine, Bell, BellOff,
  CloudRain, Waves, Settings, Globe, Search, TrendingUp, X
} from 'lucide-react';

// Maps simple sting codes used in databases to rendered Lucide SVGs
export const IconMap = ({ name, size = 18, className = "" }) => {
  const iconProps = { size, strokeWidth: 2.5, className };

  switch (name) {
    // Nav & System
    case 'home': return <Home {...iconProps} />;
    case 'habits': return <Repeat {...iconProps} />;
    case 'tasks': return <CheckSquare {...iconProps} />;
    case 'focus': return <Crosshair {...iconProps} />;
    case 'nutrition': return <Dna {...iconProps} />;
    case 'gym': return <Dumbbell {...iconProps} />;
    case 'stats': return <BarChart2 {...iconProps} />;
    case 'ai': return <Bot {...iconProps} />;
    case 'logo': return <Orbit {...iconProps} />;

    // Gym Muscle Groups & Categories
    case 'chest': return <Shirt {...iconProps} />;
    case 'back': return <Shield {...iconProps} />;
    case 'arms': return <Swords {...iconProps} />;
    case 'shoulders': return <Component {...iconProps} />;
    case 'legs': return <Hexagon {...iconProps} />;
    case 'core': return <Flame {...iconProps} />;
    case 'cardio': return <HeartPulse {...iconProps} />;
    case 'olympic': return <Dumbbell {...iconProps} />;

    // Ranks & Levels
    case 'wood': return <Hexagon {...iconProps} />;
    case 'silver': return <Medal {...iconProps} />;
    case 'gold': return <Medal {...iconProps} />;
    case 'platinum': return <Award {...iconProps} />;
    case 'diamond': return <Star {...iconProps} />;
    case 'master': return <Crown {...iconProps} />;
    case 'legendary': return <Flame {...iconProps} />;

    // Workout Templates Misc
    case 'upper': return <Swords {...iconProps} />;
    case 'lower': return <Hexagon {...iconProps} />;
    case 'push': return <Activity {...iconProps} />;
    case 'pull': return <Target {...iconProps} />;
    case 'bro': return <Zap {...iconProps} />;

    // Habits & Life
    case 'book': return <BookOpen {...iconProps} />;
    case 'water': return <Droplet {...iconProps} />;
    case 'sun': return <Sun {...iconProps} />;
    case 'moon': return <Moon {...iconProps} />;
    case 'art': return <Palette {...iconProps} />;
    case 'music': return <Music {...iconProps} />;
    case 'write': return <Edit {...iconProps} />;
    case 'brain': return <Brain {...iconProps} />;
    case 'pill': return <Pill {...iconProps} />;
    case 'walk': return <Footprints {...iconProps} />;
    case 'money': return <DollarSign {...iconProps} />;
    case 'apple': return <Apple {...iconProps} />;
    case 'coffee': return <Coffee {...iconProps} />;
    case 'food': return <Utensils {...iconProps} />;
    case 'moonstar': return <MoonStar {...iconProps} />;
    case 'check': return <CheckCircle {...iconProps} />;

    case 'beef': return <Beef {...iconProps} />;
    case 'wheat': return <Wheat {...iconProps} />;
    case 'grape': return <Grape {...iconProps} />;
    case 'leaf': return <Leaf {...iconProps} />;
    case 'scale': return <Scale {...iconProps} />;
    case 'tree': return <TreePine {...iconProps} />;
    case 'bell': return <Bell {...iconProps} />;
    case 'bellOff': return <BellOff {...iconProps} />;
    case 'cloudRain': return <CloudRain {...iconProps} />;
    case 'waves': return <Waves {...iconProps} />;
    case 'settings': return <Settings {...iconProps} />;
    case 'globe': return <Globe {...iconProps} />;
    case 'search': return <Search {...iconProps} />;
    case 'trendingUp': return <TrendingUp {...iconProps} />;
    case 'x': return <X {...iconProps} />;

    default:
      return <Activity {...iconProps} />;
  }
};
