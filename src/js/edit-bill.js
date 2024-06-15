const { default: Swal } = require("sweetalert2");
const urlParams = new URLSearchParams(window.location.search);
let locationName;
let tableNo;
let billData = {};
let apiProduct = [];
let cartItems = [];
let Locations = [];

const billNo = urlParams.get("billNo");

ipcRenderer.send("fetch-bill-by-billNo", billNo);
ipcRenderer.on("bill-fetch-error", (event, error) => {
  window.location.href = "index.html";
  console.log(error)
})

ipcRenderer.on("edit-bill-details-data", (event, data) => {
  document.getElementById("locationName").innerHTML = data.location_name;
  document.getElementById("tableNo").innerHTML = `Table No: ${data.table_no}`;
  tableNo = data.table_no;
  locationName = data.location_name;
  billData = data;
  document.getElementById("discountPercUpdate").value = data.discount_perc;
  document.getElementById("discountAmountUpdate").value = data.discount_rupees;
  cartItems = billData.item_details;
  updateCartUI();
  renderBIllItems(cartItems);
  populateProducts(apiProduct, locationName);
})

const userPref = JSON.parse(localStorage.getItem("userPreferences"));
const userCurrency = userPref ? userPref._doc.currency_name : "₹";

let netAmount;

ipcRenderer.send("fetch-products");
ipcRenderer.send("fetch-location");
ipcRenderer.on("products-data", (event, products) => {
  apiProduct = products;
  populateProducts(products, locationName);
});

ipcRenderer.on("location-data", (event, data) => { 
  Locations = data;
  populateProducts(apiProduct, locationName);
});


const updateCartUI = () => {
  const cartElement = document.getElementById("cart");
  cartElement.innerHTML = "";

  cartItems.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.classList = "flex gap-3 items-center justify-between py-2 px-3 rounded-lg bg-white";
    itemElement.innerHTML = `
    <div class="flex items-center justify-center p-2">
          <span class="w-14 h-14 border bg-primary rounded-full flex items-center justify-center" style="border:2px solid var(--common-color)">
            <p class="text-2xl">${item.item_no}</p>
          </span>
        </div>
    <div class="ml-4 flex flex-col gap-2 items-start w-40 max-lg:w-32">
      <p class="text-sm">${item.item_name.toLowerCase()}</p>
      <span class="text-xs">${item.quantity} x ${item.price}</span>
    </div>
    <div class="flex flex-col gap-2 justify-center items-center">
      <p class="text-xs">${(item.price * item.quantity).toFixed(2)}</p>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32" id="delete" class="hover:cursor-pointer"
        onclick="removeItemFromCart('${item.item_no}', '${locationName}', '${tableNo}','${billNo}')">
        <path d="M24.2,12.193,23.8,24.3a3.988,3.988,0,0,1-4,3.857H12.2a3.988,3.988,0,0,1-4-3.853L7.8,12.193a1,1,0,0,1,2-.066l.4,12.11a2,2,0,0,0,2,1.923h7.6a2,2,0,0,0,2-1.927l.4-12.106a1,1,0,0,1,2,.066Zm1.323-4.029a1,1,0,0,1-1,1H7.478a1,1,0,0,1,0-2h3.1a1.276,1.276,0,0,0,1.273-1.148,2.991,2.991,0,0,1,2.984-2.694h2.33a2.991,2.991,0,0,1,2.984,2.694,1.276,1.276,0,0,0,1.273,1.148h3.1A1,1,0,0,1,25.522,8.164Zm-11.936-1h4.828a3.3,3.3,0,0,1-.255-.944,1,1,0,0,0-.994-.9h-2.33a1,1,0,0,0-.994.9A3.3,3.3,0,0,1,13.586,7.164Zm1.007,15.151V13.8a1,1,0,0,0-2,0v8.519a1,1,0,0,0,2,0Zm4.814,0V13.8a1,1,0,0,0-2,0v8.519a1,1,0,0,0,2,0Z"></path>
      </svg>
    </div>
  `;

    cartElement.appendChild(itemElement);
  });
  updateCartSummary(cartItems, billData);
};

