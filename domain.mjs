export function webLink(value) {
  try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password; } catch { return false; }
}
export function validate(entry) {
  if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string' || !entry.id || typeof entry.title !== 'string' || !entry.title.trim() || entry.title.length > 200) throw Error('An entry needs an ID and title (up to 200 characters).');
  if (!webLink(entry.source)) throw Error('Official source must be an HTTP or HTTPS link.');
  if (typeof entry.deadline !== 'string' || !/(Z|[+-]\d{2}:\d{2})$/.test(entry.deadline) || !Number.isFinite(Date.parse(entry.deadline))) throw Error('Deadline must include a timezone.');
  if (!['cash', 'noncash', 'unknown'].includes(entry.reward)) throw Error('Invalid reward type.');
  if (!Array.isArray(entry.requirements) || entry.requirements.length > 50 || entry.requirements.some(r => !r || typeof r.label !== 'string' || !r.label.trim() || r.label.length > 200 || typeof r.done !== 'boolean')) throw Error('Invalid requirements.');
  if (typeof entry.receipt !== 'string' || (entry.receipt && !webLink(entry.receipt))) throw Error('Receipt must be an HTTP or HTTPS link.');
  if (typeof entry.synthetic !== 'boolean') throw Error('Synthetic flag is required.');
  return {id: entry.id, title: entry.title.trim(), source: entry.source, deadline: entry.deadline, reward: entry.reward, requirements: entry.requirements.map(r => ({label: r.label, done: r.done})), receipt: entry.receipt, synthetic: entry.synthetic};
}
export function status(entry, now = Date.now()) {
  if (entry.receipt) return 'submitted';
  if (Date.parse(entry.deadline) <= now) return 'expired';
  if (entry.reward !== 'cash') return 'excluded';
  return entry.requirements.some(r => !r.done) ? 'blocked' : 'ready';
}
export function importEntries(raw) {
  const data = JSON.parse(raw);
  if (data.version !== 1 || !Array.isArray(data.entries) || data.entries.length > 500) throw Error('Expected a version 1 ClaimClock export with at most 500 entries.');
  const entries = data.entries.map(validate);
  if (new Set(entries.map(e => e.id)).size !== entries.length) throw Error('Duplicate entry IDs.');
  return entries;
}
export function exportEntries(entries) { return JSON.stringify({version: 1, entries: entries.map(validate)}, null, 2); }
export function examples(now = Date.now()) {
  const deadline = new Date(now + 7 * 86400000).toISOString();
  return [
    {id:'sample-ready',title:'Synthetic cash challenge',reward:'cash',requirements:[{label:'Eligibility checked',done:true},{label:'Demo prepared',done:true}]},
    {id:'sample-blocked',title:'Synthetic integration challenge',reward:'cash',requirements:[{label:'Verify sandbox integration',done:false},{label:'Record working demo',done:false}]},
    {id:'sample-excluded',title:'Synthetic credits-only event',reward:'noncash',requirements:[]}
  ].map(e => ({...e,source:'https://example.com/',deadline,receipt:'',synthetic:true}));
}
