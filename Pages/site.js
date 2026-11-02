const groups = window.HOP_GROUPS;
const byId = id => document.getElementById(id);
const exampleTool = groups.flatMap(group => group.tools).find(tool => tool.name === 'Trust, Promise & Apology Response');
const exampleArguments = { character: 'Rue', toward: 'Eli', event: 'Eli apologizes for hiding the letter.', response: 'Acknowledge without forgiving', trust_result: 'Too early to assess' };
byId('request-preview').textContent = JSON.stringify({ name: 'next_tools', arguments: { next_tools: [exampleTool.identifier] } }, null, 2);
byId('think-call-preview').textContent = '<think>\nAn apology has been made; Rue has not restored her trust.\n</think>\n\n' + callText(exampleTool);
let groupIndex = 0;
let visibleTools = [];
let activeCall;
function showTool(index = 0) {
  const tool = visibleTools[index];
  if (!tool) return;
  document.querySelectorAll('#tools button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  byId('selected-name').textContent = tool.promptName;
  activeCall?.dispose();
  activeCall = annotatedBlock(tool);
  byId('summary').replaceChildren(activeCall);
}
function chooseGroup(index) {
  groupIndex = index;
  const query = byId('find').value.trim().toLowerCase();
  const group = groups[index];
  visibleTools = group.name.toLowerCase().includes(query) ? group.tools : group.tools.filter(tool => tool.name.toLowerCase().includes(query));
  byId('tools-label').textContent = group.name + ' / ' + visibleTools.length + (visibleTools.length === 1 ? ' tool' : ' tools');
  byId('tools').replaceChildren(...visibleTools.map((tool, i) => {
    const button = document.createElement('button');
    button.textContent = tool.name;
    button.onclick = () => showTool(i);
    return button;
  }));
  document.querySelectorAll('#groups button').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.group) === index)));
  showTool();
}
function filter() {
  const query = byId('find').value.trim().toLowerCase();
  const matches = groups.map((group, index) => ({ group, index })).filter(({ group }) => [group.name, ...group.tools.map(tool => tool.name)].some(name => name.toLowerCase().includes(query)));
  byId('groups').replaceChildren(...matches.map(({ group, index }) => {
    const button = document.createElement('button');
    button.textContent = group.name;
    button.dataset.group = index;
    button.onclick = () => chooseGroup(index);
    return button;
  }));
  byId('result').textContent = matches.length + ' of ' + groups.length + ' groups';
  byId('empty').hidden = matches.length > 0;
  byId('tools').hidden = matches.length === 0;
  byId('tools-label').hidden = matches.length === 0;
  byId('tool-content').hidden = matches.length === 0;
  if (matches.length) chooseGroup(matches.some(match => match.index === groupIndex) ? groupIndex : matches[0].index);
  else {
    activeCall?.dispose();
    byId('summary').textContent = '';
    byId('selected-name').textContent = 'No matching tools';
  }
}
byId('find').oninput = filter;
byId('explorer').hidden = false;
filter();
