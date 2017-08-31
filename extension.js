// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');

const getFileExtension = (fn, exts) => {
    for(let i = 0; i < exts.length; i++) {
        const ext = exts[i];
        const l = (ext.length + 1) * -1
        // console.log(i, fn, fn.substr(l), ext, fn.substr(l) === ext);
        if(fn.substr(l+1) === ext) {
            // console.log('found!');
            return i;
        }
    }
    return -1;
};

const getFileExtensionAsString = (fn, exts) => {
    const index = getFileExtension(fn, exts);
    return exts[index] || false;
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    const allExtensions = ['.test.js', '.js', '.html'];
    console.log('--->', getFileExtension('bla.test.js', allExtensions), 0);

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('extension.openCorrespondingFile', function () {
        // The code you place here will be executed every time your command is executed
        
        if(vscode.window.activeTextEditor && vscode.window.activeTextEditor.document) {
            const absoluteFilename = vscode.window.activeTextEditor.document.fileName;
            const absoluteFilePath = path.dirname(absoluteFilename);
            const activeFileExtension = getFileExtensionAsString(absoluteFilename, allExtensions);
            const relativePath = path.relative(vscode.workspace.rootPath, absoluteFilePath);
            
            //cancel everything, if current file is not in list of all extensions
            console.log('active file extension:', activeFileExtension);
            if(!activeFileExtension) {
                console.log('file is not in corresponding extension list');
                return;
            }
            const activeFileBasename = path.basename(absoluteFilename, activeFileExtension);

            const tryToOpen = (basename, extensions) => {
                console.log('*** tryToOpen', basename, extensions.join('; '), '***');
                
                const next = () => {
                    console.log('goto next file');
                    extensions.splice(index, 1);
                    if(extensions.length > 0) {
                        console.log('try to open next file. remaining extensions:', extensions.join('; '));
                        tryToOpen(basename, extensions);
                    }
                    else {
                        console.log('absolutly no matching file found.');
                    }
                };

                let index = (getFileExtension(basename, extensions)+1) % extensions.length;
                const extension = extensions[index];
                const currentExt = path.extname(basename);
                console.log('ext index:', index, 'next extension:', extension);

                //don't try to open the active file again
                if(extension === activeFileExtension) {
                    console.log('currentExt', currentExt, '===', activeFileExtension);
                    next();
                }
                
                const fn = `${relativePath}/${activeFileBasename}${extension}`;
                console.log('search for:', fn);
                vscode.workspace.findFiles(fn).then(searchResults => {
                    if(searchResults.length > 0) {
                        console.log('file found!', searchResults);
                        vscode.window.showTextDocument(searchResults[0]).then(() => {}).then(() => {}, (error) => {
                            console.log('failed to show file', error);
                        });
                    }
                    else {
                        next();
                    }
                }, error => {
                    console.log('file not found', error);
                });
            };

            tryToOpen(absoluteFilename, allExtensions);
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