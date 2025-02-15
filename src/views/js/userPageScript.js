/* headeriin lisätty linkki pääsivulle, html puolelle logout ja serach bar! */
document.addEventListener("DOMContentLoaded", function () {
  fetch("global-headers.html")
    .then((response) => response.text())
    .then((data) => {
      const globalHeader = document.querySelector("#global-header");
      if (globalHeader) {
        globalHeader.innerHTML = data;

        //logosta linkiksi pääsivulle!
        const logo = globalHeader.querySelector("img");
        if (logo) {
          const linkWrapper = document.createElement("a");
          linkWrapper.href = "/recipes.html";
          logo.parentNode.insertBefore(linkWrapper, logo);
          linkWrapper.appendChild(logo);
        }
      } else {
        console.error("No element with ID 'global-header' found.");
      }
    })
    .catch((error) => console.error("Error loading global header:", error));
});

document.addEventListener("DOMContentLoaded", () => {
  const favoriteTable = document.getElementById("favorite-recipes-table");
  const ownTable = document.getElementById("own-recipes-table");

  // Placeholder data for now, later fetch from server?
  const favoriteRecipes = [
    "Juustomakaronilaatikkoooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo",
    "Joulutortut",
    "Raparperikiisseli",
    "Resepti 4",
    "Resepti 5",
    "Resepti 6",
    "Resepti 7",
    "Resepti 8",
  ];
  const ownRecipes = [
    "Plätyt",
    "Mansikkarahka",
    "Resepti 3",
    "Resepti 4",
    "Resepti 5",
    "Resepti 6",
    "Resepti 7",
    "Resepti 8",
    "Poista tämä",
    "Ja tämä",
  ];

  function populateTable(tableElement, recipes, isOwn) {
    tableElement.innerHTML = "";
    recipes.forEach((recipe, index) => {
      const row = document.createElement("tr");

      // Recipe Name Cell
      const recipeCell = document.createElement("td");
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = recipe;
      recipeCell.appendChild(link);
      row.appendChild(recipeCell);

      // Actions Cell
      const actionsCell = document.createElement("td");

      const editButton = document.createElement("button");
      editButton.classList.add("button", "edit-btn");
      editButton.textContent = "Edit";
      editButton.onclick = () => editRecipe(index, isOwn);

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("button", "delete-btn");
      deleteButton.textContent = "Delete";
      deleteButton.onclick = () => deleteRecipe(index, isOwn);

      actionsCell.appendChild(editButton);
      actionsCell.appendChild(deleteButton);
      row.appendChild(actionsCell);
      tableElement.appendChild(row);
    });

    // Add scrollable functionality if more than 7 items
    if (recipes.length > 7) {
      tableElement.parentElement.style.maxHeight = "300px"; // Adjust height to fit 7 items
      tableElement.parentElement.style.overflowY = "scroll";
    } else {
      tableElement.parentElement.style.maxHeight = "";
      tableElement.parentElement.style.overflowY = "";
    }
  }

  function editRecipe(index, isOwn) {
    const recipeList = isOwn ? ownRecipes : favoriteRecipes;
    alert(`Editing recipe: ${recipeList[index]}`);
  }

  function deleteRecipe(index, isOwn) {
    const recipeList = isOwn ? ownRecipes : favoriteRecipes;
    const confirmDelete = confirm(
      `Are you sure you want to delete recipe: ${recipeList[index]}?`
    );
    if (confirmDelete) {
      recipeList.splice(index, 1);
      refreshTables();
    }
  }

  function refreshTables() {
    populateTable(favoriteTable, favoriteRecipes, false);
    populateTable(ownTable, ownRecipes, true);
  }

  refreshTables();
});

// Open modal when clicking "Add Recipe"
document.getElementById("openModal").addEventListener("click", () => {
  const modal = document.getElementById("customModal");
  modal.show("Add New Recipe", generateRecipeForm());
});

// Generate dynamic form for adding a new recipe
function generateRecipeForm() {
  return `
        <form id="recipeForm">
            <label for="title">Title:</label>
            <input type="text" id="title" name="title" required>
            
            <label for="author">Author:</label>
            <input type="text" id="author" name="author" required>
            
            <label for="ingredients">Ingredients:</label>
            <textarea id="ingredients" name="ingredients" required></textarea>
            
            <label for="instructions">Instructions:</label>
            <textarea id="instructions" name="instructions" required></textarea>
            
            <label for="image_url">Image URL:</label>
            <input type="text" id="image_url" name="image_url">
            
            <label for="keywords">Keywords (comma separated):</label>
            <input type="text" id="keywords" name="keywords">
            
            <button type="submit" class="button">Submit</button>
        </form>
    `;
}

// Handle form submission to add a new recipe
document.addEventListener("submit", async function (event) {
  if (event.target.id === "recipeForm") {
    event.preventDefault();

    const formData = {
      title: document.getElementById("title").value,
      author_id: document.getElementById("author").value,
      ingredients: document.getElementById("ingredients").value,
      instructions: document.getElementById("instructions").value,
      image_url: document.getElementById("image_url").value || "images/default.jpg",
      keywords: document.getElementById("keywords").value,
      is_private: false,
    };

    try {
      const response = await fetch("/recipeRoute/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Recipe added successfully!");
        location.reload(); // Reload page to show the new recipe
      } else {
        const errorData = await response.json();
        alert("Error: " + errorData.error);
      }
    } catch (error) {
      console.error("Error submitting recipe:", error);
    }
  }
});
