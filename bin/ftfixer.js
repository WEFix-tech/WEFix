#!/usr/bin/env node
'use strict';

const fs = require('fs');
const Pack = require('../package');
const Fixer = require('../lib/fixer');
const {Instrument_single_file, Instrument_folder} = require('../lib/instrumenter');
const {Recover_folder, Recover_single_file} = require('../lib/recover');
const {start_panel_server} = require('../lib/GUI/panel_server');
const Version = Pack.version;

const Argv = process.argv;
const params = Argv.slice(2);



const log = function(...args) {
    console.log(...args);
    process.stdin.pause();
};

async function ftfixer() {
    if (!params[0] || /^(-h|--help)$/.test(params[0]))
        return help();

    if (/^(-v|--version)$/.test(params[0]))
        return log('v' + Version);
    
    if (/^(-p|--panel|ui)$/.test(params[0])) {
        return start_panel_server();
    }
    
    // code instrument for file or folder
    if (/^(-i|--instrument)$/.test(params[0]))
        return instrument(params[1]);

    if (/^(-r|--recover)$/.test(params[0]))
        return recover(params[1]);

    // auto fix based on log data
    if (/^(-f|--fix)$/.test(params[0]))
        return log('v' + Version);

    if (/(.js)$/.test(params[0]))
        return Fixer.fix(params[0]);
    
    return log('Command not found.')
}

function instrument(filepath) {
    if (!filepath)
        filepath = '.';      // default as root directory
    if (/(.js)$/.test(filepath)) {
        // single file
        if (fs.existsSync(filepath + '.ftbackup')) {
            //file exists
            console.log(filepath + 'was already instrumented. Skip.')
        }
        else
            Instrument_single_file(filepath);
    }
    else {
        // handle all js files in the the folder
        Instrument_folder(filepath);
    }
}

function recover(filepath) {
    if (!filepath)
        filepath = '.';      // default as root directory
    if (/(.ftbackup)$/.test(filepath)) {
        // single file
        Recover_single_file(filepath);
    }
    else if (/(.js)$/.test(filepath)) {
        // single file
        Recover_single_file(filepath + '.ftbackup');
    }
    else {
        // handle all js files in the the folder
        Recover_folder(filepath);
    }
}

function help() {
    const bin = require('../help');
    const usage = 'Usage: ftfixer [options]';
    
    console.log(usage);
    console.log('Options:');
    
    for (const name of Object.keys(bin)) {
        console.log('  %s %s', name, bin[name]);
    }
}



ftfixer();