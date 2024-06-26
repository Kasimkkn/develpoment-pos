const { default: Swal } = require("sweetalert2");
const UnsettledBilldatepicker = document.getElementById("UnsettledBilldatepicker");
let datesByPicker;
let unsettledBills = [];
let checkboxes;
let apiPayModes = [];
let allBills = [];
const mainCheckbox = document.getElementById('checkbox-all-search');

document.addEventListener("DOMContentLoaded", () => {
    const todayDate = new Date().toISOString().slice(0, 10);

    UnsettledBilldatepicker.value = todayDate;
    const dateString = UnsettledBilldatepicker.value;
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    datesByPicker = `${year}-${month}-${day}`;

    fetchUnsettledBills(datesByPicker);
    ipcRenderer.once("unsettled-bills-data", (event, data) => {
        unsettledBills = JSON.parse(data);
        renderUnsettledBills(unsettledBills);
    });

    fetchPayModes();
});

UnsettledBilldatepicker.addEventListener("input", () => {
    const datesByPicker = UnsettledBilldatepicker.value;
    fetchUnsettledBills(datesByPicker);
    ipcRenderer.once("unsettled-bills-data", (event, data) => {
        unsettledBills = JSON.parse(data);
        renderUnsettledBills(unsettledBills);
    });
});

const fetchUnsettledBills = async (datesByPicker) => {
    try {
        ipcRenderer.send("fetch-unsettled-bills", datesByPicker);
        ipcRenderer.once("unsettled-bills-data", (event, data) => {
            unsettledBills = JSON.parse(data);
            renderUnsettledBills(unsettledBills);
        });
    } catch (error) {
        console.log(error);
    }
};

