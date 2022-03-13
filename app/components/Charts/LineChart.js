// import { Line, mixins } from 'vue-chartjs';
// import 'chartjs-adapter-date-fns';
import { LineChart, useLineChart } from 'vue-chart-3';
import { ref, computed, defineComponent } from '@vue/composition-api';

export default defineComponent({
    //name: 'line-chart',
    extends: LineChart,
    //mixins: [mixins.reactiveProp],
    props: {
        //extraOptions: Object,
        // data: {
        //     type: Object,
        //     default: ref([])
        // },
        // chartData: {
        //     type: Object,
        //     default: computed(() => ({
        //         labels: [],
        //         datasets: [
        //             {
        //                 data: this.data.val,
        //             },
        //         ],
        //     }))
        // },
        // options: {
        //     type: Object,
        //     default: computed(() => ({
        //         scales: {
        //             y: {
        //                 beginAtZero: true,
        //             },
        //         },
        //     }))
        // },
        gradientColors: {
            type: Array,
            default: () => [
                'rgba(72,72,176,0.2)',
                'rgba(72,72,176,0.0)',
                'rgba(119,52,169,0)',
            ],
            validator: (val) => {
                return val.length > 1;
            },
        },
        gradientStops: {
            type: Array,
            default: () => [1, 0.4, 0],
            validator: (val) => {
                return val.length > 1;
            },
        },
    },
    data() {
        return {
            ctx: null,
        };
    },
    setup() {
        const data = ref([]);
        const legendTop = ref(true);
        const imgData = ref(null);
        const options = computed(() => ({
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        }));
        const chartData = computed(() => ({
            labels: [],
            datasets: [
                {
                    data: this.data.val,
                },
            ],
        }));
        const { lineChartProps, lineChartRef } = useLineChart({
            chartData,
            options,
        });

        function zoom() {
            //lineChartRef.value.chartInstance.zoom(1.01);
        }

        return { lineChartProps, lineChartRef, imgData, zoom };
    },
});
