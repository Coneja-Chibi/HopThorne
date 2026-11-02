function callText(tool, args = exampleArguments) {
  return JSON.stringify({ name: tool.identifier, arguments: args }, null, 2);
}
function appendJsonLine(node, line) {
  let offset = 0;
  for (const match of line.matchAll(/"(?:\\.|[^"\\])*"|\b(?:true|false|null|\d+)\b/g)) {
    node.append(document.createTextNode(line.slice(offset, match.index)));
    const span = document.createElement('span');
    span.className = 'json-' + (match[0].startsWith('"') ? line.slice(match.index + match[0].length).trimStart().startsWith(':') ? 'key' : 'string' : 'literal');
    span.textContent = match[0];
    node.append(span);
    offset = match.index + match[0].length;
  }
  node.append(document.createTextNode(line.slice(offset)));
}
function annotatedBlock(tool) {
  const root = document.createElement('div');
  root.className = 'annotated-call';
  const code = document.createElement('pre');
  code.className = 'call-code';
  code.setAttribute('aria-label', tool.name + ' JSON tool definition');
  const note = document.createElement('aside');
  note.className = 'call-note';
  note.setAttribute('aria-live', 'polite');
  const caption = document.createElement('p');
  caption.className = 'call-caption';
  caption.textContent = 'JSON definition from the preset. Hover, focus, or tap underlined lines for annotations.';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('call-wire');
  svg.setAttribute('aria-hidden', 'true');
  const wire = document.createElementNS(svg.namespaceURI, 'path');
  svg.append(wire);
  let selected;
  let frame;
  function drawWire() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (!root.isConnected || !selected) return;
      const r = root.getBoundingClientRect(), a = selected.getBoundingClientRect(), b = note.getBoundingClientRect(), c = code.getBoundingClientRect();
      if (a.bottom < c.top || a.top > c.bottom) { wire.setAttribute('d', ''); return; }
      const side = b.left >= c.right;
      const x = Math.min(a.right, c.right) - r.left;
      const y = a.top + a.height / 2 - r.top;
      const bx = (side ? b.left : b.left + 25) - r.left, by = (side ? b.top + 30 : b.top) - r.top;
      const turn = side ? (c.right + b.left) / 2 - r.left : Math.max(c.right, b.right) - r.left + 8;
      wire.setAttribute('d', side ? 'M '+x+' '+y+' H '+turn+' V '+by+' H '+bx : 'M '+x+' '+y+' H '+turn+' V '+(by-14)+' H '+bx+' V '+by);
      const length = wire.getTotalLength();
      wire.style.setProperty('--wire-length', length);
    });
  }
  function select(button, item) {
    selected?.setAttribute('aria-pressed', 'false');
    selected = button;
    button.setAttribute('aria-pressed', 'true');
    root.dataset.tone = item.tone;
    const heading = document.createElement('h4');
    heading.textContent = item.label;
    const text = document.createElement('p');
    text.textContent = item.note;
    note.replaceChildren(heading, text);
    if (item.choices?.length) {
      const choices = document.createElement('p');
      choices.className = 'call-choices';
      choices.textContent = 'Allowed answers: ' + item.choices.join(' / ');
      note.append(choices);
    }
    wire.classList.remove('draw');
    drawWire();
    requestAnimationFrame(() => wire.classList.add('draw'));
  }
  const annotations = [
    { match: line => /^  "name":/.test(line), label: 'Tool identifier', note: 'The model uses this exact identifier in JSON calls and next-turn routing requests.', tone: 'blue' },
    { match: line => /^  "displayName":/.test(line), label: 'Display name', note: 'The readable title shown to people. Calls use the identifier above.', tone: 'blue' },
    { match: line => /^  "description":/.test(line), label: 'Purpose and rules', note: 'This preserves the tool’s state type, job, scope, timing and behavioral rules.', tone: 'orange' },
    { match: line => /^    "properties":/.test(line), label: 'Input fields', note: 'Each property defines a field the model may supply in its arguments object.', tone: 'teal' },
    ...tool.fields.map(field => ({ match: line => line.trimStart().startsWith(JSON.stringify(field.key) + ':'), label: field.label, note: field.question, choices: field.choices, tone: 'teal' })),
    { match: line => /^    "required":/.test(line), label: 'Required fields', note: 'Every listed property is required. Other defined properties are optional and are omitted when inapplicable.', tone: 'orange' },
    { match: line => /^    "additionalProperties":/.test(line), label: 'Closed schema', note: 'False disallows extra argument names. This is a schema instruction; the preset’s regex is not a full JSON Schema validator.', tone: 'orange' }
  ];
  const lines = tool.source.split('\n');
  let firstAnnotation;
  for (const [index, line] of lines.entries()) {
    const item = annotations.find(annotation => annotation.match(line));
    if (!item) { appendJsonLine(code, line); if (index < lines.length - 1) code.append('\n'); continue; }
    const button = document.createElement('button');
    button.className = 'call-line';
    button.type = 'button';
    appendJsonLine(button, line);
    button.setAttribute('aria-pressed', 'false');
    button.onpointerenter = button.onfocus = button.onclick = () => select(button, item);
    code.append(button);
    if (index < lines.length - 1) code.append(document.createTextNode('\n'));
    firstAnnotation ||= { button, item };
  }
  root.append(code, note, caption, svg);
  if (firstAnnotation) select(firstAnnotation.button, firstAnnotation.item);
  const observer = new ResizeObserver(drawWire);
  observer.observe(root);
  code.addEventListener('scroll', drawWire, { passive: true });
  root.dispose = () => { observer.disconnect(); cancelAnimationFrame(frame); };
  return root;
}
