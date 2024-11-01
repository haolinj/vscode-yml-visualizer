'use strict';

import { TextDocument } from 'vscode';

const updaterProps = () => {

  const blockId = (k: string) => `collapse${k}`.replace(/[^\w\s]/gi, '');

  const isYmlFile = (document: TextDocument) =>
    document.languageId.toLowerCase() === 'yml' || document.languageId.toLowerCase() === 'yaml';

  const keyWithoutLineNumber = (k: string) => k.split("@")[0];

  const keyLineNumber = (k: string) => k.split("@")[k.split("@").length - 1];

  return {
    isYmlFile,
    keyLineNumber,
    keyWithoutLineNumber,
    blockId
  };
};

export default updaterProps;
