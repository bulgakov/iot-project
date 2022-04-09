<template>
    <div>
        <div class="row">
            <card>
                <div slot="header">
                    <h4 class="card-title">{{ $t('devices.addDevice') }}</h4>
                </div>
                <div class="row">
                    <div class="col-4">
                        <base-input 
                        :label="$t('devices.inName')" type="text" :placeholder="$t('devices.inNamePH')" v-model="device.name" />
                    </div>
                    <div class="col-4">
                        <base-input :label="$t('devices.inId')" type="text" :placeholder="$t('devices.inIdPH')" v-model="device.deviceId" />
                    </div>
                    <div class="col-4">
                        <slot name="label">
                            <label>{{$t('devices.inTemplate')}}</label>
                        </slot>
                        <b-form-select v-model="device.templateId" :options="templates" value-field="_id" text-field="name" class="text-light" variant="outline-dark" required>
                            <template #first>
                                <b-form-select-option :value="null" disabled>{{$t('devices.inTemplateEmpty')}}</b-form-select-option>
                            </template>
                        </b-form-select>
                    </div>
                </div>
                <div class="row pull-right">
                    <div class="col-12">
                        <base-button class="mb-3" type="primary" size="md" @click="saveDevice()">{{$t('devices.btnAdd')}}</base-button>
                    </div>
                </div>
            </card>
        </div>
        <div class="row">
            <card>
                <div>
                    <h4 class="card-title">{{$t('devices.title')}}</h4>
                </div>
                <b-table striped hover :items="$store.state.devices" :fields="deviceFields">
                    <template #cell(actions)="row">
                        <base-button class="btn-link" type="info" icon size="sm" @click="exportModal(row.item, row.index, $event.target)">
                            <i class="fas fa-file-export"></i>
                        </base-button>
                        <span><i  class="fas fa-database "
                            :class="{
                                'text-success': row.item.saveRule.status,
                                'text-dark': !row.item.saveRule.status
                            }">
                        </i></span>
                        <base-switch :value="row.item.saveRule.status" type="primary" :on-text="$t('widgets.txtOn')" :off-text="$t('widgets.txtOff')" @click="updateDeviceStatus(row.item, row.index, $event.target)"></base-switch>
                        <base-button class="btn-link" type="danger" icon size="sm" @click="deleteDevice(row.item, row.index, $event.target)">
                            <i class="tim-icons icon-simple-remove"></i>
                        </base-button>
                    </template>
                </b-table>
                <!-- Info modal -->
                <b-modal :id="infoModal.id" scrollable hide-backdrop :title="infoModal.title" 
                    ref="modal"
                    @hidden="resetModal" 
                    @ok="modalOk"
                    title-class="text-light" 
                    button-size="sm"
                    no-close-on-esc
                    no-close-on-backdrop
                    :ok-title="$t('devices.btnModalOk')"
                    :cancel-title="$t('devices.btnModalCancel')"
                    header-bg-variant="dark" header-text-variant="light"
                    body-bg-variant="dark" body-text-variant="light"
                    footer-bg-variant="dark" footer-text-variant="light">
                    <div class="row">
                        <div class="col-12">
                            <slot name="label">
                                <label>{{$t('devices.inVariable')}}</label>
                            </slot>
                            <b-form-select v-model="infoModal.selectedVariable" class="text-light" variant="outline-dark" required>
                                <template #first>
                                    <b-form-select-option value="all">{{ $t('devices.inVariableAll') }}</b-form-select-option>
                                    <b-form-select-option v-for="variable,index in infoModal.variables" :key="index" :value="variable.variable" >{{ variable.variableName }}</b-form-select-option>
                                </template>
                            </b-form-select>
                        </div>
                    </div>
                </b-modal>
            </card>
        </div>
        <!-- <div class="row">
            <Json :value="$store.state.devices"></Json>
        </div> -->
        <b-overlay :show="infoModal.busy" no-wrap variant="transparent"></b-overlay>
    </div>
