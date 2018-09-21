"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("./index");
program.executeResxToTs('app.resources', './dev/resx-to-ts-json/Resources', './Resources/_generated');
program.executeResxToTsValues('app.resources', './dev/resx-to-ts-json/Resources', './Resources/_generated');
program.executeResxToJson('./dev/resx-to-ts-json/Resources', './Resources/_generated/json');
//# sourceMappingURL=test.js.map