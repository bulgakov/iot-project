<template>
    <div>
        <div class="row">
            <div class="col-sm-12">
                <card v-if="$store.state.devices.length > 0">
                    <div slot="header">
                        <h4 class="card-title">{{ $t('alarms.addAlarm') }}</h4>
                    </div>
                    <div class="row">
                        <div class="col-3">
                            <b-form-select v-model="selectedWidgetIndex" class="text-light" variant="outline-dark" required>
                                <template #first>
                                    <b-form-select-option :value="null" disabled>{{ $t('alarms.inVariableEmpty') }}</b-form-select-option>
                                    <b-form-select-option v-for="widget,index in $store.state.selectedDevice.template.widgets" :key="index" :value="index" >{{ widget.variableName }}</b-form-select-option>
                                </template>
                            </b-form-select>
                        </div>
                        <div class="col-3">
                            <b-form-select v-model="newRule.condition" :options="conditions" value-field="value" text-field="text" class="text-light" variant="outline-dark" required>
                                <template #first>
                                    <b-form-select-option :value="null" disabled>{{ $t('alarms.inConditionEmpty') }}</b-form-select-option>
                                </template>
                            </b-form-select>
                        </div>
                        <div class="col-3">
                            <base-input type="number" :label="$t('alarms.inValue')" v-model="newRule.value" />
                        </div>
                        <div class="col-3">
                            <base-input type="number" :label="$t('alarms.inTriggerTime')" v-model="newRule.triggerTime" />
                        </div>
                    </div>
                    <br/>
                    <br/>
                    <div class="row pull-right">
                        <div class="col-12">
                            <base-button native-type="submit" type="primary" class="mb3 pull-right" size="lg" @click="createAlarm()" >{{ $t('alarms.btnAddAlarm') }}</base-button>
                        </div>
                    </div>
                </card>
                <div v-else>
                    {{ $t('alarms.selectDevice')}}
                </div>
            </div>
        </div>
        <!-- ALARMS TABLE -->
        <div class="row" v-if="$store.state.devices.length > 0">
            <div class="col-sm-12">
                <card>
                    <div slot="header">
                        <h4 class="card-title">{{ $t('alarms.title') }}</h4>
                    </div>
                    <div class="row">
                        <b-table striped hover :items="$store.state.selectedDevice.alarmRules" :fields="alarmRulesFields">
                            <template #cell(condition)="row">
                                {{ getConditionText(row.value) }}
                            </template>
                            <template #cell(actions)="row">
                                <i  class="fas fa-database "
                                    :class="{
                                        'text-success': row.item.status,
                                        'text-dark': !row.item.status
                                    }">
                                </i>
                                <base-switch :value="row.item.status" type="primary" on-text="On" off-text="Off" @click="updateStatusRule(row.item, row.index, $event.target)"></base-switch>
                                <base-button class="btn-link" type="danger" icon size="sm" @click="deleteAlarm(row.item, row.index, $event.target)">
                                    <i class="tim-icons icon-simple-remove"></i>
                                </base-button>
                            </template>
                        </b-table>
                    </div>
                </card>
            </div>
        </div>
        <!-- JSON -->
        <!-- <div class="row">
            <Json :value="$store.state.selectedDevice.alarmRules"></Json>
        </div> -->
    </div>
</template>
<script>
import { Select, Option } from "element-ui";
import { Table, TableColumn } from "element-ui";
import { BFormSelect, BFormSelectOption } from "Bootstrap-Vue";
import { BTable } from "Bootstrap-Vue";

