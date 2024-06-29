// fetch data from main process

let dashboardData = {};
const userPref = JSON.parse(localStorage.getItem("userPreferences"));
const userCurrency = userPref ? userPref._doc.currency_name : "₹";

let salesX = [];
let salesY = [];
let salesYearX = [];
let salesYearY = [];
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
const thisYearSales = document.getElementById("thisYearSales");
const thisDaySalesPercentage = document.getElementById("thisDaySalesPercentage");
const thisMonthSalesPercent = document.getElementById("thisMonthSalesPercent");

const fetchDashboardData = () => {
  ipcRenderer.send("fetch-dashboard-data");
};

fetchDashboardData();

ipcRenderer.on("dashboard-data", (event, data) => {
  dashboardData = data;
  updateDashboardData(data);
  console.log(data)
  data.dailySale.forEach((item) => {
    let formattedDate = `${item._id} ${monthName}`
    console.log(formattedDate)
    salesX.push(formattedDate.toString());
    salesY.push(item.Daily_sales_total);
  })

data.monthlySale.forEach((item) => {
    salesYearY.push(Number(item.Monthly_sales_total));
});

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

salesYearX = data.monthlySale.map(item => months[item._id - 1]);

  updateSalesChartData(salesX, salesY);
  updateSalesByYearChartData(salesYearX, salesYearY);
})


function updateDashboardData(data) {

  totalActiveTable.innerHTML = data.totalActiveTable;
  monthlySalesText.innerHTML = userCurrency + data.monthlySalesText;
  yearlySaleText.innerHTML = userCurrency + data.yearlySalesText;
  monthlyPurchaseText.innerHTML = userCurrency + data.monthlyPurchaseText;
  yearlyPurchaseText.innerHTML = userCurrency + data.yearlyPurchaseText;
  thisMonthSales.innerHTML = userCurrency + data.thisMonthSales;
  thisYearSales.innerHTML = userCurrency + data.yearlySalesText;
  thisDaySalesPercentage.innerHTML = Number(data.daySalesPercentageChange).toFixed(0) + "%";
  if(data.isDaySalesIncreased){
    thisDaySalesPercentage.classList.add("text-green-500");
  }
  else{
    thisDaySalesPercentage.classList.add("text-red-500");
  }
  thisMonthSalesPercent.innerHTML = Number(data.monthSalesPercentageChange).toFixed(0) + "%";
  if(data.isMonthSalesIncreased){
    thisMonthSalesPercent.classList.add("text-green-500");
  }
  else{
    thisMonthSalesPercent.classList.add("text-red-500");
  }
}

function updateSalesChartData(salesX, salesY) {

  const salesChartoptions = {
    series: [
      {
        name: "Today Sale",
        data: salesY,
        color: "#e36425",
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
        shade: "#e36425",
        gradientToColors: ["#e36425"],
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
          return userCurrency + value;
        }
      }
    },
  }

  if (document.getElementById("sales-chart") && typeof ApexCharts !== 'undefined') {
    const chart = new ApexCharts(document.getElementById("sales-chart"), salesChartoptions);
    chart.render();
  }

}
function updateSalesByYearChartData(salesYearX, salesYearY) {

  const salesChartoptions = {
    series: [
      {
        name: "Month Sale",
        data: salesYearY,
        color: "#e36425",
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
        shade: "#e36425",
        gradientToColors: ["#e36425"],
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
      categories: salesYearX,
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
          return userCurrency + value;
        }
      }
    },
  }

  if (document.getElementById("yearly-sales-chart") && typeof ApexCharts !== 'undefined') {
    const chart = new ApexCharts(document.getElementById("yearly-sales-chart"), salesChartoptions);
    chart.render();
  }

}
