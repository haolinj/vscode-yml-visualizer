'use strict';

import { blockContent } from './block-content';

export const listBlock = (props: { index: number, block: any }) => {
  const { index, block } = props;

  const {["plugin:lineNumber"]: removedKey, ...blockWithoutPluginKey} = block;

  return `
    <div class='card' style='margin-bottom: 20px;'>
      <div class='card-body'>
        <div class='card-title'>
          <button 
            class='btn btn-primary btn-block' 
            aria-expanded='true' 
            data-toggle='collapse' 
            aria-controls='collapse${index}'
            data-target='#collapse${index}'>
            Block <b>${index + 1}</b> ${typeof block === 'object' ? `(${Object.keys(block).length})` : ''}
            <i class='fas'></i>
          </button>
          <button 
            class='btn btn-light' 
            onclick='window.vscode.postMessage({command:"goto",position:"${block['plugin:lineNumber']}"})'>
            view
          </button>
        </div>
        <div class='card-text collapse show' id='collapse${index}'>
          ${blockContent({ key: index, block: blockWithoutPluginKey })}
        </div>
      </div>
    </div>
  `;
};