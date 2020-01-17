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

module.exports = {
  fsReadFile,
  fsWriteFile,
  execShellCommand,
};
