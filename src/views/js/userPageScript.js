document.addEventListener("DOMContentLoaded", async () => {
    // Haetaan tarvittavat HTML-elementit
  const ownTable = document.getElementById("own-recipes-table");
  const addRecipeButton = document.getElementById("add-recipe-btn");
  const logoutButton = document.getElementById("logoutButton");
  const modal = document.getElementById("customModal");
  const favoriteTable = document.getElementById("favorite-recipes-table");// tämä

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

  // Jos käyttäjä ei ole kirjautunut sisään, ohjataan hänet kirjautumissivulle
  if (!token) {
    console.error("User token not found!");
    alert("You are not logged in. Please log in first.");
    window.location.href = "/";
    return;
  }

  // Kirjautumisesta ulos kirjautumistoiminto
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
      userId = userData.id;

      console.log(`🔹 Kirjautunut käyttäjä: ID ${userId}, ${userData.username}`);
      await fetchOwnRecipes();
    } catch (error) {
      console.error("Error fetching user:", error);
      alert("Failed to fetch user data. Please log in again.");
      logout();
    }
  }

  // Haetaan käyttäjän omat reseptit palvelimelta
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

  // Funktio taulukon täyttämiseen resepteillä
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

  // Muokkaus- ja poistopainikkeet    
      const actionsCell = document.createElement("td");

      const editButton = document.createElement("button");
      editButton.classList.add("button", "edit-btn");
      editButton.textContent = "Edit";
      editButton.onclick = () => editRecipe(recipe, index);
      actionsCell.appendChild(editButton);

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("button", "delete-btn");
      deleteButton.textContent = "Delete";
      deleteButton.onclick = () => deleteRecipe(recipe, index);
      actionsCell.appendChild(deleteButton);

      row.appendChild(actionsCell);
      tableElement.appendChild(row);
    });
  }

  // Avaa reseptin tarkemmat tiedot modaalissa
  async function openRecipeDetails(recipeId) {
    try {
      const response = await fetch(`/recipeRoute/recipe/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error("Failed to fetch recipe details");
      const recipe = await response.json();
  
      let imageHtml = "";
      try {
        const timestamp = new Date().getTime();
        const imageResponse = await fetch(`/recipeRoute/recipe/${recipeId}/image?t=${timestamp}`);
        if (imageResponse.ok) {
          imageHtml = `
            <p><strong>Image:</strong><br>
            <img src="/recipeRoute/recipe/${recipeId}/image?t=${timestamp}" 
                 alt="Recipe Image" 
                 style="max-width: 300px; height: auto; border-radius: 10px; box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);">
            </p>`;
        }
      } catch (imgError) {
        console.warn("Image not found or failed to load.");
      }
  
      modal.show(
        `Recipe Details: ${recipe.title}`,
        `
          <p><strong>Title:</strong> ${recipe.title}</p>
          <p><strong>Ingredients:</strong><br> ${recipe.ingredients.replace(/\n/g, "<br>")}</p>
          <p><strong>Instructions:</strong><br> ${recipe.instructions.replace(/\n/g, "<br>")}</p>
          ${recipe.keywords ? `<p><strong>Keywords:</strong> ${recipe.keywords}</p>` : ""}
          ${imageHtml}
          <button class="button" onclick="document.getElementById('customModal').hide()">Close</button>
        `
      );
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      alert("Failed to load recipe details.");
    }
  }
  
  
  // Lisäys
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
    
          <label for="add-keywords">Keywords:</label>
          <input type="text" id="add-keywords">
    
          <label for="add-image">Image:</label>
          <input type="file" id="add-image" accept="image/*">
    
          <button type="submit" class="button">Add Recipe</button>
        </form>
      `
    );
    

    document.getElementById("addRecipeForm").addEventListener("submit", async function (event) {
      event.preventDefault();
    
      let formData = new FormData();
      formData.append("title", document.getElementById("add-title").value);
      formData.append("ingredients", document.getElementById("add-ingredients").value);
      formData.append("instructions", document.getElementById("add-instructions").value);
      formData.append("keywords", document.getElementById("add-keywords").value); // 🔥 Uusi avainsanakenttä
    
      const imageInput = document.getElementById("add-image");
      if (imageInput.files.length > 0) {
        formData.append("image", imageInput.files[0]);
      }
    
      try {
        const response = await fetch("/recipeRoute/recipes", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
    
        if (!response.ok) throw new Error("Failed to add recipe");
    
        await fetchOwnRecipes();
        setTimeout(() => modal.hide(), 500);
      } catch (error) {
        console.error("Error adding recipe:", error);
      }
    });
    
  }

  // Poisto
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

  // Muokkaus
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
  
          <label for="edit-keywords">Keywords (comma-separated):</label>
          <input type="text" id="edit-keywords" value="${recipe.keywords ? recipe.keywords : ''}">
  
          <label for="edit-image">Replace Image (optional):</label>
          <input type="file" id="edit-image" accept="image/*">
  
          <button type="submit" class="button">Save Changes</button>
        </form>
      `
    );

    document.getElementById("editRecipeForm").addEventListener("submit", async function (event) {
      event.preventDefault();
    
      let formData = new FormData();
      formData.append("title", document.getElementById("edit-title").value);
      formData.append("ingredients", document.getElementById("edit-ingredients").value);
      formData.append("instructions", document.getElementById("edit-instructions").value);
      formData.append("keywords", document.getElementById("edit-keywords").value); // 🔥 Nyt avainsanat tallennetaan
    
      const imageInput = document.getElementById("edit-image");
      if (imageInput.files.length > 0) {
        formData.append("image", imageInput.files[0]); // Lähetetään kuva vain jos se on valittu
      } else {
        formData.append("image", ""); // Jos ei uutta kuvaa, lähetetään tyhjä arvo
      }
    
      try {
        const response = await fetch(`/recipeRoute/recipes/${recipe.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      
        if (!response.ok) throw new Error("Failed to update recipe");
      
        await fetchOwnRecipes(); // Päivitetään lista, jotta kuva vaihtuu
        setTimeout(() => modal.hide(), 500);
      } catch (error) {
        console.error("Error updating recipe:", error);
      }
      
    });
    
  }
  // Päivitetään taulukko resepteillä
  function refreshTables() {
    populateTable(ownTable, ownRecipes);
  }
  // Lisätään tapahtumakuuntelija uuden reseptin lisäämiselle
  addRecipeButton.addEventListener("click", addRecipe);
  await fetchUser(); // Haetaan käyttäjän tiedot ja reseptit heti alussa

  // Haetaan käyttäjän suosikit
  async function fetchFavorites() {
    try {
      const response = await fetch("/favorites/my-favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch favorites");

      const favorites = await response.json();

      if (favorites.length === 0) {
        favoriteTable.innerHTML = "<tr><td colspan='2'>No favorites yet.</td></tr>";
        return;
      }

      favoriteTable.innerHTML = ""; // Tyhjennetään vanha sisältö

      favorites.forEach((recipe) => {
        const row = document.createElement("tr");

        // Reseptin nimi ja linkki reseptisivulle
        const recipeCell = document.createElement("td");
        const link = document.createElement("a");
        link.href = `/singleRecipe.html?id=${recipe.id}`;
        link.textContent = recipe.title;
        recipeCell.appendChild(link);
        row.appendChild(recipeCell);

        // Poista suosikeista -painike
        const removeCell = document.createElement("td");
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.classList.add("button");
        removeButton.onclick = () => removeFavorite(recipe.id, row);
        removeCell.appendChild(removeButton);
        row.appendChild(removeCell);

        favoriteTable.appendChild(row);
      });
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  }

  // Poista suosikki
  async function removeFavorite(recipeId, row) {
    try {
      const response = await fetch("/favorites/remove", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipeId }),
      });

      if (!response.ok) throw new Error("Failed to remove favorite");

      row.remove(); // Poistetaan rivi UI:sta
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  }

  await fetchFavorites(); // Haetaan suosikit heti alussa
});


function goToRecipePage() {
  window.location.href = "/recipePage.html";
}
