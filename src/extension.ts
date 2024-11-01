'use strict';

import {
  commands,
  ExtensionContext,
  window,
  ViewColumn,
  TextEditor,
  Selection,
  WebviewPanel,
  Range
} from 'vscode';
import VisualController from './visual-controller';

export function activate(context: ExtensionContext) {
  let currentPanel: WebviewPanel | undefined = undefined;
  let openEditor: TextEditor | undefined = undefined;

  console.log('Congratulations, your extension "yaml visualizer" is now active!');

  const controller = new VisualController(currentPanel, openEditor);

  // registerTextEditorCommand only available when there is an active text editor open.
  const yamlVisualizer = commands.registerTextEditorCommand('extension.visualizer.open', (textEditor: TextEditor) => {
    try {
      // Restore the disposed listeners.
      controller.restore();

      if (!currentPanel) {
        const panel = window.createWebviewPanel(
          'visualizer', 'Yaml Visualizer', ViewColumn.Two, { enableScripts: true });

        currentPanel = panel;

        // Based on the received message from the webview, move the selection in the text editor to 
        // the desired location.
        currentPanel.webview.onDidReceiveMessage((message: { command: string, position: string }) => {
          if (message.command === 'goto') {
            const nextPosition = parseInt(message.position, 10);

            if (textEditor) {
              const position = textEditor.selection.active;
              const startPosition = position.with(nextPosition, 0);
              const endPosition = position.with(nextPosition + 10, 0);
              const newSelection = new Selection(startPosition, startPosition);
              textEditor.selection = newSelection;
              textEditor.revealRange(new Range(startPosition, endPosition));
            }
          }
          else {
            console.log(`Unknown command [${message.command}] from webview.`);
          }
        }, undefined, context.subscriptions);
      }
      else {
        currentPanel.reveal(ViewColumn.Two);
      }

      openEditor = textEditor;

      controller.updateContext(currentPanel, openEditor);

      // Make sure the current panel is reset, so when the extension open triggered, new panel can be created.
      // ALso make sure all the subscriptions in the controller are disposed, so it won't get fired in the background.
      currentPanel.onDidDispose(() => {
        currentPanel = undefined;
        controller.dispose();
      }, undefined, context.subscriptions);

      // Adds the disposables to the context, making sure the dispose() will be handled when extension is deactivated.
      context.subscriptions.push(controller);
    }
    catch (err) {
      console.error(err);
    }
  });

  // Adds the disposables to the context, making sure the dispose() will be handled when extension is deactivated.
  context.subscriptions.push(yamlVisualizer);
}

// It seems this only be called when VS Code closes or the extension disabled/uninstalled
// Once the extension is activated, it will be running until VS Code closes or extension disabled/uninstalled.
export function deactivate() {
  console.log('Extension deactivated.');
}
