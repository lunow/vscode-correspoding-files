// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');

const getFileExtension = (fn, exts) => {
    for(let i = 0; i < exts.length; i++) {
        const ext = exts[i].replace('.', '\.');
        const rg = new RegExp(`${ext}$`, 'g');
        console.log('ext->', rg, rg.test(fn));
        if(fn.search(rg.test(fn))) {
            return i;
        }
    }
    return 0;
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    const allExtensions = ['.js', '.test.js', '.html'];

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('extension.openCorrespondingFile', function () {
        // The code you place here will be executed every time your command is executed
        if(vscode.window.activeTextEditor && vscode.window.activeTextEditor.document) {
            const absoluteFilename = vscode.window.activeTextEditor.document.fileName;
            const basename = path.basename(absoluteFilename);

            const tryToOpen = (basename, extensions) => {
                const extension = path.extname(basename);
                let index = getFileExtension(basename, extensions)+1;
                if(index >= extensions.length) {
                    index = 0;
                }
                const nextFile = `${path.join(path.dirname(absoluteFilename), path.basename(basename, extension))}${extensions[index]}`;
                const uri = vscode.Uri.file(nextFile);

                vscode.workspace.openTextDocument(uri).then(document => {
                    vscode.window.showTextDocument(uri).then(() => {});
                }, error => {
                    //seems there is no file named like this. goto the next
                    extensions.splice(index, 1);
                    if(extensions.length > 0) {
                        tryToOpen(basename, extensions);
                    }
                    else {
                        console.log('absolutly no matching file found.');
                    }
                }); 
            };

            tryToOpen(absoluteFilename, allExtensions);
            
            
            // vscode.workspace.openTextDocument(uri).then(document => {
            //     debugger

            // }, error => {
            //     debugger
            // });


            console.log('you are working on file', basename, extension, index, '->', nextFile);
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