export default {
    components: {
        [Option.name]: Option,
        [Select.name]: Select,
        [Table.name]: Table,
        [TableColumn.name]: TableColumn,
        [BFormSelect.name]: BFormSelect,
        [BFormSelectOption.name]: BFormSelectOption,
        [BTable.name]: BTable
    },
    middleware: "authenticated",
    data() {
        return {
            conditions: [
                { value: 'eq',  text: '=' },
                { value: 'gt',  text: '>' },
                { value: 'get', text: '>=' },
                { value: 'lt',  text: '<' },
                { value: 'let', text: '<=' },
                { value: 'neq', text: '!=' }
            ],
            alarmRulesFields: [
                { key: 'variableName', label: this.$i18n.t('alarms.tblVariableName'), sortable: false},
                { key: 'variable', label: this.$i18n.t('alarms.tblVariable'), sortable: false},
                { key: 'condition', label: this.$i18n.t('alarms.tblCondition'), sortable: false, class: 'text-center'},
                { key: 'value', label: this.$i18n.t('alarms.tblValue'), sortable: false, class: 'text-center'},
                { key: 'triggerTime', label: this.$i18n.t('alarms.tblTriggerTime'), sortable: false, class: 'text-center'},
                //{ key: 'status', label: this.$i18n.t('alarms.tblStatus'), sortable: false, class: 'text-center'},
                { key: 'counter', label: this.$i18n.t('alarms.tblCounter'), sortable: true, class: 'text-center'},
                { key: 'actions', label: this.$i18n.t('alarms.tblActions') }
            ],
            alarmRules: [],
            selectedWidgetIndex: null,
            newRule: {
                userId: null,
                deviceId: null,
                emqxRuleId: null,
                status: true,
                variableName: null,
                variable: null,
                condition: null,
                value: null,
                triggerTime: null
            }
        }
    },
    mounted() {
        //this.getAlarms();
    },
    methods: {
        async createAlarm() {
            if (this.selectedWidgetIndex == null) {
                this.$notify({
                    type: 'warning',
                    icon: 'tim-icons icon-alert-circle-exc',
                    message: this.$i18n.t('alarms.msgVariableInvalid')
                });
                return;
            }

            if (this.newRule.condition == null) {
                this.$notify({
                    type: 'warning',
                    icon: 'tim-icons icon-alert-circle-exc',
                    message: this.$i18n.t('alarms.msgConditionInvalid')
                });
                return;
            }

            if (this.newRule.value == null) {
                this.$notify({
                    type: 'warning',
                    icon: 'tim-icons icon-alert-circle-exc',
                    message: this.$i18n.t('alarms.msgValueInvalid')
                });
                return;
            }

            if (this.newRule.triggerTime == null) {
                this.$notify({
                    type: 'warning',
                    icon: 'tim-icons icon-alert-circle-exc',
                    message: this.$i18n.t('alarms.msgTriggerTimeInvalid')
                });
                return;
            }

            var axiosConfig = {
                headers: {
                    token: this.$store.state.auth.token
                }
            };

            this.newRule.deviceId = this.$store.state.selectedDevice.deviceId;
            this.newRule.variable = this.$store.state.selectedDevice.template.widgets[this.selectedWidgetIndex].variable;
            this.newRule.variableName = this.$store.state.selectedDevice.template.widgets[this.selectedWidgetIndex].variableName;

            try {
                var res = await this.$axios.post('/alarms', this.newRule, axiosConfig);

                if (res.data.status == 'failed') {
                    this.$notify({
                        type: "danger",
                        icon: "tim-icons icon-alert-circle-exc",
                        message: this.$i18n.t('alarms.msgAlarmCreateError')
                    });
                    return;
                } else if (res.data.status == 'success') {
                    
                    this.newRule.variable = null;
                    this.newRule.variableName = null;
                    this.newRule.condition = null;
                    this.newRule.value = null;
                    this.newRule.triggerTime = null;
                    this.selectedWidgetIndex = null;

                    this.$notify({
                        type: 'success',
                        icon: 'tim-icons icon-check-2',
                        message: this.$i18n.t('alarms.msgAlarmCreated')
                    });
                    this.$store.dispatch('getDevices');
                    return;
                }
            } catch (error) {
                console.log(error);
                this.$notify({
                    type: "danger",
                    icon: "tim-icons icon-alert-circle-exc",
                    message: this.$i18n.t('alarms.msgAlarmCreateError')
                });
                return;
            }
        },
        deleteAlarm(item, index, button) {
            var axiosConfig = {
                headers: {
                    token: this.$store.state.auth.token
                },
                params: {
                    emqxRuleId: item.emqxRuleId
                }
            };

            this.$axios
            .delete('/alarms', axiosConfig)
            .then(res => {
                //success
                if (res.data.status == 'success') {
                    this.$notify({
                        type: 'success',
                        icon: 'tim-icons icon-check-2',
                        message: item.name + this.$i18n.t('alarms.msgAlarmDeleted')
                    });
                    this.$store.dispatch('getDevices');
                }
            })
            .catch(e => {
                console.log(e.response.data);
                this.$notify({
                    type: "danger",
                    icon: "tim-icons icon-alert-circle-exc",
                    message: this.$i18n.t('alarms.msgAlarmDeleteError')
                });
            });
        },
        updateStatusRule(item, index, button) {
            var rule = Object.assign({}, item);
            rule.status = !rule.status;

            var axiosConfig = {
                headers: {
                    token: this.$store.state.auth.token
                }
            };

            this.$axios
            .put('/alarms/status', rule, axiosConfig)
            .then(res => {
                //success
                if (res.data.status == 'success') {
                    this.$notify({
                        type: 'success',
                        icon: 'tim-icons icon-check-2',
                        message: item.variableName + this.$i18n.t('alarms.msgAlarmUpdated')
                    });
                    this.$store.dispatch('getDevices');
                }
            })
            .catch(e => {
                console.log(e.response.data);
                this.$notify({
                    type: "danger",
                    icon: "tim-icons icon-alert-circle-exc",
                    message: this.$i18n.t('alarms.msgAlarmUpdateError')
                });
            });
            
        },
        getConditionText(value) {
            return this.conditions.filter(condition => condition.value == value)[0].text;
        }
    }
}
</script>
