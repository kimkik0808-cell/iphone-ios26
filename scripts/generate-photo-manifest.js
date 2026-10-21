const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'photos');
const allowed = /\.(?:jpe?g|png|webp|gif)$/i;

function hashFile(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function committedAt(relativePath) {
  try {
    return Number(execFileSync('git', ['log', '-1', '--format=%ct', '--', relativePath], {
      cwd: root,
      encoding: 'utf8'
    }).trim()) || 0;
  } catch {
    return 0;
  }
}

const seenNames = new Set();
const seenContent = new Set();
const photos = fs.readdirSync(dir, { withFileTypes: true })
  .filter(entry => entry.isFile() && allowed.test(entry.name))
  .map(entry => {
    const key = entry.name.toLocaleLowerCase('en-US');
    const file = path.join(dir, entry.name);
    const sha = hashFile(file);
    if (seenNames.has(key) || seenContent.has(sha)) return null;
    seenNames.add(key);
    seenContent.add(sha);
    return {
      id: `${entry.name}:${sha.slice(0, 12)}`,
      name: entry.name,
      src: `photos/${encodeURIComponent(entry.name)}?v=${sha.slice(0, 12)}`,
      date: null,
      uploaded: committedAt(`photos/${entry.name}`),
      sha
    };
  })
  .filter(Boolean)
  .sort((a, b) => b.uploaded - a.uploaded || b.name.localeCompare(a.name, 'en', { numeric: true }))
  .map(({ uploaded, sha, ...photo }) => photo);

const version = crypto.createHash('sha256').update(JSON.stringify(photos)).digest('hex').slice(0, 12);
const output = `${JSON.stringify({ version, photos }, null, 2)}\n`;
fs.writeFileSync(path.join(dir, 'manifest.json'), output);
console.log(`Generated photos/manifest.json with ${photos.length} unique browser-compatible photos.`);
