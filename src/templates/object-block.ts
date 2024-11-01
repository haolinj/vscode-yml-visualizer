'use strict';

import { blockContent } from './block-content';
import updaterProps from '../updater-props';
import { WebviewPanel } from 'vscode';

export const objectBlock = (props: { key: string, block: any, activeLine: number, nextKey: string | undefined, currentPanel: WebviewPanel}) => {
  const { block, key, activeLine, nextKey, currentPanel } = props;

  const { keyLineNumber, keyWithoutLineNumber } = updaterProps();

  const nextBlockLineNumber = parseInt(nextKey === undefined ? "-1" : keyLineNumber(nextKey), 10);

  const blockLineNumber = parseInt(keyLineNumber(key), 10);

  const cleanKey = keyWithoutLineNumber(key);

  if (activeLine === blockLineNumber) {
    currentPanel.webview.postMessage({ command: 'scroll', elementId: cleanKey });
  }

  return `
    <ul id="${cleanKey}" class="root ${activeLine >= blockLineNumber && (activeLine < nextBlockLineNumber || nextBlockLineNumber === -1) ? "active" : ""}">
      <li>
        <span class="caret">
          ${cleanKey} ${typeof block === 'object' ? `(${Object.keys(block).length})` : ''}
        </span>
        <button class='btn btn-link btn-sm' onclick='window.vscode.postMessage({command:"goto",position:"${keyLineNumber(key)}"})'>
          Go to line
        </button>

        <ul class="nested active">
          ${blockContent({ key, block })}
        </ul>
      </li>
    </ul>
  `;
};