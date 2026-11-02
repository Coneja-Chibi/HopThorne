const changelogDialog = document.getElementById('preset-changelog');
const changelogSource = document.getElementById('changelog-source');
function renderChangelog() {
  const lite = editionSelect.value === 'lite';
  const source = lite ? window.HOP_LITE_CHANGELOG : window.HOP_CHANGELOG;
  const release = source.match(/^(v\S+) \| (\d{4}-\d{2}-\d{2})$/m);
  const changes = [...source.matchAll(/^- (.+)$/gm)].map(match => match[1]);
  const changelog = JSON.stringify({ version: release[1], date: release[2], changes }, null, 2);
  document.getElementById('changelog-title').textContent = (lite ? 'HopThorne Lite' : 'HopThorne') + ' changelog';
  document.querySelector('.tv-version').textContent = (lite ? 'Lite ' : '') + release[1];
  document.querySelector('.tv-summary').textContent = lite ? toolCount(window.HOP_LITE_GROUPS) + ' tools' : 'Output fixed';
  changelogSource.replaceChildren();
  changelog.split('\n').forEach((line, index) => {
    if (index) changelogSource.append('\n');
    appendJsonLine(changelogSource, line);
  });
}
renderChangelog();
editionSelect.addEventListener('change', renderChangelog);
document.querySelectorAll('#show-changelog, #monitor-changelog').forEach(button => button.addEventListener('click', () => changelogDialog.showModal()));
document.getElementById('close-changelog').addEventListener('click', () => changelogDialog.close());
