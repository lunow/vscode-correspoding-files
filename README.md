# README

Open corresponding files

## Features

It loops over corresponding files. Corresponding means same folder with different file extensions. You can set your own list of extensions.

![Open corresponding files](images/open.png)


## Extension Settings

This extension contributes the following settings:

* `openCorrespondingFile.extensionList`: `['.test.js', '.js', '.html']`

Add it to your shortcuts (I would suggest `[alt] + [o]`) the command is `extension.openCorrespondingFile`

## Known Issues

* Its just stupid string matching. So testing .js before .test.js will not work. Could be improved in the future.
* Improve the gif quality

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release