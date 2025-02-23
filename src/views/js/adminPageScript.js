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
            <button class="button" id="userSearchButton" onclick="searchUsers()">Search Now</button>
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
            <button class="button" id="recipeSearchButton" onclick="searchRecipes()">Search Now</button>
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

    users.forEach((user) => {
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
      editButton.onclick = () => editUser(user.id);
      actionsCell.appendChild(editButton);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("button");
      deleteButton.onclick = () => deleteUser(user.id);
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
    // Get the custom modal and show it with title and body
    const modal = document.getElementById("recipeModal");
    modal.show(recipeModalContent.title, recipeModalContent.body);

    // Fetch and display recipes
    try {
      const recipesResponse = await fetch("/recipeRoute/recipes");
      if (!recipesResponse.ok) {
        throw new Error(`HTTP error! Status: ${recipesResponse.status}`);
      }

      const recipes = await recipesResponse.json();
      console.log("Fetched recipes:", recipes); // Debug

      if (!Array.isArray(recipes)) {
        throw new Error("Invalid response format: expected an array");
      }

      const recipesTable = document.getElementById("recipes-table");
      recipesTable.innerHTML = `
        <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Actions</th>
        </tr>
      `; // Reset table headers

      recipes.forEach((recipe) => {
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
        editButton.onclick = () => editRecipe(recipe.id);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("button");
        deleteButton.onclick = () => deleteRecipe(recipe.id);
        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);
        recipesTable.appendChild(row);
      });
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  });

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
        linkWrapper.href = "/users.html";
        logo.parentNode.insertBefore(linkWrapper, logo);
        linkWrapper.appendChild(logo);
      }
    } else {
      console.error("No element with ID 'global-header' found.");
    }
  } catch (error) {
    console.error("Error initializing page:", error);
  }
});

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

function editUser(userId) {
  alert(`Editing user with ID: ${userId}`);
  // Implement edit user functionality
}

function deleteUser(userId) {
  const confirmDelete = confirm(
    `Are you sure you want to delete user with ID: ${userId}?`
  );
  if (confirmDelete) {
    alert(`Deleting user with ID: ${userId}`);
    // Implement delete user functionality
  }
}

function editRecipe(recipeId) {
  alert(`Editing recipe with ID: ${recipeId}`);
  // Implement edit recipe functionality
}

function deleteRecipe(recipeId) {
  const confirmDelete = confirm(
    `Are you sure you want to delete recipe with ID: ${recipeId}?`
  );
  if (confirmDelete) {
    alert(`Deleting recipe with ID: ${recipeId}`);
    // Implement delete recipe functionality
  }
}
