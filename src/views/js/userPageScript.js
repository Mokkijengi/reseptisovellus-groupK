document.addEventListener("DOMContentLoaded", () => {
  const ownTable = document.getElementById("own-recipes-table");
  const addRecipeButton = document.getElementById("add-recipe-btn");
  const modal = document.getElementById("customModal");

  let ownRecipes = [];

  //Haetaan käyttäjän omat reseptit tietokannasta
  async function fetchOwnRecipes() {
    try {
      const response = await fetch("/recipeRoute/recipes");
      if (!response.ok) throw new Error("Failed to fetch recipes");
      ownRecipes = await response.json();
      refreshTables();
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  }

  function populateTable(tableElement, recipes) {
    tableElement.innerHTML = "";
    recipes.forEach((recipe, index) => {
      const row = document.createElement("tr");

      //Klikattava reseptin nimi avaa modalin
      const recipeCell = document.createElement("td");
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = recipe.title;
      link.addEventListener("click", () => openRecipeDetails(recipe.id));
      recipeCell.appendChild(link);
      row.appendChild(recipeCell);

      //Muokkaa- ja Poista-painikkeet
      const actionsCell = document.createElement("td");

      const editButton = document.createElement("button");
      editButton.classList.add("button", "edit-btn");
      editButton.textContent = "Edit";
      editButton.onclick = () => editRecipe(index);
      actionsCell.appendChild(editButton);

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("button", "delete-btn");
      deleteButton.textContent = "Delete";
      deleteButton.onclick = () => deleteRecipe(index);
      actionsCell.appendChild(deleteButton);

      row.appendChild(actionsCell);
      tableElement.appendChild(row);
    });
  }

  // Avaa reseptin tiedot modaalissa
  async function openRecipeDetails(recipeId) {
    try {
      const response = await fetch(`/recipeRoute/recipe/${recipeId}`);
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

  //Muokkaa reseptiä modaalissa
  function editRecipe(index) {
    const recipe = ownRecipes[index];

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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedRecipe),
        });

        if (!response.ok) throw new Error("Failed to update recipe");

        ownRecipes[index] = { ...recipe, ...updatedRecipe };
        refreshTables();
        setTimeout(() => modal.hide(), 500); // Sulkee modalin pienen viiveen jälkeen --> ei sulje
      } catch (error) {
        console.error("Error updating recipe:", error);
      }
    });
  }

  //Poista resepti modalin varmistuksella
  function deleteRecipe(index) {
    const recipe = ownRecipes[index];

    modal.show(
      "Confirm Delete",
      `
        <p>Are you sure you want to delete the recipe: <strong>${recipe.title}</strong>?</p>
        <button class="button delete-btn" id="confirm-delete">Yes, Delete</button>
        <button class="button" onclick="document.getElementById('customModal').hide()">Cancel</button>
      `
    );

    document.getElementById("confirm-delete").addEventListener("click", async () => {
      try {
        const response = await fetch(`/recipeRoute/recipes/${recipe.id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete recipe");

        ownRecipes.splice(index, 1);
        refreshTables();
        setTimeout(() => modal.hide(), 500); // Sulkee modalin pienen viiveen jälkeen --> ei sulje
      } catch (error) {
        console.error("Error deleting recipe:", error);
      }
    });
  }

  //Lisää uusi resepti modaalissa
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

      const newRecipe = {
        author_id: 1, // TODO: Hae oikea käyttäjä
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRecipe),
        });

        if (!response.ok) throw new Error("Failed to add recipe");

        const data = await response.json();
        ownRecipes.push({ id: data.id, ...newRecipe });
        refreshTables();
        setTimeout(() => modal.hide(), 500); //Sulkee modalin pienen viiveen jälkeen --> Ei sulje
      } catch (error) {
        console.error("Error adding recipe:", error);
      }
    });
  }

  function refreshTables() {
    populateTable(ownTable, ownRecipes);
  }

  addRecipeButton.addEventListener("click", addRecipe);
  fetchOwnRecipes();
});
