'use strict';

import {
  window,
  TextEditor,
  WebviewPanel,
  Disposable
} from 'vscode';
import * as yaml from 'js-yaml';
import { CLOUDFORMATION_SCHEMA } from 'js-yaml-cloudformation-schema';
import updaterProps from './updater-props';
import * as templates from './templates';

interface ILines {
  [line: number]: string;
}

class VisualController {
  private disposable?: Disposable;
  private openEditor?: TextEditor;
  private currentPanel?: WebviewPanel;
  private updateProps: any;

  constructor(currentPanel?: WebviewPanel, openEditor?: TextEditor) {
    this.openEditor = openEditor;
    this.currentPanel = currentPanel;
    this.updateProps = updaterProps();
    this.restore();
  }

  private visualUpdater = (currentPanel?: WebviewPanel, textEditor?: TextEditor) => {
    try {
      const { isYmlFile } = this.updateProps;

      if (!textEditor) {
        window.showErrorMessage('Please open a YAML file');
        return;
      }

      if (!isYmlFile(textEditor.document)) {
        window.showErrorMessage('Can preview only YAML file');
        return;
      }

      if (!currentPanel) {
        window.showErrorMessage('No open preview panel');
        return;
      }

      console.info('Start visualizing...');

      console.info("SELECTIONS", textEditor.selection.active.line);

      const activeLine = textEditor.selection.active.line;

      const yamlContent = textEditor.document.getText();

      const rootObject = yaml.load(yamlContent, { schema: CLOUDFORMATION_SCHEMA }) as { [k: string]: unknown };

      let blocks = '';

      const lines: ILines = yamlContent.split("\n").reduce((res, content, index) => ({
        ...res,
        [index]: content
      }), {});

      // Array has different structure and viewing templates.
      if (Array.isArray(rootObject)) {
        console.info('Visualizing array...');

        const list = rootObject;

        const listWithLineNumber = list.map((item) => {
          const firstKey = Object.keys(item)[0] ?? "";
          const keyValue = `${firstKey}: ${item[firstKey]}`;
          const lineKeys = Object.keys(lines);
          const line = lineKeys.find((l) => lines[parseInt(l)].includes(keyValue)) ?? 0;

          return {
            ...item,
            ['plugin:lineNumber']: line
          };
        });

        blocks = listWithLineNumber.reduce((res: string, block: any, index: number) =>
          res + templates.listBlock({ index, block }), "");
      }
      else {
        console.info('Visualizing object...');

        const jsonContent = rootObject;

        const objectWithLineNumber: {[key: string]: unknown} = Object.keys(jsonContent).reduce((res, key) => {
          const lineKeys = Object.keys(lines);

          const line = lineKeys.find((l) => lines[parseInt(l)].split(":")[0] === key);

          return {
            ...res,
            [`${key}@${line}`]: jsonContent[key]
          };
        }, {});

        const objectLineNumberKeys = Object.keys(objectWithLineNumber);

        blocks = objectLineNumberKeys.reduce((res: string, key: string, index: number) =>
          res + templates.objectBlock({ key, block: objectWithLineNumber[key], nextKey: objectLineNumberKeys[index + 1], activeLine, currentPanel }), "");
      }

      const totalBlocks = Object.keys(rootObject).length;

      currentPanel.webview.html = templates.main(templates.content({ totalBlocks, blocks }));

      console.info('Finished.');
    }
    catch (err) {
      console.error(err);

      if (!currentPanel) {
        window.showErrorMessage('No open preview panel');
        return;
      }

      const error = err as Error;

      currentPanel.webview.html = `<html><body style="background-color:white; color:black;"><h2>Invalid YAML</h2> <p>${error.message}</p></body></html>`;
    }
  };

  private onEvent() {
    this.visualUpdater(this.currentPanel, this.openEditor);
  }

  public dispose() {
    console.info('Disposing the visual controller subscriptions.');
    if (this.disposable) {
      this.disposable.dispose();
    }
  }

  public restore() {
    console.info('Restoring the visual controller subscriptions.');

    if (this.disposable) {
      this.disposable.dispose();
    }

    let subscriptions: Disposable[] = [];

    window.onDidChangeTextEditorSelection(this.onEvent, this, subscriptions);

    window.onDidChangeActiveTextEditor(this.onEvent, this, subscriptions);

    // create a combined disposable from both event subscriptions
    this.disposable = Disposable.from(...subscriptions);
  }

  public updateContext(currentPanel?: WebviewPanel, openEditor?: TextEditor) {
    this.currentPanel = currentPanel;
    this.openEditor = openEditor;
  }
}

export default VisualController;