</template>
<script>
    import BaseSwitch from '~/components/BaseSwitch.vue';
    import * as XLSX from 'xlsx/xlsx.mjs';

    export default {
        middleware: "authenticated",
        components: {
            BaseSwitch
        },
        data() {
            return {
                selectedTemplate: null,
                device: {
                    name: "",
                    id: "",
                    templateId: ""
                },
                templates: [
                    { value: '1', text: 'Template 1' },
                    { value: '2', text: 'Template 2' },
                    { value: '3', text: 'Template 3', disabled: true }
                ],
                deviceFields: [
                    { key: 'name', label: this.$i18n.t('devices.tblName'), sortable: false}, 
                    { key: 'deviceId', label: this.$i18n.t('devices.tblId'), sortable: true}, 
                    { key: 'password', label: this.$i18n.t('devices.tblPass'), sortable: false}, 
                    { key: 'template.name', label: this.$i18n.t('devices.tblTemplate'), sortable: true},
                    { key: 'actions', label: this.$i18n.t('devices.tblActions') }
                ],
                devices: [
                    { name: "Home", deviceId: "8888" , password: 'password', templateId: "8019230", templateName: "Power Sensor", saverRule: true }
                ],
                infoModal: {
                    busy: false,
                    id: 'info-modal',
                    title: this.$i18n.t('devices.txtExport', { device: ''}),
                    content: '',
                    selectedDevice: '',
                    selectedVariable: '',
                    variables: [],
                }
            }
        },
        mounted() {
            //this.$store.dispatch('getDevices');
            this.getTemplates();
        },
        methods: {
            getTemplates() {
                var axiosConfig = {
                    headers: {
                        token: this.$store.state.auth.token
                    }
                };

                this.$axios.get('/templates', axiosConfig)
                .then(res => {
                    if (res.data.status == 'success') {
                        this.templates = res.data.data;
                    }
                })
                .catch(e => {
                    console.log(e.response.data);
                    this.$notify({
                        type: "danger",
                        icon: "tim-icons icon-alert-circle-exc",
                        message: this.$i18n.t('devices.msgTemplateError')
                    });
                });
            },
            getDevices() {
                const axiosHeader = {
                    headers: {
                        token: this.$store.state.auth.token
                    }
                };

                this.$axios.get('/devices', axiosHeader)
                .then(res => {
                    if (res.data.status == 'success') {
                        this.devices = res.data.data;
                    }
                });
            },
            saveDevice() {
                // this.infoModal.title = 'Row index: ' + index;
                // this.infoModal.content = JSON.stringify(item, null, 2);
                // this.$root.$emit('bv::show::modal', this.infoModal.id, button);
                var axiosConfig = {
                    headers: {
                        token: this.$store.state.auth.token
                    }
                };

                this.$axios
                .post('/devices', this.device, axiosConfig)
                .then(res => {
                    //success
                    if (res.data.status == 'success') {
                        this.$notify({
                            type: 'success',
                            icon: 'tim-icons icon-check-2',
                            message: this.$i18n.t('devices.msgDeviceCreated')
                        });
                        this.$store.dispatch('getDevices');
                    }
                })
                .catch(e => {
                    if (e.response.data.status == 'failed' && 
                        e.response.data.error.errors.deviceId.kind == 'unique') {
                        console.log(e.response.data);
                        this.$notify({
                            type: "danger",
                            icon: "tim-icons icon-alert-circle-exc",
                            message: this.$i18n.t('devices.msgDeviceExists')
                        });
                        return;
                    } else {
                        console.log(e.response.data);
                        this.$notify({
                            type: "danger",
                            icon: "tim-icons icon-alert-circle-exc",
                            message: this.$i18n.t('devices.msgDeviceCreateError')
                        });
                        return;
                    }
                });
            },
            deleteDevice(item, index, button) {
                // this.infoModal.title = 'Row index: ' + index;
                // this.infoModal.content = JSON.stringify(item, null, 2);
                // this.$root.$emit('bv::show::modal', this.infoModal.id, button);
                var axiosConfig = {
                    headers: {
                        token: this.$store.state.auth.token
                    },
                    params: {
                        deviceId: item.deviceId
                    }
                };

                this.$axios
                .delete('/devices', axiosConfig)
                .then(res => {
                    //success
                    if (res.data.status == 'success') {
                        this.$notify({
                            type: 'success',
                            icon: 'tim-icons icon-check-2',
                            message: item.name + this.$i18n.t('devices.msgDeviceDeleted')
                        });
                        this.$store.dispatch('getDevices');
                    }
                })
                .catch(e => {
                    console.log(e.response.data);
                    this.$notify({
                        type: "danger",
                        icon: "tim-icons icon-alert-circle-exc",
                        message: this.$i18n.t('devices.msgDeviceDeleteError')
                    });
                });
            },
            updateDeviceStatus(item, index, button) {
                //this.devices[index].saverRule = !item.saverRule;
                var rule = Object.assign({}, item.saveRule);
                rule.status = !item.saveRule.status;

                var axiosConfig = {
                    headers: {
                        token: this.$store.state.auth.token
                    }
                };

                var data = {
                    saveRule: rule
                };

                this.$axios
                .put('/devices/status', data, axiosConfig)
                .then(res => {
                    //success
                    if (res.data.status == 'success') {
                        this.$notify({
                            type: 'success',
                            icon: 'tim-icons icon-check-2',
                            message: item.name + this.$i18n.t('devices.msgDeviceUpdated')
                        });
                        this.$store.dispatch('getDevices');
                    }
                })
                .catch(e => {
                    console.log(e.response.data);
                    this.$notify({
                        type: "danger",
                        icon: "tim-icons icon-alert-circle-exc",
                        message: this.$i18n.t('devices.msgDeviceUpdateError')
                    });
                });
            },
            resetModal() {
                this.infoModal.title = '';
                this.infoModal.content = '';
                this.infoModal.selectedDevice = '';
                this.infoModal.selectedVariable = '';
                this.infoModal.variables = [];
            },
            exportModal(item, index, button) {
                this.infoModal.title = this.$i18n.t('devices.txtExport', { device: item.name}); //`Row index: ${index}`;
                this.infoModal.content = JSON.stringify(item, null, `Row index: ${index}`);
                this.infoModal.variables = item.template.widgets;
                this.infoModal.selectedDevice = item.deviceId;
                this.$root.$emit('bv::show::modal', this.infoModal.id, button);
            },
            modalOk(bvModalEvt) {
                // Prevent modal from closing
                bvModalEvt.preventDefault();
                // Trigger submit handler
                this.exportDevice();
            },
            exportDevice() {
                if (!this.infoModal.selectedVariable) {
                    return;
                }

                // Show overlay
                this.infoModal.busy = !this.infoModal.busy;
                // Hide the modal manually
                this.$nextTick(() => {
                    this.$bvModal.hide(this.infoModal.id);
                });

                var axiosConfig = {
                    headers: {
                        token: this.$store.state.auth.token,
                    }
                };

                this.$axios
                    .get('/devices/export/' + this.infoModal.selectedDevice + '/' + this.infoModal.selectedVariable, axiosConfig)
                    .then((res) => {
                        if (res.data.status == 'success' && res.data.data.length > 0) {
                            try {
                                // Export to XLSX
                                var filename = this.infoModal.selectedDevice + '.xlsx';
                                var data = res.data.data;
                                data.unshift({
                                    deviceId: this.$i18n.t('devices.txtDeviceId'), 
                                    deviceName: this.$i18n.t('devices.txtDeviceName'), 
                                    variable: this.$i18n.t('devices.txtVariable'), 
                                    variableName: this.$i18n.t('devices.txtVariableName'), 
                                    variableType: this.$i18n.t('devices.txtVariableType'), 
                                    value:this.$i18n.t('devices.txtValue'), 
                                    createdTime:this.$i18n.t('devices.txtCreatedTime')
                                });
                                var ws = XLSX.utils.json_to_sheet(res.data.data, {
                                   skipHeader: true 
                                });
                                var wb = XLSX.utils.book_new();
                                XLSX.utils.book_append_sheet(wb, ws, this.infoModal.selectedDevice);
                                XLSX.writeFile(wb, filename);

                                // Hide overlay 
                                this.infoModal.busy = !this.infoModal.busy;

                                // Show notify
                                this.$notify({
                                    type: 'success',
                                    icon: 'tim-icons icon-check-2',
                                    message: this.$i18n.t('devices.msgDeviceExport')
                                });
                                return;
                            } catch (error) {
                                // Hide overlay 
                                this.infoModal.busy = !this.infoModal.busy;

                                // Show notify
                                this.$notify({
                                    type: "danger",
                                    icon: "tim-icons icon-alert-circle-exc",
                                    message: this.$i18n.t('devices.msgDeviceExportError')
                                });
                                return;
                            }
                        }

                        this.infoModal.busy = !this.infoModal.busy;
                        this.$notify({
                            type: "danger",
                            icon: "tim-icons icon-alert-circle-exc",
                            message: this.$i18n.t('devices.msgDeviceExport404')
                        });
                        return;
                    })
                    .catch((error) => {
                        if (error.response && error.response.status == 404) {
                            this.$notify({
                                type: "danger",
                                icon: "tim-icons icon-alert-circle-exc",
                                message: this.$i18n.t('devices.msgDeviceExport404')
                            });
                            return;
                        }
                        
                        this.infoModal.busy = !this.infoModal.busy;
                        this.$notify({
                            type: "danger",
                            icon: "tim-icons icon-alert-circle-exc",
                            message: this.$i18n.t('devices.msgDeviceExportError')
                        });
                        return;
                    });
            }
        }
    }
</script>