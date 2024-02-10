import * as vscode from "vscode";

export type StickySelectionEditorMode = {
  editor: vscode.TextEditor;
  active: boolean;
  stickySelectionInitialized: boolean;
  lastAnchor?: vscode.Position;
};

export let stickySelectionDecoration =
  vscode.window.createTextEditorDecorationType({
    backgroundColor: new vscode.ThemeColor("foreground"),
    borderRadius: "2px",
  });

let editorModes: StickySelectionEditorMode[] = [];

export function initializeNewEditor(editor: vscode.TextEditor) {
  const newEditor: StickySelectionEditorMode = {
    editor,
    stickySelectionInitialized: false,
    active: false,
  };

  editorModes.push(newEditor);

  return newEditor;
}

export function findEditorMode(editor: vscode.TextEditor) {
  const result = editorModes.find((mode) => mode.editor === editor);
  return result;
}

export function updateStickyDecorations(
  editor: vscode.TextEditor,
  editorMode: StickySelectionEditorMode
) {
  if (!editorMode.lastAnchor) {
    editor.setDecorations(stickySelectionDecoration, []);

    return;
  }
  const cursorPos = editor.selection.active;

  let decoration: vscode.DecorationOptions = {
    range: new vscode.Range(cursorPos, editorMode.lastAnchor),
  };

  editor.setDecorations(stickySelectionDecoration, [decoration]);
}
