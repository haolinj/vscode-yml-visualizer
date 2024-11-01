'use strict';

export const blockContent = (props: any): string => {

  const { key, block } = props;

  if (typeof block === 'object' && !Array.isArray(block)) {
    const innerBlockKeys = Object.keys(block);

    return `${innerBlockKeys.reduce((res: string, innerBlockKey: string) =>
      `${res}
      <li>
        <span class="caret">
          ${innerBlockKey} ${typeof block[innerBlockKey] === 'object' ? `(${Object.keys(block[innerBlockKey]).length})` : ''}
        </span>
        <ul class="nested active">
          ${blockContent({ key: innerBlockKey, block: block[innerBlockKey] })}
        </ul>
      </li>
    `, '')}`;
  }

  if (Array.isArray(block)) {
    return `${block.reduce((res: string, item: any) =>
          `${res}
          <li id="${key}">
            ${blockContent({ key, block: item })}
          </li>`, '')}`;
  }

  return `<li><strong>${block}</strong></li>`;
};