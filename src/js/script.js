const { default: axios } = require('axios');
const table_no = document.getElementById("tableNo").textContent.split("Table No: ")[1];
const location_name = document.getElementById("locationName").textContent;

let KotcartItems = [];
let loyaltyData = [];
ipcRenderer.send("fetch-cartItems", table_no, location_name);

ipcRenderer.on("cartItems-data", (event, receivedCartItems) => {
  KotcartItems = receivedCartItems;
});


const initializeModal = (id) => {
  const $targetEl = document.getElementById(id);
  const options = {
    placement: "center",
    backdrop: "dynamic",
    backdropClasses: "bg-gray-900/50 fixed inset-0 z-40",
    closable: true,
  };

  const modal = new Modal($targetEl, options);
  return modal;
};

const customerBillInfoModal = initializeModal("customerInfoModal");
const loyaltyPointsModal = initializeModal("customerLoyaltyModal");


ipcRenderer.send("fetch-loyalty")

ipcRenderer.on("loyalty-data", (event, data) => {
  loyaltyData = data
})

const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

let bill_no;
ipcRenderer.send("get-bill-no");
ipcRenderer.on("bill-no-data", (event, data) => {
  bill_no = data;
})

const loyalCustomerPhone = document.getElementById("customerPhoneNO");
const loyaltyCustomerNO = document.getElementById("customerPhone");
const loyalCustomerName = document.getElementById("customerName");
const customerNoDatalist = document.getElementById("customerPhoneList");
const customerNameDatalist = document.getElementById("customerNameList");
const loyaltyCustomerPhoneList = document.getElementById("loyaltyCustomerPhoneList");

async function sendWhatsAppMessage(phone, message) {
  const url = 'https://messagesapi.co.in/chat/sendmessage';
  const payload = {
    id: "0e7c0ca865bb4862b81784b9877e9a07",
    phone: `91${phone}`,
    message: message
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post(url, payload, { headers });
  } catch (error) {
    console.error('Error:', error);
  }
}

function renderCustomerInfoSugestion(inputText) {
  customerNoDatalist.innerHTML = "";
  customerNameDatalist.innerHTML = "";
  loyaltyCustomerPhoneList.innerHTML = "";
  loyaltyData.forEach(loyalty => {
    const loyaltyNO = String(loyalty._doc.customer_no).toLowerCase();
    const loyaltyName = loyalty._doc.customer_name.toLowerCase();
    if (loyaltyNO.includes(inputText)) {
      const option = document.createElement("option");
      option.value = Number(loyalty._doc.customer_no);
      customerNoDatalist.appendChild(option);
      // clone the data and then apnned it to the datalist
      loyaltyCustomerPhoneList.appendChild(option.cloneNode(true));

    }
    if (loyaltyName.includes(inputText)) {
      const option = document.createElement("option");
      option.value = loyalty._doc.customer_name;
      customerNameDatalist.appendChild(option);
    }
  });
}

loyalCustomerPhone.addEventListener("input", (event) => {
  const inputText = event.target.value.trim().toLowerCase();
  renderCustomerInfoSugestion(inputText);
});

loyalCustomerName.addEventListener("input", (event) => {
  const inputText = event.target.value.trim().toLowerCase();
  renderCustomerInfoSugestion(inputText);
});

loyaltyCustomerNO.addEventListener("input", (event) => {
  const inputText = event.target.value.trim().toLowerCase();
  renderCustomerInfoSugestion(inputText);
  if (inputText.length == 10) {
    ipcRenderer.send("get-loyalty-points", inputText);
  }
});

let loyalCustomerData = {};

ipcRenderer.once("fetch-loyalty-points-success", (event, data) => {
  loyalCustomerData = data
  document.getElementById("customerPoints").textContent = data._doc.total_points
  document.getElementById("redeemAmount").value = data._doc.total_points
})


