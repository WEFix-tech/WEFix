'use strict'

// const fs = require('fs');
// const { execSync } = require("child_process");
// const { parse } = require('@babel/parser');
// const traverse = require('@babel/traverse').default;
// const generate = require('@babel/generator').default;
// const { bigIntLiteral } = require('@babel/types');
// const { assert } = require('console');
// //import { parse } from '@babel/parser';
// //import traverse from '@babel/traverse';
// // import generate from '@babel/generator';

// var Fixer = {}

// Fixer.codeRecord = {
//     require_codes: '',
//     before_block_codes: '',
//     after_block_codes: '',
//     statements: [], // String list
//     mutations: [] // Mutation record list
// }

// function cleanCodeRecord() {
//     Fixer.codeRecord.require_codes = '';
//     Fixer.codeRecord.before_block_codes = '';
//     Fixer.codeRecord.after_block_codes = '';
//     Fixer.codeRecord.statements = [];
//     Fixer.codeRecord.mutations = [];
// }

// function fromRecordToCode() {
//     return Fixer.codeRecord.require_codes
//         + Fixer.codeRecord.before_block_codes
//         + combineStatement( Fixer.codeRecord.statements)
//         + Fixer.codeRecord.after_block_codes;
// }

// function autoFix(statement, mutation) {
//     if (mutation.length) {
//         statement += `
//     await AutoTest.waitUntil(async () => {
//         var children = await driver.findElement(By.id('mList')).findElements(By.xpath("./*")); 
//         if (children.length == 3)
//             return true;
//         else
//             return false;
//     }, 2000);`
//     }
//     return statement;
// }

// Fixer.fix = function (file_path) {
//     console.log('Start auto fixing.');
//     cleanCodeRecord();
//     var raw_code;
//     try {
//         raw_code = fs.readFileSync(file_path, 'utf8');
//     }
//     catch (err) {
//         console.error('Unable to find ' + file_path);
//     }

//     //console.log(ast);

//     var tc = preTransform(raw_code);
//     const f_anal_path = file_path.slice(0, -2) + 'anal.js';
//     fs.writeFileSync(f_anal_path, tc);

//     var stdout = execSync('node ' + f_anal_path).toString();

//     Fixer.codeRecord.mutations = JSON.parse(stdout);
//     //console.log(Fixer.codeRecord);
//     assert(Fixer.codeRecord.mutations.length == Fixer.codeRecord.statements.length);

//     for (let i = 0; i < Fixer.codeRecord.mutations.length; i++) {
//         Fixer.codeRecord.statements[i] = autoFix(Fixer.codeRecord.statements[i], Fixer.codeRecord.mutations[i]);
//     }

//     var fixed_code = fromRecordToCode();
//     const f_fix_path = file_path.slice(0, -2) + 'fix.js';
//     fs.writeFileSync(f_fix_path, fixed_code);

//     return;
    



//     // var ast = parse(f);
//     // traverse(ast, {
//     //     enter(path) {
//     //         // in this example change all the variable `n` to `x`
//     //         if (path.isIdentifier({ name: 'a' })) {
//     //             path.node.name = 'n';
//     //         }
//     //     },
//     // });
//     // // generate code <- ast
//     // const output = generate(ast, f);
//     // console.log(output.code);
// }



// function preTransform(code) {
//     var first_test_loc = code.match(/test\(/).index;

//     var before_test_codes = code.slice(0, first_test_loc);
//     var after_test_codes = code.slice(first_test_loc);
//     let matchList = [...before_test_codes.matchAll(';')];
//     var require_codes_end_loc = matchList[matchList.length - 1].index;


//     Fixer.codeRecord.require_codes = code.slice(0, require_codes_end_loc + 1);
//     // Find first left large parenthesis (LLP) after 'test' label
//     var first_LLP_loc = after_test_codes.match(/\{/).index + before_test_codes.length;
//     Fixer.codeRecord.before_block_codes = code.slice(require_codes_end_loc + 1, first_LLP_loc + 1);

//     var block_codes = extractBlock(code.slice(first_LLP_loc));


//     var instr_block_codes = instrument(block_codes);
    
//     return Fixer.codeRecord.require_codes
//         //+ '\nconst FTFixer = require(\'@aaronxyliu/ftfixer\');'   //For deploy
//         + '\nconst FTFixer = require(\'../index\');'    // For development
//         + '\nasync function main(){'
//         + instr_block_codes
//         + '}\nmain();';
// }

// function extractBlock(code) {
//     var block_count = 0;
//     for (let i = 0; i < code.length; i++) {
//         if (code[i] === '}') {
//             block_count = block_count - 1;
//             if (block_count == 0) {
//                 // Return the block end location
//                 Fixer.codeRecord.after_block_codes = code.slice(i);
//                 return code.slice(1, i);
//             }
//         }
//         if (code[i] === '{') {
//             block_count = block_count + 1;
//         }
//     }
//     // Failed to find a block
//     return null;
// }

// function instrument(code) {
//     // Assume every statement ends in semicolon
//     Fixer.codeRecord.statements = code.split(';');
//     var new_code_list = [];
//     new_code_list.push(`    var mutationsList = [];`);
//     for (let i = 0; i < Fixer.codeRecord.statements.length; i++) {
//         let statement = Fixer.codeRecord.statements[i];
//         if (statement.match(/Builder\(/)){
//             new_code_list.push(statement);
//             new_code_list.push(`    await driver.executeScript(FTFixer.START_MO_SNIPPET);`);
//             new_code_list.push(`    mutationsList.push([]);`);
//         }
//         else if (statement.match(/Key\./)){
//             new_code_list.push(`    await driver.manage().deleteAllCookies();`);
//             new_code_list.push(statement);
//             new_code_list.push(`    await FTFixer.waitFor(2000);`);
//             new_code_list.push(`    var cookies = await driver.manage().getCookies();`);
//             new_code_list.push(`    var mutations = FTFixer.parseCookie(cookies);`);
//             new_code_list.push(`    mutationsList.push(mutations);`);
//         }
//         else if (statement.match(/(return)|(expect)/)){
//             new_code_list.push(`    mutationsList.push([]);`);
//         }
//         else{
//             new_code_list.push(statement);
//             new_code_list.push(`    mutationsList.push([]);`);
//         }
//     }
//     new_code_list.push(`    console.log(JSON.stringify(mutationsList));`);
//     new_code_list.push(`    return;`);
//     return combineStatement(new_code_list);
// }

// function combineStatement(list) {
//     var code = ''
//     for (let i = 0; i < list.length; i++) {
//         code = code + list[i] + '\n';
//     }
//     return code;
// }

// module.exports = Fixer;