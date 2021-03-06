declare const __dirname: string;
declare const require: any;

const addTypeScriptFile = require('add-typescript-file-to-project');
import * as fs from 'fs';
//const path = require('path');
import * as path from 'path';
const mkpath = require('mkpath');
const search = require('recursive-search');
const xml2js = require('xml2js');
const async = require('async');

const virtualProjectRoot = '/../../../';

interface Dictionary {
    [key: string]: string | Dictionary;
}

export function executeResxToTs(typeScriptResourcesNamespace: string, virtualResxFolder: string, virtualTypeScriptFolder: string, callback?: () => void, skipAddingFiles?: boolean): void {
    let files = getFilesFromFolder(virtualResxFolder);

    async.each(files, (file: string, cb: () => void) => {
        convertResxToTypeScriptModel(file, typeScriptResourcesNamespace, virtualTypeScriptFolder, cb, skipAddingFiles);
    }, callback);

    //if (files !== undefined && files !== null) {
    //    for (let i = 0, length = files.length; i < length; i++) {   
    //        const resxFilename = files[i];
    //        convertResxToTypeScriptModel(resxFilename, typeScriptResourcesNamespace, virtualTypeScriptFolder);
    //    }
    //}
}

export function executeResxToJson(virtualResxFolder: string, virtualJsonFolder: string, fileNameLanguage?: string, callback?: () => void, skipAddingFiles?: boolean): void {
    let files = getFilesFromFolder(virtualResxFolder);

    async.each(files, (file: string, cb: () => void) => {
        convertResxToJson(file, virtualJsonFolder, fileNameLanguage, cb);
    }, callback);

    //if (files !== undefined && files !== null) {
    //    for (let i = 0, length = files.length; i < length; i++) {   
    //        const resxFilename = files[i];
    //        convertResxToJson(resxFilename, virtualJsonFolder, fileNameLanguage);
    //    }
    //}
}

export function executeResxToTsValues(typeScriptResourcesNamespace: string, virtualResxFolder: string, virtualTypeScriptFolder: string, callback?: () => void, skipAddingFiles?: boolean): void {
    let files = getFilesFromFolder(virtualResxFolder);

    async.each(files, (file: string, cb: () => void) => {
        convertResxToTypeScriptValues(file, typeScriptResourcesNamespace, virtualTypeScriptFolder, cb, skipAddingFiles);
    }, callback);

    //if (files !== undefined && files !== null) {
    //    for (let i = 0, length = files.length; i < length; i++) {   
    //        const resxFilename = files[i];
    //        convertResxToTypeScriptValues(resxFilename, typeScriptResourcesNamespace, virtualTypeScriptFolder);
    //    }
    //}
}

