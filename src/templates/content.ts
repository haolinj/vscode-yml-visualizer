'use strict';

export const content = (props: { totalBlocks: number, blocks: string }) => `
<div class='row'>
  <div class='col-12'>
    <p style='font-size: 28px;'>
      You have <b>${props.totalBlocks}</b> blocks in the file.
    </p>
    ${props.blocks}
  </div>
</div>
`;