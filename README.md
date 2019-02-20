Depending on when you look at this test task checkout other branches, I will add some improvements when I have time.

# Project setup

Run './scripts/setup-project-dependencies.sh' script.

MongoDB should be installed globally


# Build and run web application

Run './scripts/run-dev.sh'

Open http://localhost:3000/chat in browser

There is a tricky issue with this script - it builds(runs) different components in separate processes, proper termination was not setup, so MongoDB is not closed after script execution was stopped.
In case you have an error connected to MongoDB - just rerun the script.


# Debug server application

Run: './scripts/prepare.sh'

Open Project in VS Code(haven't tried other IDE) with following configuration:

```
// .vscode/launch.json
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/packages/server/src/index.ts",
      "outFiles": [
        "${workspaceFolder}/packages/server/dist/**/*.js"
      ]
    }
  ]
}

// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  }
}
```


# Known issues
1. Application was not intensively tested because of lack of time, however should work properly enough as for a test task.
2. Synchronization of huge text(> 60000 symbols) fails.
3. Critical parts(WebSocket and WebWorker communication layers) should be refactored.
4. Error handling does not cover all situations.
5. Haven't tested components' deploy and production build.
6. Application config should be extracted to a config file and/or encironment variables.
7. Project configuration should be adjusted:
 - Live reload was broken after last project structure changes
 - Workarounds in debugging process should be fixed.
