const ctx = document.getElementById('cpuChart').getContext('2d');

const timeChartPlugins = {
    decimation: {
        enabled: true,
        algorithm: 'lttb',
        samples: 50,
        threshold: 0
    },
};

const timeChartDisplayFormats = {
    millisecond: 'hh:mm:ss',
    second: 'hh:mm:ss',
    minute: 'hh:mm:ss',
    hour: 'hh:mm:ss',
    day: 'YYYY MM DD hh:mm:ss',
    week: 'YYYY MM DD hh:mm:ss',
    month: 'YYYY MM DD hh:mm:ss',
    quarter: 'YYYY MM DD hh:mm:ss',
    year: 'YYYY MM DD hh:mm:ss',
};

// eslint-disable-next-line no-undef

export class statsChart {
    constructor(element,label,color1='#561466',color2='#370d42CC',color3='#30313b',tickCallback) {
        this.element = element;
        this.color1 = color1;
        this.color2 = color2;
        this.color3 = color3;
        // eslint-disable-next-line no-undef
        this.chart = new Chart(element, {
            type: 'line',
            data: {
                datasets: [{
                    label: label,
                    backgroundColor: this.color1,
                    borderColor: this.color1,
                    fill: {
                        target: 'origin',
                        above: this.color2
                    },
                    pointRadius: 2,
                    hitRadius: 10,
                    data: [{x: Date.now(),y:0}]
                }]
            },
            options: {
                parsing: false,
                // plugins: timeChartPlugins,
                scales: {
                    x: {
                        type: 'time',
                        display: true,
                        bounds: 'data',
                        time: {
                            displayFormats: timeChartDisplayFormats,
                            tooltipFormat: 'MM DD HH:MM:SS'
                        },
                        ticks: {
                            maxTicksLimit: 5,
                            maxRotation: 0,
                        },
                        grid: {
                            color: this.color3
                        },
                        spanGaps: true

                    },
                    y: {
                        // type: 'logarithmic',
                        spanGaps: true,
                        display: true,
                        beginAtZero: true,
                        min: 0,
                        suggestedMax: 25,
                        grid: {
                            color: this.color3
                        },
                        ticks: {
                            // eslint-disable-next-line no-undef
                            callback : tickCallback
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'CPU Usage Over Time'
                }
            }
        });
    }

    addPoint(x,y){
        this.chart.data.datasets[0].data.push({x: x,y: y});
        this.chart.update('none');
    }
}
