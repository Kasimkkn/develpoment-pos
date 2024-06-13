
const  Swal  = require("sweetalert2");

let apiUserRights = [];
function closeModal() {
  const edituserRightsModal = document.getElementById("edituserRightsModal");
  edituserRightsModal.classList.add("hidden");

  const userRightsModal = document.getElementById("userRightsModal");
  userRightsModal.classList.add("hidden");
}


const renderUserRightsOptions = (user) => {
  const UserRigthsOptions = document.getElementById("UserRigthsOptions")
  UserRigthsOptions.innerHTML = "";

  Object.entries(user._doc).forEach(([key, value]) => {
    if (typeof value === 'boolean' && key !== 'user_no' && key !== 'first_name' && key !== 'is_synced') {
      const displayName = key.replace(/_/g, " ");
      const statusSymbol = value ? "✅" : "❌";
      const optionContainer = document.createElement("div");
      optionContainer.classList.add("flex", "items-center", "gap-3");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = key;
      checkbox.id = key;
      if(statusSymbol == "✅"){
        checkbox.checked = true;
      }
      checkbox.name = "user_rights_options";
      optionContainer.appendChild(checkbox);

      const label = document.createElement("label");
      label.textContent = displayName; 
      label.setAttribute("for", key);
      optionContainer.appendChild(label);

      const status = document.createElement("span");
      status.textContent = statusSymbol;
      optionContainer.appendChild(status);

      UserRigthsOptions.appendChild(optionContainer);
    }
  });
}

function openEditUserRightsModal(userId) {
  const user = apiUserRights.find((user) => user._doc.user_no === userId);

  document.getElementById("first_name").value = user._doc.first_name;
  renderUserRightsOptions(user);

  const edituserRightsModal = document.getElementById("edituserRightsModal");
  edituserRightsModal.classList.remove("hidden");
  edituserRightsModal.classList.add("flex");
  edituserRightsModal.dataset.userId = userId;
}

const edituserRightsHandler = async () => {
  const userId = document.getElementById("edituserRightsModal").dataset.userId;

  try {
    const userRightsOptions = Array.from(document.querySelectorAll('input[name="user_rights_options"]:checked')).map(checkbox => checkbox.value);
    const userData = {
        ...userRightsOptions.reduce((acc, option) => {
            acc[option] = true;
            return acc;
        }, {})
    };
    ipcRenderer.send("edit-user-rights", userId, userData);

    const edituserRightsModal = document.getElementById("edituserRightsModal");
    edituserRightsModal.classList.add("hidden");
    edituserRightsModal.classList.remove("flex");
    fetchuser();
  } catch (error) {
    console.error("Error editing item:", error);
  }
};

const renderUserDropown = (userData) => {
    const userName = document.getElementById("new_first_name");
    userName.innerHTML = "";
    userData.forEach((user) => {
        // const userAlreadyExisits = apiUserRights.find((u) => u._doc.user_no == user._doc.user_no);
        // console.log(userAlreadyExisits)
        // if(userAlreadyExisits){
        //   console.log("User already exisits")
        //   return
        // }
        const option = document.createElement("option");
        option.value = `${user._doc.user_no} ${user._doc.first_name}`;
        option.textContent = user._doc.first_name;
        userName.appendChild(option);
    })
}

ipcRenderer.send("fetch-user");

ipcRenderer.on("user-data" , (event, data) => {
   renderUserDropown(data)
   renderDropdown(data);
});

const renderUserOptions = (userData) => {
    const userOptions = document.getElementById("UserOptions");
    userOptions.innerHTML = "";

    if (!userData || userData.length === 0) {
        console.error("No user data provided.");
        return;
    }

    const user = userData[0]._doc; 
    const userRights = Object.keys(user).filter(key => typeof user[key] === 'boolean' && key !== 'user_no' && key !== 'first_name' && key !== 'is_synced');

    userRights.forEach(right => {
        const optionContainer = document.createElement("div");
        optionContainer.classList.add("flex", "items-center" , "gap-3");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = right;
        checkbox.id = right;
        checkbox.name = "user_rights";
        optionContainer.appendChild(checkbox);

        const label = document.createElement("label");
        label.textContent = right.replace(/_/g, " "); // Convert underscore to space for display
        label.setAttribute("for", right);
        optionContainer.appendChild(label);

        userOptions.appendChild(optionContainer);
    });
};

