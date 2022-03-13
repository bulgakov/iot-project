export const basicOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                usePointStyle: true,
            },
        },
        tooltip: {
            backgroundColor: '#f5f5f5',
            titleColor: '#333',
            bodyColor: '#666',
            bodySpacing: 4,
            padding: 12,
            usePointStyle: true,
        },
    },
};
export var blueChartOptions = {
    ...basicOptions,
    scales: {
        x: {
            barPercentage: 1.6,
            grid: {
                drawBorder: false,
                color: 'rgba(29,140,248,0.1)',
                zeroLineColor: 'transparent',
            },
            ticks: {
                padding: 20,
                fontColor: '#2380f7',
            },
        },
        y: {
            barPercentage: 1.6,
            grid: {
                drawBorder: false,
                color: 'rgba(29,140,248,0.0)',
                zeroLineColor: 'transparent',
            },
            ticks: {
                suggestedMin: 60,
                suggestedMax: 125,
                padding: 20,
                fontColor: '#2380f7',
            },
        },
    },
};

export var lineChartOptionsBlue = {
    ...basicOptions,
    scales: {
        x: {
            barPercentage: 1.6,
            grid: {
                drawBorder: false,
                color: 'rgba(29,140,248,0.1)',
                zeroLineColor: 'transparent',
            },
            ticks: {
                padding: 20,
                fontColor: '#9e9e9e',
            },
        },
        y: {
            barPercentage: 1.6,
            grid: {
                drawBorder: false,
                color: 'rgba(29,140,248,0.0)',
                zeroLineColor: 'transparent',
            },
            ticks: {
                suggestedMin: 60,
                suggestedMax: 125,
                padding: 20,
                fontColor: '#9e9e9e',
            },
        },
    },
};

export var barChartOptionsGradient = {
    ...basicOptions,
    scales: {
        x: {
            grid: {
                drawBorder: false,
                color: 'rgba(253,93,147,0.1)',
                zeroLineColor: 'transparent',
            },
            ticks: {
                padding: 20,
                fontColor: '#9e9e9e',
            },
        },
        y: {
            grid: {
                drawBorder: false,
                color: 'rgba(253,93,147,0.1)',
                zeroLineColor: 'transparent',
            },
            ticks: {
                suggestedMin: 60,
                suggestedMax: 125,
                padding: 20,
                fontColor: '#9e9e9e',
            },
        },
    },
};

export var pieChartOptions = {
    ...basicOptions,
    cutout: 70,
    scales: {
        x: {
            display: 0,
            barPercentage: 1.6,
            grid: {
                drawBorder: false,
                color: 'rgba(255,255,255,0.1)',
                zeroLineColor: 'transparent',
            },
            ticks: {
                display: false,
            },
        },
        y: {
            display: 0,
            ticks: {
                display: false,
            },
            grid: {
                drawBorder: false,
                zeroLineColor: 'transparent',
                color: 'rgba(255,255,255,0.05)',
            },
        },
    },
};

export var purpleChartOptions = {
    ...basicOptions,
    scales: {
        x: {
            barPercentage: 1.6,
            grid: {
                drawBorder: false,
                color: 'rgba(225,78,202,0.1)',
                zeroLineColor: 'transparent',
            },
            ticks: {
                padding: 20,
                fontColor: '#9a9a9a',
            },
        },
        y: {
            barPercentage: 1.6,
            grid: {
                drawBorder: false,
                color: 'rgba(29,140,248,0.0)',
                zeroLineColor: 'transparent',
            },
            ticks: {
                suggestedMin: 60,
                suggestedMax: 125,
                padding: 20,
                fontColor: '#9a9a9a',
            },
        },
    },
};

export var orangeChartOptions = {
    ...basicOptions,
    scales: {
        x: {
            barPercentage: 1.6,
            grid: {
                drawBorder: false,
                color: 'rgba(220,53,69,0.1)',
                zeroLineColor: 'transparent',
            },
            ticks: {
                padding: 20,
                fontColor: '#ff8a76',
            },
        },
        y: {
            barPercentage: 1.6,
            grid: {
                drawBorder: false,
                color: 'rgba(29,140,248,0.0)',
                zeroLineColor: 'transparent',
            },
            ticks: {
                suggestedMin: 50,
                suggestedMax: 110,
                padding: 20,
                fontColor: '#ff8a76',
            },
        },
    },
};
export var greenChartOptions = {
    ...basicOptions,
    scales: {
        x: {
            barPercentage: 1.6,
            grid: {
                drawBorder: false,
                color: 'rgba(0,242,195,0.1)',
                zeroLineColor: 'transparent',
            },
            ticks: {
                padding: 20,
                fontColor: '#9e9e9e',
            },
        },
        y: {
            barPercentage: 1.6,
            grid: {
                drawBorder: false,
                color: 'rgba(29,140,248,0.0)',
                zeroLineColor: 'transparent',
            },
            ticks: {
                suggestedMin: 50,
                suggestedMax: 125,
                padding: 20,
                fontColor: '#9e9e9e',
            },
        },
    },
};

export var barChartOptions = {
    ...basicOptions,
    scales: {
        x: {
            grid: {
                drawBorder: false,
                color: 'rgba(29,140,248,0.1)',
                zeroLineColor: 'transparent',
            },
            ticks: {
                padding: 20,
                fontColor: '#9e9e9e',
            },
        },
        y: {
            grid: {
                drawBorder: false,
                color: 'rgba(29,140,248,0.1)',
                zeroLineColor: 'transparent',
            },
            ticks: {
                suggestedMin: 60,
                suggestedMax: 120,
                padding: 20,
                fontColor: '#9e9e9e',
            },
        },
    },
};