const otpInput = document.getElementById("otpInput");
const otpValue = document.getElementById("otpValue");
const redeemAmount = document.getElementById("redeemAmount");
document.getElementById("send-otp").addEventListener("click", () => {
  if (loyaltyCustomerNO.value.length < 10  || redeemAmount.value == 0) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Check your inputs or Enter less than bill amount",
      timer: 3000,
    })
  }
  else {
    const generatedOtp = Math.floor(1000 + Math.random() * 9000);
    otpValue.value = generatedOtp;
    otpInput.value = generatedOtp;
    // const phone = loyalCustomerPhone.value;
    // const message = `Your OTP is ${generatedOtp}`;
    // sendWhatsAppMessage(phone, message)
    // .then(response => {
    //     console.log('Response:', response);
    //   })
    // .catch(error => {
    //     console.error('Error sending message:', error);
    //   });
  }
})


document.getElementById("apply-button").addEventListener("click", () => {
  if (otpValue.value == '') {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "please enter OTP",
      timer: 3000,
    })
    return
  }
  if (otpInput.value === otpValue.value) {
    const redeemAmount = document.getElementById("redeemAmount").value;
    if (redeemAmount > loyalCustomerData._doc.total_points) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Insufficient Points",
        timer: 1000,
      })
    }
    else {
      const userSettings = JSON.parse(localStorage.getItem("billInfo"));
      const how_much_amount = userSettings._doc.how_much_amount;
      const discountAmount = redeemAmount * how_much_amount;
      const billAmount = Number(document.getElementById("Bill_amount").textContent.split("₹")[1]);
      if (discountAmount > billAmount) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "please redeem loyalty points less than bill amount",
          timer: 5000,
        })
        return
      }
      else {
        ipcRenderer.send("apply-loyalty-points", loyalCustomerData._doc.customer_no, redeemAmount);
        ipcRenderer.once("apply-loyalty-points-success", (event, data) => {
          const cusomterData = JSON.parse(data)
          // const phone = loyalCustomerData._doc.customer_no;
          // const message = `Hello ${loyalCustomerData._doc.customer_name},\nYou have redeemed a total of ${redeemAmount} loyalty points. Your new balance is ${cusomterData.total_points}.`;

          // sendWhatsAppMessage(phone, message)
          //   .then(response => {
          //     console.log('Response:', response);
          //   })
          //   .catch(error => {
          //     console.error('Error sending message:', error);
          //   });

          const netAmountWithDiscount = billAmount - discountAmount;
          document.getElementById("Bill_amount").textContent = `₹ ${netAmountWithDiscount}`;
          document.getElementById("net-amount").textContent = `₹ ${netAmountWithDiscount}`;
          document.getElementById("discountReason").value = `${redeemAmount} was redeemed`;
          document.getElementById("discountMoney").value = discountAmount;
          otpInput.value = "";
          otpValue.value = "";
          redeemAmount.value = "";
          ipcRenderer.once("fetch-loyalty-points-success", (event, data) => {
            loyalCustomerData = data
            document.getElementById("customerPoints").textContent = data._doc.total_points
            // document.getElementById("redeemAmount").value = data._doc.total_points
          })
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Points redeemed successfully",
            timer: 1000,
          })
          // close the loyatyModel and open the customerInfor model
          loyaltyPointsModal.hide()
          customerBillInfoModal.show();
        })
      }
    }
  }
  else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Invalid OTP",
      timer: 1000,
    })
  }
})

