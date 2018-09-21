"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const addTypeScriptFile = require('add-typescript-file-to-project');
const fs = require('fs');
const mkpath = require('mkpath');
const search = require('recursive-search');
const xml2js = require('xml2js');
const async = require('async');
const virtualProjectRoot = '\\..\\..\\..\\';
function executeResxToTs(typeScriptResourcesNamespace, virtualResxFolder, virtualTypeScriptFolder, callback) {
    let files = getFilesFromFolder(virtualResxFolder);
    async.each(files, (file, cb) => {
        convertResxToTypeScriptModel(file, typeScriptResourcesNamespace, virtualTypeScriptFolder, cb);
    }, callback);
    //if (files !== undefined && files !== null) {
    //    for (let i = 0, length = files.length; i < length; i++) {   
    //        const resxFilename = files[i];
    //        convertResxToTypeScriptModel(resxFilename, typeScriptResourcesNamespace, virtualTypeScriptFolder);
    //    }
    //}
}
exports.executeResxToTs = executeResxToTs;
function executeResxToJson(virtualResxFolder, virtualJsonFolder, fileNameLanguage, callback) {
    let files = getFilesFromFolder(virtualResxFolder);
    async.each(files, (file, cb) => {
        convertResxToJson(file, virtualJsonFolder, fileNameLanguage, cb);
    }, callback);
    //if (files !== undefined && files !== null) {
    //    for (let i = 0, length = files.length; i < length; i++) {   
    //        const resxFilename = files[i];
    //        convertResxToJson(resxFilename, virtualJsonFolder, fileNameLanguage);
    //    }
    //}
}
exports.executeResxToJson = executeResxToJson;
function executeResxToTsValues(typeScriptResourcesNamespace, virtualResxFolder, virtualTypeScriptFolder, callback) {
    let files = getFilesFromFolder(virtualResxFolder);
    async.each(files, (file, cb) => {
        convertResxToTypeScriptValues(file, typeScriptResourcesNamespace, virtualTypeScriptFolder, cb);
    }, callback);
    //if (files !== undefined && files !== null) {
    //    for (let i = 0, length = files.length; i < length; i++) {   
    //        const resxFilename = files[i];
    //        convertResxToTypeScriptValues(resxFilename, typeScriptResourcesNamespace, virtualTypeScriptFolder);
    //    }
    //}
}
exports.executeResxToTsValues = executeResxToTsValues;
function getFilesFromFolder(virtualResxFolder) {
    let files = null;
    if (virtualResxFolder === undefined || virtualResxFolder === '') {
        files = search.recursiveSearchSync(/.resx$/, __dirname + virtualProjectRoot);
    }
    else {
        virtualResxFolder = virtualResxFolder.replace(/\//g, '\\');
        let safeVirtualFolder = virtualResxFolder;
        if (safeVirtualFolder.charAt(0) === '\\') {
            safeVirtualFolder = safeVirtualFolder.substr(1);
        }
        if (safeVirtualFolder.charAt(safeVirtualFolder.length - 1) === '\\') {
            safeVirtualFolder = safeVirtualFolder.substr(0, safeVirtualFolder.length - 1);
        }
        files = search.recursiveSearchSync(/.resx$/, __dirname + virtualProjectRoot + safeVirtualFolder);
    }
    if (files !== undefined && files !== null) {
        const filesAsString = JSON.stringify(files).replace('[', "").replace(']', "");
        const splittedFiles = filesAsString.split(',');
        let cleanedFiles = splittedFiles.map((fileName) => fileName.trim().replace(/"/g, "").replace(/\\\\/g, "\\"));
        return cleanedFiles;
    }
}
function convertResxToTypeScriptValues(resxFilename, typeScriptResourcesNamespace, virtualTypeScriptFolder, callback) {
    fs.readFile(resxFilename, function (err, data) {
        const parser = new xml2js.Parser();
        parser.parseString(data, function (err, result) {
            if (err && callback) {
                callback(err);
                return;
            }
            if (result !== undefined) {
                convertXmlToTypeScriptValuesFile(result, resxFilename, typeScriptResourcesNamespace, virtualTypeScriptFolder);
                if (callback !== undefined) {
                    callback();
                }
            }
        });
    });
}
function convertResxToTypeScriptModel(resxFilename, typeScriptResourcesNamespace, virtualTypeScriptFolder, callback) {
    fs.readFile(resxFilename, function (err, data) {
        const parser = new xml2js.Parser();
        parser.parseString(data, function (err, result) {
            if (err && callback) {
                callback(err);
                return;
            }
            if (result !== undefined) {
                convertXmlToTypeScriptModelFile(result, resxFilename, typeScriptResourcesNamespace, virtualTypeScriptFolder);
                if (callback !== undefined) {
                    callback();
                }
            }
        });
    });
}
function convertResxToJson(resxFilename, virtualJsonFolder, fileNameLanguage, callback) {
    fs.readFile(resxFilename, function (err, data) {
        const parser = new xml2js.Parser();
        parser.parseString(data, function (err, result) {
            if (err && callback) {
                callback(err);
                return;
            }
            if (result !== undefined) {
                convertXmlToJsonFile(result, resxFilename, virtualJsonFolder, fileNameLanguage);
                if (callback !== undefined) {
                    callback();
                }
            }
        });
    });
}
function convertXmlToDictionary(xmlObject) {
    let dictionary = {};
    if (xmlObject.root.data !== undefined) {
        for (let i = 0, nrOfResourcesInFile = xmlObject.root.data.length; i < nrOfResourcesInFile; i++) {
            const key = xmlObject.root.data[i].$.name; // 
            const value = xmlObject.root.data[i].value.toString();
            parseToDictionaryItem(key, value, dictionary);
        }
    }
    return dictionary;
}
function parseToDictionaryItem(key, value, dictionary) {
    if (!dictionary) {
        dictionary = {};
    }
    if (!key.length) {
        return;
    }
    let nestedKeyIndex = key.indexOf("_");
    if (nestedKeyIndex >= 0) {
        let firstKey = key.substring(0, nestedKeyIndex);
        let restKey = key.substring(nestedKeyIndex + 1);
        if (!dictionary.hasOwnProperty(firstKey)) {
            dictionary[firstKey] = {};
        }
        parseToDictionaryItem(restKey, value, dictionary[firstKey]);
    }
    else {
        dictionary[key] = value;
    }
}
function convertDictionaryToTsMapping(dictionary, nest) {
    let nestedTabs = "";
    for (var i = 0; i < nest; i++) {
        nestedTabs += "\t";
    }
    var childNestedTabs = nestedTabs + "\t";
    var result = "{\n";
    var keys = Object.keys(dictionary);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = dictionary[key];
        if (typeof value == "string") {
            result += childNestedTabs + key + ": string";
        }
        else if (typeof value == "object") {
            result += childNestedTabs + key + ": " + convertDictionaryToTsMapping(value, nest + 1);
        }
        result += ";\n";
    }
    result += nestedTabs + "}";
    return result;
}
function convertDictionaryToTsValues(dictionary, nest, prefix = '') {
    let nestedTabs = "";
    for (var i = 0; i < nest; i++) {
        nestedTabs += "\t";
    }
    var childNestedTabs = nestedTabs + "\t";
    var result = "{\n";
    var keys = Object.keys(dictionary);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = dictionary[key];
        if (typeof value == "string") {
            result += childNestedTabs + key + ": \"" + prefix + key + "\"";
        }
        else if (typeof value == "object") {
            /* if (prefix !== '') {
                prefix = prefix + key + '.';
            } else {
                prefix = key + '.';
            } */
            result += childNestedTabs + key + ": " + convertDictionaryToTsValues(value, nest + 1, prefix + key + '.');
        }
        if (i < keys.length - 1) {
            result += ",\n";
        }
        else {
            result += "\n";
        }
    }
    result += nestedTabs + "}";
    return result;
}
function convertXmlToTypeScriptValuesFile(xmlObject, resxFilename, typeScriptResourcesNamespace, virtualTypeScriptFolder, callback) {
    const projectRoot = getProjectRoot();
    const relativeResxFilename = resxFilename.replace(projectRoot, "").replace(/\\/g, "/");
    const className = resxFilename.substr(resxFilename.lastIndexOf("\\") + 1).replace('.resx', '').replace(".", "_");
    let content = '// TypeScript Resx model for: ' + relativeResxFilename + '\n' +
        '// Auto generated by resx-to-ts-json (npm package)' + '\n' + '\n';
    //content = content + 'declare module ' + typeScriptResourcesNamespace + ' {\n';
    content = content + 'export const ' + className + ': ' + typeScriptResourcesNamespace + '.' + className + ' = ';
    let dictionary = convertXmlToDictionary(xmlObject);
    content = content + convertDictionaryToTsValues(dictionary, 0, className + '.');
    content = content + '\n'; //'\n}\n';
    // Write model if resources found
    if (Object.keys(dictionary).length > 0) {
        const relativeTsFilename = relativeResxFilename.replace('.resx', '.d.ts');
        const tsFileName = resxFilename.replace('.resx', '.ts');
        if (virtualTypeScriptFolder === undefined || virtualTypeScriptFolder === '') {
            // Write the file aside of the the resx file.
            fs.writeFileSync(tsFileName, content);
            addTypeScriptFile.execute(tsFileName);
        }
        else {
            // Write the file to the given output folder.
            const tsFileNameWithoutPath = tsFileName.substr(tsFileName.lastIndexOf('\\') + 1);
            const outputFileName = (projectRoot + virtualTypeScriptFolder + '\\' + tsFileNameWithoutPath).split('/').join('\\');
            const relativeOutputFileName = virtualTypeScriptFolder + '/' + tsFileNameWithoutPath;
            mkpath.sync(projectRoot + virtualTypeScriptFolder, '0700');
            fs.writeFileSync(outputFileName, content);
            addTypeScriptFile.execute(relativeOutputFileName);
        }
    }
}
function convertXmlToTypeScriptModelFile(xmlObject, resxFilename, typeScriptResourcesNamespace, virtualTypeScriptFolder) {
    const projectRoot = getProjectRoot();
    const relativeResxFilename = resxFilename.replace(projectRoot, "").replace(/\\/g, "/");
    const className = resxFilename.substr(resxFilename.lastIndexOf("\\") + 1).replace('.resx', '').replace(".", "_");
    let content = '// TypeScript Resx model for: ' + relativeResxFilename + '\n' +
        '// Auto generated by resx-to-ts-json (npm package)' + '\n' + '\n';
    content = content + 'declare module ' + typeScriptResourcesNamespace + ' {\n';
    content = content + '\texport class ' + className + ' ';
    let dictionary = convertXmlToDictionary(xmlObject);
    content = content + convertDictionaryToTsMapping(dictionary, 1);
    content = content + '\n}\n';
    // Write model if resources found
    if (Object.keys(dictionary).length > 0) {
        const relativeTsFilename = relativeResxFilename.replace('.resx', '.d.ts');
        const tsFileName = resxFilename.replace('.resx', '.d.ts');
        if (virtualTypeScriptFolder === undefined || virtualTypeScriptFolder === '') {
            // Write the file aside of the the resx file.
            fs.writeFileSync(tsFileName, content);
            addTypeScriptFile.execute(tsFileName);
        }
        else {
            // Write the file to the given output folder.
            const tsFileNameWithoutPath = tsFileName.substr(tsFileName.lastIndexOf('\\') + 1);
            const outputFileName = (projectRoot + virtualTypeScriptFolder + '\\' + tsFileNameWithoutPath).split('/').join('\\');
            const relativeOutputFileName = virtualTypeScriptFolder + '/' + tsFileNameWithoutPath;
            mkpath.sync(projectRoot + virtualTypeScriptFolder, '0700');
            fs.writeFileSync(outputFileName, content);
            addTypeScriptFile.execute(relativeOutputFileName);
        }
    }
}
function convertXmlToJsonFile(xmlObject, resxFilename, virtualJsonFolder, fileNameLanguage, callback) {
    const projectRoot = getProjectRoot();
    const relativeResxFilename = resxFilename.replace(projectRoot, "").replace(/\\/g, "/");
    let dictionary = convertXmlToDictionary(xmlObject);
    let content = JSON.stringify(dictionary);
    // Write model if resources found
    if (Object.keys(dictionary).length > 0) {
        const relativeJsonFilename = relativeResxFilename.replace('.resx', '.json');
        const jsonFileName = resxFilename.replace('.resx', '.json');
        if (virtualJsonFolder === undefined || virtualJsonFolder === '') {
            // Write the file aside of the the resx file.
            fs.writeFileSync(jsonFileName, content);
        }
        else {
            // Write the file to the given output folder.
            let jsonFileNameWithoutPath = jsonFileName.substr(jsonFileName.lastIndexOf('\\') + 1);
            if (fileNameLanguage) {
                let fileNameWithoutExtension = jsonFileNameWithoutPath.substring(0, jsonFileNameWithoutPath.indexOf(".json"));
                jsonFileNameWithoutPath = `${fileNameWithoutExtension}.${fileNameLanguage}.json`;
            }
            const outputFileName = (projectRoot + virtualJsonFolder + '\\' + jsonFileNameWithoutPath).split('/').join('\\');
            const relativeOutputFileName = virtualJsonFolder + '/' + jsonFileNameWithoutPath;
            mkpath.sync(projectRoot + virtualJsonFolder, '0700');
            fs.writeFileSync(outputFileName, content);
        }
    }
}
function getProjectRoot() {
    const splittedDirName = __dirname.split('\\');
    const splittedRootDirName = [];
    for (let i = 0, length = splittedDirName.length - 3; i < length; i++) {
        splittedRootDirName.push(splittedDirName[i]);
    }
    return splittedRootDirName.join('\\');
}
function decapitalizeFirstLetter(input) {
    return input.charAt(0).toLowerCase() + input.slice(1);
}
//# sourceMappingURL=index.js.map