const fs = require('fs');
const { MUTATIONS_LOG_PATH, OBSERVER_FILE_PATH, DEFAULT_WAIT_TIME } = require('./lib/global')

var FTfixer = {}


FTfixer.waitFor = async function (timeout = DEFAULT_WAIT_TIME) {
    return new Promise(r => {
        setTimeout(() => {
            r();
        }, timeout);
    });
}

FTfixer.waitUntil = async function (conFunc, timeout = DEFAULT_WAIT_TIME, interval = 10) {    // conFunc: condition function(async)
    var timeoutFlag = false;
    setTimeout(() => timeoutFlag = true, timeout);

    while (!timeoutFlag) {
        var res = await conFunc();
        if (res) {
            return true;
        }
        else {
            await this.waitFor(interval);
        }
    }
    return false;
}

FTfixer.parseCookie = function (cookies) {
    var mutations = []; //mutation array

    for (let i in cookies) {
        // Replace %22 and %2C
        //cookieStr = cookies[i].value.split("%22").join("\"").split("%2C").join(",");
        if (cookies[i].name.slice(0, 5) != 'ftFix')
            continue;

        let cookieStr = cookies[i].value
        try{
            let mlist = JSON.parse(cookieStr);
            //console.log(cookies[i]);
            let timestamp = parseInt(cookies[i].name.slice(5)); //remove flag
            for (let j in mlist) {
                let mutation = mlist[j];
                mutation.timestamp = timestamp;
                mutations.push(mutation);
            }
        }
        catch (err) {
            console.error('Failed to parse: ' + cookieStr);
        }
    }
    return mutations;

}

FTfixer.before_cmd = async function (driver) {
    var snippet = '';
    try {
        snippet = fs.readFileSync(OBSERVER_FILE_PATH, 'utf8');
    }
    catch (err) {
        console.error('Unable to open mutationObserver file at: ' + snippet_path);
        return;
    }
    await driver.executeScript(snippet);
    await driver.manage().deleteAllCookies();
}

FTfixer.before_cmd_cy = async function (cy) {
    // cy.readFile(OBSERVER_FILE_PATH).then((code) => {
    //     cy.window().then((win) => {
    //         win.eval(code);
    //     });
    // });

    cy.window().then((win) => {
        win.eval('function cookieSet(e){if("undefined"==typeof document)return;var t="ftFix"+(new Date).getTime()+"="+JSON.stringify(e).replaceAll(";","")+"; expires="+new Date(Date.now()+8e3).toUTCString();document.cookie=t}function StartObserver(){if("undefined"!=typeof observer_exist&&1==observer_exist)return;console.log("Start mutaion oberver");new MutationObserver((function(e,t){var o=[];for(let t in e){const r=e[t];let a=convertRecord(r);o.push(a),console.log(r),"childList"===r.type?console.log("A child node has been added or removed."):"attributes"===r.type?console.log("The "+r.attributeName+" attribute was modified."):"characterData"===r.type&&console.log("Character data was modified.")}cookieSet(o)})).observe(document,{attributes:!0,childList:!0,characterData:!0,subtree:!0,attributeOldValue:!0,characterDataOldValue:!0}),window.observer_exist=!0,console.log("Mutation observer started")}function convertRecord(e){var t={};t.target=convertNode(e.target),t.addedNodes=[];var o=e.addedNodes;for(let e=0;e<o.length;e++)t.addedNodes.push(convertNode(o[e]));t.removedNodes=[];var r=e.removedNodes;for(let e=0;e<r.length;e++)t.removedNodes.push(convertNode(r[e]));if(t.type=e.type,t.attributeName=e.attributeName,t.oldValue=e.oldValue,t.newValue=null,"attributes"===t.type){var a=e.target.attributes;for(i in a){let e=a[i];if(e.name==t.attributeName){t.newValue=e.value;break}}}return t}function convertNode(e){var t={};return t.nodeName=e.nodeName,t.className=e.className,t.id=e.id,t.nodeType=e.nodeType,t.nodeValue=e.nodeValue,t.childElementCount=e.childElementCount,t.attributes=convertAttributes(e.attributes),t}function convertAttributes(e){var t={};for(i in e)t[e[i].name]=e[i].value;return t}StartObserver();');
    });
    cy.clearCookies();
}

FTfixer.after_cmd = async function (driver, filename, start_line, start_col, sentence) {
    await FTfixer.waitFor(DEFAULT_WAIT_TIME);
    var cookies = await driver.manage().getCookies();
    var timestamp = Date.now() - DEFAULT_WAIT_TIME; //miliseconds
    var mutations = FTfixer.parseCookie(cookies);
    
    var record = {
        "time": timestamp,
        "filename": filename,
        "start_line": start_line,
        "start_col": start_col,
        "sentence": sentence,
        "mutations": mutations
    };
    // Append to log file
    fs.appendFile(MUTATIONS_LOG_PATH, JSON.stringify(record) + '\r\n', function(err){
        if(err)
            console.error('save to log file fails.');
    })
}

FTfixer.after_cmd_cy = async function (cy, filename, start_line, start_col, sentence) {
    cy.wait(DEFAULT_WAIT_TIME);
    cy.getCookies().then((cookies) => {
        var mutations = FTfixer.parseCookie(cookies);
        var timestamp = Date.now() - DEFAULT_WAIT_TIME;     
        var record = {
            "time": timestamp,
            "filename": filename,
            "start_line": start_line,
            "start_col": start_col,
            "sentence": sentence,
            "mutations": mutations
        };
        // Append to log file
        var log_path = process.env.FT_LOG_PATH || MUTATIONS_LOG_PATH
        //var log_path = '/home/aaron/'
        if (log_path[log_path.length - 1] == '/' || log_path[log_path.length - 1] == '\\')
            log_path += 'mutations.log'
        cy.readFile(log_path).then((str) => {
            cy.writeFile(log_path, str + JSON.stringify(record) + '\r\n')
        })
        
        cy.log(record)
    })
}



module.exports = FTfixer;