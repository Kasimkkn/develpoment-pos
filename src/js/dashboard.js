// fetch data from main process

let dashboardData = {};
const userPref = JSON.parse(localStorage.getItem("userPreferences"));
const userCurrency = userPref ? userPref._doc.currency_name : "₹";

let salesX = [];
let salesY = [];
let purchasesX = [];
let purchasesY = [];
let date = new Date();
let today = date.getDate();

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthName = months[date.getMonth()];

const totalActiveTable = document.getElementById("totalActiveTable");
const monthlySalesText = document.getElementById("monthlySalesText");
const yearlySaleText = document.getElementById("yearlySaleText");
const monthlyPurchaseText = document.getElementById("monthlyPurchaseText");
const yearlyPurchaseText = document.getElementById("yearlyPurchaseText");
const thisMonthSales = document.getElementById("thisMonthSales");
const thisMonthIncome = document.getElementById("thisMonthIncome");
const thisMonthExpense = document.getElementById("thisMonthExpense");

const fetchDashboardData = () => {
    ipcRenderer.send("fetch-dashboard-data");
};

fetchDashboardData();

ipcRenderer.on("dashboard-data", (event, data) => {
    dashboardData = data;
    updateDashboardData(data);
    console.log(data)
    data.dailySale.forEach((item)=>{
        let formattedDate = `${item._id} ${monthName}`
        console.log(formattedDate)
        salesX.push(formattedDate.toString());
        salesY.push(item.Daily_sales_total);
    })

    data.monthlySale.forEach((item)=>{
        purchasesX.push(item._id);
        purchasesY.push(item.Monthly_sales_total);
    })
    updateSalesChartData(salesX, salesY)
    updatePurchasesChartData(purchasesX, purchasesY)
})

console.log(purchasesX, purchasesY)

function updateDashboardData(data) {
    
    totalActiveTable.innerHTML = data.totalActiveTable;
    monthlySalesText.innerHTML = userCurrency + data.monthlySalesText;
    yearlySaleText.innerHTML =userCurrency + data.yearlySalesText;
    monthlyPurchaseText.innerHTML = userCurrency + data.monthlyPurchaseText;
    yearlyPurchaseText.innerHTML = userCurrency + data.yearlyPurchaseText;
    thisMonthSales.innerHTML = userCurrency + data.thisMonthSales;
    thisMonthIncome.innerHTML = userCurrency + data.yearlySalesText;
    thisMonthExpense.innerHTML = userCurrency + data.yearlyPurchaseText;
}


function updateSalesChartData(salesX, salesY) {

const salesChartoptions = {
    series: [
        {
            name: "Today Sale",
            data: salesY,
            color: "#1A56DB",
        },
    ],
    chart: {
        height: "100%",
        width: "100%",
        type: "area",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
            enabled: false,
        },
        toolbar: {
            show: false,
        },
    },
    tooltip: {
        enabled: true,
        x: {
            show: false,
        },
    },
    legend: {
        show: false
    },
    fill: {
        type: "gradient",
        gradient: {
            opacityFrom: 0.55,
            opacityTo: 0,
            shade: "#1C64F2",
            gradientToColors: ["#1C64F2"],
        },
    },
    dataLabels: {
        enabled: false,
    },
    stroke: {
        width: 6,
    },
    grid: {
        show: false,
        strokeDashArray: 4,
        padding: {
            left: 2,
            right: 2,
            top: 0
        },
    },
    xaxis: {
        categories: salesX,
        labels: {
            show: false,
        },
        axisBorder: {
            show: false,
        },
        axisTicks: {
            show: false,
        },
    },
    yaxis: {
        show: false,
        labels: {
            formatter: function (value) {
                return '$' + value;
            }
        }
    },
}

if (document.getElementById("sales-chart") && typeof ApexCharts !== 'undefined') {
    const chart = new ApexCharts(document.getElementById("sales-chart"), salesChartoptions);
    chart.render();
}
 
}

function updatePurchasesChartData(purchasesX, purchasesY) {
  const barcharOptions = {
    series: [
      {
        name: "Income",
        color: "#31C48D",
        data: purchasesY,
      },
      {
        name: "Expense",
        data: ["788", "810", "866", "788", "1100", "1200"],
        color: "#F05252",
      }
    ],
    chart: {
      sparkline: {
        enabled: false,
      },
      type: "bar",
      width: "100%",
      height: "100%",
      toolbar: {
        show: false,
      }
    },
    fill: {
      opacity: 1,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "100%",
        borderRadiusApplication: "end",
        borderRadius: 6,
        dataLabels: {
          position: "top",
        },
      },
    },
    legend: {
      show: false,
      position: "bottom",
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      shared: true,
      intersect: false,
      formatter: function (value) {
        return value
      }
    },
    xaxis: {
      labels: {
        show: true,
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
        },
        formatter: function(value) {
          return "$" + value
        }
      },
      categories: months,
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: false,
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
        }
      }
    },
    grid: {
      show: true,
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: -20
      },
    },
    fill: {
      opacity: 1,
    }
  }
  
  if(document.getElementById("bar-chart") && typeof ApexCharts !== 'undefined') {
    const chart = new ApexCharts(document.getElementById("bar-chart"), barcharOptions);
    chart.render();
  }
  
}

  const areaChart = {
    chart: {
      height: "100%",
      maxWidth: "100%",
      type: "area",
      fontFamily: "Inter, sans-serif",
      dropShadow: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
        shade: "#1C64F2",
        gradientToColors: ["#1C64F2"],
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 6,
    },
    grid: {
      show: false,
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: 0
      },
    },
    series: [
      {
        name: "New users",
        data: [6500, 6418, 6456, 6526, 6356, 6456],
        color: "#1A56DB",
      },
    ],
    xaxis: {
      categories: ['01 February', '02 February', '03 February', '04 February', '05 February', '06 February', '07 February'],
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
    },
  }
  
  if (document.getElementById("area-chart") && typeof ApexCharts !== 'undefined') {
    const chart = new ApexCharts(document.getElementById("area-chart"), areaChart);
    chart.render();
  }
  