const updateCartSummary = (cartItems, billData) => {
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  let discountAmount = 0;
  let netAmount = totalAmount;

  if(billData.discount_perc > 0){
    discountAmount = totalAmount * (billData.discount_perc / 100);
    netAmount -= discountAmount;
  }
  else if(billData.discount_rupees > 0){
    discountAmount = billData.discount_rupees;
    netAmount -= discountAmount;
  }
  // if (billData.discount_perc && billData.discount_perc > 0) {
  //   discountAmount = totalAmount * (billData.discount_perc / 100);
  //   netAmount -= discountAmount;
  // }

  const userPreferences = JSON.parse(localStorage.getItem("userPreferences"));
  let userGst;
  if (userPreferences._doc.is_gstAvailable && userTaxPercentage > 0) {
    userGst = userPreferences._doc.gst_percentage;
  } 
  else if (userPreferences._doc.is_ValueAddedTaxAvailable && userPreferences._doc.vat_percentage > 0) {
    userGst = userPreferences._doc.vat_percentage;
  }

  const totalTaxAmount = netAmount * ((userGst > 0 ? userGst : 0) / 100);
  netAmount += totalTaxAmount;

  if (discountAmount > 0) {
    document.getElementById("disc-amount").textContent = `${userCurrency} ${discountAmount.toFixed(2)}`;
  } else {
    document.getElementById("disc-amount").textContent = `${userCurrency} 0.00`;
  }

  document.getElementById("total-items").textContent = `Total (${totalItems} Items)`;
  document.getElementById("total-amount").textContent = `${userCurrency} ${totalAmount.toFixed(2)}`;
  document.getElementById("tax-amount").textContent = `${userCurrency} ${totalTaxAmount.toFixed(2)}`;
  document.getElementById("net-amount").textContent = `${userCurrency} ${netAmount.toFixed(2)}`;
};

const addNewItemToCart = (product , price) => {

  const newItem = {
    tableNo: tableNo,
    locationName: locationName,
    id: product._doc.item_no,
    name: product._doc.item_name,
    image: product._doc.item_image,
    price: price || product._doc.common_hall,
    quantity: 1,
    bill_no: billNo,
  };

  ipcRenderer.send("edit-bills-add-new-Item", newItem);
};

const removeItemFromCart = (productId, locationName, tableNo, billNo) => {
  try {
    if (cartItems.length == 1) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Cannot remove last item from cart',
        timer: 1000
      })
    }
    else {
      ipcRenderer.send(
        "delete-whole-billItem",
        productId,
        locationName,
        tableNo,
        billNo
      );
      location.reload(true);
      updateCartUI();
    }
  } catch (error) {
    console.log("Error removing item from cart:", error);
  }
};

const handleNewItemToBill = (productId, price, event) => {
  event.preventDefault();
  const quantityElement = document.getElementById(`quantity-${productId}`);
  if (quantityElement) {
    let quantity = parseInt(quantityElement.textContent);
    const product = apiProduct.find(
      (product) => product._doc.item_no == productId
    );
    if (product) {
      addNewItemToCart(product , price);
      quantity++;
    quantityElement.textContent = quantity;
    } else {
      console.error(`Product with ID '${productId}' not found.`);
    }
  } else {
    console.error(`Element with ID 'quantity-${productId}' not found.`);
  }
};

const handleDecrement = (productId, event) => {
  event.preventDefault();
  
  const quantityElement = document.getElementById(`quantity-${productId}`);
  const decrmentBtn = document.getElementById(`decrement-${productId}`);

  if (!quantityElement) {
    console.error(`Element with ID 'quantity-${productId}' not found.`);
    return;
  }

  let quantity = parseInt(quantityElement.textContent);

  if (isNaN(quantity)) {
    console.error(
      `Invalid quantity for product ID '${productId}': '${quantityElement.textContent}'`
    );
    return;
  }

  if (quantity <= 1 && cartItems.length === 1) {
    decrmentBtn.disabled = true;

    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Cannot remove last item from cart',
      timer: 1000
    })
    return;
  }

  const toUpdateData = {
    tableNo: tableNo,
    locationName: locationName,
    itemId: productId,
    newQuantity: quantity - 1,
    bill_no: billNo
  };

  ipcRenderer.send("update-bill-quantity", toUpdateData);

  quantityElement.textContent = quantity - 1;
  const updatedQtyItem = cartItems.find(
    (item) => item.item_no === productId
  );
  updatedQtyItem.quantity = quantity - 1;
  updateCartUI();
};

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.toLowerCase();
  const filteredProducts = apiProduct.filter((product) =>
    product._doc.item_name.toLowerCase().includes(searchText)
  );
  populateProducts(filteredProducts);
});


