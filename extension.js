// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');

//gets the file name and an extension list and returns the index of the next extension to test
const getFileExtension = (fn, exts) => {
    for(let i = 0; i < exts.length; i++) {
        const ext = exts[i];
        const l = (ext.length + 1) * -1
        if(fn.substr(l+1) === ext) {
            return i;
        }
    }
    return -1;
};
exports.getFileExtension = getFileExtension;

//return the extension as string instead of the index of extension list
const getFileExtensionAsString = (fn, exts) => {
    const index = getFileExtension(fn, exts);
    return exts[index] || false;
};
exports.getFileExtensionAsString = getFileExtensionAsString;

//wrapper for vscode.workpace.findFiles for mocking it in tests
const findFiles = (fn) => {
    return vscode.workspace.findFiles(fn);
};
exports.findFiles = findFiles;

//this function loops over the extension list and find the files. takes a few parameters for testing it (see tests)
const findCorrespondingFile = ({ absoluteFilename, allExtensions, rootPath, findFiles }) => {
    return new Promise((resolve, reject) => {
        const absoluteFilePath = path.dirname(absoluteFilename);
        const activeFileExtension = getFileExtensionAsString(absoluteFilename, allExtensions);
        const relativePath = path.relative(rootPath, absoluteFilePath);
        
        //cancel everything, if current file is not in list of all extensions
        if(!activeFileExtension) {
            console.log('file is not in corresponding extension list');
            return;
        }
        
        const activeFileBasename = path.basename(absoluteFilename, activeFileExtension);
        const tryToOpen = (basename, extensions) => {
            
            const next = () => {
                extensions.splice(index, 1);
                if(extensions.length > 0) {
                    tryToOpen(basename, extensions);
                }
                else {
                    reject('no files found');
                }
            };

            let index = (getFileExtension(basename, extensions)+1) % extensions.length;
            const extension = extensions[index];
            const currentExt = path.extname(basename);

            //don't try to open the active file again
            if(extension === activeFileExtension) {
                next();
            }
            else {
                //find the next corresponding file
                const fn = `${relativePath}/${activeFileBasename}${extension}`;
                findFiles(fn).then(searchResults => {
                    if(searchResults && searchResults.length && searchResults.length > 0) {
                        resolve(searchResults[0]);
                    }
                    else {
                        next();
                    }
                }, error => {
                    reject('not able to find files');
                });
            }
        };

        tryToOpen(absoluteFilename, allExtensions.slice());
    });
};
exports.findCorrespondingFile = findCorrespondingFile;

function activate(context) {
    const allExtensions = vscode.workspace.getConfiguration('openCorrespondingFile').get('extensionList');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('extension.openCorrespondingFile', function () {
        if(vscode.window.activeTextEditor && vscode.window.activeTextEditor.document) {
            const absoluteFilename = vscode.window.activeTextEditor.document.fileName;
            const rootPath = vscode.workspace.rootPath;
            
            //when activated, take the current file and find the next corresponding one
            findCorrespondingFile({ absoluteFilename, allExtensions, rootPath, findFiles }).then((file) => {
                vscode.window.showTextDocument(file);
            }, (error) => {
                console.log('no corresponding file found.', error);
            });
        }
        else {
            console.log('not in an active editor.');
        }
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;