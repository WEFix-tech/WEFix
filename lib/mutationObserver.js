function cookieSet(content) {
    //@param content type: any
    if (typeof document === 'undefined') {
        return;
    }

    const validPeriod = 8000;    // Cookie expires after 8 seconds
    const flag = "ftFix";

    var timestamp = new Date().getTime();
    var contentStr = JSON.stringify(content).replaceAll(';','');
    var expireTime = new Date(Date.now() + validPeriod).toUTCString();

    //Add cookie
    var cookieStr = flag + timestamp + "=" + contentStr + "; expires=" + expireTime;
    document.cookie = cookieStr;
}

function StartObserver(){
    if(typeof observer_exist != 'undefined' && observer_exist == true) {
        // Observer already initialized
        return;
    }

    
    console.log('Start mutaion oberver');

    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, characterData:true, subtree: true ,attributeOldValue: true, characterDataOldValue: true};

    // Callback function to execute when mutations are observed
    const callback = function(mutationList, observer) {
        //var timestamp = new Date().getTime() + '';

        // serializable version of mutation list
        var s_mutationList = [];

        for(let i in mutationList) {
            const mutation = mutationList[i]
            //console.log(mutation);
            // convert to serializable version
            let s_mutation = convertRecord(mutation);
            s_mutationList.push(s_mutation);
            console.log(mutation);
            
            // Log according to different mutation type
            if (mutation.type === 'childList') {
                console.log('A child node has been added or removed.');
            }
            else if (mutation.type === 'attributes') {
                console.log('The ' + mutation.attributeName + ' attribute was modified.');
            }
            else if (mutation.type === 'characterData') {
                console.log('Character data was modified.');
            }
        }
        
        //Cookies.set(timestamp, JSON.stringify(s_mutationList), { expires: 0.0001 });    // cookies expire after 8 seconds
        cookieSet(s_mutationList);
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(document, config);

    // Set a flag
    window.observer_exist = true;

    console.log('Mutation observer started')
}

// Mutation Record Reference: https://dom.spec.whatwg.org/#mutationrecord
function convertRecord(mutationRecord){
    var newRecord = {};

    // target Field
    newRecord.target = convertNode(mutationRecord.target);
    
    // addedNodes Field
    newRecord.addedNodes = [];
    var m_addedNodes = mutationRecord.addedNodes;
    for (let i=0; i<m_addedNodes.length; i++){
        newRecord.addedNodes.push(convertNode(m_addedNodes[i]));
    }

    // removedNodes Field
    newRecord.removedNodes = [];
    var m_removedNodes = mutationRecord.removedNodes;
    for (let i=0; i<m_removedNodes.length; i++){
        newRecord.removedNodes.push(convertNode(m_removedNodes[i]));
    }

    // type Filed
    newRecord.type = mutationRecord.type;

    // attributeName Field
    newRecord.attributeName = mutationRecord.attributeName;

    // oldValue Field
    newRecord.oldValue = mutationRecord.oldValue;


    // Get new attribute value
    newRecord.newValue = null;
    if (newRecord.type === 'attributes') {
        var attributes = mutationRecord.target.attributes;
        for (i in attributes) {
            let attribute = attributes[i];
            if (attribute.name == newRecord.attributeName) {
                newRecord.newValue = attribute.value;
                break;
            }
        } 
    }

    return newRecord;
}

function convertNode(node){
    // node is Element type
    var newNode = {}
    newNode.nodeName = node.nodeName;
    newNode.className = node.className;
    newNode.id = node.id;
    newNode.nodeType = node.nodeType;
    newNode.nodeValue = node.nodeValue;
    //newNode.textContent = node.textContent;
    newNode.childElementCount = node.childElementCount;
    newNode.attributes = convertAttributes(node.attributes);
    return newNode;
}

function convertAttributes(attr) {
    var newAttr = {};
    for (i in attr) {
        newAttr[attr[i].name] = attr[i].value;
    }
    return newAttr;
}

StartObserver();