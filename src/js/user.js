
const  Swal  = require("sweetalert2");
let apiUser = [];
function closeModal() {
  const editModal = document.getElementById("edituserModal");
  editModal.classList.add("hidden");

  const newItemModal = document.getElementById("addNewuserModal");
  newItemModal.classList.add("hidden");
}

function openEditModal(userId) {
  const user = apiUser.find((user) => user._doc.user_no === userId);

  document.getElementById("first_name").value = user._doc.first_name;
  document.getElementById("last_name").value = user._doc.last_name;
  document.getElementById("user_id").value = user._doc.user_id;
  document.getElementById("password").value = user._doc.password;
  document.getElementById("user_role").value = user._doc.user_role;
  document.getElementById("status").value = user._doc.status;

  const edituserModal = document.getElementById("edituserModal");
  edituserModal.classList.remove("hidden");
  edituserModal.classList.add("flex");
  edituserModal.dataset.userId = userId;
}

const edituserHandler = async () => {
  const userId = document.getElementById("edituserModal").dataset.userId;

  try {
    const userData = {
      firstName: document.getElementById("first_name").value,
      lastName: document.getElementById("last_name").value,
      userId: document.getElementById("user_id").value,
      Password: document.getElementById("password").value,
      Role: document.getElementById("user_role").value,
      isActive: document.getElementById("status").value,
    };
    ipcRenderer.send("edit-user", userId, userData);

    const edituserModal = document.getElementById("edituserModal");
    edituserModal.classList.add("hidden");
    edituserModal.classList.remove("flex");
    fetchuser();
  } catch (error) {
    console.error("Error editing item:", error);
  }
};

const newuserHandler = () => {
  try {
    const newFirstNameInput = document.getElementById("new_first_name").value;
    const newLastNameInput = document.getElementById("new_last_name").value;
    const newUserIdInput = document.getElementById("new_user_id").value;
    const newPasswordInput = document.getElementById("new_user_password").value;
    const newMobileInput = document.getElementById("new_mobile_no").value;
    const newRoleInput = document.getElementById("new_user_role").value;
    const newStatusInput = document.getElementById("new_status").value;

   if(newFirstNameInput == "" || newLastNameInput == "" || newUserIdInput == "" || newPasswordInput == "" ||newMobileInput == "" || newRoleInput == "" || newStatusInput == "") {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'All fields are required!',
      timer: 1000
    })
    setTimeout(() => {
      location.reload(true);
    },1000)
   }
    const userData = {
      firstName: newFirstNameInput,
      lastName: newLastNameInput,
      userId: newUserIdInput,
      newPassword: newPasswordInput,
      newMobile: newMobileInput,
      newRole: newRoleInput,
      isActive: newStatusInput,
    };

    ipcRenderer.send("new-user", userData);

    const addNewuserModal = document.getElementById("addNewuserModal");
    addNewuserModal.classList.add("hidden");
    addNewuserModal.classList.remove("flex");
    location.reload(true);
    fetchuser();
  } catch (error) {
    ipcRenderer.on("new-user-error", (event, error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error,
          timer:1000,
        })
        setTimeout(() => {
          location.reload(true);
        },1000)
      })
  }
};

const searchInput = document.getElementById("table_search_item");

searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.toLowerCase();
  const filteredProducts = apiUser.filter((user) =>
    user._doc.first_name.toLowerCase().includes(searchText)
  );
  renderUser(filteredProducts);
});

const userFilterDropdown = document.getElementById("userFilterDropdown");
userFilterDropdown.addEventListener("change", (event) => {
  const selecteduser = event.target.value;
  if (selecteduser === "0") {
    renderUser(apiUser);
  } else {
    const filteredProducts = apiUser.filter(
      (user) => user._doc.user_role === selecteduser
    );
    renderUser(filteredProducts);
  }
});

