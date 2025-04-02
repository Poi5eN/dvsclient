import React from 'react';
import ReactApexChart from 'react-apexcharts';

const ActiveChart = () => {
  const chartData = {
    // series: [44, 55, 41, 17, 15],
    series: [44, 55],
    options: {
      chart: {
        type: 'donut',
      },
      labels: ["Active", "Inactive"],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    },
  };

  return (
    <div id="chart">
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="donut"
        width={330} 
      />
    </div>
  );
};

export default ActiveChart;
