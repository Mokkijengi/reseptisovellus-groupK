/*main content page, search bar, and filter recipes, access to user's site, quickview recipes with cards */

/* HEADER FOR ECERY PAGE, LOADED LIKE THIS! */

// JavaScript to load the header dynamically
document.addEventListener("DOMContentLoaded", function () {
    fetch("global-headers.html")
        .then(response => response.text())
        .then(data => {
            const globalHeader = document.querySelector("#global-header");
            if (globalHeader) {
                globalHeader.innerHTML = data;
            } else {
                console.error("No element with ID 'global-header' found.");
            }
        })
        .catch(error => console.error("Error loading global header:", error));
});
/*HEADERS END */


// Example of user login check (for now, simulate logged-in state)
const isLoggedIn = true; // Replace with actual login check

window.onload = () => {
    const userSiteButton = document.getElementById("userSiteButton");
    if (isLoggedIn) {
        userSiteButton.classList.remove("hidden");
    }
};

// Navigate to User Site
function goToUserSite() {
    alert("Navigating to your recipes...");
    window.location.href = "/user-dashboard.html"; // Replace with the correct URL
}

// Filter Recipes Based on Search Input
function filterRecipes() {
    const searchBar = document.getElementById("searchBar");
    const filter = searchBar.value.toLowerCase();
    const recipes = document.querySelectorAll(".recipe");

    recipes.forEach(recipe => {
        const title = recipe.querySelector("h2").textContent.toLowerCase();
        if (title.includes(filter)) {
            recipe.style.display = "block";
        } else {
            recipe.style.display = "none";
        }
    });
}

// Navigate to Recipedetails
function navigateToRecipe(recipeName) {
    // Ohjaa käyttäjä oikealle reseptisivulle
    window.location.href = `/recipe.html?name=${recipeName}`;
}