const renderDropdown = (users) => {
  userFilterDropdown.innerHTML = "";
  const allusersOption = document.createElement("option");
  allusersOption.textContent = "All users";
  allusersOption.value = "0";
  userFilterDropdown.appendChild(allusersOption);

  const uniqueRoles = new Set(users.map((user) => user._doc.user_role));

  uniqueRoles.forEach((user) => {
    const option = document.createElement("option");
    option.textContent = user;
    option.value = user;
    userFilterDropdown.appendChild(option);
  });
};

const renderUser = (users) => {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  users.forEach((user) => {
    const tr = document.createElement("tr");
    tr.classList.add("bg-secondary", "border-b", "hover:bg-primary");

    tr.innerHTML = `
<td scope="row" class="flex items-center px-6 py-4 text-black whitespace-nowrap">
  <div class="px-6 py-4">
    <div class="max-md:text-xs">${user._doc.user_no}</div>
  </div>
</td>
<td class="px-6 py-4">
    <div class="max-md:text-xs">${user._doc.first_name}</div>
    <div class="max-md:text-xs">ID : ${user._doc.user_id}</div>
    </td>
<td class="px-6 py-4">
    
    <div class="max-md:text-xs">${user._doc.user_role}</div>
    <div class="max-md:text-xs ${user._doc.status ? "bg-green-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded" : "bg-pink-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded"
      }">${user._doc.status ? "Active" : "Inactive"}</div>
    </td>
<td class="px-6 py-4">
  <button type="button" 
  onClick="openEditModal(${user._doc.user_no})"
  data-modal-target="edituserModal" data-modal-show="edituserModal"
      class="inline-flex items-center justify-between rounded-md text-sm  h-10 px-4 py-2 w-max mb-2 max-md:text-xs">
          <svg fill="var(--common-color)" height="25px" width="25px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 348.882 348.882" xml:space="preserve">
<g>
	<path d="M333.988,11.758l-0.42-0.383C325.538,4.04,315.129,0,304.258,0c-12.187,0-23.888,5.159-32.104,14.153L116.803,184.231
		c-1.416,1.55-2.49,3.379-3.154,5.37l-18.267,54.762c-2.112,6.331-1.052,13.333,2.835,18.729c3.918,5.438,10.23,8.685,16.886,8.685
		c0,0,0.001,0,0.001,0c2.879,0,5.693-0.592,8.362-1.76l52.89-23.138c1.923-0.841,3.648-2.076,5.063-3.626L336.771,73.176
		C352.937,55.479,351.69,27.929,333.988,11.758z M130.381,234.247l10.719-32.134l0.904-0.99l20.316,18.556l-0.904,0.99
		L130.381,234.247z M314.621,52.943L182.553,197.53l-20.316-18.556L294.305,34.386c2.583-2.828,6.118-4.386,9.954-4.386
		c3.365,0,6.588,1.252,9.082,3.53l0.419,0.383C319.244,38.922,319.63,47.459,314.621,52.943z"/>
	<path d="M303.85,138.388c-8.284,0-15,6.716-15,15v127.347c0,21.034-17.113,38.147-38.147,38.147H68.904
		c-21.035,0-38.147-17.113-38.147-38.147V100.413c0-21.034,17.113-38.147,38.147-38.147h131.587c8.284,0,15-6.716,15-15
		s-6.716-15-15-15H68.904c-37.577,0-68.147,30.571-68.147,68.147v180.321c0,37.576,30.571,68.147,68.147,68.147h181.798
		c37.576,0,68.147-30.571,68.147-68.147V153.388C318.85,145.104,312.134,138.388,303.85,138.388z"/>
</g>
</svg>
  </button>
</td>
`;

    tbody.appendChild(tr);
  });
};

const fetchuser = () => {
  ipcRenderer.send("fetch-user");
};

ipcRenderer.on("user-data", (event, userData) => {
  apiUser = userData;
  renderDropdown(apiUser);
  renderUser(apiUser);
});

document.addEventListener("DOMContentLoaded", () => {
  fetchuser();
  renderUser(apiUser);
  renderDropdown(apiUser);
});
