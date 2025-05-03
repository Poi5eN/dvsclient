import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

// Helper for formatting currency (optional, adjust as needed)
const formatCurrency = (value) => {
  // Example: Format as Indian Rupees
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(value);
  // Or a simple prefix:
  // return `₹ ${value}`;
};

const AllIncomeCharts = () => { // Renamed component slightly for clarity
  const authToken = localStorage.getItem("token");
  const [incomeData, setIncomeData] = useState([]); // Store raw income data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Chart State ---
  // We define the options structure once and update the series data later
  const initialChartOptions = {
    chart: {
      height: 350,
      toolbar: { // Optional: customize toolbar
        show: true,
      },
      zoom: {
        enabled: false // Disable zoom for simpler charts if desired
      }
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2, // Slightly thinner line
    },
    xaxis: {
      categories: [
         'Jan', 'Feb', 'Mar','Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ],
      labels: {
        style: {
          colors: '#6b7280', // Gray color for labels (adjust for dark mode if needed)
        },
      },
    },
    yaxis: {
       labels: {
        style: {
          colors: '#6b7280', // Gray color for labels
        },
        formatter: (value) => formatCurrency(value), // Format Y-axis labels
      },
    },
    tooltip: {
      x: {
        // format: 'MMM', // Use short month names from categories
      },
      y: {
         formatter: (value) => formatCurrency(value), // Format tooltip value
         title: {
             formatter: (seriesName) => seriesName + ':',
         },
      }
    },
    grid: {
      borderColor: '#e5e7eb', // Lighter grid lines
      strokeDashArray: 4, // Dashed grid lines
    },
    fill: { // Gradient fill for area chart
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    colors: ['#3b82f6'], // Example color (Blue) - choose your preferred color
  };

  // State for Area Chart
  const [areaChartData, setAreaChartData] = useState({
    series: [{ name: 'Monthly Income', data: [] }],
    options: {
        ...initialChartOptions,
        chart: { ...initialChartOptions.chart, type: 'area' },
        // title: {
        //     text: 'Monthly Fee Income (Area Chart)',
        //     align: 'left',
        //     style: {
        //         fontSize: '16px',
        //         color: '#1f2937' // Darker title color
        //     }
        // }
     },
  });

  // State for Bar Chart
  const [barChartData, setBarChartData] = useState({
    series: [{ name: 'Monthly Income', data: [] }],
    options: {
      ...initialChartOptions, // Reuse common options
      chart: { ...initialChartOptions.chart, type: 'bar' }, // Set type to bar
      plotOptions: { // Bar chart specific options
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded' // Rounded bars
        },
      },
      stroke: { // Bar charts don't usually need smooth curves
        show: true,
        width: 2,
        colors: ['transparent']
      },
      fill: { // Solid fill for bar chart
          opacity: 1
      },
      title: {
        text: 'Monthly Fee Income (Bar Chart)',
        align: 'left',
        style: {
            fontSize: '16px',
            color: '#1f2937'
        }
     },
     colors: ['#10b981'], // Example color (Green)
    },
  });


  // --- Fetch Data Effect ---
  useEffect(() => {
    setIsLoading(true);
    setError(null); // Reset error on new fetch

    axios.get('https://dvsserver.onrender.com/api/v1/fees/feeIncomeMonths', {
      withCredentials: true, // Keep this if your backend requires cookies
      headers: {
        Authorization: `Bearer ${authToken}`,
      }
    })
    .then((response) => {
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            const fetchedData = response.data.data;
            setIncomeData(fetchedData); // Store raw data if needed elsewhere

            // --- Update Chart States ---
            // Area Chart
            setAreaChartData(prev => ({
                ...prev,
                series: [{ ...prev.series[0], data: fetchedData }],
            }));

            // Bar Chart
            setBarChartData(prev => ({
                ...prev,
                series: [{ ...prev.series[0], data: fetchedData }],
            }));
        } else {
            console.error("Unexpected API response structure:", response.data);
            setError("Received invalid data from the server.");
        }
    })
    .catch((error) => {
      console.error("API Error fetching income data:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch income data."); // Show specific backend error or generic message
    })
    .finally(() => {
      setIsLoading(false); // Stop loading regardless of success or failure
    });

  }, [authToken]); // Re-fetch if authToken changes


  // --- Render Logic ---
  const renderChart = (chartState, chartType) => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-60 text-gray-500">Loading chart data...</div>;
    }
    if (error) {
      return <div className="flex justify-center items-center h-60 text-red-500 px-4">Error: {error}</div>;
    }
    if (chartState.series[0].data.length === 0) {
       return <div className="flex justify-center items-center h-60 text-gray-500">No income data available for this period.</div>;
    }

    return (
      <ReactApexChart
        options={chartState.options}
        series={chartState.series}
        type={chartState.options.chart.type} // Use type from options
        height={350}
      />
    );
  };

  return (
    // Use grid for layout: 1 column on small screens, 2 on large
    <div 
    // className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 md:p-6 bg-gray-100 dark:bg-gray-900"
    >

      {/* Area Chart Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-4">
         {/* Title moved inside ApexChart options */}
         {/* <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
             Monthly Fee Income (Area)
         </h2> */}
         <div id="area-chart">
           {renderChart(areaChartData)}
         </div>
      </div>

       {/* Bar Chart Card */}
       {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-4">
         
         <div id="bar-chart">
            {renderChart(barChartData)}
         </div>
       </div> */}

    </div> // End of grid container
  );
};

export default AllIncomeCharts;


// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import ReactApexChart from 'react-apexcharts';


// const AllIncomeChart = () => {
//   const authToken = localStorage.getItem("token");
//   const [dataAll, setDataAll] = useState([]);

//   useEffect(() => {

//     axios.get('https://dvsserver.onrender.com/api/v1/fees/feeIncomeMonths', 
//     {
//       withCredentials: true,
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//       }
//     }
//     )
//     .then((response) => {
//       setDataAll(response.data.data);
//       console.log("response.data.data",response.data.data)
//     })
//     .catch((error) => {
//       console.log("error", error.message);
//     })

//   }, []);

//   useEffect(() => {

//     // Update chartData when dataAll changes
//     setChartData(prevChartData => ({
//       ...prevChartData,
//       series: [
//         {
//           name: 'Income',
//           data: dataAll,
//         },
//       ],
//     }));

//   }, [dataAll]);


//   const [chartData, setChartData] = useState({
//     series: [
//       {
//         name: 'Income',
//         data: dataAll,
       
//       },
//     ],
//     options: {
//       chart: {
//         height: 350,
//         type: 'area',
//       },
//       dataLabels: {
//         enabled: false,
//       },
//       stroke: {
//         curve: 'smooth',
//       },
//       xaxis: {
//         categories: [
//           // '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
//  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
//         ],
//       },
//       tooltip: {
//         x: {
//           format: 'MM',
//         },
//       },
//     },
//   });



//   return (
//     <div className="w-full">
//       <h2 className="dark:text-white dark:bg-secondary-dark-bg text-xl py-2">Fee IncomeChart According to Months</h2>
//       <div id="chart">
//         <ReactApexChart
//           options={chartData.options}
//           series={chartData.series}
//           type="area"
//           height={350}
//         />
//       </div>
//     </div>
//   );
// };

// export default AllIncomeChart;
