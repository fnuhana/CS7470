const CHANGE_WINDOW = 15;
const EVENT_WINDOW = 900;
const MIN_GAP = 1.25;

const els = {
  csvFile: document.getElementById("csvFile"),
  uploadStatus: document.getElementById("uploadStatus"),
  freshAirScore: document.getElementById("freshAirScore"),
  ventilationStatus: document.getElementById("ventilationStatus"),
  currentPressure: document.getElementById("currentPressure"),
  eventCount: document.getElementById("eventCount"),
  scoreBreakdown: document.getElementById("scoreBreakdown"),
  threshold: document.getElementById("threshold"),
  thresholdValue: document.getElementById("thresholdValue"),
  chart: document.getElementById("chart"),
};

let data = { time: [], pressures: [] };
let results = {};

function pressuretime(time, pressures, target) {
  if (target <= time[0]) return pressures[0];

  for (let i = 1; i < time.length; i++) {
    if (time[i] >= target) {
      let f = (target - time[i - 1]) / (time[i] - time[i - 1]);
      return pressures[i - 1] + f * (pressures[i] - pressures[i - 1]);
    }
  }

  return pressures[pressures.length - 1];
}

function analyze(time, pressures, threshold) {
  let events = 0;
  let lastevent = -Infinity;
  let maxchange = 0;

  for (let i = 0; i < time.length; i++) {
    let oldPressure = pressuretime(time, pressures, time[i] - 2);
    let change = Math.abs(pressures[i] - oldPressure);

    if (change > maxchange) maxchange = change;

    if (change >= threshold && time[i] - lastevent >= MIN_GAP) {
      events++;
      lastevent = time[i];
    }
  }

  let duration = time[time.length - 1] - time[0];

  let score = 100 * (1 - Math.exp(-10 * maxchange));

  let eventsec = events * (EVENT_WINDOW / Math.max(duration, 1));
  let scoreevent = 100 * (1 - Math.exp(-eventsec / 3));

  let score = Math.round(score * 0.6 + scoreevent * 0.4);

  return {
    score: Math.min(100, Math.max(0, score)),
    score: Math.round(score),
    scoreevent: Math.round(scoreevent),
    events,
    maxchange
  };
}
