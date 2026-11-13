// Set by the lesson workspace: saves a line into this chapter's note ("Save to notes" on key points). null = off.
import { createContext, useContext } from 'react';

export type NoteTarget = ((line: string) => void) | null;
export const NoteTargetContext = createContext<NoteTarget>(null);
export const useNoteTarget = () => useContext(NoteTargetContext);
