'use strict'

const fs = require('fs');


function Recover_single_file(backup_filename) {
    console.log('Recover the file: ' + backup_filename);
    var raw_filename = backup_filename.slice(0, backup_filename.length - 9)
    
    //Remove the instrumented file
    try {
        fs.unlinkSync(raw_filename);
    }
    catch (err) {
        ;
    }
    try {
        fs.renameSync(backup_filename, raw_filename);
    }
    catch (err) {
        console.error('Unable to rename from' + backup_filename + ' to ' + raw_filename);
    }
}

function Recover_folder(dirname) {
    var openedDir
    try {
        openedDir = fs.opendirSync(dirname);
    }
    catch (err) {
        console.error('Unable to open ' + dirname);
        return;
    }

    var dirent = openedDir.readSync();
    while (dirent) {
        if (dirent.isFile() && /(.ftbackup)$/.test(dirent.name)) {
            Recover_single_file(dirname + '/' + dirent.name);
        }
        else if (dirent.isDirectory()) {
            Recover_folder(dirname + '/' + dirent.name);
        }
        dirent = openedDir.readSync();
    }
}

module.exports = {Recover_single_file, Recover_folder};