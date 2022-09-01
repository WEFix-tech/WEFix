const express = require('express');
const router = express.Router();
const fs = require('fs');
const { MUTATIONS_LOG_PATH } = require('../../../global');

var record_list = [];
router.get('/', (req, res) => {
    CleanMutationData();

    if (record_list.length == 0) {
        var content = '';
        try {
            content = fs.readFileSync(MUTATIONS_LOG_PATH, 'utf8');
        }
        catch (err) {
            console.error('Unable to open mutation log file');
            res.json(record_list);
            return;
        }
        console.log('read mutation log from file');
        var records = content.split('\r\n');
        for (let record of records) {
            if (record) {
                record_list.push(JSON.parse(record));
            }
        }
    }
    // Sort based on timestamp
    record_list.sort((a, b) => a.time > b.time );
    res.json(record_list);
});

router.get('/refresh', (req, res) => {
    CleanMutationData();

    // Read from file again
    record_list = [];

    var content = '';
    try {
        content = fs.readFileSync(MUTATIONS_LOG_PATH, 'utf8');
    }
    catch (err) {
        console.error('Unable to open mutation log file');
        res.json(record_list);
        return;
    }
    console.log('read mutation log from file');
    var records = content.split('\r\n');
    for (let record of records) {
        if (record) {
            record_list.push(JSON.parse(record));
        }
    }
    // Sort based on timestamp
    record_list.sort((a, b) => a.time > b.time );
    res.json(record_list);
});

// router.post('/', (req, res) => {
//     const newMember = {
//         //id: uuid.v4(),
//         name: req.body.name,
//         email: req.body.email,
//         //status: 'active'
//     }

//     if(!newMember.name || !newMember.email){
//         return res.status(400).json({ msg: 'Please include a name and email'});
//     }

//     members.push(newMember);
//     res.json(members);
// });

router.delete('/', (req, res) => {
    try {
        // Empty the file content
        content = fs.writeFileSync(MUTATIONS_LOG_PATH, '');
        res.status(200);
        // remove log file
        //fs.unlinkSync(MUTATIONS_LOG_PATH);
    }
    catch (err) {
        console.error('Unable to open mutation log file');
        res.status(400);
    }
    res.json([])
});

function CleanMutationData() {
    // Read mutations from local log file
    var content = '';
    try {
        content = fs.readFileSync(MUTATIONS_LOG_PATH, 'utf8');
    }
    catch (err) {
        console.error('Unable to open mutation log file to read during clean process');
        return;
    }
    var records = content.split('\r\n');
    var newContent = '';

    for (let record_s of records) {
        if (record_s) {
            let record = JSON.parse(record_s)
            let mutations = record.mutations;
            var lastMutation_s = ''
            let i = mutations.length;
            while (i > 0) {
                i --;
                let mutation = mutations[i];
                let target = mutation.target;
                let Mutation_s = JSON.stringify(mutation);

                if (target && (target.nodeName == 'HEAD' || target.nodeName == 'BODY' || target.nodeName == 'META')) {
                    mutations.splice(i, 1); //remove this element
                }
                else if (Mutation_s == lastMutation_s) {
                    mutations.splice(i, 1); //remove this repeat element
                }
                else if (mutation.attributeName == 'data-cypress-el') {
                    mutations.splice(i, 1); //remove attribute 'data-cypress-el' mutation
                }
                else if (mutation.oldValue == mutation.newValue) {
                    mutations.splice(i, 1); //remove false attributes mutation
                }
                else if (mutation.oldValue == mutation.target.nodeValue) {
                    mutations.splice(i, 1); //remove false characterData mutation
                }
                else {
                    lastMutation_s = Mutation_s;
                }
                
            }
            newContent += JSON.stringify(record) + '\r\n';
        }
    }

    try {
        fs.writeFileSync(MUTATIONS_LOG_PATH, newContent);
    }
    catch (err) {
        console.error('Unable to open mutation log file to write during clean process');
        return;
    } 
}

module.exports = router;