const changelogDialog = document.getElementById('preset-changelog');
const changelogSource = document.getElementById('changelog-source');
const release = window.HOP_CHANGELOG.match(/^(v\S+) \| (\d{4}-\d{2}-\d{2})$/m);
const changes = [...window.HOP_CHANGELOG.matchAll(/^- (.+)$/gm)].map(match => match[1]);
const changelog = JSON.stringify({ version: release[1], date: release[2], changes }, null, 2);
changelogSource.replaceChildren();
changelog.split('\n').forEach((line, index) => {
  if (index) changelogSource.append('\n');
  appendJsonLine(changelogSource, line);
});
document.querySelectorAll('#show-changelog, #monitor-changelog').forEach(button => button.addEventListener('click', () => changelogDialog.showModal()));
document.getElementById('close-changelog').addEventListener('click', () => changelogDialog.close());
