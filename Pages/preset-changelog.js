const changelogDialog = document.getElementById('preset-changelog');
const changelogSource = document.getElementById('changelog-source');
const release = window.HOP_CHANGELOG.match(/^(v\S+) \| (\d{4}-\d{2}-\d{2})$/m);
const changes = [...window.HOP_CHANGELOG.matchAll(/^- (.+)$/gm)].map(match => match[1]);
function token(text, kind) {
  const span = document.createElement('span');
  span.className = 'syntax-' + kind;
  span.textContent = text;
  return span;
}
changelogSource.replaceChildren(token('[changelog]', 'section'), '\n\n', token('version', 'key'), ' = ', token(JSON.stringify(release[1]), 'value'), '\n', token('date', 'key'), ' = ', token(JSON.stringify(release[2]), 'value'), '\n\n', token('changes', 'key'), ' = [\n', ...changes.flatMap(change => ['  ', token(JSON.stringify(change), 'value'), ',\n']), ']');
document.querySelectorAll('#show-changelog, #monitor-changelog').forEach(button => button.addEventListener('click', () => changelogDialog.showModal()));
document.getElementById('close-changelog').addEventListener('click', () => changelogDialog.close());
