document.addEventListener("DOMContentLoaded", async () => {
  const ownTable = document.getElementById("own-recipes-table");
  const addRecipeButton = document.getElementById("add-recipe-btn");
  const logoutButton = document.getElementById("logoutButton");
  const modal = document.getElementById("customModal");

  let ownRecipes = [];
  let userId = null;

  fetch("global-headers.html")
    .then((response) => response.text())
    .then((data) => {
      const globalHeader = document.querySelector("#global-header");
      if (globalHeader) {
        globalHeader.innerHTML = data;
      } else {
        console.error("No element with ID 'global-header' found.");
      }
    })
    .catch((error) => console.error("Error loading global header:", error));


  // Hae token localStoragesta tai sessionStoragesta
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    console.error("User token not found!");
    alert("You are not logged in. Please log in first.");
    window.location.href = "/";
    return;
  }

  // Logout-toiminnallisuus
  function logout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    alert("You have been logged out.");
    window.location.href = "/";
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }
  if (token) {
    logoutButton.style.display = "block";
  } else {
    logoutButton.style.display = "none";
  }
  

  // Haetaan kirjautuneen käyttäjän tiedot ja päivitetään userId
  async function fetchUser() {
    try {
      const response = await fetch("/userRoute/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Käyttäjän tietojen haku epäonnistui!");

      const userData = await response.json();
      userId = userData.id; // Tallennetaan käyttäjän ID

      console.log(`🔹 Kirjautunut käyttäjä: ID ${userId}, ${userData.username}`);
      await fetchOwnRecipes(); // Haetaan käyttäjän reseptit heti kun ID saadaan
    } catch (error) {
      console.error("Error fetching user:", error);
      alert("Failed to fetch user data. Please log in again.");
      logout();
    }
  }

  

  // Haetaan vain kirjautuneen käyttäjän reseptit
  async function fetchOwnRecipes() {
    try {
      if (!userId) {
        console.error("User ID missing, cannot fetch recipes!");
        return;
      }

      const response = await fetch(`/recipeRoute/my-recipes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch recipes");

      ownRecipes = await response.json();
      console.log("🔹 Own Recipes Fetched:", ownRecipes);
      refreshTables();
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  }

  function populateTable(tableElement, recipes) {
    tableElement.innerHTML = "";
    recipes.forEach((recipe, index) => {
      const row = document.createElement("tr");

      const recipeCell = document.createElement("td");
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = recipe.title;
      link.addEventListener("click", () => openRecipeDetails(recipe.id));
      recipeCell.appendChild(link);
      row.appendChild(recipeCell);

      const actionsCell = document.createElement("td");

      const editButton = document.createElement("button");
      editButton.classList.add("button", "edit-btn");
      editButton.textContent = "Edit";
      editButton.onclick = () => editRecipe(recipe, index);
      actionsCell.appendChild(editButton);

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("button", "delete-btn");
      deleteButton.textContent = "Delete";
      deleteButton.onclick = () => deleteRecipe(recipe, index);//------
      actionsCell.appendChild(deleteButton);

      row.appendChild(actionsCell);
      tableElement.appendChild(row);
    });
  }

  async function openRecipeDetails(recipeId) {
    try {
      const response = await fetch(`/recipeRoute/recipe/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch recipe details");
      const recipe = await response.json();

      modal.show(
        `Recipe Details: ${recipe.title}`,
        `
          <p><strong>Title:</strong> ${recipe.title}</p>
          <p><strong>Ingredients:</strong><br> ${recipe.ingredients.replace(/\n/g, "<br>")}</p>
          <p><strong>Instructions:</strong><br> ${recipe.instructions.replace(/\n/g, "<br>")}</p>
          <button class="button" onclick="document.getElementById('customModal').hide()">Close</button>
        `
      );
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      alert("Failed to load recipe details.");
    }
  }

  // Korjattu lisäys (varmistettu että userId menee oikein)
  function addRecipe() {
    modal.show(
      "Add New Recipe",
      `
        <form id="addRecipeForm">
          <label for="add-title">Title:</label>
          <input type="text" id="add-title" required>

          <label for="add-ingredients">Ingredients:</label>
          <textarea id="add-ingredients" required></textarea>

          <label for="add-instructions">Instructions:</label>
          <textarea id="add-instructions" required></textarea>

          <button type="submit" class="button">Add Recipe</button>
        </form>
      `
    );

    document.getElementById("addRecipeForm").addEventListener("submit", async function (event) {
      event.preventDefault();

      if (!userId) {
        alert("User ID is missing. Please log in again.");
        return;
      }

      const newRecipe = {
        author_id: userId,
        title: document.getElementById("add-title").value,
        ingredients: document.getElementById("add-ingredients").value,
        instructions: document.getElementById("add-instructions").value,
        image_url: null,
        keywords: null,
        is_private: 0,
      };

      try {
        const response = await fetch("/recipeRoute/recipes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newRecipe),
        });

        if (!response.ok) throw new Error("Failed to add recipe");

        await fetchOwnRecipes();
        setTimeout(() => modal.hide(), 500);
      } catch (error) {
        console.error("Error adding recipe:", error);
      }
    });
  }

//DELETE
  function deleteRecipe(recipe) {
    modal.show(
      "Confirm Delete",
      `
        <p>Are you sure you want to delete the recipe "<strong>${recipe.title}</strong>"?</p>
        <button id="confirmDelete" class="button">Yes, Delete</button>
        <button class="button" onclick="document.getElementById('customModal').hide()">Cancel</button>
      `
    );
  
    document.getElementById("confirmDelete").addEventListener("click", async function () {
      try {
        const response = await fetch(`/recipeRoute/recipes/${recipe.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) throw new Error("Failed to delete recipe");
  
        await fetchOwnRecipes();
        setTimeout(() => modal.hide(), 500);
      } catch (error) {
        console.error("Error deleting recipe:", error);
      }
    });
  }
  
//EDIT
function editRecipe(recipe) {
  modal.show(
    "Edit Recipe",
    `
      <form id="editRecipeForm">
        <label for="edit-title">Title:</label>
        <input type="text" id="edit-title" value="${recipe.title}" required>

        <label for="edit-ingredients">Ingredients:</label>
        <textarea id="edit-ingredients" required>${recipe.ingredients}</textarea>

        <label for="edit-instructions">Instructions:</label>
        <textarea id="edit-instructions" required>${recipe.instructions}</textarea>

        <button type="submit" class="button">Save Changes</button>
      </form>
    `
  );

  document.getElementById("editRecipeForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const updatedRecipe = {
      title: document.getElementById("edit-title").value,
      ingredients: document.getElementById("edit-ingredients").value,
      instructions: document.getElementById("edit-instructions").value,
    };

    try {
      const response = await fetch(`/recipeRoute/recipes/${recipe.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedRecipe),
      });

      if (!response.ok) throw new Error("Failed to update recipe");

      await fetchOwnRecipes();
      setTimeout(() => modal.hide(), 500);
    } catch (error) {
      console.error("Error updating recipe:", error);
    }
  });
}


  function refreshTables() {
    populateTable(ownTable, ownRecipes);
  }

  addRecipeButton.addEventListener("click", addRecipe);
  await fetchUser();
});

function goToRecipePage() {
  window.location.href = "/recipePage.html";
}
