
import { create } from 'zustand';

interface EditorState {
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  setLoading: (isLoading: boolean) => void;
  setSaving: (isSaving: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  isLoading: false,
  isSaving: false,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setSaving: (isSaving) => set({ isSaving }),
  setError: (error) => set({ error }),
}));
