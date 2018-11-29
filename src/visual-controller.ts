'use strict';

import {
  window,
  TextEditor,
  WebviewPanel,
  Disposable
} from 'vscode';
import * as yaml from 'js-yaml';
import * as fp from 'lodash/fp';
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

      console.log('Start visualizing...');

      const yamlContent = textEditor.document.getText();

      const rootObject = yaml.safeLoad(yamlContent);

      let blocks = '';

      const lines = fp.flow(
        fp.split('\n'),
        // @ts-ignore
        fp.convert({ cap: false }).reduce((res: any, content: string, index: number) => ({
          ...res,
          [index]: content
        }))({})
      )(yamlContent) as ILines;

      // Array has different structure and viewing templates.
      if (Array.isArray(rootObject)) {
        console.log('Visualizing array...');

        const list = rootObject;

        const listWithLineNumber = fp.map((item: any) => {
          const firstKey = fp.first(fp.keys(item)) || '';
          const keyValue = `${firstKey}: ${item[firstKey]}`;
          const lineKeys = fp.keys(lines);
          const line = fp.find((l: number) => fp.includes(keyValue)(lines[l]))(lineKeys) || 0;
          return { ...item, ['plugin:lineNumber']: line };
        })(list);

        // @ts-ignore
        blocks = fp.convert({ cap: false }).reduce((res: string, block: any, index: number) =>
          res + templates.listBlock({ index, block }))('')(listWithLineNumber);
      }
      else {
        console.log('Visualizing object...');

        const jsonContent = rootObject;

        const objectWithLineNumber = fp.flow(
          fp.keys,
          fp.reduce((res: any, key: string) => {
            const lineKeys = fp.keys(lines);
            const line = fp.find((l: number) => fp.first(fp.split(':')(lines[l])) === key)(lineKeys);
            return {
              ...res,
              [`${key}@${line}`]: jsonContent[key]
            };
          })({})
        )(jsonContent);

        // @ts-ignore
        blocks = fp.convert({ cap: false }).reduce((res: string, block: any, key: string) =>
          res + templates.objectBlock({ key, block }))('')(objectWithLineNumber);
      }

      const totalBlocks = fp.keys(rootObject).length;

      currentPanel.webview.html = templates.main(templates.content({ totalBlocks, blocks }));

      console.log('Finished.');
    }
    catch (err) {
      console.error(err);
    }
  }

  private onEvent() {
    this.visualUpdater(this.currentPanel, this.openEditor);
  }

  public dispose() {
    console.log('Disposing the visual controller subscriptions.');
    if (this.disposable) {
      this.disposable.dispose();
    }
  }

  public restore() {
    console.log('Restoring the visual controller subscriptions.');

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
