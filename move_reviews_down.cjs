const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The block to extract
const startIdx = code.indexOf('// Reviews');
const endIdx = code.indexOf('import express from "express";');

if (startIdx !== -1 && endIdx !== -1) {
  const reviewsBlock = code.substring(startIdx, endIdx);
  code = code.substring(endIdx); // now starts with import express...

  // Let's insert reviewsBlock before `if (process.env.NODE_ENV !== 'production')`
  const viteIdx = code.indexOf('if (process.env.NODE_ENV !==');
  code = code.substring(0, viteIdx) + reviewsBlock + '\n  ' + code.substring(viteIdx);

  fs.writeFileSync('server.ts', code);
}
