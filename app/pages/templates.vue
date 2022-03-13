<template>
    <!-- <div class="row">
        <div class="col-4">
            <IoTIndicator :config="configIndicator"></IoTIndicator>
        </div>
        <div class="col-4">
            <IoTButton :config="configButton"></IoTButton>
        </div>
        <div class="col-4">
            <IoTIndicator :config="config3"></IoTIndicator>
        </div>
        <base-button class="btn-link" @click="sendData()">SEND</base-button>
    </div> -->
    <div>
        <!-- WIDGET CONFIGURATION -->
        <div class="row">
            <card>
                <div slot="header">
                    <h4 class="card-title">{{ $t('templates.widgetsTitle')}} ({{widgets.length}})</h4>
                </div>
                <div class="row">
                    <!-- WIDGET SELECTOR AND FORMS -->
                    <div class="col-6">
                        <b-form-select v-model="widgetType" :options="widgetTypes" class="text-light" variant="outline-dark" >
                            <template #first>
                                <b-form-select-option :value="null" disabled>{{ $t('templates.inWidgetTypeEmpty')}}</b-form-select-option>
                            </template>
                        </b-form-select>
                        <br />
                        <br />
                        <!-- FORMS NUMBER CHART TYPE -->
                        <div v-if="widgetType == 'chart'">
                            <base-input type="text" :label="$t('templates.inVariableName')" v-model="configChart.variableName" />
                            <base-input type="number" :label="$t('templates.inVariableFreq')" v-model="configChart.variableFreq" />
                            <base-input type="text" :label="$t('templates.inVariableUnit')" v-model="configChart.unit" />
                            <base-input type="number" :label="$t('templates.inDecimalPlaces')" v-model="configChart.decimalPlaces" />
                            <base-input type="text" :label="$t('templates.inIcon')" v-model="configChart.icon" />
                            <br />
                            <base-input type="number" :label="$t('templates.inChartTimeAgo')" v-model="configChart.chartTimeAgo" />
                            <br />
                            <b-form-select v-model="configChart.class" :options="classes" class="text-light" variant="outline-dark" >
                                <template #first>
                                    <b-form-select-option :value="null" disabled>{{$t('templates.inClassEmpty')}}</b-form-select-option>
                                </template>
                            </b-form-select>
                            <br />
                            <br />
                            <br />
                            <b-form-select v-model="configChart.column" :options="columns" class="text-light" variant="outline-dark" >
                                <template #first>
                                    <b-form-select-option :value="null" disabled>{{$t('templates.inColumnEmpty')}}</b-form-select-option>
                                </template>
                            </b-form-select>
                            <br />
                            <br />
                        </div>
                        <!-- FORMS SWITCH TYPE -->
                        <div v-if="widgetType == 'switch'">
                            <base-input type="text" :label="$t('templates.inVariableName')" v-model="configSwitch.variableName" />
                            <base-input type="number" :label="$t('templates.inVariableFreq')" v-model="configSwitch.variableFreq" />
                            <base-input type="text" :label="$t('templates.inIcon')" v-model="configSwitch.icon" />
                            <br />
                            <b-form-select v-model="configSwitch.class" :options="classes" class="text-light" variant="outline-dark" >
                                <template #first>
                                    <b-form-select-option :value="null" disabled>{{$t('templates.inClassEmpty')}}</b-form-select-option>
                                </template>
                            </b-form-select>
                            <br />
                            <br />
                            <br />
                            <b-form-select v-model="configSwitch.column" :options="columns" class="text-light" variant="outline-dark" >
                                <template #first>
                                    <b-form-select-option :value="null" disabled>{{$t('templates.inColumnEmpty')}}</b-form-select-option>
                                </template>
                            </b-form-select>
                            <br />
                            <br />
                        </div>
                        <!-- FORMS NUMBER CHART TYPE -->
                        <div v-if="widgetType == 'button'">
                            <base-input type="text" :label="$t('templates.inVariableName')" v-model="configButton.variableName" />
                            <base-input type="text" :label="$t('templates.inMessage')" v-model="configButton.message" />
                            <base-input type="text" :label="$t('templates.inText')" v-model="configButton.text" />
                            <base-input type="text" :label="$t('templates.inIcon')" v-model="configButton.icon" />
                            <br />
                            <b-form-select v-model="configButton.class" :options="classes" class="text-light" variant="outline-dark" >
                                <template #first>
                                    <b-form-select-option :value="null" disabled>{{$t('templates.inClassEmpty')}}</b-form-select-option>
                                </template>
                            </b-form-select>
                            <br />
                            <br />
                            <br />
                            <b-form-select v-model="configButton.column" :options="columns" class="text-light" variant="outline-dark" >
                                <template #first>
                                    <b-form-select-option :value="null" disabled>{{$t('templates.inColumnEmpty')}}</b-form-select-option>
                                </template>
                            </b-form-select>
                            <br />
                            <br />
                        </div>
                        <!-- FORMS INDICATOR TYPE -->
                        <div v-if="widgetType == 'indicator'">
                            <base-input type="text" :label="$t('templates.inVariableName')" v-model="configIndicator.variableName" />
                            <base-input type="number" :label="$t('templates.inVariableFreq')" v-model="configIndicator.variableFreq" />
                            <base-input type="text" :label="$t('templates.inIcon')" v-model="configIndicator.icon" />
                            <br />
                            <b-form-select v-model="configIndicator.class" :options="classes" class="text-light" variant="outline-dark" >
                                <template #first>
                                    <b-form-select-option :value="null" disabled>{{$t('templates.inClassEmpty')}}</b-form-select-option>
                                </template>
                            </b-form-select>
                            <br />
                            <br />
                            <br />
                            <b-form-select v-model="configIndicator.column" :options="columns" class="text-light" variant="outline-dark" >
                                <template #first>
                                    <b-form-select-option :value="null" disabled>{{$t('templates.inColumnEmpty')}}</b-form-select-option>
                                </template>
                            </b-form-select>
                            <br />
                            <br />
                        </div>
                    </div>

                    <!-- WIDGET PREVIEW -->
                    <div class="col-6">
                        <IoTChart v-if="widgetType == 'chart'" :config="configChart" />
                        <IoTSwitch v-if="widgetType == 'switch'" :config="configSwitch" />
                        <IoTButton v-if="widgetType == 'button'" :config="configButton" />
                        <IoTIndicator v-if="widgetType == 'indicator'" :config="configIndicator" />
                    </div>
                </div>
                <!-- ADD WIDGET BUTTON -->
                <div class="row pull-right">
                    <div class="col-12">
                        <base-button native-type="submit" type="primary" class="mb-3" size="lg" @click="addWidget()" v-if="widgetType">{{$t('templates.btnAddWidget')}}</base-button>
                    </div>
                </div>
            </card>
        </div>
        <!-- DASHBOARD PREVIEW -->
        <div class="row">
            <div v-for="(widget, index) in widgets" :key="index" :class="[widget.column]" >
                <base-button 
                    native-type="submit" 
                    type="primary"
                    link 
                    class="pull-right" 
                    v-on:click="deleteWidget(widget, index)">
                    <i class="fa fa-trash text-warning pull-right" style="margin-bottom: 10px;"></i>
                </base-button>
                <IoTChart v-if="widget.widget == 'chart'" :config="widget" />
                <IoTSwitch v-if="widget.widget == 'switch'" :config="widget" />
                <IoTButton v-if="widget.widget == 'button'" :config="widget" />
                <IoTIndicator v-if="widget.widget == 'indicator'" :config="widget" />
            </div>
        </div>
        <!-- SAVE TEMPLATE -->
        <div class="row" v-if="widgets.length > 0">
            <card>
                <div slot="header">
                    <h4 class="card-title">{{$t('templates.titleSaveTemplate')}}</h4>
                </div>
                <div class="row">
                    <base-input type="text" :label="$t('templates.inTemplateName')" class="col-4" v-model="templateName" />
                    <base-input type="text" :label="$t('templates.inTemplateDesc')" class="col-8" v-model="templateDescription" />
                </div>
                <br />
                <br />
                <div class="row">
                    <div class="col-12">
                        <base-button native-type="submit" type="primary" class="mb3 pull-right" size="lg" @click="saveTemplate()" :disabled="widgets.length == 0">{{$t('templates.btnSaveTemplate')}}</base-button>
                    </div>
                </div>
            </card>
        </div>
        <!-- TEMPLATES TABLE -->
        <div class="row">
            <card>
                <div slot="header">
                    <h4 class="card-title">{{$t('templates.title')}}</h4>
                </div>
                <div class="row">
                    <b-table striped hover :items="templates" :fields="templateFields" show-empty>
                        <template #cell(widgets)="row">
                            {{ row.value.length }}
                        </template>
                        <template #cell(actions)="row">
                            <base-button class="btn-link" type="danger" icon size="sm" @click="deleteTemplate(row.item, row.index, $event.target)">
                                <i class="tim-icons icon-simple-remove"></i>
                            </base-button>
                        </template>
                    </b-table>
                </div>
            </card>
        </div>
        <!-- JSON -->
        <!-- <div class="row">
            <Json :value="templates"></Json>
        </div> -->
    </div>
