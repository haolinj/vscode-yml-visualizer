'use strict';

import * as fp from 'lodash/fp';
import updaterProps from '../updater-props';

export const blockContent = (props: any): string => {

  const { key, block } = props;

  const { blockId, keyWithoutLineNumber } = updaterProps();

  if (typeof block === 'object' && !Array.isArray(block)) {
    const innerBlockKeys = fp.keys(block);
    return `
      ${fp.reduce((res: string, innerBlockKey: string) =>
        `${res}
          <div style='margin-bottom: 20px;'>
          
            <button
              class='btn btn-success collapsed' 
              aria-expanded='false' 
              data-toggle='collapse' 
              aria-controls='${blockId(key + innerBlockKey)}'
              data-target='#${blockId(key + innerBlockKey)}'>
              ${innerBlockKey} ${typeof block[innerBlockKey] === 'object' ? `(${fp.keys(block[innerBlockKey]).length})` : ''}
              <i class='fas'></i>
            </button>
          </div>
          <div class='card collapse' style='margin-bottom: 20px;' id='${blockId(key + innerBlockKey)}'>
            <div class='card-body'>
              ${blockContent({ key: innerBlockKey, block: block[innerBlockKey] })}
            </div>
          </div>
        `)('')(innerBlockKeys)}`;
  }

  if (Array.isArray(block)) {
    return `
    ${fp.reduce((res: string, item: any) =>
        `${res}
      <div class='card' style='margin-bottom: 20px;'>
        <div class='card-body'>
          ${blockContent({ key, block: item })}
        </div>
      </div>`)('')(block)}`;
  }

  return `
        <h5 class='card-title'>${keyWithoutLineNumber(key)}</h5>
        <div class='card-text'>${block}</div>`;
};