function printBill() {
  const userPref = JSON.parse(localStorage.getItem("userPreferences"));
  const billInfoStr = JSON.parse(localStorage.getItem("billInfo"));
  const customerName = document.getElementById("customerName").value;
  const customerPhone = document.getElementById("customerPhoneNO").value;
  const customerGSTNo = document.getElementById("customerGSTNo").value;
  const todaysDate = document.getElementById("todaysDate").textContent;

  let userTaxPercentage = 0;
  if (userPref._doc.is_gstAvailable) {
    userTaxPercentage = userPref._doc.gst_percentage;
  } else if (userPref._doc.is_ValueAddedTaxAvailable) {
    userTaxPercentage = userPref._doc.vat_percentage;
  }

  let sgstAmount = 0;
  let cgstAmount = 0;
  let vat_Amount = 0;
  if (userPref._doc.is_gstAvailable && userTaxPercentage > 0) {
    sgstAmount = userTaxPercentage / 2;
    cgstAmount = userTaxPercentage / 2;
  } else if (userPref._doc.is_ValueAddedTaxAvailable && userTaxPercentage > 0) {
    vat_Amount = userTaxPercentage / 100;
  }

  const discountPerc = parseFloat(document.getElementById("discountPerc").value) || 0;
  const discountMoney = parseFloat(document.getElementById("discountMoney").value) || 0;
  const discountReason = document.getElementById("discountReason").value || '';

  let itemDetails = [];
  let totalAmount = 0;

  // Assuming KotcartItems is globally accessible
  KotcartItems.forEach((item) => {
    const productNo = item._doc.item_no;
    const productName = item._doc.item_name;
    const productImage = item._doc.item_image;
    const sp_info = item._doc.sp_info;
    const quantity = item._doc.quantity;
    const price = item._doc.price;
    const totalAmountofItem = quantity * price;
    totalAmount += totalAmountofItem;

    const existingItemIndex = itemDetails.findIndex((existingItem) => existingItem.item_name === productName);

    if (existingItemIndex !== -1) {
      itemDetails[existingItemIndex].quantity += quantity;
      itemDetails[existingItemIndex].totalAmount += totalAmountofItem;
    } else {
      itemDetails.push({
        item_no: productNo,
        item_name: productName,
        item_image: productImage,
        sp_info: sp_info,
        quantity: quantity,
        price: price,
        totalAmount: totalAmountofItem,
      });
    }
  });


  let discountAmount = 0;
  if (discountPerc > 0) {
    discountAmount = (discountPerc / 100) * totalAmount;
  }
  if (discountMoney > 0) {
    discountAmount = discountMoney;
  }

  let netAmountWithDiscount = totalAmount - discountAmount;
  let totalTaxAmount = 0;

  if (sgstAmount > 0 || cgstAmount > 0) {
    const gstAmount = netAmountWithDiscount * (userTaxPercentage / 100);
    totalTaxAmount = gstAmount;
    netAmountWithDiscount += gstAmount;
  } else if (vat_Amount > 0) {
    const vatAmount = netAmountWithDiscount * vat_Amount;
    totalTaxAmount = vatAmount;
    netAmountWithDiscount += vatAmount;
  }

  const roundedNetAmount = Math.round(netAmountWithDiscount);
  const decimalPart = Number(String(netAmountWithDiscount.toFixed(2)).split(".")[1]);

  let roundOffValue;
  if (decimalPart < 50) {
    roundOffValue = `-0.${(100 - decimalPart)}`;
  }
  else {
    roundOffValue = `0.${decimalPart}`;
  }

  if (roundOffValue === '-0.100' || roundOffValue === '0.100') {
    roundOffValue = '0.00';
  }

  const billData = {
    itemDetails,
    parseTotalAmount: totalAmount,
    customer_phone: customerPhone,
    customer_name: customerName,
    pay_mode: "CASH",
    table_no: table_no,
    final_amount: netAmountWithDiscount,
    location_name,
    created_at: Date.now(),
    discount_perc: discountPerc,
    discount_rupees: discountMoney,
    discount_reason: discountReason,
    cgst_tax: userPref._doc.is_gstAvailable ? totalTaxAmount / 2 : 0,
    sgst_tax: userPref._doc.is_gstAvailable ? totalTaxAmount / 2 : 0,
    vat_tax: userPref._doc.is_ValueAddedTaxAvailable ? totalTaxAmount : 0,
    GST_no: customerGSTNo,
    total_tax: totalTaxAmount.toFixed(2),
  };

  let loyaltyData = {};
  if (customerName && customerPhone) {
    loyaltyData = {
      customer_name: customerName,
      customer_no: Number(customerPhone),
      total_points: 0,
      used_points: 0,
      remaining_points: 0
    }
  }

  if (customerName && customerPhone.length === 10) {
    const userSetting = JSON.parse(localStorage.getItem("billInfo"));
    const conversion_rate = netAmountWithDiscount * userSetting._doc.loyalty_points / userSetting._doc.loyalty_amount;
    loyaltyData.total_points = Math.floor(conversion_rate);
    loyaltyData.remaining_points = Math.floor(conversion_rate);
  }

  const transactData = {
    table_no: table_no,
    location_name: location_name,
    item_details: itemDetails,
    discount_perc: discountPerc,
    discount_rupees: discountMoney,
    is_active: false,
    is_printed: true,
    is_loading: false,
  };

  try {
    ipcRenderer.send("save-bill", billData);
    ipcRenderer.send("save-transaction", transactData);
    ipcRenderer.send("deduct-qty", itemDetails);

    if (customerName && customerPhone.length === 10) {
      ipcRenderer.send("save-loyalty", loyaltyData);
      ipcRenderer.once("save-loyalty-success", async (event, data) => {
        const loyalData = JSON.parse(data);
        const phone = loyalData.customer_no;
        const message = `Hello ${loyalData.customer_name},\nYou have earned a total of ${loyalData.total_points} loyalty points. You can redeem them on your next purchase.`;

        await sendWhatsAppMessage(phone, message)
          .then(response => {
            console.log('Message sent successfully:', response.data);
          })
          .catch(error => {
            console.error('Error sending message:', error);
          });
      });
    }
    const printer_ip = localStorage.getItem("printerSetting");
    // Send the data to the printer
    ipcRenderer.send("print-bill-data", billInfoStr, itemDetails, todaysDate, customerName, customerGSTNo, bill_no, table_no, totalAmount, discountPerc, discountMoney, discountAmount, cgstAmount, sgstAmount, vat_Amount, roundOffValue, roundedNetAmount, totalTaxAmount, printer_ip);

    ipcRenderer.on("bill-saved", (event, data) => {
      location.reload();
    });
  } catch (error) {
    console.log("Error saving bill:", error);
  }
}


