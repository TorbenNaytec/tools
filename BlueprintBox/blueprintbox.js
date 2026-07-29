// Blueprint Box — generische Zu-/Abschalt-Steuerung für ein Set von "Tools".
//
// Ein Tool ist ein beliebiges Objekt { name, desc, activate(api), deactivate(api) }.
// createBlueprintBox rendert selbst eine minimale Picker-UI (Karten-Grid,
// Auswahlfeld, Fertig-Hinweis, Stage) in den übergebenen Container und reicht
// jedem Tool eine API durch, über die sich Tools GEGENSEITIG steuern —
// die Blueprint Box selbst implementiert keine Kopplungslogik zwischen Tools,
// sie liefert dafür nur Lesezugriff (isActive/getActive), einen kleinen
// Variablenspeicher (getVar/setVar) und onChange.
//
// Baumstruktur: api.createChildBox(mountEl, childTools) ruft dieselbe
// Funktion rekursiv auf — ein Tool kann so in seiner eigenen Section eine
// eigene Blueprint Box für seine Sub-Tools aufspannen (dieselbe Funktion
// steuert die nächste Ebene).
//
// Markup-Vertrag für Tools, die eigenen Inhalt über api.addSection(html)
// in die Stage rendern: Das Wurzel-Element der Section trägt
// data-tool-id="<key>"; ein optionales Element darin mit [data-close]
// deaktiviert das Tool per Klick.

export function createBlueprintBox(mountEl, tools, options = {}) {
  const { showTree = true, treeLabel = 'Stamm' } = options;
  const el = typeof mountEl === 'string' ? document.querySelector(mountEl) : mountEl;
  if (!el || !tools) return null;

  el.innerHTML = `
    <div data-blueprint-grid></div>
    ${showTree ? '<div data-blueprint-tree></div>' : ''}
    <div data-blueprint-select hidden>
      <label>Weiteres Tool aktivieren: <select data-blueprint-add></select></label>
    </div>
    <div data-blueprint-done hidden>Alle Tools sind aktiv.</div>
    <div data-blueprint-stage></div>
  `;
  const grid = el.querySelector('[data-blueprint-grid]');
  const tree = showTree ? el.querySelector('[data-blueprint-tree]') : null;
  const selectWrap = el.querySelector('[data-blueprint-select]');
  const select = el.querySelector('[data-blueprint-add]');
  const done = el.querySelector('[data-blueprint-done]');
  const stage = el.querySelector('[data-blueprint-stage]');

  const active = new Set();
  const vars = {};
  const listeners = new Set();
  const notify = () => listeners.forEach((fn) => fn());

  // Baumstruktur-Tracking: welcher Tool-Key hat über createChildBox welche
  // Kind-Box(en) aufgespannt — nur dafür da, um das Diagramm zu zeichnen.
  const childBoxes = {};
  let currentActivatingKey = null;

  const describeTree = () => Object.entries(tools).map(([key, tool]) => ({
    name: tool.name,
    active: active.has(key),
    children: (childBoxes[key] || []).flatMap((childBox) => childBox.describeTree()),
  }));

  const renderTreeList = (nodes) => `
    <ul>
      ${nodes.map((n) => `
        <li>
          <span data-tree-node class="${n.active ? 'is-active' : ''}">${n.name}</span>
          ${n.children.length ? renderTreeList(n.children) : ''}
        </li>
      `).join('')}
    </ul>
  `;

  const renderTree = () => {
    if (!tree) return;
    tree.innerHTML = `<div data-blueprint-tree-root>${treeLabel}</div>${renderTreeList(describeTree())}`;
  };

  const api = {
    isActive: (key) => active.has(key),
    getActive: () => [...active],
    getVar: (name) => vars[name],
    setVar(name, value) { vars[name] = value; notify(); },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    stage,
    addSection(html) {
      const wrap = document.createElement('div');
      wrap.innerHTML = html;
      stage.appendChild(wrap.firstElementChild);
    },
    describeTree,
    createChildBox(childMountEl, childTools) {
      const childBox = createBlueprintBox(childMountEl, childTools, { showTree: false });
      if (currentActivatingKey) {
        (childBoxes[currentActivatingKey] ??= []).push(childBox);
        childBox.onChange(() => { renderTree(); notify(); });
      }
      return childBox;
    },
  };

  const renderCards = () => {
    grid.innerHTML = '';
    Object.entries(tools).forEach(([key, tool]) => {
      const card = document.createElement('div');
      card.setAttribute('data-blueprint-card', '');
      card.innerHTML = `
        <div data-blueprint-card-name>${tool.name}</div>
        <div data-blueprint-card-desc>${tool.desc}</div>
        <button type="button" data-blueprint-card-activate>Aktivieren</button>
      `;
      card.querySelector('[data-blueprint-card-activate]').addEventListener('click', () => activate(key));
      grid.appendChild(card);
    });
  };

  const renderSelect = () => {
    const remaining = Object.keys(tools).filter((k) => !active.has(k));
    select.innerHTML = '<option value="" disabled selected>Tool wählen …</option>'
      + remaining.map((k) => `<option value="${k}">${tools[k].name} — ${tools[k].desc}</option>`).join('');
  };

  const render = () => {
    if (active.size === 0) {
      grid.hidden = false;
      selectWrap.hidden = true;
      done.hidden = true;
      renderCards();
      return;
    }
    grid.hidden = true;
    const remaining = Object.keys(tools).filter((k) => !active.has(k));
    if (remaining.length === 0) {
      selectWrap.hidden = true;
      done.hidden = false;
    } else {
      selectWrap.hidden = false;
      done.hidden = true;
      renderSelect();
    }
  };

  function activate(key) {
    if (active.has(key)) return;
    active.add(key);
    currentActivatingKey = key;
    tools[key].activate(api);
    currentActivatingKey = null;
    render();
    renderTree();
    notify();
  }

  function deactivate(key) {
    if (!active.has(key)) return;
    active.delete(key);
    tools[key].deactivate(api);
    delete childBoxes[key];
    render();
    renderTree();
    notify();
  }

  select.addEventListener('change', () => {
    const key = select.value;
    if (key) activate(key);
  });

  // Deaktivieren über [data-close] im Tool-Markup, delegiert auf die Stage.
  stage.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('[data-close]');
    if (!closeBtn) return;
    const host = closeBtn.closest('[data-tool-id]');
    const key = host?.getAttribute('data-tool-id');
    if (key && tools[key]) deactivate(key);
  });

  render();
  renderTree();

  api.destroyAll = () => { [...active].forEach((key) => deactivate(key)); };

  return api;
}
