const childProcess = require('child_process');

const fs = require('fs');
const util = require('util');

const fsWriteFile = util.promisify(fs.writeFile);

const fsReadFile = util.promisify(fs.readFile);

function execShellCommand(command) {
  return new Promise((resolve) => {
    childProcess.exec(command, (err, stdout, stderr) => {
      resolve({
        err,
        stdout,
        stderr,
      });
    });
  });
}

function splitFrontMatterAndContent(bufferOrString) {
  const fileContent = bufferOrString.toString();
  const index1stNewline = fileContent.indexOf('\n');
  const frontMatterDelimiter = fileContent.substring(0, index1stNewline);
  const index2ndNewline = fileContent.indexOf(frontMatterDelimiter, index1stNewline + 1);
  const indexEndFrontMatter = index2ndNewline + frontMatterDelimiter.length + 1;
  const frontMatter = fileContent.substring(0, indexEndFrontMatter);
  const content = fileContent.substring(indexEndFrontMatter);
  return {
    frontMatter,
    content,
  };
}

async function splitFrontMatterAndContentFromLocalFile(absoluteLocalFilePath) {
  const fileBuffer = await fsReadFile(absoluteLocalFilePath);
  return splitFrontMatterAndContent(fileBuffer);
}

module.exports = {
  fsReadFile,
  fsWriteFile,
  execShellCommand,
  splitFrontMatterAndContent,
  splitFrontMatterAndContentFromLocalFile,
};
