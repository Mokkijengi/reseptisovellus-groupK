let allRecipes = []; // Määritellään globaali muuttuja
let allUsers = []; // Määritellään globaali muuttuja

const userModalContent = {
  title: "User Modal",
  body: `
        <div class="search-container">
            <input
                type="text"
                id="user-search-bar"
                placeholder="Search users..."
                oninput="filterUsers()"
            >


        </div>
        <div class="admin-content-left-container-content">
            <table id="users-table">
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                </tr>
            </table>
        </div>
      `,
};

const recipeModalContent = {
  title: "Recipe Modal",
  body: `
        <div class="search-container">
            <input
                type="text"
                id="recipe-search-bar"
                placeholder="Search recipes..."
                oninput="filterRecipes()"
            >
        </div>
        <div class="admin-content-right-container-content">
            <table id="recipes-table">
                <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Actions</th>
                </tr>
            </table>
        </div>
      `,
};

document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Lataa globaalit headerit
    const response = await fetch("global-headers.html");
    const data = await response.text();
    const globalHeader = document.querySelector("#global-header");

    if (globalHeader) {
      globalHeader.innerHTML = data;

      // Muuttaa logon linkiksi
      const logo = globalHeader.querySelector("img");
      if (logo) {
        const linkWrapper = document.createElement("a");
        linkWrapper.href = "/userPage.html";
        logo.parentNode.insertBefore(linkWrapper, logo);
        linkWrapper.appendChild(logo);
      }
    } else {
      console.error("No element with ID 'global-header' found.");
    }
  } catch (error) {
    console.error("Error initializing page:", error);
  }

  // JWT-tokenin tarkistus
  const token = localStorage.getItem("token");
  console.log("Token in localStorage:", token);

  if (token) {
    try {
      const payloadBase64 = token.split(".")[1];
      const payloadJson = atob(payloadBase64);
      const decoded = JSON.parse(payloadJson);
      console.log("Decoded token:", decoded);

      if (decoded.role === "admin") {
        console.log("Admin detected!");
      } else {
        console.log("User is not admin, redirecting...");
        window.location.href = "/index.html";
      }
    } catch (err) {
      console.error("Error decoding token:", err);
      window.location.href = "/index.html";
    }
  } else {
    console.log("No token found, redirecting...");
    window.location.href = "/index.html";
  }
});
async function openUserDetails(userId) {
  try {
    const response = await fetch(`/userRoute/users/${userId}`); // Fetch user details
    if (!response.ok) throw new Error("Failed to fetch user details");

    const user = await response.json();

    // Open modal with an editable form
    document.getElementById("editUserModal").show(
      `Edit User: ${user.username}`,
      `
      <form id="editUserForm">
        <label for="editUsername">Username:</label>
        <input type="text" id="editUsername" value="${user.username}" required>

        <label for="editEmail">Email:</label>
        <input type="email" id="editEmail" value="${user.email}" required>

        <label for="editRole">Role:</label>
        <select id="editRole">
          <option value="user" ${
            user.user_role === "user" ? "selected" : ""
          }>User</option>
          <option value="admin" ${
            user.user_role === "admin" ? "selected" : ""
          }>Admin</option>
        </select>

        <button type="submit">Save Changes</button>
      </form>

      <script>
        document.getElementById("editUserForm").onsubmit = async function (event) {
          event.preventDefault(); // Prevent page reload

          const newRole = document.getElementById("editRole").value;

          // If changing role to admin, ask for confirmation
          if (newRole === "admin" && !confirm("Are you sure you want to change this user to an admin?")) {
            return; // Stop submission if user cancels
          }

          const updatedUser = {
            username: document.getElementById("editUsername").value,
            email: document.getElementById("editEmail").value,
            role: newRole,
          };

          try {
            const updateResponse = await fetch("/userRoute/users/${userId}", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedUser),
            });

            if (!updateResponse.ok) {
              throw new Error("Failed to update user");
            }

            alert("User updated successfully!");
            document.getElementById("editUserModal").hide(); // Close modal
            openUserModal.click(); // Refresh user list
          } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user.");
          }
        };
      </script>
      `
    );
  } catch (error) {
    console.error("Error fetching user details:", error);
    alert("Failed to load user details.");
  }
}

