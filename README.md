# `git-cached-copy`

Copies files from remote git repositories to your local filesystem.

Features:

- Allows specified mapping
- Only updates when commit hash has changed (cache)

## Usage

Create a configuration file named `.git-cached-copy.config.json`,
and save this in the root directory of your project.
See the [Configuration File](#configuration-file) section for details.

Run this tool:

```shell
npx git-cached-copy ./.git-cached-copy.config.json
```

The output will indicate if any relevant changes were detected
in the remote repositories, and which files were updated.

## Configuration File

```json
{
  "projects": [
    {
      "id": "my-repo",
      "gitUrl": "git@github.com:my-user/my-repo.git",
      "httpUrl": "https://raw.githubusercontent.com/my-user/my-repo",
      "localPath": "/home/my-user/my-repo",
      "head": "refs/heads/master",
      "commit": null,
      "commands": [
        {
          "name": "copySingle",
          "remoteFilePath": "README.md",
          "localFilePath": "some/nested/path/my-repo.md"
        }
      ]
    }
  ]
}
```

If this file is committed into a repository of its own,
you are recommended to omit `localPath`,
as it will default to the directory from which the tool is run.
The `localPath` option exists only to override said default.

The value of `commit` will be overwritten by the git commit hash
each time this tool is run,
if the remote repository being copied from has changed.

## Licence

GPL-3.0

## Author

[Brendan Graetz](http://bguiz.com)
