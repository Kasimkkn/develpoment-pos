const { default: Swal } = require("sweetalert2");
const UnsettledBilldatepicker = document.getElementById("UnsettledBilldatepicker");
let datesByPicker;
let unsettledBills = [];
let checkboxes;

document.addEventListener("DOMContentLoaded", () => {
    const todayDate = new Date().toISOString().slice(0, 10);

    UnsettledBilldatepicker.value = todayDate;
    const dateString = UnsettledBilldatepicker.value;
    const date = new Date(dateString)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    datesByPicker = `${year}-${month}-${day}`;

    fetchUnsettledBills(datesByPicker);
    ipcRenderer.once("unsettled-bills-data", (event, data) => {
        unsettledBills = data;
        renderUnsettledBills(data);
    });

    fetchPayModes();
});

UnsettledBilldatepicker.addEventListener("input", () => {
    const datesByPicker = UnsettledBilldatepicker.value;
    fetchUnsettledBills(datesByPicker);
    ipcRenderer.once("unsettled-bills-data", (event, data) => {
        unsettledBills = data;
        renderUnsettledBills(data);
    })
});

const fetchUnsettledBills = async (datesByPicker) => {
    try {
        ipcRenderer.send("fetch-unsettled-bills", datesByPicker);
        if (ipcRenderer.once("unsettled-bills-data", (event, data) => {
            unsettledBills = data;
            renderUnsettledBills(data);
        })) {
            renderUnsettledBills(unsettledBills);
        }
    }
    catch (error) {
        console.log(error);
    }
}

const renderUnsettledBills = (data) => {
    const unsettledBillsTable = document.getElementById("Unsettled-bills-table");
    unsettledBillsTable.innerHTML = "";

    data.forEach((sale) => {
        const tr = document.createElement("tr");
        tr.classList.add("bg-secondary", "border-b", "hover:bg-white");
        tr.innerHTML = `
        <td class="px-6 py-4">
        <div class="flex items-center checkbox-container">
            <input type="checkbox" class="w-4 h-4 bg-gray-100 rounded" data-bill-no="${sale._doc.bill_no}">
        </div>
    </td>
        <td class="px-6 py-4">
            ${sale._doc.bill_no}        
        </td>
        <td class="px-6 py-4">
                <div class="h-2.5 w-2.5 rounded-full me-2"></div> ${sale._doc.customer_name ? sale._doc.customer_name : 'no name'}
        </td>
        <td class="px-6 py-4">
                <div class="h-2.5 w-2.5 rounded-full me-2"></div> ${sale._doc.discount_perc ? sale._doc.discount_perc : 0}%
        </td>
        <td class="px-6 py-4">
                <div class="h-2.5 w-2.5 rounded-full me-2"></div> ${sale._doc.discount_rupees ? sale._doc.discount_rupees : 0}
        </td>
        <td class="px-6 py-4">
                <div class="h-2.5 w-2.5 rounded-full me-2"></div> ${sale._doc.round_off}
        </td>
        <td class="px-6 py-4">
                <div class="h-2.5 w-2.5 rounded-full me-2"></div> ${sale._doc.final_amount}
        </td>
    `;
        unsettledBillsTable.appendChild(tr);
        checkboxes = document.querySelectorAll('input[type="checkbox"]');
    });
};

let allBills = [];
const mainCheckbox = document.getElementById('checkbox-all-search');
mainCheckbox.addEventListener("click", () => {
    checkboxes.forEach((checkbox) => {
        checkbox.checked = mainCheckbox.checked;
        if (checkbox.checked == false) {
            allBills = [];
        }
        if (checkbox.checked == true) {
            allBills.push(checkbox.dataset.billNo);
        }
        checkbox.addEventListener("click", () => {
            if (checkbox.checked == false) {
                const index = allBills.findIndex(element => element == checkbox.dataset.billNo);
                allBills.splice(index, 1);
                if (allBills.length == 0) {
                    mainCheckbox.checked = false;
                }
            }
            if (checkbox.checked == true) {
                allBills.push(checkbox.dataset.billNo);
            }
        });
    });
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
                })
            })
            fetchUnsettledBills(datesByPicker);
            ipcRenderer.once("unsettled-bills-data", (event, data) => {
                unsettledBills = data;
                renderUnsettledBills(data);
            });
        }
        else {
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
            renderPayModes(payModes);
        });
    } catch (error) {
        console.error("Error fetching paymodes:", error);
    }
}

const renderPayModes = (payModes) => {
    console.log(payModes);
    const payModeList = document.getElementById("payModeList");
    payModeList.innerHTML = "";

    payModes.forEach((payMode) => {
        if (payMode._doc.status) {
            const li = document.createElement("li");
            li.innerText = payMode._doc.paymode_name.toUpperCase();
            li.classList.add("hover:underline", "text-xl", "text-common", "hover:text-black", "active:text-black");
            li.onclick = () => setPayMode(payMode._doc.paymode_name.toUpperCase());
            payModeList.appendChild(li);
        }
    });
}
