


const app = Vue.createApp({
    template: `
            <recordTablePanel></recordTablePanel>`
})

app.component('recordTablePanel', {
    data() {
        return {
            recordTable: []
        }
    },
    created() {
        Vue.onMounted(() => {
            $.ajax({
                type: "GET",
                url: "/api/mutations",
                success: this.UpdateRecordTable
            })
        })
    },
    methods: {
        refresh() {
            $.ajax({
                type: "GET",
                url: "/api/mutations/refresh",
                success: this.UpdateRecordTable
            });
        },
        DeleteAll() {
            $.ajax({
                type: "DELETE",
                url: "/api/mutations",
                //success: showRecords
                statusCode: {
                    400: function() {
                      alert( "Log file not found!" );
                    },
                    200: function() {
                      alert( "Log been deleted! Please refresh." );
                    }
                }
            });
        },
        DownloadLog() {
            document.getElementById('download-a').click();
        },
        ExportRT() {
            RTarray = []
            for (i in this.recordTable) {
                for (j in this.recordTable[i].cmd_list) {
                    benchmark_time = this.recordTable[i].cmd_list[j].time
                    mutations = this.recordTable[i].cmd_list[j].mutations
                    for (m in mutations) {
                        mut_time = mutations[m].timestamp
                        RTarray.push(mut_time - benchmark_time)
                    }
                }
            }
            alert(RTarray);
        },
        UpdateRecordTable(records) {
            this.recordTable = [];
            if (!records || records.length == 0)
                return;

            // First, categorize based on filename
            this.recordTable.push({
                filename: records[0].filename,
                time: records[0].time,
                cmd_list: [records[0]]
            });
            for (let i = 1; i < records.length; i++) {
                let record = records[i];
                if (record.filename != this.recordTable[this.recordTable.length - 1].filename) {
                    // create a new file entry in file_list
                    this.recordTable.push({
                        filename: record.filename,
                        time: record.time,
                        cmd_list: [record]
                    });
                }
                else {
                    this.recordTable[this.recordTable.length - 1].cmd_list.push(record);
                }
            }
        },
    },
    template: `
        <statistics :recordTable="recordTable"/>

        <ol id="record_table" class="list-group my-2 mx-5">
            <li v-for="record in recordTable" class="list-group-item list-group-item-primary">
                <recordsInOneFile :record="record"/>
            </li>
        </ol>
        
        <div class="py-8 mx-5">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="IDcheck" >
                <label class="form-check-label" for="IDcheck">
                    Only Show Mutations With ID (Need Refresh)
                </label>
            </div>
            
            <button type="button" class="btn btn-primary" style="margin:6px" @click="refresh">Refresh</button>
            <button type="button" class="btn btn-danger" style="margin:6px" @click="DeleteAll">Delete All</button>
            <button type="button" class="btn btn-dark" style="margin:6px" @click="DownloadLog">Download Log File</button>
            <button type="button" class="btn btn-warning" style="margin:6px" @click="ExportRT">Export RT</button>
            <a id="download-a" href="mutations.log" download style="display: none">Download Log Files</a>
        </div>`
})

app.component('recordsInOneFile', {
    props: {
        record: Object
        
    },
    data() {
        return {
            isShow: false
        }
    },
    methods: {
        showDetail() {
            this.isShow = !this.isShow
        }
    },
    template: `
        <div @click="showDetail">File name: {{record.filename}}</div>
        <div @click="showDetail">Record start time: {{ new Date(record.time).toLocaleString() }}</div>
        <ol class="cmd_list list-group">
            <li v-show="isShow" v-for="cmd in record.cmd_list" class="list-group-item list-group-item-warning">
                <commandRecord :cmd_record="cmd"/>
            </li>
        </ol>
       `
})

app.component('commandRecord', {
    props: {
        cmd_record: Object
    },
    data() {
        return {
            isShow: false
        }
    },
    methods: {
        showDetail() {
            this.isShow = !this.isShow
        }
    },
    computed: {
        filtered_mutations: function() {
            if ($("#IDcheck").is(":checked")) { 
                // Only show mutations with ID exists 
                return this.cmd_record.mutations.filter(mu => mu.target.id);
            }
            else{
                return this.cmd_record.mutations;
            }
        }
    },
    template: `
                <div>time: {{cmd_record.time}}</div>
                <div>start line: {{cmd_record.start_line}}</div>
                <div>start col: {{cmd_record.start_col}}</div>
                <div>sentence: {{cmd_record.sentence}}</div>
                <div @click="showDetail">mutation number : {{filtered_mutations.length}}</div>
                <ol class="mutation_list list-group">
                    <li v-show="isShow" v-for="mutation in filtered_mutations"  class="list-group-item list-group-item-info">
                        <mutationRecord :mu_record="mutation" :benchmarkTime="cmd_record.time"/>
                    </li>
                </ol>
       `
})

