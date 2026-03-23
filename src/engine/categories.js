// =======================================
// Category Definitions
// =======================================

export const BASE_CATS = {
    careerHR:       { label: 'Career HR',              type: 'hitter',  dMin: 30,    step: 1,     thresholds: [100,150,200,250,300,350,400,450,500,550], tolerance: 0.30, minBuffer: 50 },
    careerH:        { label: 'Career Hits',            type: 'hitter',  dMin: 200,   step: 1,     thresholds: [1000,1500,2000,2500,3000,3250], tolerance: 0.30, minBuffer: 500 },
    careerRBI:      { label: 'Career RBI',             type: 'hitter',  dMin: 100,   step: 1,     thresholds: [750,1000,1250,1500], tolerance: 0.30, minBuffer: 250 },
    careerSB:       { label: 'Career SB',              type: 'hitter',  dMin: 50,    step: 1,     thresholds: [100,200,300,400,500,600], tolerance: 0.40, minBuffer: 80 },
    careerBB:       { label: 'Career BB',              type: 'hitter',  dMin: 100,   step: 1,     thresholds: [500,750,1000,1250,1500,1750], tolerance: 0.30, minBuffer: 250 },
    careerBA:       { label: 'Career BA',              type: 'hitter',  dMin: 0.008, step: 0.001, thresholds: [0.250,0.260,0.270,0.280,0.290,0.300,0.320], tolerance: 0.15, minBuffer: 0.030 },
    careerOPS:      { label: 'Career OPS',             type: 'hitter',  dMin: 0.040, step: 0.001, thresholds: [0.750,0.800,0.850,0.900,0.950,1.000], tolerance: 0.20, minBuffer: 0.100 },
    careerXBHRate:  { label: 'Career XBH%',            type: 'hitter',  dMin: 0.04,  step: 0.001, thresholds: [0.20,0.25,0.30,0.35,0.40,0.45,0.50], tolerance: 0.30, minBuffer: 0.05 },
    careerWARBat:   { label: 'Career WAR',             type: 'hitter',  dMin: 5,     step: 0.1,   thresholds: [10,20,30,40,50,60,70,80], tolerance: 0.30, minBuffer: 5 },
    seasonHighHR:   { label: 'Highest Season HR',      type: 'hitter',  dMin: 5,     step: 1,     thresholds: [15,20,25,30,35,40,45,50], tolerance: 0.30, minBuffer: 5 },
    seasonHighSB:   { label: 'Highest Season SB',      type: 'hitter',  dMin: 10,    step: 1,     thresholds: [10,20,30,40,50,60,70], tolerance: 0.40, minBuffer: 8 },
    peakSeasonOPS:  { label: 'Highest Season OPS',     type: 'hitter',  dMin: 0.05,  step: 0.001, thresholds: [0.850,0.900,0.950,1.000,1.050,1.100,1.150], tolerance: 0.20, minBuffer: 0.150 },
    seasonHighKBat: { label: 'Highest Season K',       type: 'hitter',  dMin: 20,    step: 1,     lowerBetter: true, thresholds: [200,175,150,125,100,75], tolerance: 0.30, minBuffer: 30 },
    careerW:        { label: 'Career W',               type: 'pitcher', dMin: 20,    step: 1,     thresholds: [75,100,125,150,175,200,250,275,300], tolerance: 0.30, minBuffer: 30 },
    careerSO:       { label: 'Career K',               type: 'pitcher', dMin: 200,   step: 1,     thresholds: [1000,1500,2000,2500,2750,3000], tolerance: 0.30, minBuffer: 500 },
    careerWARPit:   { label: 'Career WAR',             type: 'pitcher', dMin: 5,     step: 0.1,   thresholds: [10,20,30,40,50,60,70], tolerance: 0.30, minBuffer: 5 },
    careerIP:       { label: 'Career IP',              type: 'pitcher', dMin: 200,   step: 1,     thresholds: [1000,1500,2000,2500,3000,3500,4000], tolerance: 0.30, minBuffer: 500 },
    careerERA:      { label: 'Career ERA',             type: 'pitcher', dMin: 0.30,  step: 0.01,  lowerBetter: true, thresholds: [4.50,4.25,4.00,3.75,3.50,3.25,3.00,2.75,2.50], tolerance: 0.25, minBuffer: 0.75 },
    careerWHIP:     { label: 'Career WHIP',            type: 'pitcher', dMin: 0.08,  step: 0.01,  lowerBetter: true, thresholds: [1.40,1.35,1.30,1.25,1.20,1.15,1.10,1.05], tolerance: 0.20, minBuffer: 0.20 },
    careerKBB:      { label: 'Career K/BB',            type: 'pitcher', dMin: 0.40,  step: 0.01,  thresholds: [1.50,1.75,2.00,2.50,3.00,3.50,4.00,4.50], tolerance: 0.30, minBuffer: 0.50 },
    seasonHighW:    { label: 'Highest Season W',       type: 'pitcher', thresholds: [16,18,20,22,24,26], tolerance: 0.25, minBuffer: 4 },
    seasonHighK:    { label: 'Highest Season K',       type: 'pitcher', dMin: 20,    step: 1,     thresholds: [150,175,200,225,250,275,300], tolerance: 0.30, minBuffer: 50 },
    bestSeasonERA:  { label: 'Best Season ERA',        type: 'pitcher', dMin: 0.20,  step: 0.01,  lowerBetter: true, thresholds: [4.00,3.75,3.50,3.25,3.00,2.75,2.50,2.25,2.00,1.75], tolerance: 0.25, minBuffer: 0.50 },
    seasonHighHRPit:{ label: 'Season High HR Allowed', type: 'pitcher', lowerBetter: true, thresholds: [40,35,30,25,20], tolerance: 0.30, minBuffer: 10 },
    seasons:        { label: 'Seasons Played',         type: 'both',    thresholds: [8,10,12,15,18,20,24], tolerance: 0.30, minBuffer: 3 },
    teams:          { label: 'Teams Played For',       type: 'both',    thresholds: [7,5,4,3,2], tolerance: 0.60, minBuffer: 2 },
};

