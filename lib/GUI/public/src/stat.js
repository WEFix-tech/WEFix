app.component('statistics', {
    props: {
        recordTable: Object
        
    },
    computed: {
        file_num: function() {
            return this.recordTable.length
        },
        cmd_num: function() {
            cmd_n = 0
            for (i in this.recordTable) {
                cmd_n += this.recordTable[i].cmd_list.length
            }
            return cmd_n
        },
        mut_num: function() {
            mut_n = 0
            for (i in this.recordTable) {
                for (j in this.recordTable[i].cmd_list) {
                    cmd = this.recordTable[i].cmd_list[j]
                    mut_n += cmd.mutations.length
                }
            }
            return mut_n
        },
        mut_per_cmd: function() {
            return (this.mut_num / this.cmd_num).toFixed(1)
        },
        att_num: function() {
            att_n = 0
            for (i in this.recordTable) {
                for (j in this.recordTable[i].cmd_list) {
                    mutations = this.recordTable[i].cmd_list[j].mutations
                    for (m in mutations) {
                        type = mutations[m].type
                        if (type == "attributes")
                            att_n += 1
                    }
                }
            }
            return att_n
        },
        att_prop: function() {
            return (this.att_num / this.mut_num * 100).toFixed(1)
        },
        cld_num: function() {
            cld_n = 0
            for (i in this.recordTable) {
                for (j in this.recordTable[i].cmd_list) {
                    mutations = this.recordTable[i].cmd_list[j].mutations
                    for (m in mutations) {
                        type = mutations[m].type
                        if (type == "childList")
                            cld_n += 1
                    }
                }
            }
            return cld_n
        },
        cld_prop: function() {
            return (this.cld_num / this.mut_num * 100).toFixed(1)
        },
        cha_num: function() {
            return this.mut_num - this.cld_num - this.att_num;
        },
        cha_prop: function() {
            return (this.cha_num / this.mut_num * 100).toFixed(1)
        },
        avg_rt: function() {
            rt_sum = 0
            rt_cnt = 0
            for (i in this.recordTable) {
                for (j in this.recordTable[i].cmd_list) {
                    benchmark_time = this.recordTable[i].cmd_list[j].time
                    mutations = this.recordTable[i].cmd_list[j].mutations
                    for (m in mutations) {
                        mut_time = mutations[m].timestamp
                        rt_sum += mut_time - benchmark_time
                        rt_cnt += 1
                        
                    }
                }
            }
            return (rt_sum/rt_cnt).toFixed(0)
        },
        avg_lrt: function() {
            lrt_sum = 0
            lrt_cnt = 0
            for (i in this.recordTable) {
                for (j in this.recordTable[i].cmd_list) {
                    benchmark_time = this.recordTable[i].cmd_list[j].time
                    mutations = this.recordTable[i].cmd_list[j].mutations
                    if (mutations.length > 0)
                    {
                        mut_time = mutations[mutations.length-1].timestamp
                        lrt_sum += mut_time - benchmark_time
                        lrt_cnt += 1
                    }
                }
            }
            return (lrt_sum/lrt_cnt).toFixed(0)
        },
        no_late_prop: function() {
            late_cnt = 0
            for (i in this.recordTable) {
                for (j in this.recordTable[i].cmd_list) {
                    benchmark_time = this.recordTable[i].cmd_list[j].time
                    mutations = this.recordTable[i].cmd_list[j].mutations
                    if (mutations.length > 0)
                    {
                        mut_time = mutations[mutations.length-1].timestamp
                        lrt = mut_time - benchmark_time
                        if (lrt > 0)
                            late_cnt += 1
                    }
                }
            }
            return ((1 - late_cnt/this.cmd_num) * 100).toFixed(0)
        }
    },
    template: `
    <div  id="statistics" class="accordion-item">
        <h2 class="accordion-header" id="headingOne">
        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
        STATISTICS
        </button>
        </h2>
        <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
            <div class="accordion-body" style="padding: 0px;">
            <ul class="list-group">
                <li class="list-group-item" style="font-size:small; padding: .2rem 1rem;"><strong>file number:</strong> {{file_num}}</li>
                <li class="list-group-item" style="font-size:small; padding: .2rem 1rem;"><strong>command number:</strong> {{cmd_num}}</li>
                <li class="list-group-item" style="font-size:small; padding: .2rem 1rem;"><strong>mutation number:</strong> {{mut_num}}</li>
                <li class="list-group-item" style="font-size:small; padding: .2rem 1rem;"><strong>mutation per command:</strong> {{mut_per_cmd}} </li>
                <li class="list-group-item" style="font-size:small; padding: .2rem 1rem;"><strong>attribute mutations:</strong> {{att_num}} ({{att_prop}}%)</li>
                <li class="list-group-item" style="font-size:small; padding: .2rem 1rem;"><strong>childList mutations:</strong> {{cld_num}} ({{cld_prop}}%)</li>
                
                <li class="list-group-item" style="font-size:small; padding: .2rem 1rem;"><strong>characterData mutations:</strong> {{cha_num}} ({{cha_prop}}%)</li>
                <li class="list-group-item"></li>
                <li class="list-group-item" style="font-size:small; padding: .2rem 1rem;"><strong>average RT:</strong> {{avg_rt}} (ms)</li>
                <li class="list-group-item" style="font-size:small; padding: .2rem 1rem;"><strong>average latest RT:</strong> {{avg_lrt}} (ms)</li>
                <li class="list-group-item" style="font-size:small; padding: .2rem 1rem;"><strong>No-late command:</strong> {{no_late_prop}}%</li>
            </ul>
            </div>
        </div>
    </div>`
})