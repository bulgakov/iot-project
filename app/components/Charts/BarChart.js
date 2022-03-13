//import { Bar, mixins } from 'vue-chartjs';
//import 'chartjs-adapter-date-fns';
import { BarChart, useBarChart } from 'vue-chart-3';
import { ref, computed, defineComponent } from '@vue/composition-api';

export default defineComponent({
    extends: BarChart,
    //mixins: [mixins.reactiveProp],
    props: {
        //extraOptions: Object,
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
        const { barChartProps, barChartRef } = useBarChart({
            chartData,
            options,
        });

        function zoom() {
            //barChartRef.value.chartInstance.zoom(1.01);
        }

        function updateGradients(chartData) {
            if (!chartData) return;
            const ctx =
                this.ctx ||
                document.getElementById(this.chartId).getContext('2d');
            const gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

            this.gradientStops.forEach((stop, index) => {
                gradientStroke.addColorStop(stop, this.gradientColors[index]);
            });

            chartData.datasets.forEach((set) => {
                if (!set.backgroundColor) {
                    set.backgroundColor = gradientStroke;
                }
            });
        }

        //this.imgData.value = this.barChartRef.value.chartInstance.toBase64Image();
        //this.barChartRef.value.chartInstance.resetZoom();

        return { barChartProps, barChartRef, imgData, zoom };
    },
});
