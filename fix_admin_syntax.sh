#!/bin/bash
cat << 'INNEREOF' > replacer3.js
const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Find the stray "      reader.readAsDataURL(file);\n    }\n  };"
const regex = /      reader\.readAsDataURL\(file\);\s*}\s*};\s*/;
code = code.replace(regex, '');

fs.writeFileSync('src/pages/Admin.tsx', code);
INNEREOF
node replacer3.js
