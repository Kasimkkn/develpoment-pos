
const $ = require("jquery");
const todaySaleInput = document.getElementById("todaysdatepicker");
let datesByInput;
let dailySales = [];

document.addEventListener("DOMContentLoaded", () => {
  const todayDate = new Date().toISOString().slice(0, 10);
  todaySaleInput.value = todayDate;
  const dateString = todaySaleInput.value;
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  datesByInput = `${year}-${month}-${day}`;

  fetchDailySales(datesByInput);
  ipcRenderer.on("daily-sales-data", (event, data) => {
    dailySales = data;
    renderDailySales(data);
  });
});

todaySaleInput.addEventListener("input", () => {
  const datesByInput = todaySaleInput.value;
  fetchDailySales(datesByInput);
  ipcRenderer.on("daily-sales-data", (event, data) => {
    dailySales = data;
    renderDailySales(data);
  });
});

const fetchDailySales = async (datesByInput) => {
  try {
    ipcRenderer.send("fetch-daily-sales", datesByInput);
    if (
      ipcRenderer.on("daily-sales-data", (event, data) => {
        dailySales = data;
        renderDailySales(data);
      })
    ) {
      renderDailySales(dailySales);
    }
  } catch (error) {
    console.log(error);
  }
};

const renderDailySales = (data) => {
  if (data.length > 0) {
    const initialColumns = [
      { title: "Bills" },
      { title: "Total" },
      { title: "Discount By %" },
      { title: "Discount" },
      { title: "Total Tax" },
      { title: "Round Off" },
      { title: "Final Amount" }
    ];

    const payModes = {};
    Object.keys(data[0]).forEach(key => {
      if (key.startsWith('total') && key !== 'totalAmount' && key !== 'totalFinalAmount' && key !== 'totalDiscountPerc' && key !== 'totalDiscount' && key !== 'totalTax' && key !== '_id') {
        payModes[key] = true;
      }
    });

    Object.keys(payModes).forEach(paymode => {
      initialColumns.push({ title: paymode.split("total")[1].toLowerCase() });
    });

    // Initialize DataTable with all columns
    const dailySalesTable = $("#daily-sales-table").DataTable({
      layout: {
        topStart: {
          buttons: ['copyHtml5', 'excelHtml5', 'csvHtml5', 'pdfHtml5']
        }
      },
      responsive: true,
      destroy: true,
      paging: false,
      info: false,
      ordering: false,
      columns: initialColumns // Set all columns during initialization
    });

    // Clear existing table data
    dailySalesTable.clear();

    let totalAmount = 0;
    let totalTax = 0;
    let totalRound = 0;
    let totalDiscountPerc = 0;
    let totalDiscount = 0;
    let totalFinal = 0;

    // Populate rows in DataTable
    data[0]?.sales?.forEach((sale) => {
      const discountPerc = sale.discount_perc ? (sale.total_amount * sale.discount_perc / 100).toFixed(2) : '0.00';
      const discountRupees = sale.discount_rupees ? sale.discount_rupees : '0.00';
      const roundOff = sale.round_off ? sale.round_off : '0.00';

      totalAmount += parseFloat(sale.total_amount);
      totalTax += parseFloat(sale.total_tax);
      totalDiscountPerc += parseFloat(discountPerc);
      totalDiscount += parseFloat(discountRupees);
      totalFinal += parseFloat(sale.final_amount);

      const rowData = [
        sale.bill_no,
        sale.total_amount.toFixed(2),
        discountPerc,
        discountRupees,
        sale.total_tax.toFixed(2),
        roundOff,
        sale.final_amount.toFixed(2)
      ];

      Object.keys(payModes).forEach(paymode => {
        const paymodeKey = paymode.split("total")[1].toLowerCase();
        if (Array.isArray(sale.pay_mode)) {
          const index = sale.pay_mode.map(mode => mode.toLowerCase()).indexOf(paymodeKey);
          rowData.push(index !== -1 ? sale.splited_amount[index].toFixed(2) : '0.00');
        } else {
          rowData.push(sale.pay_mode.toLowerCase() === paymodeKey ? sale.final_amount.toFixed(2) : '0.00');
        }
      });

      dailySalesTable.row.add(rowData);

      if (!roundOff.startsWith("-")) {
        totalRound += Number(roundOff);
      } else if (roundOff.startsWith("-")) {
        totalRound -= Number(roundOff.split("-")[1]);
      }
    });

    // Add overall totals row
    const totalsRow = [
      'Total',
      totalAmount.toFixed(2),
      totalDiscountPerc.toFixed(2),
      totalDiscount.toFixed(2),
      totalTax.toFixed(2),
      totalRound.toFixed(2),
      totalFinal.toFixed(2)
    ];

    Object.keys(payModes).forEach(paymode => {
      const paymodeKey = paymode.split("total")[1].toLowerCase();
      const total = data.reduce((sum, saleData) => {
        return sum + saleData.sales.reduce((saleSum, sale) => {
          if (Array.isArray(sale.pay_mode)) {
            const index = sale.pay_mode.map(mode => mode.toLowerCase()).indexOf(paymodeKey);
            return saleSum + (index !== -1 ? sale.splited_amount[index] : 0);
          } else {
            return saleSum + (sale.pay_mode.toLowerCase() === paymodeKey ? sale.final_amount : 0);
          }
        }, 0);
      }, 0);
      totalsRow.push(total.toFixed(2));
    });

    dailySalesTable.row.add(totalsRow).draw(false);

    // Draw DataTable
    dailySalesTable.draw();
  } else {
    const dailySalesTable = $("#daily-sales-table").DataTable({
      layout: {
        topStart: {
          buttons: ['copyHtml5', 'excelHtml5', 'csvHtml5', 'pdfHtml5']
        }
      },
      responsive: true,
      destroy: true,
      paging: false,
      info: false,
      ordering: false
    });

    // Clear existing table data
    dailySalesTable.clear();

    // Draw DataTable
    dailySalesTable.draw();
  }
};

