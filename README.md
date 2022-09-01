# WEFix

## For Users
This is a tool to automatically fix web e2e flaky test. To use this tool, your test must be written in JavaScript using Selenium or Cypress for end-to-end testing purpose. You can find in [example](https://github.com/WEFix-tech/WEFix/tree/main/example) folder about how a typical test code looks like, and how this tool actually work.

how to install?
``` shell
# NPM
$ npm install --save-dev @wefix-tech/wefix
# Yarn
$ yarn add --dev @wefix-tech/wefix
```

how to update to newest version?
``` shell
# NPM
$ npm update wefix
# Yarn
$ yarn up @wefix-tech/wefix
```

how to use?
``` shell
# NPM
$ npx wefix --help    # User manual
$ npx wefix ui        # Open UI panel on local server
# Yarn
$ yarn wefix --help
$ yarn wefix ui
```

You can preset the log file path by setting environment variable.
``` shell
$ FT_LOG_PATH=<path/to/mutations.log>
```

## For Developers
How to deploy?
``` shell
$ npm install
```

How to minify JS file?
``` shell
$ npx minify lib/mutationObserver.js > lib/mutationObserver.min.js
```

How to publish to NPM?
``` shell
$ npm run git-push
$ npm run deploy
```

How to test?
``` shell
$ node bin/wefix.js --help
$ npx nodemon bin/wefix.js ui
```

All the mutation record will be saved in `mutations.log` file, located in `lib/GUI/public` directory.
