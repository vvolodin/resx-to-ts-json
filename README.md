# resx-to-ts-json

Source code for the resx-to-ts-json node module, originally forked from resx-to-typescript

Node module for converting resx files to TypeScript (models) files and JSON files.

To use this node module add a reference to your project package.json dependencies.

{
    "dependencies": {
        "resx-to-ts-json": "1.0.13"
    }
}

The script requires one parameter, the virtual path to the TypeScript file you want to add.

So, to use the module in for instance a gulp task:

var resxConverter = require('resx-to-ts-json');
resxConverter.executeResxToTs('exampleApp.resources', '/Resources', '/App/Resources');
resxConverter.executeResxToJson('/Resources', '/App/Resources/Json');

where the parameters stand for:

'exampleApp.resources'  -> TypeScript module name / namespace for the resource models.
'/Resources'            -> Relative folder to scan for .resx files.
'/App/Resources'        -> Output directory for TypeScript files
'/App/Resources/Json    -> Output directory for JSON files

executeResxToTs converts all resx files in the specified folder to TypeScript definition files (.d.ts)
executeResxToJson converts all resx files in the specified folder to JSON files (.json).

UPDATES:

2016-09-19 Switched to creating a typescript definition file (.d.ts) and added support for
                nested resources using '_' between key names.
                
2016-08-19 Refactored code and added support for multi line resources. (v 1.0.12)

Voilá, the TypeScript models for your resx files are added to your project and ready to use in typescript development/mvc bundling.