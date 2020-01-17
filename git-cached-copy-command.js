#!/usr/bin/env node

const {
  fsReadFile,
} = require('./utils.js');
const {
  gitCachedCopy,
} = require('./git-cached-copy.js');

async function runGitCachedCopyFromCli() {
  const args  = process.argv.slice(2);
  const configFileName = args[0];
  if (!configFileName) {
    throw new Error('Please specify a config file as the first argument');
  }
  const configBuffer = await fsReadFile(configFileName);
  const config = JSON.parse(configBuffer);
  await gitCachedCopy(config, configFileName);
}

runGitCachedCopyFromCli();
