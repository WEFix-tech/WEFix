# WEFix

## For Users
This is a tool to automatically fix UI-based flaky test. To use this tool, your test must be written in JavaScript using Selenium for end-to-end testing purpose. You can find in [example](https://github.com/NJUaaron/UI-Flaky-Test-Fixer/tree/main/example) folder about how a typical test code looks like, and how this tool actually work.

how to install?
``` shell
# NPM
$ npm install --save-dev @aaronxyliu/ftfixer
# Yarn
$ yarn add --dev @aaronxyliu/ftfixer
```

how to update to newest version?
``` shell
# NPM
$ npm update ftfixer
# Yarn
$ yarn up @aaronxyliu/ftfixer
```

how to use?
``` shell
# NPM
$ npx ftfixer --help    # User manual
$ npx ftfixer ui        # Open UI panel on local server
# Yarn
$ yarn ftfixer --help
$ yarn ftfixer ui
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
$ node bin/ftfixer.js --help
$ npx nodemon bin/ftfixer.js ui
```

How to contact the author?  
Please email to `xliu234@buffalo.edu`

All the mutation record will be saved in `mutations.log` file, located in `lib/GUI/public` directory.
