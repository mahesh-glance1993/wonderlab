import { useState } from 'react';
import { Button, Modal, TextInput } from '../../../ui/kit';

export function RenameDialog({ title, onSave, onClose }: { title: string; onSave: (t: string) => void; onClose: () => void }) {
  const [v, setV] = useState(title);
  return (
    <Modal title="Rename picture" onClose={onClose}>
      <form className="stack" onSubmit={(e) => { e.preventDefault(); if (v.trim()) onSave(v.trim().slice(0, 60)); }}>
        <label htmlFor="art-rename" style={{ fontWeight: 800 }}>Name</label>
        <TextInput id="art-rename" value={v} maxLength={60} onChange={(e) => setV(e.target.value)} />
        <div className="row"><Button variant="primary" type="submit" disabled={!v.trim()}>Save</Button><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button></div>
      </form>
    </Modal>
  );
}
