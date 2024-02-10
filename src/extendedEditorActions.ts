import * as vscode from "vscode";

import { findEditorMode, updateStickyDecorations } from "./core";

async function executeExtended(editorCommand: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const editorMode = findEditorMode(editor);

  if (!editorMode || !editorMode.active || !editorMode.lastAnchor) {
    await vscode.commands.executeCommand(editorCommand);

    return;
  }

  editor.selections = [
    new vscode.Selection(editorMode.lastAnchor, editor.selection.active),
  ];

  await vscode.commands.executeCommand(editorCommand);
  editorMode.active = false;
  editorMode.lastAnchor = undefined;
  updateStickyDecorations(editor, editorMode);
}

export async function copySelection() {
  await executeExtended("editor.action.clipboardCopyAction");
}

export async function cutSelection() {
  await executeExtended("editor.action.clipboardCutAction");
}

export async function deleteSelection() {
  await executeExtended("deleteLeft");
}
