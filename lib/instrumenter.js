'use strict'

const fs = require('fs');

var Instrumenter = {};

class SentenceInfo {
    start_line;     //@int
    start_col;      //@int
    end_line;       //@int
    end_col;        //@int
    type;           //@int  0:other  1:command  2:driver init
    sentence;       //@string

    constructor(sl, sc) {
        this.start_line = sl;
        this.start_col = sc;
        this.type = 0;
        this.sentence = '';
    }

    check_sentence_type() {
        // Check if this sentence contains Selenium command
        // Use regular expression match
        // Refer to: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions
        if (this.sentence.match(/require\(/))
            this.type = 0;
        else if (this.sentence.match(/close\(\)/))
            this.type = 0;
        else if (this.sentence.match(/\.build\(\)/))
            this.type = 2;
        else if (this.sentence.match('driver'))
            this.type = 1; 
        //console.log(this.sentence + " ||| " + this.type.toString());
    }
}

class CodeMap {
    #raw_code;              //@string
    #lines;                 //@string array
    #filename;              //@string
    sentences = [];         //@SentenceInfo array
    #in_code = '';   //instrumented code @string
    #driver_variable_name = '';  //@string

    constructor(filepath) {
        // Read the file as string
        try {
            this.#raw_code = fs.readFileSync(filepath, 'utf8');
        }
        catch (err) {
            console.error('Unable to find ' + filepath);
            return;
        }
        this.#filename = filepath;
        console.log('Instrument file: ' + filepath);
        this.#lines = this.#raw_code.split('\r\n');

        var in_comment = false;
        var in_sentence = false;
        var cur_sentence;   // Current Sentence
        for (let i = 0; i < this.#lines.length; i++) {
            var line = this.#lines[i];
            for (let j = 0; j < line.length; j++) {
                if (in_sentence) {
                    cur_sentence.sentence += line[j];
                    if (line[j] == ';') {
                        // End of the sentence
                        cur_sentence.end_line = i;
                        cur_sentence.end_col = j;
                        cur_sentence.check_sentence_type();
                        this.sentences.push(cur_sentence);
                        in_sentence = false;
                    }
                    else if (line[j] == '{' || line[j] == '}') {
                        in_sentence = false;
                    }
                }
                else {
                    // Need to find next sentence
                    if (line[j] == '\r' || line[j] == '\n' || line[j] == ' ' || line[j] == ';' || line[j] == '{' || line[j] == '}') {
                        continue;
                    }
                    else if (line[j] == '/' && j < line.length - 1) {
                        if (line[j + 1] == '/') {
                            // comment. Skip this line
                            j = line.length;
                        }
                        else if (line[j + 1] == '*') {
                            in_comment = true;
                        }
                    }
                    else if (in_comment && line[j] == '*' && j < line.length - 1 && line[j+1] == '/') {
                        in_comment = false;
                    }
                    else if (!in_comment) {
                        // Find the start of new sentence
                        in_sentence = true;
                        cur_sentence = new SentenceInfo(i, j);
                        cur_sentence.sentence += line[j];
                    }
                }
            }
        }

        // Need implement later
        this.#driver_variable_name = 'driver';
    }

    raw_code_concat(sl, sc, el, ec) {
        if (sl >= this.#lines.length || el >= this.#lines.length) {
            console.log('[ERROR] in raw_code_concat: line no out of bounds.');
            return '';
        }

        // absolute start location in raw code
        var start_abs_loc = sc;     
        for (let i = 0; i < sl; i++) {
            start_abs_loc += this.#lines[i].length + 2;
        }
        // absolute end location in raw code
        var end_abs_loc = ec;       
        for (let i = 0; i < el; i++) {
            end_abs_loc += this.#lines[i].length + 2;
        }

        //check if end location are prior than start location
        if (start_abs_loc > end_abs_loc) {
            console.log('[ERROR] in raw_code_concat: end location are prior than start location.');
            return '';
        }

        return this.#raw_code.slice(start_abs_loc, end_abs_loc);
    }

