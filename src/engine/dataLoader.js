/**
 * Data Loader - CSV parsing pipeline via PapaParse
 * Loads all 7 CSV files and stores raw data on window for buildAgg()
 */

import Papa from 'papaparse';

export function loadAllData(onProgress) {
  return new Promise((resolve) => {
    const players = new Map();
    const batSeasons = new Map();
    const pitSeasons = new Map();
    const warBatMap = new Map();
    const warPitMap = new Map();
    const warLoaded = { bat: false, pit: false };

    let loaded = 0;
    const totalFiles = 7;
    let finished = false;

    const done = () => {
      if (finished) return;
      finished = true;
      resolve({ players, batSeasons, pitSeasons, warBatMap, warPitMap, warLoaded });
    };

    const safeNext = () => {
      loaded++;
      if (onProgress) onProgress(Math.round((loaded / totalFiles) * 100));
      if (loaded === totalFiles) done();
    };

    // Watchdog timeout
    setTimeout(() => { if (!finished) { console.warn('CSV load watchdog fired'); done(); } }, 15000);

    const parse = (file, callback) => {
      Papa.parse(file, {
        download: true, header: true, dynamicTyping: true, skipEmptyLines: true,
        complete: (result) => {
          try {
            if (result.data && result.data.length) callback(result.data);
            else console.warn('CSV empty:', file);
          } catch (e) { console.warn('Error processing CSV:', file, e); }
          finally { safeNext(); }
        },
        error: (err) => { console.warn('PapaParse error:', file, err); safeNext(); },
      });
    };

    // Store raw data on window for buildAgg() to process
    parse('/data/People.csv', (d) => { window._people = d; });
    parse('/data/Batting.csv', (d) => { window._bat = d; });
    parse('/data/Pitching.csv', (d) => { window._pit = d; });
    parse('/data/Batting_2025.csv', (d) => { window._bat25 = d; });
    parse('/data/Pitching_2025.csv', (d) => { window._pit25 = d; });

    const loadWar = (data, map, type) => {
      if (!data || !data[0]) return;
      try {
        const keys = Object.keys(data[0]);
        const idKey = keys.find((k) => k.toLowerCase().includes('id'));
        const warKey = keys.find((k) => k.toLowerCase().includes('war'));
        if (idKey && warKey) {
          let count = 0;
          data.forEach((r) => {
            const id = (r[idKey] || '').toString().trim();
            const val = Number(r[warKey]);
            if (id && !isNaN(val)) { map.set(id, val); count++; }
          });
          if (count > 0) warLoaded[type] = true;
        }
      } catch (e) { console.warn('WAR load error', type, e); }
    };

    parse('/data/career_war_bat.csv', (d) => { loadWar(d, warBatMap, 'bat'); });
    parse('/data/career_war_pit.csv', (d) => { loadWar(d, warPitMap, 'pit'); });
  });
}
