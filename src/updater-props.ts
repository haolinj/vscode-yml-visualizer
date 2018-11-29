'use strict';

import * as fp from 'lodash/fp';
import { TextDocument } from 'vscode';

const updaterProps = () => {

  const blockId = (k: string) => `collapse${k}`.replace(/[^\w\s]/gi, '');

  const isYmlFile = (document: TextDocument) =>
    document.languageId.toLowerCase() === 'yml' || document.languageId.toLowerCase() === 'yaml';

  const keyWithoutLineNumber = (k: string) => fp.first(fp.split('@')(k));

  const keyLineNumber = (k: string) => fp.last(fp.split('@')(k));

  return {
    isYmlFile,
    keyLineNumber,
    keyWithoutLineNumber,
    blockId
  };
};

export default updaterProps;