</template>
<script>
    import IoTIndicator from '~/components/Widgets/IoTIndicator.vue';
    import IoTButton from '~/components/Widgets/IoTButton.vue';
    import IoTSwitch from '~/components/Widgets/IoTSwitch.vue';
    import IoTChart from '~/components/Widgets/IoTChart.vue';
    export default {
        middleware: "authenticated",
        components: {
            IoTIndicator,
            IoTButton,
            IoTSwitch,
            IoTChart
        },
        data() {
            return {
                classes: [
                    { value: 'success', text: this.$i18n.t('templates.txtClassSuccess') },
                    { value: 'primary', text: this.$i18n.t('templates.txtClassPrimary') },
                    { value: 'warning', text: this.$i18n.t('templates.txtClassWarning') },
                    { value: 'danger', text: this.$i18n.t('templates.txtClassDanger') }
                ],
                columns: [
                    { value: 'col-3', text: 'col-3' },
                    { value: 'col-4', text: 'col-4' },
                    { value: 'col-5', text: 'col-5' },
                    { value: 'col-6', text: 'col-6' },
                    { value: 'col-7', text: 'col-7' },
                    { value: 'col-8', text: 'col-8' },
                    { value: 'col-9', text: 'col-9' },
                    { value: 'col-10', text: 'col-10' },
                    { value: 'col-11', text: 'col-11' },
                    { value: 'col-12', text: 'col-12' }
                ],
                widgetType: '',
                widgetTypes: [
                    { value: 'chart', text: this.$i18n.t('templates.txtWidgetChart') },
                    { value: 'indicator', text: this.$i18n.t('templates.txtWidgetIndicator') },
                    { value: 'switch', text: this.$i18n.t('templates.txtWidgetSwitch') },
                    { value: 'button', text: this.$i18n.t('templates.txtWidgetButton') }
                ],
                widgets: [],
                templateFields: [
                    { key: 'name', label: this.$i18n.t('templates.tblName'), sortable: true}, 
                    { key: 'description', label: this.$i18n.t('templates.tblDescription'), sortable: false},
                    { key: 'widgets', label: this.$i18n.t('templates.tblWidgets'), sortable: true, class: 'text-center'},
                    { key: 'actions', label: this.$i18n.t('templates.tblActions') }
                ],
                templates: [],
                templateName: '',
                templateDescription: '',
                value: false,
                configChart: {
                    userId: 'userId',
                    selectedDevice: { 
                        deviceId: '9999',
                        name: this.$i18n.t('templates.txtConfigDeviceName')
                    },
                    widget: 'chart',
                    variableName: this.$i18n.t('templates.txtConfigVariableName'),
                    variable: 'variable',
                    variableType: 'input',
                    variableFreq: 30,
                    unit: this.$i18n.t('templates.txtConfigUnit'),
                    decimalPlaces: 2,
                    chartTimeAgo: 60,
                    class: 'danger',
                    column: 'col-6',
                    icon: 'fa-sun',
                    demo: true
                },
                configSwitch: {
                    userId: 'userId',
                    selectedDevice: { 
                        deviceId: '9999',
                        name: this.$i18n.t('templates.txtConfigDeviceName')
                    },
                    variableName: 'Variable Name',
                    variable: 'variable',
                    variableType: 'inoutput',
                    variableFreq: 30,
                    icon: 'fa-sun',
                    column: 'col-6',
                    widget: 'switch',
                    class: 'primary',
                    message: "{'status':'stop'}"
                },
                configButton: {
                    userId: 'userId',
                    selectedDevice: { 
                        deviceId: '9999',
                        name: this.$i18n.t('templates.txtConfigDeviceName')
                    },
                    variableName: this.$i18n.t('templates.txtConfigVariableName'),
                    variable: 'variable',
                    variableType: 'output',
                    icon: 'fa-sun',
                    column: 'col-6',
                    widget: 'button',
                    class: 'primary',
                    message: "{'status':'stop'}",
                    text: this.$i18n.t('templates.txtConfigButton')
                },
                configIndicator: {
                    userId: 'userId',
                    selectedDevice: { 
                        deviceId: '9999',
                        name: this.$i18n.t('templates.txtConfigDeviceName')
                    },
                    variableName: this.$i18n.t('templates.txtConfigVariableName'),
                    variable: 'variable',
                    variableType: 'input',
                    variableFreq: 30,
                    icon: 'fa-sun',
                    column: 'col-6',
                    widget: 'indicator',
                    class: 'danger'
                }
            }
        },
        mounted() {
            this.getTemplates();
        },
        methods: {
            addWidget() {
                var widgetConfig;
                switch (this.widgetType) {
                    case 'chart':
                        widgetConfig = this.configChart;
                        break;
                    case 'indicator':
                        widgetConfig = this.configIndicator;
                        break;
                    case 'switch':
                        widgetConfig = this.configSwitch;
                        break;
                    case 'button':
                        widgetConfig = this.configButton;
                        break;
                    default:
                        widgetConfig = {};
                        break;
                }
                widgetConfig.variable = this.makeid(10);
                this.widgets.push(JSON.parse(JSON.stringify(widgetConfig)));
            },
            makeid(length) {
                var result = "";
                var characters =
                    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                var charactersLength = characters.length;
                for (var i = 0; i < length; i++) {
                    result += characters.charAt(
                        Math.floor(Math.random() * charactersLength)
                    );
                }
                return result;
            },
            deleteWidget(widget, index) {
                this.widgets.splice(index, 1);
            },
            async getTemplates() {
                var axiosConfig = {
                    headers: {
                        token: this.$store.state.auth.token
                    }
                };

                try {
                    var res = await this.$axios.get('/templates', axiosConfig);

                    if (res.data.status == 'success') {
                        this.templates = res.data.data;
                    }
                } catch (error) {
                    console.log(error);
                    this.$notify({
                        type: "danger",
                        icon: "tim-icons icon-alert-circle-exc",
                        message: this.$i18n.t('templates.msgTemplateError')
                    });
                    return;
                }
            },
            async saveTemplate() {
                var axiosConfig = {
                    headers: {
                        token: this.$store.state.auth.token
                    }
                };

                var template = {
                    name: this.templateName,
                    description: this.templateDescription,
                    widgets: this.widgets
                }

                try {
                    var res = await this.$axios.post('/templates', template, axiosConfig);

                    if (res.data.status == 'success') {
                        this.$notify({
                            type: 'success',
                            icon: 'tim-icons icon-check-2',
                            message: this.$i18n.t('templates.msgTemplateCreated')
                        });
                        this.getTemplates();
                        this.widgets = [];
                    }
                } catch (error) {
                    console.log(error);
                    this.$notify({
                        type: "danger",
                        icon: "tim-icons icon-alert-circle-exc",
                        message: this.$i18n.t('templates.msgTemplateCreateError')
                    });
                    return;
                }
            },
            async deleteTemplate(item, index, target) {
                var axiosConfig = {
                    headers: {
                        token: this.$store.state.auth.token
                    },
                    params: {
                        templateId: item._id
                    }
                };

                try {
                    var res = await this.$axios.delete('/templates', axiosConfig);
                    
                    if (res.data.status == 'failed' && res.data.error == 'template in use') {
                        this.$notify({
                            type: 'danger',
                            icon: 'tim-icons icon-alert-circle-exc',
                            message: item.name + this.$i18n.t('templates.msgTemplateInUseError')
                        });
                        return;
                    }
                    
                    //success
                    if (res.data.status == 'success') {
                        this.$notify({
                            type: 'success',
                            icon: 'tim-icons icon-check-2',
                            message: item.name + this.$i18n.t('templates.msgTemplateDeleted')
                        });
                        this.getTemplates();
                    }
                } catch (error) {
                    console.log(e.response.data);
                    this.$notify({
                        type: "danger",
                        icon: "tim-icons icon-alert-circle-exc",
                        message: this.$i18n.t('templates.msgTemplateDeleteError')
                    });
                    return;
                }
            }
        }
    }
</script>