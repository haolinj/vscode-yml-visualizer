'use strict';

import * as fp from 'lodash/fp';
import { blockContent } from './block-content';
import updaterProps from '../updater-props';

export const objectBlock = (props: { key: string, block: any }) => {
  const { block, key } = props;

  const { blockId, keyLineNumber, keyWithoutLineNumber } = updaterProps();

  const cleanKey = keyWithoutLineNumber(key);

  return `
    <div class='card'>
      <div class='card-body'>
        <div class='card-title'>
          <button 
            class='btn btn-primary' 
            aria-expanded='true' 
            data-toggle='collapse' 
            aria-controls='${blockId(key)}'
            data-target='#${blockId(key)}'>
            ${cleanKey} ${typeof block === 'object' ? `(${fp.keys(block).length})` : ''}
            <i class='fas'></i>
          </button>
          <button class='btn btn-light' 
            onclick='window.vscode.postMessage({command:"goto",position:"${keyLineNumber(props.key)}"})'>
            view
          </button>
        </div>
        <div class='card-body collapse show' id='${blockId(key)}'>
          ${blockContent({ key, block })}
        </div>
      </div>
    </div>
  `;
};