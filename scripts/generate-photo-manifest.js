const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'photos');
const allowed = /\.(?:jpe?g|png|webp|gif)$/i;
const folders = [
  { absolute: dir, relative: 'photos', deleted: false },
  { absolute: path.join(dir, 'deleted'), relative: 'photos/deleted', deleted: true }
];

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

const candidates = folders.flatMap(folder => {
  if (!fs.existsSync(folder.absolute)) return [];
  return fs.readdirSync(folder.absolute, { withFileTypes: true })
    .filter(entry => entry.isFile() && allowed.test(entry.name))
    .map(entry => ({ ...folder, name: entry.name }));
});

const seenPaths = new Set();
const seenContent = new Set();
const photos = candidates
  .map(entry => {
    const relativePath = `${entry.relative}/${entry.name}`;
    const key = relativePath.toLocaleLowerCase('en-US');
    const file = path.join(entry.absolute, entry.name);
    const sha = hashFile(file);
    if (seenPaths.has(key) || seenContent.has(sha)) return null;
    seenPaths.add(key);
    seenContent.add(sha);
    return {
      id: `${relativePath}:${sha.slice(0, 12)}`,
      name: entry.name,
      src: `${entry.relative.split('/').map(encodeURIComponent).join('/')}/${encodeURIComponent(entry.name)}?v=${sha.slice(0, 12)}`,
      date: null,
      ...(entry.deleted ? { deleted: true } : {}),
      uploaded: committedAt(relativePath),
      sha
    };
  })
  .filter(Boolean)
  .sort((a, b) => b.uploaded - a.uploaded || b.name.localeCompare(a.name, 'en', { numeric: true }))
  .map(({ uploaded, sha, ...photo }) => photo);

const version = crypto.createHash('sha256').update(JSON.stringify(photos)).digest('hex').slice(0, 12);
const output = `${JSON.stringify({ version, photos }, null, 2)}\n`;
fs.writeFileSync(path.join(dir, 'manifest.json'), output);
const deletedCount = photos.filter(photo => photo.deleted).length;
console.log(`Generated photos/manifest.json with ${photos.length} photos (${deletedCount} recently deleted).`);