function printKOT() {
  const currentItemsMap = {};
  const currentItemsWithSPInfo = {};
  const todaysDate = document.getElementById("todaysDate").textContent;

  KotcartItems.forEach((item) => {
    const productName = item._doc.item_name;
    const isPrinted = item._doc.is_printed;
    const quantity = item._doc.quantity;
    const sp_info = item._doc.sp_info;

    if (!isPrinted) {
      if (sp_info !== "none") {
        if (currentItemsWithSPInfo[productName]) {
          currentItemsWithSPInfo[productName].quantity += quantity;
        } else {
          currentItemsWithSPInfo[productName] = {
            quantity: quantity,
            sp_info: sp_info
          };
        }
      } else {
        if (currentItemsMap[productName]) {
          currentItemsMap[productName].quantity += quantity;
        } else {
          currentItemsMap[productName] = {
            quantity: quantity
          };
        }
      }
    }
  });
  const kotContent = {
    table_no: table_no,
    location_name: location_name,
    loggedInUser: loggedInUser,
    todaysDate: todaysDate,
    currentItemsMap: currentItemsMap,
    currentItemsWithSPInfo: currentItemsWithSPInfo,
    printer_ip: localStorage.getItem("kotPrinterSetting")
  };

  try {
    ipcRenderer.send("change-kot-status", kotContent);
    ipcRenderer.send("print-kot-data", kotContent);
  } catch (error) {
    console.error("Error updating is_printed field:", error);
  }
}


document.addEventListener("DOMContentLoaded", () => {

  function customerBill() {
    customerBillInfoModal.show();
  }
  function applyLoyaltyPoints() {
    loyaltyPointsModal.show()
  }


  function customerBill() {
    customerBillInfoModal.show();
  }
  let totalTimeKotIsPrinted = 0;

  document.getElementById("print-KOt-btn").addEventListener("click", function () {
    totalTimeKotIsPrinted += 1;
    if (KotcartItems.length > 0) {
      printKOT();
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Cart is empty',
        timer: 800
      })
    }
  });
  document.getElementById("get-customer-info-btn").addEventListener("click", () => {
    if (KotcartItems.length > 0) {
      customerBill();
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Cart is empty',
        timer: 800
      })
    }
  });
  document.getElementById("print-bill-btn").addEventListener("click", () => {
    if (KotcartItems.length > 0) {
      printBill();
    }
  });
  document.getElementById("customerLoyaltyBtn").addEventListener("click", () => {
    if (KotcartItems.length > 0) {
      applyLoyaltyPoints();
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Cart is empty',
        timer: 800
      })
    }
  })
});
