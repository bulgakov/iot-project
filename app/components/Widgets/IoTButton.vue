<template>
    <card>
        <div slot="header">
            <h4 class="card-title">{{config.selectedDevice.name}} - {{config.variableName}}</h4>
        </div>
        <i class="fa " :class="[config.icon, getIconClass()]" style="font-size: 3em;"></i>
        <base-button :type="config.class" class="mb-3 pull-right" size="md" @click="sendValue()">{{config.text}}</base-button>
    </card>    
</template>
<script>
    export default {
        name: 'IoTButton',
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
                    default: 'button',
                    description: 'Widget type'
                },
                class: {
                    type: String,
                    default: 'danger',
                    description: 'Widget class (primary|secondary|danger etc)'
                },
                message: {
                    type: String,
                    default: undefined,
                    description: 'Message to send'
                },
                text: {
                    type: String,
                    default: 'Button',
                    description: 'Button Text'
                }
            },
            sending: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                //sending: false
            }
        },
        methods: {
            getIcon() {
                return this.config.icon;
            },
            getIconClass() {
                if (!this.sending) {
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
            sendValue() {
                this.sending = true;

                setTimeout(() => {
                    this.sending = false;
                }, 1000);

                var toSend = {
                    topic: this.config.userId +'/'+  this.config.selectedDevice.deviceId +'/'+ this.config.variable + '/actdata',
                    msg: {
                        value: this.config.message
                    }
                };

                console.log(toSend);
                this.$nuxt.$emit('mqtt-sender', toSend);
            }
        }
    }
</script>