const renderUnsettledBills = (data) => {
    const unsettledBillsTable = document.getElementById("Unsettled-bills-table");
    unsettledBillsTable.innerHTML = "";
    console.log(data)
    data.forEach((sale) => {
        const tr = document.createElement("tr");
        tr.classList.add("bg-secondary", "border-b", "hover:bg-white");
        tr.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center checkbox-container">
                    <input type="checkbox" class="w-4 h-4 bg-gray-100 rounded" data-bill-no="${sale.bill_no}">
                </div>
            </td>
            <td class="px-6 py-4">${sale.bill_no}</td>
            <td class="px-6 py-4">${sale.customer_name ? sale.customer_name : 'no name'}</td>
            <td class="px-6 py-4">${sale.discount_perc ? sale.discount_perc : 0}%</td>
            <td class="px-6 py-4">${sale.discount_rupees ? sale.discount_rupees : 0}</td>
            <td class="px-6 py-4">${sale.round_off}</td>
            <td class="px-6 py-4">${sale.final_amount}</td>
        `;
        unsettledBillsTable.appendChild(tr);
    });

    checkboxes = document.querySelectorAll('input[type="checkbox"]');
    attachCheckboxListeners();
};

const attachCheckboxListeners = () => {
    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("click", () => {
            console.log("i clicked")
            if (checkbox.checked) {
                allBills.push(checkbox.dataset.billNo);
            } 
            else {
                const index = allBills.indexOf(checkbox.dataset.billNo);
                if (index > -1) {
                    allBills.splice(index, 1);
                }
            }
            if (allBills.length === 1 || allBills.length <= 1 ) {
                singleBillPayUi(allBills[0], apiPayModes);
            }
            else if(allBills.length > 1) {
                singleBillPayUi(false, apiPayModes);
            }
        });
    });
};

mainCheckbox.addEventListener("click", () => {
    allBills = [];
    checkboxes.forEach((checkbox) => {
        checkbox.checked = mainCheckbox.checked;
        if (mainCheckbox.checked) {
            allBills.push(checkbox.dataset.billNo);
        }
    });

    if (allBills.length === 1) {
        singleBillPayUi(allBills[0], apiPayModes);
    }
});

function setPayMode(paymodeType) {
    try {
        if (allBills.length > 1) {
            allBills.shift();
            ipcRenderer.send("set-paymode", allBills, paymodeType);
            ipcRenderer.on("set-paymode-success", (event, data) => {
                Swal.fire({
                    icon: 'success',
                    title: data,
                    showConfirmButton: false,
                    timer: 1250
                });
            });
            fetchUnsettledBills(datesByPicker);
            ipcRenderer.once("unsettled-bills-data", (event, data) => {
                unsettledBills = JSON.parse(data);
                renderUnsettledBills(unsettledBills);
            });
        } else {
            let checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
            if (checkedBoxes.length > 0) {
                checkedBoxes.forEach(checkbox => {
                    ipcRenderer.send("set-single-paymode", checkbox.dataset.billNo, paymodeType);
                    ipcRenderer.on("set-paymode-success", (event, data) => {
                        Swal.fire({
                            icon: 'success',
                            title: data,
                            showConfirmButton: false,
                            timer: 1250
                        });
                        setTimeout(() => {
                            location.reload();
                        }, 1250);
                    });
                });
            }
        }
    } catch (error) {
        console.log(error);
    }
}

// Fetch and render pay modes dynamically
const fetchPayModes = async () => {
    try {
        ipcRenderer.send("fetch-paymode");
        ipcRenderer.on("paymode-data", (event, payModes) => {
            apiPayModes = payModes;
            renderPayModes(payModes);
        });
    } catch (error) {
        console.error("Error fetching paymodes:", error);
    }
};

const renderPayModes = (payModes) => {
    const payModeList = document.getElementById("payModeList");
    payModeList.innerHTML = "";

    payModes.forEach((payMode) => {
        if (payMode._doc.status) {
            const li = document.createElement("li");
            li.innerText = "ALL" + " " + payMode._doc.paymode_name.toUpperCase();
            li.classList.add("border","border-common","rounded-lg","p-1", "text-common",);
            li.onclick = () => setPayMode(payMode._doc.paymode_name.toUpperCase());
            payModeList.appendChild(li);
        }
    });
};

const settleOneBill = (billNo) => {
    const selected_record = unsettledBills.filter((bill) => bill.bill_no == billNo);
    const totalAmount = selected_record[0].final_amount;

    let splitPayments = [];
    document.querySelectorAll(`input[name="billAmt"]`).forEach((input, index) => {
        const value = parseFloat(input.value);
        if (value > 0) {
            splitPayments.push({
                paymode: apiPayModes[index]._doc.paymode_name,
                amount: value
            });
        }
    });

    if (splitPayments.length > 0) {
        ipcRenderer.send("set-split-paymode", billNo, splitPayments);
        ipcRenderer.on("set-split-paymode-success", (event, data) => {
            Swal.fire({
                icon: 'success',
                title: data,
                showConfirmButton: false,
                timer: 1250
            });
            setTimeout(() => {
                location.reload();
            }, 1250);
        });
    }
};


const singleBillPayUi = (billNo, apiPayModes) => {
    const singleSplitUi = document.getElementById("singleSplitUi");
    if(billNo === false){
        singleSplitUi.style.display = "none";
        singleSplitUi.classList.add("hidden");
        // return;
    }
    else{
        singleSplitUi.style.display = "flex";
        const selected_record = unsettledBills.filter((bill) => bill.bill_no == billNo);
        singleSplitUi.innerHTML = "";
        const ui = `
        <div class="px-2 py-1 flex flex-col gap-1">
            <div class="flex justify-between py-2">
                <span>Total Amount :</span>
                <span id="total-${billNo}">${selected_record[0].final_amount}</span>
            </div>
            ${apiPayModes.map((paymode, index) => `
                <div key=${index}>
                    <ul class="flex justify-between">
                        <label 
                        class="hover:underline text-xl text-common hover:text-black active:text-black hover:cursor-pointer"
                        for="billAmt-${index}" onclick="handleAmount(${index}, '${paymode._doc.paymode_name}', '${billNo}')">
                            ${paymode._doc.paymode_name}
                        </label>
                        <input style="width: 50%;" id="billAmt-${index}" name="billAmt" type="number" oninput="handleAmountChange(${index}, this.value, '${paymode._doc.paymode_name}', '${billNo}')">
                    </ul>
                </div>
            `).join('')}
            <div>
                <button 
                class="border border-common rounded-lg p-1 text-common hover:bg-secondary hover:text-white hover:cursor-pointer"
                onclick="settleOneBill('${billNo}')">Settle Bill</button>
            </div>
        </div>
    `;
    singleSplitUi.innerHTML = ui;
    }
};

const handleAmount = (index, paymodeName, billNo) => {
    console.log(index, paymodeName);
    const selected_record = unsettledBills.filter((bill) => bill.bill_no == billNo);
    const totalAmount = document.getElementById(`total-${billNo}`);
    const inputElement = document.getElementById(`billAmt-${index}`);
    const currentValue = parseFloat(totalAmount.innerText);

    inputElement.value = currentValue.toFixed(2);
    totalAmount.innerText = "0.00";
};


const handleAmountChange = (index, value, paymodeName, billNo) => {
    console.log(index, value, paymodeName);
    const totalAmount = document.getElementById(`total-${billNo}`);
    const selected_record = unsettledBills.filter((bill) => bill.bill_no == billNo);
    
    let remainingAmount = selected_record[0].final_amount;
    document.querySelectorAll(`input[name="billAmt"]`).forEach(input => {
        if (input.value) {
            remainingAmount -= parseFloat(input.value);
        }
    });
    totalAmount.innerText = remainingAmount.toFixed(2);
};

