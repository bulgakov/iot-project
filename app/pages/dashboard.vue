<template>
    <div class="container-fluid">
        <div class="row d-flex flex-wrap" v-if="$store.state.devices.length > 0">
            <div
                v-for="(widget, index) in $store.state.selectedDevice.template.widgets"
                :key="index"
                :class="[widget.column]">
                <IoTChart
                    v-if="widget.widget == 'chart'"
                    :config="fixWidget(widget)"></IoTChart>
                <IoTSwitch
                    v-if="widget.widget == 'switch'"
                    :config="fixWidget(widget)"></IoTSwitch>
                <IoTIndicator
                    v-if="widget.widget == 'indicator'"
                    :config="fixWidget(widget)"></IoTIndicator>
                <IoTButton v-if="widget.widget == 'button'"></IoTButton>
                <!-- <Json :value="fixWidget(widget)"></Json> -->
            </div>
        </div>
        <div v-else>
            {{ $t('dashboard.selectDevice')}}
        </div>
    </div>
</template>
<script>
import IoTIndicator from '~/components/Widgets/IoTIndicator.vue';
import IoTButton from '~/components/Widgets/IoTButton.vue';
import IoTSwitch from '~/components/Widgets/IoTSwitch.vue';
import IoTChart from '~/components/Widgets/IoTChart.vue';
export default {
    middleware: 'authenticated',
    name: 'Dashboard',
    components: {
        IoTIndicator,
        IoTButton,
        IoTSwitch,
        IoTChart
    },
    data() {
        return {

        }
    },

    mounted() {

    },

    methods: {
        fixWidget(widget) {
            //var fixed = Object.assign({}, widget);
            var fixed = JSON.parse(JSON.stringify(widget));
            fixed.selectedDevice.deviceId = this.$store.state.selectedDevice.deviceId;
            fixed.selectedDevice.name = this.$store.state.selectedDevice.name;
            fixed.userId = this.$store.state.selectedDevice.userId;
            
            if(fixed.demo)
            {
                fixed.demo = false;
            }
            
            return fixed; 
        }
    }
};
</script>