document.getElementById("openUserModal").addEventListener("click", async () => {
  // Get the custom modal and show it with title and body
  const modal = document.getElementById("userModal");
  modal.show(userModalContent.title, userModalContent.body);

  // Fetch and display users
  try {
    const usersResponse = await fetch("/userRoute/users");
    if (!usersResponse.ok) {
      throw new Error(`HTTP error! Status: ${usersResponse.status}`);
    }

    const users = await usersResponse.json();
    console.log("Fetched users:", users); // Debug

    if (!Array.isArray(users)) {
      throw new Error("Invalid response format: expected an array");
    }

    const usersTable = document.getElementById("users-table");
    usersTable.innerHTML = `
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      `; // Reset table headers

    users.forEach((user, index) => {
      const row = document.createElement("tr");

      const usernameCell = document.createElement("td");
      usernameCell.textContent = user.username;
      row.appendChild(usernameCell);

      const emailCell = document.createElement("td");
      emailCell.textContent = user.email;
      row.appendChild(emailCell);

      const roleCell = document.createElement("td");
      roleCell.textContent = user.user_role;
      row.appendChild(roleCell);

      const actionsCell = document.createElement("td");
      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.classList.add("button");
      editButton.onclick = () => {
        openUserDetails(user.id);
        console.log("Editing user:", user, user.id);
      };
      actionsCell.appendChild(editButton);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("button");
      deleteButton.onclick = () => {
        deleteUser(user.id);
      };
      actionsCell.appendChild(deleteButton);

      row.appendChild(actionsCell);
      usersTable.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }
});

document
  .getElementById("openRecipeModal")
  .addEventListener("click", async () => {
    const modal = document.getElementById("recipeModal");
    modal.show(recipeModalContent.title, recipeModalContent.body);
    // Lataa newUserPopup.js dynaamisesti

    try {
      const recipesResponse = await fetch("/recipeRoute/recipes");
      if (!recipesResponse.ok) {
        throw new Error(`HTTP error! Status: ${recipesResponse.status}`);
      }

      allRecipes = await recipesResponse.json(); // Tallenna data globaalisti
      console.log("Fetched recipes:", allRecipes); // Debug

      if (!Array.isArray(allRecipes)) {
        throw new Error("Invalid response format: expected an array");
      }

      populateRecipesTable(); // Uusi funktio taulukon täyttämiseen
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  });

function populateRecipesTable() {
  const recipesTable = document.getElementById("recipes-table");
  recipesTable.innerHTML = `
    <tr>
      <th>Title</th>
      <th>Author</th>
      <th>Actions</th>
    </tr>
  `;

  allRecipes.forEach((recipe, index) => {
    const row = document.createElement("tr");

    const titleCell = document.createElement("td");
    titleCell.textContent = recipe.title;
    row.appendChild(titleCell);

    const authorCell = document.createElement("td");
    authorCell.textContent = recipe.author;
    row.appendChild(authorCell);

    const actionsCell = document.createElement("td");
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("button");
    editButton.onclick = () => editRecipe(index);
    actionsCell.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("button", "delete-btn");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteRecipe(index);
    actionsCell.appendChild(deleteButton);

    row.appendChild(actionsCell);
    recipesTable.appendChild(row);
  });
}

// Käyttäjäfiltterin korjaus
function filterUsers() {
  const searchBar = document.getElementById("user-search-bar");
  const filter = searchBar.value.toLowerCase();
  const users = document.querySelectorAll("#users-table tr:not(:first-child)"); // Exclude header row
  users.forEach((user) => {
    const username = user
      .querySelector("td:nth-child(1)")
      .textContent.toLowerCase();
    user.style.display = username.includes(filter) ? "table-row" : "none";
  });
}

function filterRecipes() {
  const searchBar = document.getElementById("recipe-search-bar");
  const filter = searchBar.value.toLowerCase();
  const recipes = document.querySelectorAll(
    "#recipes-table tr:not(:first-child)"
  ); // Exclude header row
  recipes.forEach((recipe) => {
    const title = recipe
      .querySelector("td:nth-child(1)")
      .textContent.toLowerCase();
    recipe.style.display = title.includes(filter) ? "table-row" : "none";
  });
}

function deleteUser(userId) {
  const confirmDelete = confirm(
    `Are you sure you want to delete user with ID: ${userId}?`
  );
  if (!confirmDelete) return;

  fetch(`/userRoute/users/${userId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      return response.json();
    })
    .then(() => {
      alert("User deleted successfully!");
      openUserModal.click(); // Päivitetään sivu muutosten näkymiseksi
    })
    .catch((error) => console.error("Error deleting user:", error));
}
function editUser(userId) {
  const user = allUsers.find((user) => user.id === userId); // Find user by ID
  if (!user) {
    alert("User not found!");
    return;
  }

  // Get the modal element
  const editUserModal = document.getElementById("editUserModal");

  // Open the modal and set the content dynamically
  editUserModal.show(
    "Edit User",
    `
      <form id="editUserForm">
        <label for="editUsername">Username:</label>
        <input type="text" id="editUsername" value="${user.username}" required>

        <label for="editEmail">Email:</label>
        <input type="email" id="editEmail" value="${user.email}" required>

        <label for="editRole">Role:</label>
        <select id="editRole">
          <option value="user" ${
            user.user_role === "user" ? "selected" : ""
          }>User</option>
          <option value="admin" ${
            user.user_role === "admin" ? "selected" : ""
          }>Admin</option>
        </select>

        <button type="submit">Save Changes</button>
      </form>

      <script>
        document.getElementById("editUserForm").onsubmit = async function (event) {
          event.preventDefault(); 
          const confirmDelete = confirm(
    "Are you sure you want to change role to admin?"
  );
  if (!confirmDelete) return;

          const updatedUser = {
            username: document.getElementById("editUsername").value,
            email: document.getElementById("editEmail").value,
            role: document.getElementById("editRole").value,
          };
          

          try {
            const response = await fetch("/userRoute/users/${userId}", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedUser),
            });

            if (!response.ok) {
              throw new Error("Failed to update user");
            }

            alert("User updated successfully!");
            document.getElementById("editUserModal").hide(); // Close modal
            openUserModal.click(); // Refresh user list
          } catch (error) {
            console.error("Error updating user:", error);
          }
        };
      </script>
    `
  );
}

//Muokkaus
function editRecipe(index) {
  const recipe = allRecipes[index];

  const newTitle = prompt("Enter new title:", recipe.title);
  const newIngredients = prompt("Enter new ingredients:", recipe.ingredients);
  const newInstructions = prompt(
    "Enter new instructions:",
    recipe.instructions
  );

  if (!newTitle || !newIngredients || !newInstructions) {
    alert("All fields must be filled!");
    return;
  }

  fetch(`/recipeRoute/recipes/${recipe.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: newTitle,
      ingredients: newIngredients,
      instructions: newInstructions,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update recipe");
      }
      return response.json();
    })
    .then(() => {
      alert("Recipe updated successfully!");
      allRecipes[index].title = newTitle;
      allRecipes[index].ingredients = newIngredients;
      allRecipes[index].instructions = newInstructions;
      openRecipeModal.click(); // Päivitetään sivu muutosten näkymiseksi
    })
    .catch((error) => console.error("Error updating recipe:", error));
}

//Poisto
function deleteRecipe(index) {
  const recipe = allRecipes[index]; // Käytetään allRecipes-taulukkoa

  const confirmDelete = confirm(
    `Are you sure you want to delete recipe: ${recipe.title}?`
  );

  if (confirmDelete) {
    fetch(`/recipeRoute/recipes/${recipe.id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete recipe");
        }
        return response.json();
      })
      .then(() => {
        alert("Recipe deleted successfully!");
        allRecipes.splice(index, 1); // Poistetaan resepti oikeasta taulukosta
        //   openRecipeModal.click(); // Päivitetään sivu muutosten näkymiseksi
        //location.reload();
        openRecipeModal.click(); // Päivitetään sivu muutosten näkymiseksi
      })
      .catch((error) => console.error("Error deleting recipe:", error));
  }
}

function goToUserSite() {
  alert("Navigating to user site...");
  window.location.href = "/userPage.html"; // Replace with the correct URL
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/index.html";
}
