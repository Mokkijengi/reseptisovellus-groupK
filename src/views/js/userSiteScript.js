/* headeriin lisätty linkki pääsivulle, html puolelle logout ja serach bar! */
document.addEventListener("DOMContentLoaded", function () {
    fetch("global-headers.html")
        .then(response => response.text())
        .then(data => {
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
        .catch(error => console.error("Error loading global header:", error));
});


document.addEventListener("DOMContentLoaded", () => {
    const favoriteTable = document.getElementById("favorite-recipes-table");
    const ownTable = document.getElementById("own-recipes-table");

    // Placeholder data for now, later fetch from server?
    const favoriteRecipes = ["Juustomakaronilaatikkoooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo", "Joulutortut", "Raparperikiisseli", "Resepti 4", "Resepti 5", "Resepti 6", "Resepti 7", "Resepti 8"];
    const ownRecipes = ["Plätyt", "Mansikkarahka", "Resepti 3", "Resepti 4", "Resepti 5", "Resepti 6", "Resepti 7", "Resepti 8", "Poista tämä", "Ja tämä"];

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
        const confirmDelete = confirm(`Are you sure you want to delete recipe: ${recipeList[index]}?`);
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