app.component('mutationRecord', {
    props: {
        mu_record: Object,
        benchmarkTime: Number
    },
    data() {
        return {
            isShow: false
        }
    },
    methods: {
        showDetail() {
            this.isShow = !this.isShow
        }
    },
    computed: {
        mu_description: function() {
            if (this.mu_record.type == 'childList') {
                if (this.mu_record.addedNodes.length > 0)
                    return this.mu_record.addedNodes.length.toString() + ' child nodes have been added.';
                else
                    return this.mu_record.removedNodes.length.toString() + ' child nodes have been removed.';
            }
            else if (this.mu_record.type == 'attributes')
                return '\'' + this.mu_record.attributeName + '\' attribute was modified.'
            else if (this.mu_record.type == 'characterData')
                return 'Character data was modified.';
            else
                return 'Unrecognized mutation type.'
        },
        relative_time: function() {
            return this.mu_record.timestamp - this.benchmarkTime;
        }
    },
    template: `
        <div @click="showDetail">{{mu_description}} RT: {{relative_time}}</div>
        <MutationShow v-show="isShow" :mu_record="mu_record"/>
       `
})

app.component('MutationShow', {
    props: {
        mu_record: Object
    },
    template: `<div class="alert alert-info shadow-sm p-3 mb-2 rounded" role="alert">
        <strong>Type: {{mu_record.type}}</strong>
        <div>Target: <Node :node_object="mu_record.target"/></div>
        <childList_Info :mu_record="mu_record" v-if="mu_record.type == 'childList'"/>
        <Attribute_Info :mu_record="mu_record" v-if="mu_record.type == 'attributes'"/>
        <charData_Info :mu_record="mu_record" v-if="mu_record.type == 'characterData'"/></div>
       `
})

app.component('childList_Info', {
    props: {
        mu_record: Object
    },
    template: `
        <div>Added Nodes: </div>
        <div class="accordion">
            <Node v-for="node in mu_record.addedNodes" :node_object="node"/>
        </div>
        <div>Removed Nodes: </div>
        <div class="accordion">
            <Node v-for="node in mu_record.removedNodes" :node_object="node"/>
        </div>
        `
})

app.component('Attribute_Info', {
    props: {
        mu_record: Object
    },
    template: `<div>Attribute "{{mu_record.attributeName}}" changed from "{{mu_record.oldValue}}" to "{{mu_record.newValue}}".</div>`
})

app.component('charData_Info', {
    props: {
        mu_record: Object
    },
    template: `<div>Node value changed from "{{mu_record.oldValue}}" to "{{mu_record.target.nodeValue}}".</div>`
})


var node_uuid = 0;
app.component('Node', {
    props: {
        node_object: Object
    },
    
    created: function() {
        node_uuid++;
    },
    computed: {
        attributes: function() {
            var attr = this.node_object.attributes;
            var str = '';
            for (attrName in attr)
                str += ' ' + attrName + "=\"" + attr[attrName] + "\"";
            return str;
        },
        CollapseTag: function() {
            return 'collapse' + node_uuid;
        },
        CollapseTag2: function() {
            return '#collapse' + node_uuid;
        },
        HeadingTag: function() {
            return 'heading' + node_uuid;
        },
    },
    template: `
        <div class="accordion-item">
            <h5 class="accordion-header" :id="HeadingTag">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="CollapseTag2" aria-expanded="false" :aria-controls="CollapseTag">
                    {{node_object.nodeName}}
                </button>
            </h5>
            <div :id="CollapseTag" class="accordion-collapse collapse" :aria-labelledby="HeadingTag" data-bs-parent="#accordionExample">
                <div class="accordion-body">
                    <div class="small-font"><strong>Node Value:</strong> {{node_object.nodeValue}}</div>
                    <div class="small-font"><strong>Attributes:</strong> {{attributes}}</div>
                </div>
            </div>
        </div>
       `
})

const vm = app.mount('#app')