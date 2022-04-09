<template>
    <card>
        <div slot="header">
            <h5 class="card-category">{{ config.selectedDevice.name }} - {{ config.variableName }}</h5>
            <h3 class="card-title">
                <i  class="fa "
                    :class="[config.icon, getIconClass()]"
                    aria-hidden="true"
                    style="font-size: 30px"></i>
                <base-switch class="pull-right" @click="sendValue()" :value="value" type="primary" :on-text="$t('widgets.txtOn')" :off-text="$t('widgets.txtOff')" style="margin-top: 10px"></base-switch>
            </h3>
        </div>
    </card>    
</template>
<script>
    export default {
        name: 'IoTSwitch',
        //props: ['config']
        props: {
            config: {
                userId: {
                    type: String,
                    default: 'userId',
                    description: 'User Id'
                },
                selectedDevice: { 
                    type: Object,
                    default: undefined,
                    description: 'Selected Device'
                },
                variableName: {
                    type: String,
                    default: 'Widget Name',
                    description: 'Widget Name'
                },
                variable: {
                    type: String,
                    default: 'unique-name',
                    description: 'Widget Id'
                },
                icon: {
                    type: String,
                    default: 'fa-sun',
                    description: 'Icon class'
                },
                column: {
                    type: String,
                    default: 'col-6',
                    description: 'Column class'
                },
                widget: {
                    type: String,
                    default: 'indicator',
                    description: 'Widget type'
                },
                class: {
                    type: String,
                    default: 'danger',
                    description: 'Widget class (primary|secondary|danger etc)'
                },
            }
        },
        data() {
            return {
                value: true,
                topic: ''
            }
        },
        watch: {
            config: {
                immediate: true,
                deep: true,
                handler() {
                    setTimeout(() => {
                        this.value = false;
                        if(this.topic != '') {
                            this.$nuxt.$off(
                                this.topic + '/sdata',
                                this.processData
                            );
                        }
                        
                        this.topic = this.config.userId + '/' +  
                            this.config.selectedDevice.deviceId + '/' + 
                            this.config.variable;
                            
                        this.$nuxt.$on(
                            this.topic + '/sdata',
                            this.processData
                        );
                    }, 300);
                }
            }
        },
        mounted() {
            //userId/id/unique-str/sdata
            // this.topic = this.config.userId +'/'+  this.config.selectedDevice.deviceId +'/'+ this.config.variable + '/sdata';
            // this.$nuxt.$on(
            //     this.topic + '/sdata',
            //     this.processData
            // );
        },
        beforeDestroy() {
            this.topic = this.config.userId +'/'+  this.config.selectedDevice.deviceId +'/'+ this.config.variable + '/sdata';
            this.$nuxt.$off(
                this.topic + '/sdata',
                this.processData
            );
        },
        methods: {
            getIcon() {
                return this.config.icon;
            },
            getIconClass() {
                if (!this.value) {
                    return 'text-dark';
                } 
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
            processData(data) {
                try {
                    if (data) {
                        this.value = data.value;
                    }
                } catch (error) {
                    console.log(error);
                }
            },
            sendValue() {
                var toSend = {
                    topic: this.config.userId +'/'+  this.config.selectedDevice.deviceId +'/'+ this.config.variable + '/actdata',
                    msg: {
                        value: !this.value
                    }
                };

                console.log(toSend);
                this.$nuxt.$emit('mqtt-sender', toSend);
            }
        }
    }
</script>