export const BASE_BULL = {
    careerHR:12, careerBA:0.0032, careerOPS:0.016, careerERA:0.12, careerW:8, careerSB:20,
    seasonHighHR:2, careerKBB:0.16, careerXBHRate:0.016, peakSeasonOPS:0.02,
    seasonHighK:8, seasonHighKBat:8, seasonHighSB:4,
    bestSeasonERA:0.08, careerWARBat:2.0, careerWARPit:2.0, careerIP:80,
    careerH:80, careerBB:40, careerWHIP:0.032
};

export const CAT_DESCRIPTIONS = {
    careerHR:       { desc: 'Total home runs hit over a player\'s entire career.', calc: null, elig: null },
    careerH:        { desc: 'Total base hits accumulated over a player\'s career.', calc: null, elig: null },
    careerRBI:      { desc: 'Total runs batted in over a player\'s career.', calc: null, elig: null },
    careerSB:       { desc: 'Total stolen bases over a player\'s career.', calc: null, elig: null },
    careerBB:       { desc: 'Total walks (bases on balls) drawn over a player\'s career.', calc: null, elig: null },
    careerBA:       { desc: 'Career batting average \u2014 how often a batter gets a hit.', calc: 'Hits \u00f7 At Bats', elig: null },
    careerOPS:      { desc: 'Career on-base plus slugging \u2014 measures a hitter\'s overall offensive value.', calc: 'On-Base % + Slugging %', elig: null },
    careerXBHRate:  { desc: 'Percentage of hits that go for extra bases (doubles, triples, home runs).', calc: '(2B + 3B + HR) \u00f7 Hits', elig: null },
    careerWARBat:   { desc: 'Career Wins Above Replacement for position players \u2014 estimates total value over a replacement-level player.', calc: 'Composite metric combining batting, baserunning, and fielding value (Baseball Reference bWAR).', elig: null },
    seasonHighHR:   { desc: 'Most home runs hit in any single season.', calc: null, elig: null },
    seasonHighSB:   { desc: 'Most stolen bases in any single season.', calc: null, elig: null },
    peakSeasonOPS:  { desc: 'Highest OPS achieved in any single season.', calc: 'On-Base % + Slugging % (best single season)', elig: 'Minimum 400 PA in the season.' },
    seasonHighKBat: { desc: 'Most strikeouts in any single season as a batter.', calc: null, elig: null },
    careerW:        { desc: 'Total wins as a pitcher over an entire career.', calc: null, elig: null },
    careerSO:       { desc: 'Total strikeouts recorded as a pitcher over a career.', calc: null, elig: null },
    careerWARPit:   { desc: 'Career Wins Above Replacement for pitchers \u2014 estimates total value over a replacement-level pitcher.', calc: 'Composite metric combining pitching value, run prevention, and leverage (Baseball Reference bWAR).', elig: null },
    careerIP:       { desc: 'Total innings pitched over a career.', calc: null, elig: null },
    careerERA:      { desc: 'Career earned run average \u2014 average earned runs allowed per 9 innings.', calc: '(Earned Runs \u00f7 Innings Pitched) \u00d7 9', elig: null },
    careerWHIP:     { desc: 'Career walks plus hits per inning pitched.', calc: '(Walks + Hits) \u00f7 Innings Pitched', elig: null },
    careerKBB:      { desc: 'Career strikeout-to-walk ratio \u2014 measures a pitcher\'s command.', calc: 'Strikeouts \u00f7 Walks', elig: null },
    seasonHighW:    { desc: 'Most wins in any single season as a pitcher.', calc: null, elig: null },
    seasonHighK:    { desc: 'Most strikeouts in any single season as a pitcher.', calc: null, elig: null },
    bestSeasonERA:  { desc: 'Lowest ERA achieved in any single season.', calc: '(Earned Runs \u00f7 Innings Pitched) \u00d7 9 (best single season)', elig: 'Minimum 100 IP in the season.' },
    seasonHighHRPit:{ desc: 'Most home runs allowed in any single season.', calc: null, elig: null },
    seasons:        { desc: 'Number of MLB seasons played.', calc: null, elig: null },
    teams:          { desc: 'Number of distinct MLB teams played for.', calc: null, elig: null }
};

