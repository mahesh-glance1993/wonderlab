import { useState } from 'react';
import { Button, IconButton, Modal } from '../../../ui/kit';
import { Icon } from '../../../ui/Icon';
import { canDeleteLayer, type Project } from '../engine/project';

export function LayersPanel({ project, onSelect, onAdd, onDelete, onProps, onMove, allowTyping }: {
  project: Project;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onProps: (id: string, p: { name?: string; visible?: boolean; locked?: boolean }) => void;
  onMove: (id: string, dir: 1 | -1) => void;
  allowTyping: boolean;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState<string | null>(null);
  const rows = [...project.layers].map((l, i) => ({ l, i })).reverse(); // top first
  const n = project.layers.length;
  return (
    <div className="stack" style={{ gap: 6 }}>
      <ul className="art-layers" aria-label="Layers, top first">
        {rows.map(({ l, i }) => {
          const active = l.id === project.active;
          const tpl = l.kind === 'template';
          return (
            <li key={l.id} className={`art-layer ${active ? 'active' : ''}`}>
              {editing === l.id ? (
                <form className="row" style={{ flex: 1, gap: 4, flexWrap: 'nowrap' }} onSubmit={(e) => { e.preventDefault(); if (name.trim()) onProps(l.id, { name: name.trim().slice(0, 30) }); setEditing(null); }}>
                  <input className="input" aria-label="Layer name" autoFocus value={name} maxLength={30} onChange={(e) => setName(e.target.value)} onBlur={() => { if (name.trim() && name.trim() !== l.name) onProps(l.id, { name: name.trim().slice(0, 30) }); setEditing(null); }} style={{ minHeight: 38, padding: '2px 8px' }} />
                </form>
              ) : (
                <button type="button" className="art-layer-name" aria-pressed={active} disabled={tpl} onClick={() => onSelect(l.id)} title={tpl ? 'Outline layer (always locked)' : `Draw on ${l.name}`}>
                  {active && <Icon name="brush" />}{tpl && <Icon name="image" />}
                  <span>{l.name}</span>
                  {tpl && <small>outline</small>}
                </button>
              )}
              <IconButton className="small ghost" icon={l.visible ? 'eye' : 'eyeOff'} label={`${l.visible ? 'Hide' : 'Show'} ${l.name}`} aria-pressed={!l.visible} onClick={() => onProps(l.id, { visible: !l.visible })} />
              <IconButton className="small ghost" icon={l.locked ? 'lock' : 'unlock'} label={tpl ? `${l.name} is always locked` : `${l.locked ? 'Unlock' : 'Lock'} ${l.name}`} aria-pressed={l.locked} disabled={tpl} onClick={() => onProps(l.id, { locked: !l.locked })} />
              <IconButton className="small ghost" icon="up" label={`Move ${l.name} up`} disabled={i === n - 1} onClick={() => onMove(l.id, 1)} />
              <IconButton className="small ghost flip" icon="up" label={`Move ${l.name} down`} disabled={i === 0} onClick={() => onMove(l.id, -1)} />
              {!tpl && allowTyping && <IconButton className="small ghost" icon="edit" label={`Rename ${l.name}`} onClick={() => { setEditing(l.id); setName(l.name); }} />}
              {!tpl && <IconButton className="small ghost" icon="trash" label={`Delete ${l.name}`} disabled={!canDeleteLayer(project, l.id)} onClick={() => setConfirm(l.id)} />}
            </li>
          );
        })}
      </ul>
      <Button small icon="plus" onClick={onAdd}>Add layer</Button>
      {confirm && (
        <Modal title="Delete this layer?" onClose={() => setConfirm(null)}>
          <p>“{project.layers.find((l) => l.id === confirm)?.name}” will be removed. You can bring it back with Undo.</p>
          <div className="row"><Button variant="danger" icon="trash" onClick={() => { onDelete(confirm); setConfirm(null); }}>Delete layer</Button><Button onClick={() => setConfirm(null)}>Keep it</Button></div>
        </Modal>
      )}
    </div>
  );
}
