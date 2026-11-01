function callText(tool) {
  return '[tool_call]\nname = ' + JSON.stringify(tool.name) + '\n\n[tool_call.arguments]\n' + tool.fields.filter(field => field.value !== undefined).map(field => JSON.stringify(field.key) + ' = ' + JSON.stringify(field.value)).join('\n');
}
function annotatedBlock(tool) {
  const root = document.createElement('div');
  root.className = 'annotated-call';
  const code = document.createElement('pre');
  code.className = 'call-code';
  code.setAttribute('aria-label', 'Original ' + tool.name + ' preset block');
  const note = document.createElement('aside');
  note.className = 'call-note';
  note.setAttribute('aria-live', 'polite');
  const caption = document.createElement('p');
  caption.className = 'call-caption';
  caption.textContent = 'Verbatim preset block. Hover, focus, or tap an underlined line for annotations.';
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
    { match: line => line.startsWith('{{//'), label: 'Preset comment', note: 'This comment is part of the original prompt block. It explains how this entry is used.', tone: 'blue' },
    { match: line => line === '[tool_schema]', label: 'Tool schema', note: 'The original definition supplied to the model when this tool loads.', tone: 'blue' },
    { match: line => line === 'name = ' + JSON.stringify(tool.name), label: 'Exact tool name', note: 'This name identifies the tool in routing requests and output calls.', tone: 'orange' },
    { match: line => line === '[tool_schema.arguments]', label: 'Argument definitions', note: 'The original fields, constraints, allowed answers, and questions follow below.', tone: 'teal' },
    ...tool.fields.map(field => ({ match: line => line.startsWith(JSON.stringify(field.key) + ' ='), label: field.label, note: field.question, choices: field.choices, tone: 'teal' })),
    { match: line => line === '[tool_schema.rules]', label: 'Tool rules', note: 'The original behavioral rules for applying this definition.', tone: 'orange' },
    { match: line => line.includes('{{if '), label: 'Conditional macro', note: 'These macro conditions control when this block contributes to the prompt build.', tone: 'blue' },
    { match: line => line.includes('{{addvar::'), label: 'Prompt assembly macro', note: 'This appends content to a variable used while assembling the prompt.', tone: 'blue' }
  ];
  const lines = tool.source.split('\n');
  let firstAnnotation;
  for (const [index, line] of lines.entries()) {
    const item = annotations.find(annotation => annotation.match(line));
    if (!item) { code.append(document.createTextNode(line + (index < lines.length - 1 ? '\n' : ''))); continue; }
    const button = document.createElement('button');
    button.className = 'call-line';
    button.type = 'button';
    button.textContent = line;
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