export const CUSTOM_STAT_OPTIONS = [
    { key: 'PA',             label: 'Career PA',             type: 'hitter',  dir: 'min' },
    { key: 'careerHR',       label: 'Career HR',             type: 'hitter',  dir: 'min' },
    { key: 'careerH',        label: 'Career Hits',           type: 'hitter',  dir: 'min' },
    { key: 'careerRBI',      label: 'Career RBI',            type: 'hitter',  dir: 'min' },
    { key: 'careerSB',       label: 'Career SB',             type: 'hitter',  dir: 'min' },
    { key: 'careerBB',       label: 'Career BB',             type: 'hitter',  dir: 'min' },
    { key: 'careerBA',       label: 'Career BA',             type: 'hitter',  dir: 'min' },
    { key: 'careerOPS',      label: 'Career OPS',            type: 'hitter',  dir: 'min' },
    { key: 'careerXBHRate',  label: 'Career XBH%',           type: 'hitter',  dir: 'min' },
    { key: 'careerWARBat',   label: 'Career WAR (Bat)',      type: 'hitter',  dir: 'min' },
    { key: 'seasonHighHR',   label: 'Highest Season HR',     type: 'hitter',  dir: 'min' },
    { key: 'seasonHighSB',   label: 'Highest Season SB',     type: 'hitter',  dir: 'min' },
    { key: 'peakSeasonOPS',  label: 'Highest Season OPS',    type: 'hitter',  dir: 'min' },
    { key: 'seasonHighKBat', label: 'Highest Season K (Bat)',type: 'hitter',  dir: 'max' },
    { key: 'G',              label: 'Career G',              type: 'pitcher', dir: 'min' },
    { key: 'GS',             label: 'Career GS',             type: 'pitcher', dir: 'min' },
    { key: 'careerW',        label: 'Career W',              type: 'pitcher', dir: 'min' },
    { key: 'careerSO',       label: 'Career K',              type: 'pitcher', dir: 'min' },
    { key: 'careerWARPit',   label: 'Career WAR (Pit)',      type: 'pitcher', dir: 'min' },
    { key: 'careerIP',       label: 'Career IP',             type: 'pitcher', dir: 'min' },
    { key: 'careerERA',      label: 'Career ERA',            type: 'pitcher', dir: 'max' },
    { key: 'careerWHIP',     label: 'Career WHIP',           type: 'pitcher', dir: 'max' },
    { key: 'careerKBB',      label: 'Career K/BB',           type: 'pitcher', dir: 'min' },
    { key: 'seasonHighW',    label: 'Highest Season W',      type: 'pitcher', dir: 'min' },
    { key: 'seasonHighK',    label: 'Highest Season K',      type: 'pitcher', dir: 'min' },
    { key: 'bestSeasonERA',  label: 'Best Season ERA',       type: 'pitcher', dir: 'max' },
    { key: 'seasonHighHRPit',label: 'Season High HR Allowed',type: 'pitcher', dir: 'max' },
    { key: 'seasons',        label: 'Seasons Played',        type: 'both',    dir: 'min' },
    { key: 'teams',          label: 'Teams Played For',      type: 'both',    dir: 'max' }
];

