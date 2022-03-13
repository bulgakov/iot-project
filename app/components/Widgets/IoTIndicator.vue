<template>
    <card>
        <div slot="header">
            <h4 class="card-title">{{config.selectedDevice.name}} - {{config.variableName}}</h4>
        </div>

        <i class="fa " :class="[config.icon, getIconClass()]" style="font-size: 3em;"></i>
    </card>    
</template>
<script>
    export default {
        name: 'IoTIndicator',
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
            },
            // value: {
            //     type: Boolean,
            //     default: true,
            //     description: 'Value'
            // }
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
                        this.$nuxt.$off(
                            this.topic + '/sdata',
                            this.processData
                        );
                        
                        this.topic = this.config.userId + '/' +  
                            this.config.selectedDevice.deviceId + '/' + 
                            this.config.variable;
                            
                        this.$nuxt.$on(
                            this.topic + '/sdata',
                            this.processData
                        );
                    }, 300);
                },
            },
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
            processData(data) {
                try {
                    if (data) {
                        console.log('received');
                        console.log(data);
                        this.value = data.value;
                    }
                } catch (error) {
                    console.log(error);
                }
            },
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
            }
        }
    }
</script>