"use strict";
// Source distribution adapter. When storage is denied, script.js falls back to memory.
window.motherGoldRateCache = {
  read: (key) => JSON.parse(window.localStorage.getItem(key)),
  write: (key, value) => window.localStorage.setItem(key, JSON.stringify(value))
};