export const CUSTOM_PRESETS = [
    { id: 'willie_mays_hayes', name: 'Willie Mays Hayes', type: 'hitter', desc: 'Speed demons with little power', filters: [
        { stat: 'careerSB', value: 400, dir: 'min' },
        { stat: 'careerHR', value: 100, dir: 'max' }
    ]},
    { id: 'swing_for_fences', name: 'Swing for the Fences', type: 'hitter', desc: 'High XBH rate, moderate WAR, long careers', filters: [
        { stat: 'careerXBHRate', value: 0.40, dir: 'min' },
        { stat: 'careerWARBat', value: 30, dir: 'max' },
        { stat: 'seasons', value: 10, dir: 'min' }
    ]},
    { id: 'pop_and_patience', name: 'Pop & Patience', type: 'hitter', desc: 'Power hitters who made contact', filters: [
        { stat: 'careerHR', value: 250, dir: 'min' },
        { stat: 'seasonHighKBat', value: 100, dir: 'max' }
    ]},
    { id: 'power_precision', name: 'Power & Precision', type: 'pitcher', desc: 'Elite command pitchers', filters: [
        { stat: 'careerKBB', value: 3, dir: 'min' },
        { stat: 'seasons', value: 10, dir: 'min' }
    ]},
    { id: 'journeymen', name: 'Journeymen', type: 'pitcher', desc: 'Long-serving starters who never dominated', filters: [
        { stat: 'seasonHighW', value: 15, dir: 'max' },
        { stat: 'GS', value: 300, dir: 'min' }
    ]}
];

export const SBS_CATS_BAT = [
    {key:'careerWARBat', label:'Career WAR'},
    {key:'careerH',      label:'Career Hits'},
    {key:'careerBA',     label:'Career BA'},
    {key:'careerOPS',    label:'Career OPS'},
    {key:'careerHR',     label:'Career HR'},
    {key:'careerXBHRate',label:'Career XBH%'},
    {key:'careerBB',     label:'Career BB'},
    {key:'peakSeasonOPS',label:'High Season OPS'},
    {key:'seasonHighHR', label:'High Season HR'},
    {key:'seasonHighKBat',label:'High Season K', lowerBetter:true}
];