    raw_code_concat_to_end(sl, sc) {
        if (sl >= this.#lines.length) {
            console.log('[ERROR] in raw_code_concat: line no out of bounds.');
            return '';
        }

        // absolute start location in raw code
        var start_abs_loc = sc;     
        for (let i = 0; i < sl; i++) {
            start_abs_loc += this.#lines[i].length + 2;
        }

        return this.#raw_code.slice(start_abs_loc);
    }

    insert_head() {
        this.#in_code = 'const FTFixer = require(\'@aaronxyliu/ftfixer\');\n'   // For deployment
        //this.#in_code = 'const FTFixer = require(\'../index\');\n'          // For development
    }

    insert_cmd_analyzer() {
        var last_start_line = 0;
        var last_start_col = 0;
        for(let sentence of this.sentences) {
            // Instrumented sentence
            let in_sentence = '';
            if (sentence.type == 0) {
                in_sentence = sentence.sentence;
            }
            else if (sentence.type == 1) {   
                // command     
                in_sentence = 'await FTFixer.before_cmd('
                    + this.#driver_variable_name
                    + ');'
                    + sentence.sentence
                    + 'await FTFixer.after_cmd('
                    + this.#driver_variable_name
                    + ', \''
                    + this.#filename
                    + '\', '
                    + sentence.start_line
                    + ', '
                    + sentence.start_col
                    + ', `'
                    + sentence.sentence
                    + '`);';

            }
            else if (sentence.type == 2) {
                // driver init sentence
                in_sentence = sentence.sentence;
            }
            // console.log('IN_SENTENCE: ' + in_sentence);
            // console.log('START POS: ' + sentence.start_line + ', ' + sentence.start_col);
            // console.log('END POS: ' + sentence.end_line + ', ' + sentence.end_col);
            this.#in_code += this.raw_code_concat(last_start_line, 
                last_start_col, 
                sentence.start_line, 
                sentence.start_col) + in_sentence;
            last_start_line = sentence.end_line;
            last_start_col = sentence.end_col + 1;
        }
        this.#in_code += this.raw_code_concat_to_end(last_start_line, last_start_col);
        //console.log(this.#in_code);
    }

    save_to_file() {
        var backup_file_path = this.#filename + '.ftbackup';
        try {
            fs.writeFileSync(this.#filename, this.#in_code);
            console.log('Instrumented code saved to [' + this.#filename + '] successfully!');
        }
        catch (err) {
            console.error('Unable to open ' + this.#filename);
            return;
        }
        try {
            fs.writeFileSync(backup_file_path, this.#raw_code);
            console.log('Primitive code saved to [' + backup_file_path + '] successfully!');
        }
        catch (err) {
            console.error('Unable to open ' + backup_file_path);
            return;
        }
    }
}


function Instrument_single_file(filepath) {
    var codemap = new CodeMap(filepath);
    codemap.insert_head();
    codemap.insert_cmd_analyzer();
    codemap.save_to_file();
}

function Instrument_folder(dirname) {
    var openedDir
    try {
        openedDir = fs.opendirSync(dirname);
    }
    catch (err) {
        console.error('Unable to open ' + dirname);
        return;
    }

    // Print the pathname of the directory
    //console.log("\nPath of the directory:", openedDir.path);

    // Read the files in the directory
    // as fs.Dirent objects
    var dirent = openedDir.readSync();
    while (dirent) {
        if (dirent.isFile() && /(.js)$/.test(dirent.name)) {
            Instrument_single_file(dirname + '/' + dirent.name);
        }
        else if (dirent.isDirectory()) {
            Instrument_folder(dirname + '/' + dirent.name);
        }
        dirent = openedDir.readSync();
    }
    // console.log("First Dirent:", );
    // console.log("Next Dirent:", openedDir.readSync());
    // console.log("Next Dirent:", openedDir.readSync());
}




module.exports = {Instrument_single_file, Instrument_folder};