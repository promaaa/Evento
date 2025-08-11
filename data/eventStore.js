const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'events.json');

let events = [];
let nextEventId = 1;

function loadEvents() {
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    events = JSON.parse(raw);
    nextEventId = events.reduce((max, e) => Math.max(max, e.id), 0) + 1;
  } catch (err) {
    events = [];
    nextEventId = 1;
  }
}

function saveEvents() {
  fs.writeFileSync(dataPath, JSON.stringify(events, null, 2));
}

function getEvents() {
  return events;
}

function addEvent(event) {
  event.id = nextEventId++;
  events.push(event);
  saveEvents();
  return event;
}

function findEvent(id) {
  return events.find(e => e.id === id);
}

function deleteEvent(id) {
  const index = events.findIndex(e => e.id === id);
  if (index !== -1) {
    events.splice(index, 1);
    saveEvents();
    return true;
  }
  return false;
}

loadEvents();

module.exports = {
  getEvents,
  addEvent,
  findEvent,
  deleteEvent,
  saveEvents
};
