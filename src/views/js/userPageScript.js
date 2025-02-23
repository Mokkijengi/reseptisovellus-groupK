document.addEventListener("DOMContentLoaded", () => {
  const ownTable = document.getElementById("own-recipes-table");
  const addRecipeButton = document.getElementById("add-recipe-btn");

  let ownRecipes = [];

  // Haetaan käyttäjän omat reseptit tietokannasta
  async function fetchOwnRecipes() {
    try {
      const response = await fetch("/recipeRoute/recipes");
      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }
      ownRecipes = await response.json(); // Oletetaan, että palauttaa [{ id, title }, ...]
      refreshTables();
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  }

  function populateTable(tableElement, recipes) {
    tableElement.innerHTML = "";
    recipes.forEach((recipe, index) => {
      const row = document.createElement("tr");

      // Reseptin nimi (linkki)
      const recipeCell = document.createElement("td");
      const link = document.createElement("a");
      link.href = `recipePage.html?id=${recipe.id}`;
      link.textContent = recipe.title;
      recipeCell.appendChild(link);
      row.appendChild(recipeCell);

      // Toimintopainikkeet (muokkaa & poista)
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

//Muokkaus
  function editRecipe(index) {
    const recipe = ownRecipes[index];

    const newTitle = prompt("Enter new title:", recipe.title);
    const newIngredients = prompt("Enter new ingredients:", recipe.ingredients);
    const newInstructions = prompt("Enter new instructions:", recipe.instructions);

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
      ownRecipes[index].title = newTitle;
      ownRecipes[index].ingredients = newIngredients;
      ownRecipes[index].instructions = newInstructions;
      refreshTables();
    })
    .catch((error) => console.error("Error updating recipe:", error));
  }

//Poisto
  function deleteRecipe(index) {
    const recipe = ownRecipes[index];

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
        ownRecipes.splice(index, 1);
        refreshTables();
      })
      .catch((error) => console.error("Error deleting recipe:", error));
    }
  }

  function refreshTables() {
    populateTable(ownTable, ownRecipes);
  }
  
//Lisäys
  function addRecipe() {
    const title = prompt("Enter recipe title:");
    const ingredients = prompt("Enter ingredients:");
    const instructions = prompt("Enter instructions:");

    if (!title || !ingredients || !instructions) {
        alert("All fields must be filled!");
        return;
    }

    const newRecipe = {
        author_id: 1, // Muutetaan tämä dynaamiseksi, kun käyttäjä pitää tunnistaa
        title,
        ingredients,
        instructions,
        image_url: null, // Voi olla tyhjä
        keywords: null, // Voi olla tyhjä
        is_private: 0, // Oletusarvo: julkinen
    };

    console.log("Sending new recipe:", newRecipe); // Debug-loki

    fetch("/recipeRoute/recipes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newRecipe),
    })
    .then((response) => {
        console.log("Response status:", response.status);
        if (!response.ok) {
            throw new Error("Failed to add recipe");
        }
        return response.json();
    })
    .then((data) => {
        alert("Recipe added successfully!");
        console.log("Recipe added:", data);

        ownRecipes.push(data);
        refreshTables();
    })
    .catch((error) => console.error("Error adding recipe:", error));
}


  // Lisätään tapahtumankäsittelijä "Add Recipe" -napille
  addRecipeButton.addEventListener("click", addRecipe);

  // Haetaan reseptit heti sivun latauksen yhteydessä
  fetchOwnRecipes();
});
