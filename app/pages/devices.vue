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
                        <i  class="fas fa-database "
                            :class="{
                                'text-success': row.item.saveRule.status,
                                'text-dark': !row.item.saveRule.status
                            }">
                        </i>
                        <base-switch :value="row.item.saveRule.status" type="primary" on-text="On" off-text="Off" @click="updateDeviceStatus(row.item, row.index, $event.target)"></base-switch>
                        <base-button class="btn-link" type="danger" icon size="sm" @click="deleteDevice(row.item, row.index, $event.target)">
                            <i class="tim-icons icon-simple-remove"></i>
                        </base-button>
                    </template>
                </b-table>
                <!-- Info modal -->
                <b-modal :id="infoModal.id" :title="infoModal.title" ok-only @hide="resetInfoModal"
                    title-class="text-light" 
                    header-bg-variant="dark" header-text-variant="light"
                    body-bg-variant="dark" body-text-variant="light"
                    footer-bg-variant="dark" footer-text-variant="light">
                    <pre>{{ infoModal.content }}</pre>
                </b-modal>
            </card>
        </div>
        <!-- <div class="row">
            <Json :value="$store.state.devices"></Json>
        </div> -->
    </div>
</template>
<script>
    import BaseSwitch from '~/components/BaseSwitch.vue';
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
                    id: 'info-modal',
                    title: '',
                    content: ''
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
                            message: item.name + ' deleted!'
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
            resetInfoModal() {
                this.infoModal.title = '';
                this.infoModal.content = '';
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
            }
        }
    }
</script>