const getCartItemQuantity = (itemNo) => {
  const cartItem = cartItems.find((item) => item.item_no === itemNo);
  return cartItem ? cartItem.quantity : 0;
};

const populateProducts = (products, locationName) => {

  const productList = document.getElementById("search-product-list");
  productList.innerHTML = "";

  products.forEach((product) => {
    const currentLocation = Locations.find(loc => loc._doc.location_name == locationName);
    const locationPriceKey = currentLocation ?  "rate_"+ currentLocation._doc.location_price : "rate_one";


    let price;
    switch (locationPriceKey) {
      case "rate_one":
        price = product._doc.rate_one;
        break;
      case "rate_two":
        price = product._doc.rate_two;
        break;
      case "rate_three":
        price = product._doc.rate_three;
        break;
      case "rate_four":
        price = product._doc.rate_four;
        break;
      case "rate_five":
        price = product._doc.rate_five;
        break;
      case "rate_six":
        price = product._doc.rate_six;
        break;
      default:
        price = product._doc.rate_one;
    }
    const productElement = document.createElement("div");
    productElement.classList.add("product", "w-40", "bg-white", "shadow-md", "rounded-xl");
    productElement.innerHTML = `
      <a href="#">
        <div class="flex items-center justify-center p-2">
          <span class="w-16 h-16 border bg-primary rounded-full flex items-center justify-center" style="border:2px solid var(--common-color)">
            <p class="text-2xl">${product._doc.item_no}</p>
          </span>
        </div>
        <div class="px-4 pb-4 w-full product-info">
         <div class="flex justify-between items-center">
         <p class="text-sm font-normal w-16">${product._doc.item_name.split(" ").slice(0, 2).join(" ")}</p>
         <p class="text-sm text-black cursor-auto my-3">${userCurrency} ${price}</p>
         </div>
          <div class="flex items-center justify-center w-full">
            <div class="product-buttons flex gap-2 items-center justify-between">
              <button class="text-lg text-white rounded-md beautyBtn w-10 h-10 " onclick="handleNewItemToBill('${product._doc.item_no}', '${price}', event)">+</button>
              <button data-modal-target="quantityAddModal" data-modal-toggle="quantityAddModal" class="bg-primary text-black rounded-md w-10 h-10" id="quantity-${product._doc.item_no}">${getCartItemQuantity(product._doc.item_no)}</button>
              <button class="text-lg text-white rounded-md beautyBtn w-10 h-10 " id="decrement-${product._doc.item_no}" onclick="handleDecrement(${product._doc.item_no}, event)">-</button> 
            </div>
          </div>
        </div>
      </a>
    `;
    productList.appendChild(productElement);
  });
};

const renderBIllItems = (cartItems) => {
  const billItemsList = document.getElementById("product-list");
  billItemsList.innerHTML = "";

  cartItems.forEach((item) => {
    const productElement = document.createElement("div");
    productElement.classList.add("product", "w-40", "bg-white", "shadow-md", "rounded-xl");
    productElement.innerHTML = `
      <a href="#">
        <div class="flex items-center justify-center p-2">
          <span class="w-16 h-16 border bg-primary rounded-full flex items-center justify-center" style="border:2px solid var(--common-color)">
            <p class="text-2xl">${item.item_no}</p>
          </span>
        </div>
        <div class="px-4 pb-4 w-full product-info">
         <div class="flex justify-between items-center">
         <p class="text-sm font-normal w-16">${item.item_name.split(" ").slice(0, 2).join(" ")}</p>
         <p class="text-sm text-black cursor-auto my-3">${userCurrency} ${item.price}</p>
         </div>
          <div class="flex items-center justify-center w-full">
            <div class="product-buttons flex gap-2 items-center justify-between">
              <button class="text-lg text-white rounded-md beautyBtn w-10 h-10 " onclick="handleNewItemToBill('${item.item_no}','${item.price}', event)">+</button>
              <button data-modal-target="quantityAddModal" data-modal-toggle="quantityAddModal" class="bg-primary text-black rounded-md w-10 h-10" id="quantity-${item.item_no}">${getCartItemQuantity(item.item_no)}</button>
              <button class="text-lg text-white rounded-md beautyBtn w-10 h-10 " id="decrement-${item.item_no}" onclick="handleDecrement(${item.item_no}, event)">-</button> 
            </div>
          </div>
        </div>
      </a>
    `;
    billItemsList.appendChild(productElement);
  })
}



