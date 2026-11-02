// NGN Daily bullet grading: stores each grader's picks in this spreadsheet.
// Deploy as a web app (Execute as: Me, Who has access: Anyone). See SETUP.md.

const SHEET = 'Responses';
const FIXED = ['Grader key', 'Name', 'Team', 'Finished', 'Updated', 'Data'];

// The page POSTs one grader's whole state; we upsert their row.
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (typeof d.id !== 'string' || !/^[A-Za-z0-9-]{8,64}$/.test(d.id)) return out_({ ok: false, error: 'bad id' });
    const sh = sheet_(d.headers);
    const key = hash_(d.id);
    const last = sh.getLastRow();
    const keys = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map(r => r[0]) : [];
    const at = keys.indexOf(key);
    const row = at === -1 ? last + 1 : at + 2;
    const vals = [key, cell_(d.name, 80), cell_(d.team, 40), d.done ? 'Yes' : 'No', new Date(),
      JSON.stringify({ picks: obj_(d.picks), notes: obj_(d.notes), reasons: obj_(d.reasons) })];
    (Array.isArray(d.summary) ? d.summary : []).slice(0, 60).forEach(p => vals.push(cell_(p[0], 200), cell_(p[1], 2000)));
    sh.getRange(row, 1, 1, vals.length).setValues([vals]);
    return out_({ ok: true });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// The page GETs everyone's picks to draw the results dashboard.
function doGet() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET);
  if (!sh || sh.getLastRow() < 2) return out_({ rows: [] });
  const v = sh.getRange(2, 1, sh.getLastRow() - 1, FIXED.length).getValues();
  const rows = v.filter(r => r[0]).map(r => {
    let raw = {};
    try { raw = JSON.parse(r[5]); } catch (_) {}
    return { key: r[0], name: r[1], team: r[2], done: r[3] === 'Yes', picks: raw.picks || {}, notes: raw.notes || {}, reasons: raw.reasons || {} };
  });
  return out_({ rows });
}

function sheet_(storyHeaders) {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
  if (sh.getLastRow() === 0 && Array.isArray(storyHeaders)) {
    const head = FIXED.concat(storyHeaders.slice(0, 120).map(h => cell_(h, 120)));
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setFrozenColumns(3);
    sh.hideColumns(1);
    sh.hideColumns(6);
  }
  return sh;
}

// Rows are found by a hash of the grader's browser key, so the key itself is never readable.
function hash_(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s)
    .map(b => ((b + 256) % 256).toString(16).padStart(2, '0')).join('');
}

// Plain text only: a leading = + - @ would otherwise become a formula.
function cell_(v, max) {
  const s = String(v == null ? '' : v).slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function obj_(o) { return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; }

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
