/**
 * PitchMind API client — replaces tRPC.
 * All calls go to /api/* (proxied to localhost:8787 in dev, same origin in prod).
 */

const BASE = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? 'https://pitchmind.realdo.org'
  : '';

export async function apiRecap(user: string) {
  const r = await fetch(`${BASE}/api/recap?user=${encodeURIComponent(user)}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{
    scored: ScoredPick[];
    record: RecordSummary;
  }>;
}

export async function apiPredict(payload: {
  user: string;
  matchId: string;
  home: string;
  away: string;
  pick: 'HOME' | 'AWAY' | 'DRAW';
  confidence: number;
  take?: string;
}) {
  const r = await fetch(`${BASE}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ blob_id: string }>;
}

export async function apiRoast(user: string, day = 1) {
  const r = await fetch(`${BASE}/api/roast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, day }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ roast: string; record: RecordSummary; blob_id: string }>;
}

export async function apiHealth() {
  const r = await fetch(`${BASE}/api/health`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface ScoredPick {
  user: string;
  matchId: string;
  home: string;
  away: string;
  pick: 'HOME' | 'AWAY' | 'DRAW';
  confidence: number;
  take: string;
  ts: string;
  correct: boolean | null;
  actual?: 'HOME' | 'AWAY' | 'DRAW';
}

export interface RecordSummary {
  user: string;
  total: number;
  decided: number;
  correct: number;
  accuracy: number;
  avgConfidence: number;
  overconfidentMisses: number;
  byTeamPicked: Record<string, { picks: number; correct: number }>;
}

// ── WC2026 Real Schedule ───────────────────────────────────────────────────

export interface Match {
  id: string;
  date: string;
  time: string;
  home: string;
  away: string;
  venue: string;
}

export const SCHEDULE: Match[] = [
  { id: "MEX-SOU",  date: "2026-06-11", time: "19:00", home: "Mexico",              away: "South Africa",        venue: "Estadio Banorte" },
  { id: "SOU-CZE",  date: "2026-06-12", time: "02:00", home: "South Korea",         away: "Czechia",             venue: "MetLife Stadium" },
  { id: "CAN-BOS",  date: "2026-06-12", time: "19:00", home: "Canada",              away: "Bosnia-Herzegovina",  venue: "BC Place" },
  { id: "UNI-PAR",  date: "2026-06-13", time: "01:00", home: "United States",       away: "Paraguay",            venue: "SoFi Stadium" },
  { id: "QAT-SWI",  date: "2026-06-13", time: "19:00", home: "Qatar",               away: "Switzerland",         venue: "AT&T Stadium" },
  { id: "BRA-MOR",  date: "2026-06-13", time: "22:00", home: "Brazil",              away: "Morocco",             venue: "MetLife Stadium" },
  { id: "HAI-SCO",  date: "2026-06-14", time: "01:00", home: "Haiti",               away: "Scotland",            venue: "Arrowhead Stadium" },
  { id: "AUS-TUR",  date: "2026-06-14", time: "04:00", home: "Australia",           away: "Türkiye",             venue: "SoFi Stadium" },
  { id: "GER-CUR",  date: "2026-06-14", time: "17:00", home: "Germany",             away: "Curaçao",             venue: "MetLife Stadium" },
  { id: "NET-JAP",  date: "2026-06-14", time: "20:00", home: "Netherlands",         away: "Japan",               venue: "Levi's Stadium" },
  { id: "IVO-ECU",  date: "2026-06-14", time: "23:00", home: "Ivory Coast",         away: "Ecuador",             venue: "AT&T Stadium" },
  { id: "SWE-TUN",  date: "2026-06-15", time: "02:00", home: "Sweden",              away: "Tunisia",             venue: "Hard Rock Stadium" },
  { id: "SPA-CAP",  date: "2026-06-15", time: "16:00", home: "Spain",               away: "Cape Verde",          venue: "Rose Bowl" },
  { id: "BEL-EGY",  date: "2026-06-15", time: "19:00", home: "Belgium",             away: "Egypt",               venue: "Gillette Stadium" },
  { id: "SAU-URU",  date: "2026-06-15", time: "22:00", home: "Saudi Arabia",        away: "Uruguay",             venue: "SoFi Stadium" },
  { id: "IRA-NEW",  date: "2026-06-16", time: "01:00", home: "Iran",                away: "New Zealand",         venue: "Arrowhead Stadium" },
  { id: "FRA-SEN",  date: "2026-06-16", time: "19:00", home: "France",              away: "Senegal",             venue: "MetLife Stadium" },
  { id: "IRA-NOR",  date: "2026-06-16", time: "22:00", home: "Iraq",                away: "Norway",              venue: "Levi's Stadium" },
  { id: "ARG-ALG",  date: "2026-06-17", time: "01:00", home: "Argentina",           away: "Algeria",             venue: "Arrowhead Stadium" },
  { id: "AUS-JOR",  date: "2026-06-17", time: "04:00", home: "Austria",             away: "Jordan",              venue: "Rose Bowl" },
  { id: "POR-CON",  date: "2026-06-17", time: "17:00", home: "Portugal",            away: "Congo DR",            venue: "SoFi Stadium" },
  { id: "ENG-CRO",  date: "2026-06-17", time: "20:00", home: "England",             away: "Croatia",             venue: "AT&T Stadium" },
  { id: "GHA-PAN",  date: "2026-06-17", time: "23:00", home: "Ghana",               away: "Panama",              venue: "MetLife Stadium" },
  { id: "UZB-COL",  date: "2026-06-18", time: "02:00", home: "Uzbekistan",          away: "Colombia",            venue: "Hard Rock Stadium" },
  { id: "CZE-SOU",  date: "2026-06-18", time: "16:00", home: "Czechia",             away: "South Africa",        venue: "BC Place" },
  { id: "SWI-BOS",  date: "2026-06-18", time: "19:00", home: "Switzerland",         away: "Bosnia-Herzegovina",  venue: "Gillette Stadium" },
  { id: "CAN-QAT",  date: "2026-06-18", time: "22:00", home: "Canada",              away: "Qatar",               venue: "BC Place" },
  { id: "MEX-SOU1", date: "2026-06-19", time: "01:00", home: "Mexico",              away: "South Korea",         venue: "Estadio Banorte" },
  { id: "UNI-AUS",  date: "2026-06-19", time: "19:00", home: "United States",       away: "Australia",           venue: "SoFi Stadium" },
  { id: "SCO-MOR",  date: "2026-06-19", time: "22:00", home: "Scotland",            away: "Morocco",             venue: "Arrowhead Stadium" },
  { id: "BRA-HAI",  date: "2026-06-20", time: "00:30", home: "Brazil",              away: "Haiti",               venue: "MetLife Stadium" },
  { id: "TUR-PAR",  date: "2026-06-20", time: "03:00", home: "Türkiye",             away: "Paraguay",            venue: "Levi's Stadium" },
  { id: "NET-SWE",  date: "2026-06-20", time: "17:00", home: "Netherlands",         away: "Sweden",              venue: "AT&T Stadium" },
  { id: "GER-IVO",  date: "2026-06-20", time: "20:00", home: "Germany",             away: "Ivory Coast",         venue: "Rose Bowl" },
  { id: "ECU-CUR",  date: "2026-06-21", time: "00:00", home: "Ecuador",             away: "Curaçao",             venue: "Hard Rock Stadium" },
  { id: "TUN-JAP",  date: "2026-06-21", time: "04:00", home: "Tunisia",             away: "Japan",               venue: "Gillette Stadium" },
  { id: "SPA-SAU",  date: "2026-06-21", time: "16:00", home: "Spain",               away: "Saudi Arabia",        venue: "Rose Bowl" },
  { id: "BEL-IRA",  date: "2026-06-21", time: "19:00", home: "Belgium",             away: "Iran",                venue: "Levi's Stadium" },
  { id: "URU-CAP",  date: "2026-06-21", time: "22:00", home: "Uruguay",             away: "Cape Verde",          venue: "SoFi Stadium" },
  { id: "NEW-EGY",  date: "2026-06-22", time: "01:00", home: "New Zealand",         away: "Egypt",               venue: "Hard Rock Stadium" },
  { id: "ARG-AUS",  date: "2026-06-22", time: "17:00", home: "Argentina",           away: "Austria",             venue: "MetLife Stadium" },
  { id: "FRA-IRA",  date: "2026-06-22", time: "21:00", home: "France",              away: "Iraq",                venue: "AT&T Stadium" },
  { id: "NOR-SEN",  date: "2026-06-23", time: "00:00", home: "Norway",              away: "Senegal",             venue: "Rose Bowl" },
  { id: "JOR-ALG",  date: "2026-06-23", time: "03:00", home: "Jordan",              away: "Algeria",             venue: "Arrowhead Stadium" },
  { id: "POR-UZB",  date: "2026-06-23", time: "17:00", home: "Portugal",            away: "Uzbekistan",          venue: "Gillette Stadium" },
  { id: "ENG-GHA",  date: "2026-06-23", time: "20:00", home: "England",             away: "Ghana",               venue: "AT&T Stadium" },
  { id: "PAN-CRO",  date: "2026-06-23", time: "23:00", home: "Panama",              away: "Croatia",             venue: "BC Place" },
  { id: "COL-CON",  date: "2026-06-24", time: "02:00", home: "Colombia",            away: "Congo DR",            venue: "Hard Rock Stadium" },
  { id: "BOS-QAT",  date: "2026-06-24", time: "19:00", home: "Bosnia-Herzegovina",  away: "Qatar",               venue: "Estadio Banorte" },
  { id: "SWI-CAN",  date: "2026-06-24", time: "19:00", home: "Switzerland",         away: "Canada",              venue: "Gillette Stadium" },
  { id: "MOR-HAI",  date: "2026-06-24", time: "22:00", home: "Morocco",             away: "Haiti",               venue: "Levi's Stadium" },
  { id: "SCO-BRA",  date: "2026-06-24", time: "22:00", home: "Scotland",            away: "Brazil",              venue: "MetLife Stadium" },
  { id: "CZE-MEX",  date: "2026-06-25", time: "01:00", home: "Czechia",             away: "Mexico",              venue: "Rose Bowl" },
  { id: "SOU-SOU",  date: "2026-06-25", time: "01:00", home: "South Africa",        away: "South Korea",         venue: "SoFi Stadium" },
  { id: "CUR-IVO",  date: "2026-06-25", time: "20:00", home: "Curaçao",             away: "Ivory Coast",         venue: "AT&T Stadium" },
  { id: "ECU-GER",  date: "2026-06-25", time: "20:00", home: "Ecuador",             away: "Germany",             venue: "Hard Rock Stadium" },
  { id: "JAP-SWE",  date: "2026-06-25", time: "23:00", home: "Japan",               away: "Sweden",              venue: "Arrowhead Stadium" },
  { id: "TUN-NET",  date: "2026-06-25", time: "23:00", home: "Tunisia",             away: "Netherlands",         venue: "BC Place" },
  { id: "PAR-AUS",  date: "2026-06-26", time: "02:00", home: "Paraguay",            away: "Australia",           venue: "Gillette Stadium" },
  { id: "TUR-UNI",  date: "2026-06-26", time: "02:00", home: "Türkiye",             away: "United States",       venue: "Levi's Stadium" },
  { id: "NOR-FRA",  date: "2026-06-26", time: "19:00", home: "Norway",              away: "France",              venue: "Rose Bowl" },
  { id: "SEN-IRA",  date: "2026-06-26", time: "19:00", home: "Senegal",             away: "Iraq",                venue: "SoFi Stadium" },
  { id: "CAP-SAU",  date: "2026-06-27", time: "00:00", home: "Cape Verde",          away: "Saudi Arabia",        venue: "Estadio Banorte" },
  { id: "URU-SPA",  date: "2026-06-27", time: "00:00", home: "Uruguay",             away: "Spain",               venue: "MetLife Stadium" },
  { id: "EGY-IRA",  date: "2026-06-27", time: "03:00", home: "Egypt",               away: "Iran",                venue: "AT&T Stadium" },
  { id: "NEW-BEL",  date: "2026-06-27", time: "03:00", home: "New Zealand",         away: "Belgium",             venue: "Hard Rock Stadium" },
  { id: "CRO-GHA",  date: "2026-06-27", time: "21:00", home: "Croatia",             away: "Ghana",               venue: "Arrowhead Stadium" },
  { id: "PAN-ENG",  date: "2026-06-27", time: "21:00", home: "Panama",              away: "England",             venue: "BC Place" },
  { id: "COL-POR",  date: "2026-06-27", time: "23:30", home: "Colombia",            away: "Portugal",            venue: "Gillette Stadium" },
  { id: "CON-UZB",  date: "2026-06-27", time: "23:30", home: "Congo DR",            away: "Uzbekistan",          venue: "Levi's Stadium" },
  { id: "ALG-AUS",  date: "2026-06-28", time: "02:00", home: "Algeria",             away: "Austria",             venue: "Rose Bowl" },
  { id: "JOR-ARG",  date: "2026-06-28", time: "02:00", home: "Jordan",              away: "Argentina",           venue: "SoFi Stadium" },
];