async function printBill() {
  let customerName = billData.customer_name ? billData.customer_name : "None";
  let customerGSTNo = billData.GST_no ? billData.GST_no : "None";
  let todaysDate = String(billData.created_at).split("T")[0];
  let discountPerc = billData.discount_perc ? billData.discount_perc : 0;

  let userTaxPercentage = 0;

  if (userPref._doc.is_gstAvailable) {
    userTaxPercentage = userPref._doc.gst_percentage / 100;
  }
  else if (userPref._doc.is_ValueAddedTaxAvailable) {
    userTaxPercentage = userPref._doc.vat_percentage / 100;
  }

  let sgstAmount = 0;
  let cgstAmount = 0;
  let vat_Amount = 0;

  if (userPref._doc.is_gstAvailable && userTaxPercentage > 0) {
    sgstAmount = userTaxPercentage / 2 * 100;
    cgstAmount = userTaxPercentage / 2 * 100;
  } else if (userPref._doc.is_ValueAddedTaxAvailable && userPref._doc.vat_percentage > 0) {
    vat_Amount = userTaxPercentage;
  }

  let productsInfo = "";
  let itemDetails = [];

  billData.item_details.forEach((item) => {
    const productNo = item.item_no;
    const productName = item.item_name;
    const sp_info = item.sp_info ? item.sp_info : "none";
    const quantity = item.quantity;
    const price = item.price;

    itemDetails.push({
      item_no: productNo,
      item_name: productName,
      sp_info: sp_info,
      quantity: quantity,
      price: price,
      totalAmount: quantity * price
    })

  });

  let totalAmount = 0;
  itemDetails.map((item) => {
    productsInfo += `
      <tr>
        <td align="left">${item.item_name} ${item.sp_info !== "none" ? " (" + item.sp_info + ")" : ""}</td>
        <td align="center">${item.quantity}</td>
        <td align="center">${parseFloat(item.price).toFixed(2)}</td>
        <td align="center">${parseFloat(item.totalAmount).toFixed(2)}</td>
      </tr>
    `
    totalAmount += item.totalAmount;
  })

  const discountAmount = (discountPerc / 100) * totalAmount;

  let netAmountWithDiscount = totalAmount - discountAmount;

  let totalTaxAmount = 0;
  if (sgstAmount > 0 || cgstAmount > 0) {
    const gstAmount = netAmountWithDiscount * (userTaxPercentage);
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
    roundOffValue = `-${(100 - decimalPart)}`;
  } else {
    roundOffValue = `${decimalPart}`;
  }

  const billContent = `
    <div style="padding: 5px; max-width: 270px; border: 1px solid #ccc;">
    <h1 style="font-size: 16px; text-align: center;"></h1>
    <p style="font-size: 13px; text-align: center;">
      MS ALI ROAD, GRANT ROAD EAST, MUMBAI<br>
      Ph. 9892446322
    </p>
    
    <div style="display: flex;">
      <div style="border: 1px solid #ccc; align-items: center; display: flex; justify-content: center; width: 100%; padding: 3px;">TAX INVOICE</div>
    </div>
    
      <div style="padding: 1px 1px; display: flex;flex-direction: column;">
      ${customerName !== "None" ? `<p style="margin:0">Bill To: <span style="font-weight:600">${customerName}</span></p>` : ''}
        ${customerGSTNo !== "None" ? `<p style="margin:0">Gst: <span style="font-weight:600">${customerGSTNo}</span></p>` : ''}
      </div>
      
      <div style="padding: 3px 1px; font-size: 15px; display: flex; justify-content: space-between;">
        <p style="margin:0">Bill-No: <span style="font-weight:600">${billNo}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; T.No: <span style="font-weight:600">${tableNo}</span></p>
      </div>

      <div style="border-bottom: 1px solid #ccc; padding: 3px 1px; font-size: 15px; display: flex; justify-content: space-between;">
        <p style="margin:0">Date: <span style="font-weight:600">${todaysDate}</span></p>
      </div>
      
      <table style="width: 100%; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc;">
      <thead>
        <tr>
          <th align="left" style="border-bottom: 1px solid #ccc;">Item</th>
          <th style="border-bottom: 1px solid #ccc;">Qty</th>
          <th style="border-bottom: 1px solid #ccc;">Rate</th>
          <th style="border-bottom: 1px solid #ccc;">Amt</th>
        </tr>
      </thead>
      <tbody>
        ${productsInfo}
      </tbody>
    </table>

      <div style="border-top: 1px solid #ccc; padding: 10px 1px; margin-bottom: 10px; border-bottom: 1px solid #ccc;">
        <div style="display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 5px;">
          <div>Total:</div>
          <div style="text-align: right;"> ${totalAmount.toFixed(2)}</div>
        </div>

        ${discountPerc !== 0 && discountAmount > 0
      ? `<div style="display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 5px;">
              <div>Discount ${discountPerc}%:</div>
              <div style="text-align: right;"> ${discountAmount.toFixed(2)}</div>
            </div>`
      : ""
    }
        
        ${cgstAmount > 0
      ? `<div style="display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 5px;">
              <div>CGST ${cgstAmount}%:</div>
              <div style="text-align: right;"> ${(totalTaxAmount / 2).toFixed(2)}</div>
            </div>`
      : ""
    }

        ${sgstAmount > 0
      ? `<div style="display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 5px;">
              <div>SGST ${sgstAmount}%:</div>
              <div style="text-align: right;"> ${(totalTaxAmount / 2).toFixed(2)}</div>
            </div>`
      : ""
    }

        ${vat_Amount > 0
      ? `<div style="display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 5px;">
              <div>VAT :</div>
              <div style="text-align: right;"> ${(totalTaxAmount).toFixed(2)}</div>
            </div>`
      : ""
    }
          <div style="display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 5px;">
          <div>Round Off:</div>
          <div style="text-align: right;">${roundOffValue}</div>
        </div>


        <div style="display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 5px;">
          <div style="font-size: 19px;">Net :</div>
          <div style="text-align: right; font-size: 19px;"> ${roundedNetAmount.toFixed(0)}</div>
        </div>
      </div>

      <p style="margin: 10px auto; width: 155px;">THANKS FOR VISIT</p>
    </div>`;

  let round_off_value = 0
  if (decimalPart < 50) {
    const roundOffNum = 100 - decimalPart;
    round_off_value = "-0." + roundOffNum.toFixed(0);
  } else {
    round_off_value = "0." + decimalPart.toFixed(0);
  }

  let updatedbillData = {
    bill_no: billData.bill_no,
    item_details: billData.item_details,
    final_amount: Math.round(netAmountWithDiscount),
    total_amount: totalAmount.toFixed(2),
    round_off: round_off_value,
  }

  try {
    ipcRenderer.send("updated-bill-info", updatedbillData);
    ipcRenderer.send("fetch-bill-by-billNo", billNo);
  } catch (err) {
    console.log(err)
  }

  const printWindow = window.open("", "_blank");
  printWindow.document.write("<html><head><title>Bill</title></head><body>");
  printWindow.document.write(billContent);
  printWindow.document.write("</body></html>");
  printWindow.document.close();
  printWindow.print();

}