const userRightsModalOpen = (userNo) => {
    const userRightsModal = document.getElementById("userRightsModal");
    userRightsModal.classList.remove("hidden");
    userRightsModal.classList.add("flex");
    const userRightsModalBody = document.getElementById("userRightsModalBody");
  
    const user = apiUserRights.find((user) => user._doc.user_no == userNo);
  
    const userRightsModalTitle = document.getElementById("userRightsModalTitle");
    userRightsModalTitle.innerHTML = `User Rights: ${user._doc.first_name} ${user._doc.last_name}`;
    
    const rightsHTML = Object.entries(user._doc).map(([key, value]) => {
      if (typeof value === 'boolean' && key !== 'user_no' && key !== 'first_name' && key !== 'is_synced') {
        const displayName = key.replace(/_/g, " "); 
        const statusSymbol = value ? "✅" : "❌";
        return `<span class="font-bold w-max flex items-center">${displayName}: ${statusSymbol}</span>`;
      }
      return ''; 
    }).join("");
  
    userRightsModalBody.innerHTML = `${rightsHTML}`;
  };
    
  const newUserRightsHandler = () => {
    try {
        const newUser = document.getElementById("new_first_name").value;
        const newUserNo = newUser.split(" ")[0];
        const newUserName = newUser.split(" ")[1];

        const userRightsOptions = Array.from(document.querySelectorAll('input[name="user_rights"]:checked')).map(checkbox => checkbox.value);
        
        if (newUserNo === "" || userRightsOptions.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'All fields are required!',
                timer: 1000
            });

            return;
        }

        const userData = {
            user_no: newUserNo,
            first_name: newUserName,
            ...userRightsOptions.reduce((acc, option) => {
                acc[option] = true;
                return acc;
            }, {})
        };

        ipcRenderer.send("new-user-right", userData);

        const newUserRightsModal = document.getElementById("newUserRightsModal");
        newUserRightsModal.classList.add("hidden");
        newUserRightsModal.classList.remove("flex");
        window.location.reload(true);
        fetchuser();
    } catch (error) {
        ipcRenderer.on("new-user-error", (event, error) => {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error,
                timer: 1000,
            });
            setTimeout(() => {
                location.reload(true);
            }, 1000);
        });
    }
};


const searchInput = document.getElementById("table_search_item");

searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.toLowerCase();
  const filteredUser = apiUserRights.filter((user) =>
    user._doc.first_name.toLowerCase().includes(searchText)
  );
  renderUser(filteredUser);
});

const userFilterDropdown = document.getElementById("userFilterDropdown");
userFilterDropdown.addEventListener("change", (event) => {
  const selecteduser = event.target.value;
  if (selecteduser === "0") {
    renderUser(apiUserRights);
  } else {
    const filteredUser = apiUserRights.filter(
      (user) => user._doc.user_role === selecteduser
    );
    renderUser(filteredUser);
  }
});

const renderDropdown = (users) => {
  userFilterDropdown.innerHTML = "";
  const allusersOption = document.createElement("option");
  allusersOption.textContent = "All users";
  allusersOption.value = "0";
  userFilterDropdown.appendChild(allusersOption);

  users.forEach((user) => {
    const option = document.createElement("option");
    option.textContent = user._doc.first_name + " " + user._doc.last_name;
    option.value = user._doc.user_no;
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
    </td>
<td class="px-6 py-4">
<button type="button" 
onClick="userRightsModalOpen(${user._doc.user_no})"
data-modal-target="userRightsModal" data-modal-show="userRightsModal"
class="inline-flex items-center justify-between rounded-md text-sm  h-10 px-4 py-2 w-max mb-2 beautyBtn text-white">
 User Rights</button>
<td class="px-6 py-4">
  <button type="button" 
  onClick="openEditUserRightsModal(${user._doc.user_no})"
  data-modal-target="edituserRightsModal" data-modal-show="edituserRightsModal"
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
  ipcRenderer.send("fetch-user-rights");
};

ipcRenderer.on("fetch-user-rights-data", (event, userData) => {
  apiUserRights = userData;
  renderUser(apiUserRights);
  renderUserOptions(apiUserRights);
});

document.addEventListener("DOMContentLoaded", () => {
  fetchuser();
  renderDropdown(apiUserRights);
  renderUserOptions(apiUserRights);
});
