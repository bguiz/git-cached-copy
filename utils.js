const childProcess = require('child_process');

const fs = require('fs');
const util = require('util');
const http = require('http');
const https = require('https');

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

function copyRemoteFileToLocal(remoteUrl, absoluteLocalFilePath) {
  return new Promise((resolve, reject) => {
    const protocolSeparatorIndex = remoteUrl.indexOf('://');
    if (protocolSeparatorIndex < 0) {
      return reject(new Error('Invalid protocol specified in URL'));
    }

    let request;
    const file = fs.createWriteStream(absoluteLocalFilePath);

    const protocol = remoteUrl.substring(0, protocolSeparatorIndex);
    switch (protocol) {
      case 'http':
        request = http.get(remoteUrl, handleHttpOrHttpsDownload);
        request.on('error', handleHttpOrHttpsError);
        break;
      case 'https':
        request = https.get(remoteUrl, handleHttpOrHttpsDownload);
        request.on('error', handleHttpOrHttpsError);
        break;
      default:
        return reject(new Error(`Unsupported protocol specified in URL: ${protocol}`));
    }

    function handleHttpOrHttpsError(err) {
      fs.unlink(absoluteLocalFilePath);
      return reject(err);
    }

    function handleHttpOrHttpsDownload(response) {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        return reject(new Error(`Response with status code: ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close((err) => {
          if (err) {
            return reject(err);
          }
          return resolve();
        });
      });
    }
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
  copyRemoteFileToLocal,
};
