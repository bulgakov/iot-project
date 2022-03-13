import { Chart, registerables } from "chart.js";
//import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-date-fns";

Chart.register(...registerables); //, zoomPlugin);