export function formatDate(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function formatDisplayDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });
}

export function formatFullDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });
}

export function getToday() {
  return formatDate(new Date());
}

export function getWeekDates(referenceDate) {
  const d = new Date(referenceDate);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const curr = new Date(monday);
    curr.setDate(monday.getDate() + i);
    dates.push(formatDate(curr));
  }
  return dates;
}

export function getMonthDates(year, month) {
  const dates = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Pad start to Monday
  const startPad = (firstDay.getDay() + 6) % 7;
  for (let i = startPad; i > 0; i--) {
    const d = new Date(firstDay);
    d.setDate(d.getDate() - i);
    dates.push({ date: formatDate(d), inMonth: false });
  }
  
  for (let d = 1; d <= lastDay.getDate(); d++) {
    dates.push({ date: formatDate(new Date(year, month, d)), inMonth: true });
  }
  
  // Pad end
  const remaining = 7 - (dates.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(lastDay);
      d.setDate(lastDay.getDate() + i);
      dates.push({ date: formatDate(d), inMonth: false });
    }
  }
  
  return dates;
}

export function get52WeekGrid() {
  const today = new Date();
  const grid = [];
  
  // Start from 52 weeks ago, aligned to Sunday
  const start = new Date(today);
  start.setDate(today.getDate() - 363); // ~52 weeks
  // Align to Sunday
  start.setDate(start.getDate() - start.getDay());
  
  for (let week = 0; week < 53; week++) {
    const weekDates = [];
    for (let day = 0; day < 7; day++) {
      const d = new Date(start);
      d.setDate(start.getDate() + week * 7 + day);
      if (d <= today) {
        weekDates.push(formatDate(d));
      } else {
        weekDates.push(null);
      }
    }
    grid.push(weekDates);
  }
  
  return grid;
}

export function getDaysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

export function getLastNDays(n) {
  const dates = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
}

export function getDayName(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
}

export function getMonthName(month) {
  return new Date(2024, month).toLocaleDateString('en-US', { month: 'long' });
}

export function isToday(dateStr) {
  return dateStr === getToday();
}

export function isPast(dateStr) {
  return dateStr < getToday();
}
