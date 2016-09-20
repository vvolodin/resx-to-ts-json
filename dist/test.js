"use strict";
var program = require('./index');
program.execute('app.resources', '/custom/node-resx-to-typescript/Resources', '/custom/node-resx-to-typescript/Resources/_generated');
program.executeResxToJson('/custom/node-resx-to-typescript/Resources', '/custom/node-resx-to-typescript/Resources/_generated/json');
//# sourceMappingURL=test.js.map