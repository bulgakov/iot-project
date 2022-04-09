<template>
    <card type="chart">
        <template slot="header">
            <h5 class="card-category pull-right">
                {{$t('widgets.txtAgo', { time: getTimeAgo((nowTime - time) / 1000)})}}
            </h5>
            <h5 class="card-category">
                {{ config.selectedDevice.name }} - {{ config.variableName }}
            </h5>
            <h3 class="card-title">
                <i
                    class="fa"
                    :class="[config.icon, getIconClass()]"
                    aria-hidden="true"
                    style="font-size: 30px"></i>
                <span>
                    {{ value.toFixed(config.decimalPlaces) }}
                    {{ config.unit }}
                </span>
            </h3>
        </template>
        <div class="chart-area" style="height: 300px">
            <LineChart
                style="height: 100%"
                v-if="isMounted"
                :chartData="chartData"
                :options="options">
            </LineChart>
        </div>
    </card>
</template>
<script>
import { LineChart } from 'vue-chart-3';
import * as chartConfigs from '@/components/Charts/config';
import configs from '@/config';
import { enUS, es, arEG } from 'date-fns/locale';

export default {
    name: 'IoTChart',
    components: {
        LineChart,
    },
    //props: ['config']
    props: {
        config: {
            userId: {
                type: String,
                default: 'userId',
                description: 'User Id',
            },
            id: {
                type: String,
                default: 'id',
                description: 'Device Id',
            },
            selectedDevice: {
                type: Object,
                default: undefined,
                description: 'Selected Device',
            },
            variableName: {
                type: String,
                default: 'Widget Name',
                description: 'Widget Name',
            },
            variable: {
                type: String,
                default: 'unique-name',
                description: 'Widget Id',
            },
            icon: {
                type: String,
                default: 'fa-sun',
                description: 'Icon class',
            },
            column: {
                type: String,
                default: 'col-6',
                description: 'Column class',
            },
            widget: {
                type: String,
                default: 'chart',
                description: 'Widget type',
            },
            class: {
                type: String,
                default: 'danger',
                description: 'Widget class (primary|secondary|danger etc)',
            },
            unit: {
                type: String,
                default: '',
                description: 'Unit',
            },
            decimalPlaces: {
                type: Number,
                default: 2,
                description: 'Decimal Places',
            },
            chartTimeAgo: {
                type: Number,
                default: 30,
                description: 'Time Lapse',
            },
            demo: {
                type: Boolean,
                default: true,
                description: 'Demo',
            },
        },
    },
    data() {
        return {
            receivedTime: 0,
            value: 0,
            time: Date.now(),
            nowTime: Date.now(),
            isMounted: false,
            topic: '',
            options: JSON.parse(
                JSON.stringify(chartConfigs.greenChartOptions)
            ),
            chartData: {
                labels: [],
                datasets: [
                    {
                        label: 'label',
                        fill: true,
                        borderColor: configs.colors.danger,
                        borderWidth: 2,
                        borderDash: [],
                        borderDashOffset: 0.0,
                        pointBackgroundColor: configs.colors.danger,
                        pointBorderColor: 'rgba(255,255,255,0)',
                        pointHoverBackgroundColor: configs.colors.danger,
                        pointBorderWidth: 20,
                        pointHoverRadius: 4,
                        pointHoverBorderWidth: 15,
                        pointRadius: 4,
                        data: [],
                    },
                ],
            },
            gradientColors: [
                'rgba(66,134,121,0.15)',
                'rgba(66,134,121,0.0)',
                'rgba(66,134,121,0)',
            ],
            gradientStops: [1, 0.4, 0],
        };
    },
    watch: {
        config: {
            immediate: true,
            deep: true,
            handler() {
                setTimeout(() => {
                    this.value = 0;
                    this.chartData.datasets[0].data = [];

                    this.$nuxt.$off(
                        this.topic + '/sdata',
                        this.processReceivedData
                    );
                    
                    this.topic = this.config.userId + '/' + 
                        this.config.selectedDevice.deviceId + '/' +
                        this.config.variable;
                        
                    this.$nuxt.$on(
                        this.topic + '/sdata',
                        this.processReceivedData
                    );

                    this.getChartData();
                    this.updateColorClass();
                    window.dispatchEvent(new Event('resize'));
                }, 300);
            },
        },
    },
    mounted() {
        this.getNow();
        this.getChartData();
        this.updateColorClass();
    },
    beforeDestroy() {
        this.$nuxt.$off(
            this.topic + '/sdata',
            this.processReceivedData
        );
    },
    methods: {
        getIcon() {
            return this.config.icon;
        },
        getIconClass() {
            switch (this.config.class) {
                case 'success':
                    return 'text-info';
                case 'primary':
                    return 'text-success';
                case 'warning':
                    return 'text-warning';
                case 'danger':
                    return 'text-danger';
                default:
                    return 'text-default';
            }
        },
        updateColorClass() {
            switch (this.config.class) {
                case 'success':
                    this.chartData.options = JSON.parse(
                        JSON.stringify(chartConfigs.blueChartOptions)
                    );
                    this.chartData.datasets[0].borderColor = configs.colors.info;
                    this.chartData.datasets[0].pointBackgroundColor = configs.colors.info;
                    this.chartData.datasets[0].pointHoverBackgroundColor = configs.colors.info;
                    this.gradientColors = configs.colors.primaryGradient;
                    break;
                case 'warning':
                    this.options = JSON.parse(
                        JSON.stringify(chartConfigs.orangeChartOptions)
                    );
                    this.chartData.datasets[0].borderColor = configs.colors.orange;
                    this.chartData.datasets[0].pointBackgroundColor = configs.colors.orange;
                    this.chartData.datasets[0].pointHoverBackgroundColor = configs.colors.orange;
                    this.gradientColors = configs.colors.primaryGradient;
                    break;
                case 'danger':
                    this.options = JSON.parse(
                        JSON.stringify(chartConfigs.purpleChartOptions)
                    );
                    this.chartData.datasets[0].borderColor = configs.colors.danger;
                    this.chartData.datasets[0].pointBackgroundColor = configs.colors.danger;
                    this.chartData.datasets[0].pointHoverBackgroundColor = configs.colors.danger;
                    this.gradientColors = [
                        'rgba(66,134,121,0.15)',
                        'rgba(66,134,121,0.0)',
                        'rgba(66,134,121,0)',
                    ];
                    break;
                case 'primary':
                default:
                    this.options = JSON.parse(
                        JSON.stringify(chartConfigs.greenChartOptions)
                    );
                    this.chartData.datasets[0].borderColor = configs.colors.primary;
                    this.chartData.datasets[0].pointBackgroundColor = configs.colors.primary;
                    this.chartData.datasets[0].pointHoverBackgroundColor = configs.colors.primary;
                    this.gradientColors = configs.colors.primaryGradient;
                    break;
            }
            this.options.scales.x = {
                type: 'time',
                time: {
                    unit: 'day',
                },
                ticks: {
                    padding: 20,
                    fontColor: '#9e9e9e',
                    source: 'data',
                },
                adapters: {
                    date: {
                        locale: es,
                    },
                },
                barPercentage: 1.6,
                gridLines: {
                    drawBorder: false,
                    color: 'rgba(29,140,248,0.1)',
                    //zeroLineColor: 'transparent'
                },
            };
            this.chartData.datasets[0].label = this.config.variableName + ' ' + this.config.unit;
        },
        getNow() {
            this.nowTime = Date.now();
            setTimeout(() => {
                this.getNow();
            }, 1000);
        },
        getTimeAgo(seconds) {
            if (seconds < 0) {
                seconds = 0;
            }
            if (seconds < 59) {
                return seconds.toFixed() + this.$i18n.t('widgets.txtSecs');
            }
            if (seconds > 59 && seconds <= 3600) {
                seconds = seconds / 60;
                return seconds.toFixed() + this.$i18n.t('widgets.txtMin');
            }
            if (seconds > 3600 && seconds <= 86400) {
                seconds = seconds / 3600;
                return seconds.toFixed() + this.$i18n.t('widgets.txtHour');
            }
            if (seconds > 86400) {
                seconds = seconds / 86400;
                return seconds.toFixed() + this.$i18n.t('widgets.txtDay');
            }
        },
        processReceivedData(data) {
            try {
                if (data) {
                    this.time = Date.now();
                    this.value = data.value;
        
                    setTimeout(() => {
                        if (data.save == 1) {
                            this.getChartData();
                        }
                    }, 500);
                }
            } catch (error) {
                console.log(error);
            }
        },
        getChartData() {
            if (this.config.demo) {
                this.chartData.datasets[0].data = [
                    { x: new Date(1606659071668), y: 22 },
                    { x: new Date(1606659072668), y: 27 },
                    { x: new Date(1606659073668), y: 32 },
                    { x: new Date(1606659074668), y: 7 },
                ];
                this.isMounted = true;
                return;
            }

            var axiosConfig = {
                headers: {
                    token: this.$store.state.auth.token,
                },
                params: {
                    deviceId: this.config.selectedDevice.deviceId,
                    variable: this.config.variable,
                    timeAgo: this.config.chartTimeAgo,
                },
            };

            this.$axios
                .get('/devices/data', axiosConfig)
                .then((res) => {
                    if (res.data.status == 'success') {

                        this.chartData.datasets[0].data = [];
                        res.data.data.forEach((d) => {
                            this.chartData.datasets[0].data.push(
                                {
                                    x: d.createdTime, //+ new Date().getTimezoneOffset() * 60 * 1000 * -1,
                                    y: d.value,
                                }
                            );
                        });
                        this.isMounted = true;
                        return;
                    }
                    return;
                })
                .catch((error) => {
                    console.log(error);
                    return;
                });
        },
    },
};
</script>