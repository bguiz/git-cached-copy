# `git-cached-copy`

Copies files from remote git repositories to your local filesystem.

Features:

- Allows specified mapping
- Only updates when commit hash has changed (cache)

## Usage

Clone this project, and `cd` into its directory.

Create a configuration file.

```shell
RUN=1 node ./git-cached-copy.js ./config.json
```

## Sample configuration file

```json
{
  "projects": [
    {
      "id": "my-repo",
      "gitUrl": "git@github.com:my-user/my-repo.git",
      "httpUrl": "https://raw.githubusercontent.com/my-user/my-repo",
      "localPath": "/home/my-user/my-repo",
      "head": "refs/heads/master",
      "commit": "e5c0283d4d6c5a52a06be6a3fb27efcb2fbe647d",
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

## Licence

GPL-3.0

## Author

[Brendan Graetz](http://bguiz.com)
