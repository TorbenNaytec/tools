export function createBlueprintBox(mountEl, tools, options = {}) {
  const { showTree = true, treeLabel = 'Stamm' } = options;
  const el = typeof mountEl === 'string' ? document.querySelector(mountEl) : mountEl;
  if (!el || !tools) return null;

  el.innerHTML = `
    <div data-blueprint-grid></div>
    ${showTree ? '<div data-blueprint-tree></div>' : ''}
    <div data-blueprint-done hidden>Alle Tools sind aktiv.</div>
    <div data-blueprint-stage></div>
  `;
  const grid = el.querySelector('[data-blueprint-grid]');
  const tree = showTree ? el.querySelector('[data-blueprint-tree]') : null;
  const done = el.querySelector('[data-blueprint-done]');
  const stage = el.querySelector('[data-blueprint-stage]');

  const active = new Set();
  const vars = {};
  const listeners = new Set();
  const notify = () => listeners.forEach((fn) => fn());

  const childBoxes = {};
  let currentActivatingKey = null;

  // Nur aktive Tools landen im Baum — jeder Knoten trägt seine eigene
  // deactivate()-Closure (gebunden an die Box+Key-Kombination, die ihn
  // erzeugt hat), damit der Lösch-Button im Baum unabhängig von der
  // Verschachtelungstiefe die richtige Instanz trifft.
  const describeTree = () => Object.entries(tools)
    .filter(([key]) => active.has(key))
    .map(([key, tool]) => ({
      name: tool.name,
      deactivate: () => deactivate(key),
      children: (childBoxes[key] || []).flatMap((childBox) => childBox.describeTree()),
    }));

  const buildTreeList = (nodes) => {
    const ul = document.createElement('ul');
    nodes.forEach((n) => {
      const li = document.createElement('li');

      const span = document.createElement('span');
      span.setAttribute('data-tree-node', '');
      span.className = 'is-active';
      span.textContent = n.name;
      li.appendChild(span);

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.setAttribute('data-tree-delete', '');
      delBtn.setAttribute('aria-label', `${n.name} entfernen`);
      delBtn.textContent = '×';
      delBtn.addEventListener('click', () => n.deactivate());
      li.appendChild(delBtn);

      if (n.children.length) li.appendChild(buildTreeList(n.children));
      ul.appendChild(li);
    });
    return ul;
  };

  const renderTree = () => {
    if (!tree) return;
    tree.innerHTML = '';
    const rootLabel = document.createElement('div');
    rootLabel.setAttribute('data-blueprint-tree-root', '');
    rootLabel.textContent = treeLabel;
    tree.appendChild(rootLabel);
    tree.appendChild(buildTreeList(describeTree()));
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
    Object.entries(tools)
      .filter(([key]) => !active.has(key))
      .forEach(([key, tool]) => {
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

  const render = () => {
    const remaining = Object.keys(tools).filter((k) => !active.has(k));
    if (remaining.length === 0) {
      grid.hidden = true;
      done.hidden = false;
      return;
    }
    grid.hidden = false;
    done.hidden = true;
    renderCards();
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