export const SBS_CATS_PIT = [
    {key:'careerWARPit', label:'Career WAR'},
    {key:'careerIP',     label:'Career IP'},
    {key:'careerW',      label:'Career W'},
    {key:'careerERA',    label:'Career ERA', lowerBetter:true},
    {key:'careerWHIP',   label:'Career WHIP', lowerBetter:true},
    {key:'careerKBB',    label:'Career K/BB'},
    {key:'seasonHighW',  label:'High Season W'},
    {key:'bestSeasonERA',label:'Low Season ERA', lowerBetter:true},
    {key:'seasonHighK',  label:'High Season K'},
    {key:'seasonHighHRPit',label:'High Season HR', lowerBetter:true}
];

export const TOP10_CATS_BAT_DECADE = [
    { key: 'HR',  label: 'HR',    baseCat: 'careerHR',      field: 'HR',  lowerBetter: false },
    { key: 'H',   label: 'Hits',  baseCat: 'careerH',       field: 'H',  lowerBetter: false },
    { key: 'RBI', label: 'RBI',   baseCat: 'careerRBI',     field: 'RBI', lowerBetter: false },
    { key: 'SB',  label: 'SB',    baseCat: 'careerSB',      field: 'SB',  lowerBetter: false },
    { key: 'BB',  label: 'BB',    baseCat: 'careerBB',      field: 'BB',  lowerBetter: false },
    { key: 'BA',  label: 'BA',    baseCat: 'careerBA',      field: 'BA', lowerBetter: false, isRate: true, minPA: 1500 },
    { key: 'OPS', label: 'OPS',   baseCat: 'careerOPS',     field: 'OPS', lowerBetter: false, isRate: true, minPA: 1500 },
    { key: 'XBH%', label: 'XBH%', baseCat: 'careerXBHRate', field: 'XBHRate', lowerBetter: false, isRate: true, minPA: 1500 }
];

export const TOP10_CATS_PIT_DECADE = [
    { key: 'W',   label: 'W',   baseCat: 'careerW',   field: 'W',   lowerBetter: false },
    { key: 'K',   label: 'K',   baseCat: 'careerSO',  field: 'SO',  lowerBetter: false },
    { key: 'ERA', label: 'ERA', baseCat: 'careerERA',  field: 'ERA', lowerBetter: true, isRate: true, minIP: 500 },
    { key: 'IP',  label: 'IP',  baseCat: 'careerIP',   field: 'IP', lowerBetter: false }
];

export const TOP10_CATS_BAT_CAREER = [
    { key: 'careerHR',      label: 'Career HR',     statKey: 'careerHR',     lowerBetter: false },
    { key: 'careerH',       label: 'Career Hits',   statKey: 'careerH',      lowerBetter: false },
    { key: 'careerRBI',     label: 'Career RBI',    statKey: 'careerRBI',    lowerBetter: false },
    { key: 'careerSB',      label: 'Career SB',     statKey: 'careerSB',     lowerBetter: false },
    { key: 'careerBB',      label: 'Career BB',     statKey: 'careerBB',     lowerBetter: false },
    { key: 'careerBA',      label: 'Career BA',     statKey: 'careerBA',     lowerBetter: false, isRate: true },
    { key: 'careerOPS',     label: 'Career OPS',    statKey: 'careerOPS',    lowerBetter: false, isRate: true },
    { key: 'careerXBHRate', label: 'Career XBH%',   statKey: 'careerXBHRate',lowerBetter: false, isRate: true },
    { key: 'careerWARBat',  label: 'Career WAR',    statKey: 'careerWARBat', lowerBetter: false }
];

export const TOP10_CATS_PIT_CAREER = [
    { key: 'careerW',      label: 'Career Wins',   statKey: 'careerW',      lowerBetter: false },
    { key: 'careerSO',     label: 'Career K',      statKey: 'careerSO',     lowerBetter: false },
    { key: 'careerERA',    label: 'Career ERA',    statKey: 'careerERA',    lowerBetter: true, isRate: true },
    { key: 'careerIP',     label: 'Career IP',     statKey: 'careerIP',     lowerBetter: false },
    { key: 'careerWARPit', label: 'Career WAR',    statKey: 'careerWARPit', lowerBetter: false }
];

export const TOP10_POINTS = [200, 160, 130, 110, 90, 80, 70, 60, 50, 50];
