const path = require('path');

const {
  fsReadFile,
  fsWriteFile,
  execShellCommand,
} = require('./utils.js');

async function gitCachedCopy(config, configFileName) {
  const projectPromises = config.projects.map(processProject);
  await Promise.all(projectPromises);

  if (!configFileName) {
    return;
  }
  let updatedProjectsCount = 0;
  config.projects.forEach((project) => {
    if (project.remoteCommit) {
      project.commit = project.remoteCommit;
      project.remoteCommit = undefined;
      ++updatedProjectsCount;
    }
  });
  console.log(`Copied from ${updatedProjectsCount} updated projects.`);
  if (updatedProjectsCount > 0) {
    const updatedConfigString = JSON.stringify(config, undefined, 2);
    await fsWriteFile(configFileName, updatedConfigString);
  }
}

async function processProject(project) {
  const {
    id,
    gitUrl,
    head,
    commit,
    commands,
  } = project;
  console.log(`Processing "${id}", with ${commands.length} commands ...`);

  // check whether git commit is the same, or is newer
  // e.g. `git ls-remote --quiet --refs --head "git@github.com:username/reponame.git" \
  //   | grep "refs\/heads\/master"`
  const checkCommitCommand =
    `git ls-remote --quiet --refs --head "${gitUrl}" | grep "${head}"`;
  checkCommitResult = await execShellCommand(checkCommitCommand);
  if (checkCommitResult.err) {
    throw new Error(checkCommitResult.err);
  }
  const remoteCommit = checkCommitResult.stdout.split(/\s+/)[0];
  if (remoteCommit === commit) {
    console.log(`Commit for ${id} unchanged:\n${commit}\nDoing nothing further.`);
    return [];
  } else {
    console.log(`Commit for ${id} has changed:\n${commit} -> ${remoteCommit}\nExecuting commands.`);
  }
  // TODO return this value instead of mutating input object
  project.remoteCommit = remoteCommit;

  const commandPromises = commands.map((command) => {
    switch (command.name) {
      case 'copySingle':
        return processCommandCopySingle(project, command);
      default:
        throw new Error(`Unsupported command: ${command.name}`);
    }
  });
  await Promise.all(commandPromises);
}

async function processCommandCopySingle(project, command) {
  const {
    httpUrl,
    localPath,
    remoteCommit,
  } = project;
  const {
    remoteFilePath,
    localFilePath,
  } = command;

  // download the new copy of the file
  // e.g. `curl https://raw.githubusercontent.com/username/reponame/commithash/README.md`
  const remoteFileUrl = `${httpUrl}/${remoteCommit}/${remoteFilePath}`;
  const downloadFileCommand =
    `curl "${remoteFileUrl}"`;
  console.log(downloadFileCommand);
  downloadFileResult = await execShellCommand(downloadFileCommand);
  if (downloadFileResult.err) {
    throw new Error(downloadFileResult.err);
  }
  const absoluteLocalFilePath = path.resolve(localPath, localFilePath);
  overwriteLocalFile(
    absoluteLocalFilePath,
    downloadFileResult.stdout, {
      preserveFrontMatter: true,
    },
  );
}

async function overwriteLocalFile(
  absoluteLocalFilePath,
  remoteFileContents,
  {
    preserveFrontMatter,
  },
) {
  let dataToWrite;
  if (preserveFrontMatter) {
    const frontMatter = await extractFrontMatterFromLocalFile(absoluteLocalFilePath);
    dataToWrite = frontMatter + '\n' + remoteFileContents;
  } else {
    dataToWrite = remoteFileContents;
  }
  await fsWriteFile(absoluteLocalFilePath, dataToWrite);
  console.log(`Updated: ${absoluteLocalFilePath}`);
}

async function extractFrontMatterFromLocalFile(absoluteLocalFilePath) {
  const fileBuffer = await fsReadFile(absoluteLocalFilePath);
  const fileContent = fileBuffer.toString();
  const index1stNewline = fileContent.indexOf('\n');
  const frontMatterDelimiter = fileContent.substring(0, index1stNewline);
  const index2ndNewline = fileContent.indexOf(frontMatterDelimiter, index1stNewline + 1);
  const indexEndFrontMatter = index2ndNewline + frontMatterDelimiter.length + 1;
  const frontMatter = fileContent.substring(0, indexEndFrontMatter);
  return frontMatter;
}

module.exports = {
  gitCachedCopy,
};
