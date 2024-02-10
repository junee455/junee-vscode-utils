// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import {
  updateStickyDecorations,
  findEditorMode,
  initializeNewEditor,
  stickySelectionDecoration,
} from "./core";

import {
  deleteSelection,
  cutSelection,
  copySelection,
} from "./extendedEditorActions";

async function toggleMaximizeEditor() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  await vscode.commands
    .executeCommand("workbench.action.toggleMaximizeEditorGroup")
    .then((res) => {
      console.log(res);
    });

  // console.log(vscode.window.visibleTextEditors.map((ed) => ed.visibleRanges.map((range) => range.isEmpty())));
}

async function onToggleStickySelection() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  const editorMode = findEditorMode(editor) || initializeNewEditor(editor);

  if (!editorMode.stickySelectionInitialized) {
    editorMode.stickySelectionInitialized = true;

    vscode.window.onDidChangeTextEditorSelection((ev) => {
      if (!editorMode.active || !editorMode.lastAnchor) {
        return;
      }

      updateStickyDecorations(editor, editorMode);
    });
  }

  editorMode.active = !editorMode.active;

  if (editorMode.active) {
    editorMode.lastAnchor = editor.selection.anchor;

    editor.selections = [
      new vscode.Selection(editor.selection.active, editor.selection.active),
    ];

    updateStickyDecorations(editor, editorMode);
  } else {
    editor.setDecorations(stickySelectionDecoration, []);

    if (editorMode.lastAnchor) {
      editor.selections = [
        new vscode.Selection(editorMode.lastAnchor, editor.selection.active),
      ];
    }

    editorMode.lastAnchor = undefined;
  }
}

async function swapCursorPosition() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  const editorMode = findEditorMode(editor) || initializeNewEditor(editor);

  if (editorMode.active) {
    let cursorPosition = editor.selection.active;
    [editorMode.lastAnchor, cursorPosition] = [
      cursorPosition,
      editorMode.lastAnchor!,
    ];

    editor.selections = [new vscode.Selection(cursorPosition, cursorPosition)];

    editor.revealRange(new vscode.Range(cursorPosition, cursorPosition));

    return;
  }

  // swap existing selections
  if (!editor.selection.isEmpty) {
    const range = editor.selection.anchor.isBefore(editor.selection.active)
      ? [editor.selection.end, editor.selection.start]
      : [editor.selection.start, editor.selection.end];

    editor.selection = new vscode.Selection(
      ...(range as [vscode.Position, vscode.Position])
    );

    editor.revealRange(new vscode.Range(range[1], range[1]));

    return;
  }
}

const commands: [string, (...args: any[]) => any][] = [
  ["junee-utils.toggleStickySelection", onToggleStickySelection],
  ["junee-utils.swapPosition", swapCursorPosition],
  ["junee-utils.copy", copySelection],
  ["junee-utils.cut", cutSelection],
  ["junee-utils.delete", deleteSelection],
  ["junee-utils.toggleMaximizeEditor", toggleMaximizeEditor],
];
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  commands.forEach((command: [string, (...args: any[]) => any]) => {
    const disposable = vscode.commands.registerCommand(...command);
    context.subscriptions.push(disposable);
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