function getFilesFromFolder(virtualResxFolder: string): any {
    let files: any = null;

    if (virtualResxFolder === undefined || virtualResxFolder === '') {
        files = search.recursiveSearchSync(/.resx$/, __dirname + virtualProjectRoot );   
    } 
    else {
        //virtualResxFolder = virtualResxFolder.replace(/\//g, '\\');
        
        let safeVirtualFolder = virtualResxFolder;
        
        if (safeVirtualFolder.charAt(0) === '\\' || safeVirtualFolder.charAt(0) === '/')
        {
            safeVirtualFolder = safeVirtualFolder.substr(1);
        } 
        if (safeVirtualFolder.charAt(safeVirtualFolder.length-1) === '\\' || safeVirtualFolder.charAt(safeVirtualFolder.length-1) === '/')
        {
            safeVirtualFolder = safeVirtualFolder.substr(0, safeVirtualFolder.length-1);
        } 
        
        files = search.recursiveSearchSync(/.resx$/, __dirname + virtualProjectRoot + safeVirtualFolder );      
    }
    
    if (files !== undefined && files !== null) {
        const filesAsString = JSON.stringify(files).replace('[', "").replace(']', "");
        const splittedFiles = filesAsString.split(',');
        let cleanedFiles = splittedFiles.map((fileName) => fileName.trim().replace(/"/g,"").replace(/\\\\/g,"\\")); 

        return cleanedFiles;
    }
}

function convertResxToTypeScriptValues(resxFilename: string, typeScriptResourcesNamespace: string, virtualTypeScriptFolder: string, callback?: (err?: any) => any, skipAddingFiles?: boolean): void {
    fs.readFile(resxFilename, function(err: any, data: any) {
        const parser = new xml2js.Parser();

        parser.parseString(data, function (err: any, result: any) {
            if (err && callback) {
                callback(err);
                return;
            }
            if (result !== undefined) {
                convertXmlToTypeScriptValuesFile(result, resxFilename, typeScriptResourcesNamespace, virtualTypeScriptFolder, skipAddingFiles);
                if (callback !== undefined) {
                    callback();
                }
            }
        });  
    });    
}

function convertResxToTypeScriptModel(resxFilename: string, typeScriptResourcesNamespace: string, virtualTypeScriptFolder: string, callback?: (err?: any) => any, skipAddingFiles?: boolean): void {
    fs.readFile(resxFilename, function(err: any, data: any) {
        const parser = new xml2js.Parser();

        parser.parseString(data, function (err: any, result: any) {
            if (err && callback) {
                callback(err);
                return;
            }
            if (result !== undefined) {
                convertXmlToTypeScriptModelFile(result, resxFilename, typeScriptResourcesNamespace, virtualTypeScriptFolder, skipAddingFiles);
                if (callback !== undefined) {
                    callback();
                }
            }
        });
    });
}

function convertResxToJson(resxFilename: string, virtualJsonFolder: string, fileNameLanguage?: string, callback?: (err?: any) => any): void {
    fs.readFile(resxFilename, function(err: any, data: any) {
        const parser = new xml2js.Parser();

        parser.parseString(data, function (err: any, result: any) {
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

function convertXmlToDictionary(xmlObject: any) {
    let dictionary: Dictionary = {};

    if (xmlObject.root.data !== undefined) { 
        for (let i = 0, nrOfResourcesInFile = xmlObject.root.data.length; i < nrOfResourcesInFile; i++) {
            const key = xmlObject.root.data[i].$.name; // 
            const value =  xmlObject.root.data[i].value.toString();   

            parseToDictionaryItem(key, value, dictionary);  
        }           
    }

    return dictionary;
}

function parseToDictionaryItem(key: string, value: string, dictionary: Dictionary) {
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
            dictionary[firstKey] = <Dictionary>{};
        }

        parseToDictionaryItem(restKey, value, <Dictionary>dictionary[firstKey])
    } else {
        dictionary[key] = value;
    }
}

function convertDictionaryToTsMapping(dictionary: Dictionary, nest: number) {
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
            result += childNestedTabs + key + ": " + convertDictionaryToTsMapping(<Dictionary>value, nest + 1);
        }
        result += ";\n";
    }

    result += nestedTabs + "}";

    return result;
}

function convertDictionaryToTsValues(dictionary: Dictionary, nest: number, prefix: string = '') {
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
            result += childNestedTabs + key + ": " + convertDictionaryToTsValues(<Dictionary>value, nest + 1, prefix + key + '.');
        }
        if (i < keys.length - 1) {
            result += ",\n";
        } else {
            result += "\n";
        }
    }

    result += nestedTabs + "}";

    return result;
}

function convertXmlToTypeScriptValuesFile(xmlObject: any, resxFilename: string, typeScriptResourcesNamespace: string, virtualTypeScriptFolder: string, skipAddingFiles?: boolean): void {
    const projectRoot = getProjectRoot();
    const relativeResxFilename = path.relative(projectRoot, resxFilename).replace(/\\/g, "/");
    //const relativeResxFilename = resxFilename.replace(projectRoot, "").replace(/\\/g, "/");
    const parsed = path.parse(relativeResxFilename);
    const className = parsed.name.replace('.', '_');
    //const className = resxFilename.substr(resxFilename.lastIndexOf("\\") + 1).replace('.resx', '').replace(".", "_");

    let content = '// TypeScript Resx model for: ' + relativeResxFilename + '\n' + 
                    '// Auto generated by resx-to-ts-json (npm package)' + '\n' + '\n';

    //content = content + 'declare module ' + typeScriptResourcesNamespace + ' {\n';
    content = content + 'export const ' + className + ': ' + typeScriptResourcesNamespace + '.' + className + ' = ' ;

    let dictionary = convertXmlToDictionary(xmlObject);
    content = content + convertDictionaryToTsValues(dictionary, 0, className + '.');
    content = content + '\n';//'\n}\n';
    
    // Write model if resources found
    if (Object.keys(dictionary).length > 0) {
        //const relativeTsFilename = relativeResxFilename.replace('.resx', '.d.ts');
        const tsFileName = resxFilename.replace('.resx', '.ts');
        
        if (virtualTypeScriptFolder === undefined || virtualTypeScriptFolder === '') {
            // Write the file aside of the the resx file.
            fs.writeFileSync(tsFileName, content);

            if (!skipAddingFiles) addTypeScriptFile.execute(tsFileName);
        }
        else {
            // Write the file to the given output folder.
            //const tsFileNameWithoutPath = tsFileName.substr(tsFileName.lastIndexOf('\\') + 1);
            //const outputFileName = (projectRoot + virtualTypeScriptFolder + '\\' + tsFileNameWithoutPath).split('/').join('\\');
            //const relativeOutputFileName = virtualTypeScriptFolder + '/' + tsFileNameWithoutPath;

            const parsedTsFileName = path.parse(tsFileName);
            const tsFileNameWithoutPath = parsedTsFileName.base;
            const outputFileName = path.join(projectRoot, virtualTypeScriptFolder, tsFileNameWithoutPath);
            const relativeOutputFileName = path.join(virtualTypeScriptFolder, tsFileNameWithoutPath);

            //console.log(outputFileName);
            //return;
            mkpath.sync(path.join(projectRoot, virtualTypeScriptFolder), '0700');

            //fs.stat(outputFileName, (err, stats) => console.log(stats));
            
            fs.writeFileSync(outputFileName, content); 
            
            if (!skipAddingFiles) addTypeScriptFile.execute(relativeOutputFileName);                          
        }
    }
}

function convertXmlToTypeScriptModelFile(xmlObject: any, resxFilename: string, typeScriptResourcesNamespace: string, virtualTypeScriptFolder: string, skipAddingFiles?: boolean): void {
    const projectRoot = getProjectRoot();
    const relativeResxFilename = path.relative(projectRoot, resxFilename).replace(/\\/g, "/");
    //const relativeResxFilename = resxFilename.replace(projectRoot, "").replace(/\\/g, "/");
    const parsed = path.parse(relativeResxFilename);
    const className = parsed.name.replace('.', '_');
    //const className = resxFilename.substr(resxFilename.lastIndexOf("\\") + 1).replace('.resx', '').replace(".", "_");

    let content = '// TypeScript Resx model for: ' + relativeResxFilename + '\n' + 
                    '// Auto generated by resx-to-ts-json (npm package)' + '\n' + '\n';

    content = content + 'declare module ' + typeScriptResourcesNamespace + ' {\n';
    content = content + '\texport class ' + className + ' ';

    let dictionary = convertXmlToDictionary(xmlObject);
    content = content + convertDictionaryToTsMapping(dictionary, 1);
    content = content + '\n}\n';
    
    // Write model if resources found
    if (Object.keys(dictionary).length > 0) {
        //const relativeTsFilename = relativeResxFilename.replace('.resx', '.d.ts');
        const tsFileName = resxFilename.replace('.resx', '.d.ts');
        
        if (virtualTypeScriptFolder === undefined || virtualTypeScriptFolder === '') {
            // Write the file aside of the the resx file.
            fs.writeFileSync(tsFileName, content);                           

            if (!skipAddingFiles) addTypeScriptFile.execute(tsFileName);                          
        }
        else {
            // Write the file to the given output folder.
            const parsedTsFileName = path.parse(tsFileName);
            const tsFileNameWithoutPath = parsedTsFileName.base;
            //const tsFileNameWithoutPath = tsFileName.substr(tsFileName.lastIndexOf('\\') + 1);
            const outputFileName = path.join(projectRoot, virtualTypeScriptFolder, tsFileNameWithoutPath);
            //const outputFileName = (projectRoot + virtualTypeScriptFolder + '\\' + tsFileNameWithoutPath).split('/').join('\\');
            const relativeOutputFileName = path.join(virtualTypeScriptFolder, tsFileNameWithoutPath);//virtualTypeScriptFolder + '/' + tsFileNameWithoutPath;

            mkpath.sync(path.join(projectRoot, virtualTypeScriptFolder), '0700');

            fs.writeFileSync(outputFileName, content); 
            
            if (!skipAddingFiles) addTypeScriptFile.execute(relativeOutputFileName);                          
        }
    }
}

function convertXmlToJsonFile(xmlObject: any, resxFilename: string, virtualJsonFolder: string, fileNameLanguage?: string): void {
    const projectRoot = getProjectRoot();
    //const relativeResxFilename = path.relative(projectRoot, resxFilename).replace(/\\/g, "/");
    //const relativeResxFilename = resxFilename.replace(projectRoot, "").replace(/\\/g, "/");

    let dictionary = convertXmlToDictionary(xmlObject);
    let content = JSON.stringify(dictionary);
    
    // Write model if resources found
    if (Object.keys(dictionary).length > 0) {
        //const relativeJsonFilename = relativeResxFilename.replace('.resx', '.json');
        const jsonFileName = resxFilename.replace('.resx', '.json');
        
        if (virtualJsonFolder === undefined || virtualJsonFolder === '') {
            // Write the file aside of the the resx file.
            fs.writeFileSync(jsonFileName, content);
        }
        else {
            // Write the file to the given output folder.
            const parsedPath = path.parse(jsonFileName);
            let jsonFileNameWithoutPath = parsedPath.base;
            if (fileNameLanguage) {
                let fileNameWithoutExtension = parsedPath.name;
                jsonFileNameWithoutPath = `${fileNameWithoutExtension}.${fileNameLanguage}.json`;
            }

            const outputFileName = path.join(projectRoot, virtualJsonFolder, jsonFileNameWithoutPath);
            console.log(outputFileName);
            //const outputFileName = (projectRoot + virtualJsonFolder + '\\' + jsonFileNameWithoutPath).split('/').join('\\');
            //const relativeOutputFileName = virtualJsonFolder + '/' + jsonFileNameWithoutPath;

            mkpath.sync(path.join(projectRoot, virtualJsonFolder), '0700');

            fs.writeFileSync(outputFileName, content); 
        }
    }
}

function getProjectRoot(): string {
    return path.normalize(path.join(__dirname, '..', '..', '..'));
}

function decapitalizeFirstLetter(input: string) {
    return input.charAt(0).toLowerCase() + input.slice(1);
}