const dublicateBillBtn = document.getElementById("duplicate-bill-btn");
dublicateBillBtn.addEventListener("click", printBill)

const updateDiscountBtn = document.getElementById("updateDiscountBtn");
updateDiscountBtn.addEventListener("click", () => {
  const userPreferences = JSON.parse(localStorage.getItem("userPreferences"));
  const discountPerc = document.getElementById("discountPercUpdate").value;
  const discountRupees = document.getElementById("discountAmountUpdate").value;
  const tax_perc = userPreferences._doc.is_gstAvailable ? userPreferences._doc.gst_percentage : 0;
  const vat_tax = userPreferences._doc.is_vatAvailable ? userPreferences._doc.vat_percentage : 0;

  if (discountPerc > 0) {
    ipcRenderer.send("update-bill-discount", billNo, discountPerc, tax_perc, vat_tax);
  }
  if (discountRupees > 0) {
    console.log("jii")
    ipcRenderer.send("update-bill-discount-rupee", billNo, discountRupees, tax_perc);
  }
  if (tax_perc > 0) {
    ipcRenderer.send("update-bill-discount", billNo, discountPerc, tax_perc, vat_tax);
  }
  if (vat_tax > 0) {
    ipcRenderer.send("update-bill-discount-vat", billNo, discountPerc, vat_tax);
  }
  ipcRenderer.send("fetch-bill-by-billNo", billNo);
})


