/**
 * Stats Aggregator - processes raw CSV data into player stats
 * Ported from original buildAgg() function
 */

function getOrCreate(players, id) {
  if (!players.has(id)) {
    players.set(id, {
      id, name: '', bbrefID: '', years: new Set(), decades: new Set(), teams: new Set(),
      AB: 0, H: 0, BB: 0, HBP: 0, SF: 0, HR: 0, _2B: 0, _3B: 0, SB: 0, RBI: 0,
      W: 0, G: 0, GS: 0, ER: 0, IPouts: 0, pitchSO: 0, pitchBB: 0, pitchH: 0,
      stats: null, type: null,
    });
  }
  return players.get(id);
}

export function buildAgg(players, batSeasons, pitSeasons, warBatMap, warPitMap) {
  // The dataLoader stores raw data on the returned object. We need to process it.
  // This function is called after loadAllData, and the raw arrays are stored as window globals
  // or passed through. We'll use the approach where dataLoader passes them through.

  // Process People
  if (window._people) {
    for (let i = 0; i < window._people.length; i++) {
      const r = window._people[i];
      if (!r.playerID) continue;
      const p = getOrCreate(players, r.playerID);
      p.name = (r.nameFirst && r.nameLast) ? (r.nameFirst + ' ' + r.nameLast) : r.playerID;
      p.bbrefID = (r.bbrefID || '').toString().trim();
    }
  }

  const isValidRow = (r) => r.teamID !== 'TOT';

  // Process Batting
  if (window._bat) {
    for (let i = 0; i < window._bat.length; i++) {
      const r = window._bat[i];
      if (!isValidRow(r)) continue;
      const p = getOrCreate(players, r.playerID);
      if (!p) continue;
      p.AB += r.AB || 0; p.H += r.H || 0; p.BB += r.BB || 0; p.HBP += r.HBP || 0;
      p.SF += r.SF || 0; p.HR += r.HR || 0; p.RBI += r.RBI || 0;
      p._2B += r['2B'] || 0; p._3B += r['3B'] || 0; p.SB += r.SB || 0;
      if (r.yearID) {
        p.years.add(r.yearID); p.decades.add(Math.floor(r.yearID / 10) * 10);
        if (!batSeasons.has(p.id)) batSeasons.set(p.id, []);
        batSeasons.get(p.id).push(r);
        if (r.teamID) p.teams.add(r.teamID);
      }
    }
  }

  // Process Pitching
  if (window._pit) {
    for (let i = 0; i < window._pit.length; i++) {
      const r = window._pit[i];
      if (!isValidRow(r)) continue;
      const p = getOrCreate(players, r.playerID);
      if (!p) continue;
      p.W += r.W || 0; p.G += r.G || 0; p.GS += r.GS || 0; p.ER += r.ER || 0; p.IPouts += r.IPouts || 0;
      p.pitchSO = (p.pitchSO || 0) + (r.SO || 0);
      p.pitchBB = (p.pitchBB || 0) + (r.BB || 0);
      p.pitchH = (p.pitchH || 0) + (r.H || 0);
      if (r.yearID) {
        p.years.add(r.yearID); p.decades.add(Math.floor(r.yearID / 10) * 10);
        if (!pitSeasons.has(p.id)) pitSeasons.set(p.id, []);
        pitSeasons.get(p.id).push(r);
        if (r.teamID) p.teams.add(r.teamID);
      }
    }
  }

  // Process 2025 Batting
  if (window._bat25) {
    for (let i = 0; i < window._bat25.length; i++) {
      const r = window._bat25[i];
      const id = r['Player-additional'];
      if (!id) continue;
      if (r.Team && r.Team.includes('TM')) continue;
      const p = getOrCreate(players, id);
      if (!p.name || p.name === id) p.name = r.Player ? r.Player.replace(/[*#]/g, '') : id;
      p.AB += r.AB || 0; p.H += r.H || 0; p.BB += r.BB || 0; p.HBP += r.HBP || 0;
      p.SF += r.SF || 0; p.HR += r.HR || 0; p.RBI += r.RBI || 0;
      p._2B += r['2B'] || 0; p._3B += r['3B'] || 0; p.SB += r.SB || 0;
      p.years.add(2025); p.decades.add(2020);
      if (r.Team) p.teams.add(r.Team);
      const sObj = { yearID: 2025, AB: r.AB, H: r.H, BB: r.BB, HBP: r.HBP, SF: r.SF, HR: r.HR, '2B': r['2B'], '3B': r['3B'], SB: r.SB, SO: r.SO, RBI: r.RBI || 0 };
      if (!batSeasons.has(id)) batSeasons.set(id, []);
      batSeasons.get(id).push(sObj);
    }
  }

  // Process 2025 Pitching
  if (window._pit25) {
    for (let i = 0; i < window._pit25.length; i++) {
      const r = window._pit25[i];
      const id = r['Player-additional'];
      if (!id) continue;
      if (r.Team && r.Team.includes('TM')) continue;
      const p = getOrCreate(players, id);
      if (!p.name || p.name === id) p.name = r.Player ? r.Player.replace(/[*#]/g, '') : id;
      const rawIP = r.IP || 0;
      const ipOuts = Math.floor(rawIP) * 3 + Math.round((rawIP % 1) * 10);
      p.W += r.W || 0; p.G += r.G || 0; p.GS += r.GS || 0; p.ER += r.ER || 0; p.IPouts += ipOuts;
      p.pitchSO += r.SO || 0; p.pitchBB += r.BB || 0; p.pitchH += r.H || 0;
      p.years.add(2025); p.decades.add(2020);
      if (r.Team) p.teams.add(r.Team);
      const sObj = { yearID: 2025, SO: r.SO, ER: r.ER, IPouts: ipOuts, W: r.W, HR: r.HR, BB: r.BB || 0, H: r.H || 0 };
      if (!pitSeasons.has(id)) pitSeasons.set(id, []);
      pitSeasons.get(id).push(sObj);
    }
  }

  // Calculate final stats for every player
  players.forEach((p) => {
    const IP = p.IPouts / 3;
    const PA = p.AB + p.BB + p.HBP + p.SF;
    let sHR = 0, sK = 0, bERA = 0, peakOPS = 0, sSB = 0, sKBat = 0, sW = 0, sHRPit = 0;

    if (batSeasons.has(p.id)) {
      const aggBat = {};
      batSeasons.get(p.id).forEach((y) => {
        const yr = y.yearID;
        if (!aggBat[yr]) aggBat[yr] = { AB: 0, H: 0, BB: 0, HBP: 0, SF: 0, HR: 0, _2B: 0, _3B: 0, SB: 0, SO: 0 };
        aggBat[yr].AB += y.AB || 0; aggBat[yr].H += y.H || 0; aggBat[yr].BB += y.BB || 0;
        aggBat[yr].HBP += y.HBP || 0; aggBat[yr].SF += y.SF || 0; aggBat[yr].HR += y.HR || 0;
        aggBat[yr]._2B += y['2B'] || 0; aggBat[yr]._3B += y['3B'] || 0; aggBat[yr].SB += y.SB || 0;
        aggBat[yr].SO += y.SO || 0;
      });
      for (const yr in aggBat) {
        const d = aggBat[yr];
        if (d.HR > sHR) sHR = d.HR;
        if (d.SB > sSB) sSB = d.SB;
        if (d.SO > sKBat) sKBat = d.SO;
        const yPA = d.AB + d.BB + d.HBP + d.SF;
        if (yPA >= 400) {
          const obp = (d.H + d.BB + d.HBP) / yPA;
          const slg = ((d.H - d._2B - d._3B - d.HR) + (2 * d._2B) + (3 * d._3B) + (4 * d.HR)) / (d.AB || 1);
          if (obp + slg > peakOPS) peakOPS = obp + slg;
        }
      }
    }

    if (pitSeasons.has(p.id)) {
      const aggPit = {};
      pitSeasons.get(p.id).forEach((y) => {
        const yr = y.yearID;
        if (!aggPit[yr]) aggPit[yr] = { SO: 0, ER: 0, IPouts: 0, W: 0, HR: 0 };
        aggPit[yr].SO += y.SO || 0; aggPit[yr].ER += y.ER || 0; aggPit[yr].IPouts += y.IPouts || 0;
        aggPit[yr].W += y.W || 0; aggPit[yr].HR += y.HR || 0;
      });
      for (const yr2 in aggPit) {
        const d2 = aggPit[yr2];
        if (d2.SO > sK) sK = d2.SO;
        if (d2.W > sW) sW = d2.W;
        if (d2.HR > sHRPit) sHRPit = d2.HR;
        const yIP = d2.IPouts / 3;
        if (yIP >= 100) {
          const e = (d2.ER * 9) / yIP;
          if (bERA === 0 || e < bERA) bERA = e;
        }
      }
    }

    const warBat = warBatMap.get(p.bbrefID) || warBatMap.get(p.id) || 0;
    const warPit = warPitMap.get(p.bbrefID) || warPitMap.get(p.id) || 0;
    const whip = IP > 0 ? (p.pitchBB + (p.pitchH || 0)) / IP : 0;

    p.stats = {
      careerHR: p.HR,
      careerBA: p.AB > 0 ? p.H / p.AB : 0,
      careerOPS: (PA > 0 ? (p.H + p.BB + p.HBP) / PA : 0) + (p.AB > 0 ? ((p.H - p._2B - p._3B - p.HR) + 2 * p._2B + 3 * p._3B + 4 * p.HR) / p.AB : 0),
      careerW: p.W, careerERA: IP > 0 ? p.ER * 9 / IP : 0, PA, IP,
      careerSB: p.SB,
      seasonHighHR: sHR, seasonHighK: sK, bestSeasonERA: bERA, peakSeasonOPS: peakOPS,
      seasonHighSB: sSB, seasonHighKBat: sKBat, seasonHighW: sW, seasonHighHRPit: sHRPit,
      careerKBB: p.pitchBB > 0 ? p.pitchSO / p.pitchBB : 0,
      careerXBHRate: p.H > 0 ? (p._2B + p._3B + p.HR) / p.H : 0,
      careerIP: IP,
      careerWARBat: warBat,
      careerWARPit: warPit + warBat,
      careerBB: p.BB,
      careerWHIP: whip,
      careerH: p.H,
      careerRBI: p.RBI,
      careerSO: p.pitchSO,
    };

    p.type = (IP + p.W * 3 + p.GS * 2) > (PA + p.HR * 10 + p.AB) ? 'pitcher' : 'hitter';
  });
}

function parsePlayerName(name) {
  const parts = name.split(' ');
  const first = parts[0] || '';
  const lastParts = [];
  for (let i = parts.length - 1; i >= 1; i--) {
    if (/^[A-Za-z]\.$/.test(parts[i])) break;
    lastParts.unshift(parts[i]);
  }
  const last = lastParts.join(' ') || (parts.length > 1 ? parts[parts.length - 1] : '');
  return { first, last };
}

export function buildPlayerNameIndex(players) {
  const index = [];
  players.forEach((p) => {
    if (!p.stats || !p.name || p.name === p.id) return;
    const parsed = parsePlayerName(p.name);
    const yrs = Array.from(p.years);
    const minY = yrs.length ? Math.min(...yrs) : 0;
    const maxY = yrs.length ? Math.max(...yrs) : 0;
    index.push({
      id: p.id, name: p.name, nameFirst: parsed.first, nameLast: parsed.last,
      minYear: minY, maxYear: maxY, type: p.type,
    });
  });
  index.sort((a, b) => a.nameLast.localeCompare(b.nameLast) || a.nameFirst.localeCompare(b.nameFirst));
  return index;
}
