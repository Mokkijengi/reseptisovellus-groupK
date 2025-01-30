document.addEventListener("DOMContentLoaded", function () {
    // Lataa globaalin headerin
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

    // Reseptitiedot
    const recipes = {
        spaghetti: {
            title: "Spaghetti Carbonara",
            image: "images/spaghetti.jpg",
            description: "A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper.",
            author: "Chef John", // Tekijän nimi
            ingredients: [
                "200g spaghetti",
                "100g pancetta",
                "2 large eggs",
                "50g Parmesan cheese",
                "Salt and pepper to taste"
            ],
            instructions: [
                "Boil the pasta in salted water.",
                "Fry the pancetta until crispy.",
                "Whisk eggs and Parmesan together in a bowl.",
                "Combine pasta with pancetta and remove from heat.",
                "Stir in the egg mixture quickly and serve."
            ]
        },
        salad: {
            title: "Fresh Salad",
            image: "images/salad.jpg",
            description: "A refreshing mix of greens, veggies, and a light vinaigrette.",
            author: "Healthy Chef", // Tekijän nimi
            ingredients: [
                "1 head lettuce",
                "1 cucumber",
                "2 tomatoes",
                "50g feta cheese",
                "2 tbsp olive oil",
                "1 tbsp balsamic vinegar"
            ],
            instructions: [
                "Wash and chop all vegetables.",
                "Crumble feta cheese over the vegetables.",
                "Mix olive oil and vinegar to make the dressing.",
                "Toss the salad with the dressing and serve."
            ]
        },
        pancakes: {
            title: "Fluffy Pancakes",
            image: "images/pancakes.jpg",
            description: "Delicious fluffy pancakes perfect for breakfast or brunch.",
            author: "Pancake Lover", // Tekijän nimi
            ingredients: [
                "200g all-purpose flour",
                "2 tbsp sugar",
                "1 tsp baking powder",
                "1/2 tsp baking soda",
                "250ml milk",
                "1 egg",
                "2 tbsp butter"
            ],
            instructions: [
                "Mix all dry ingredients in a bowl.",
                "Whisk wet ingredients together and combine with dry ingredients.",
                "Heat a pan and add butter.",
                "Pour batter into the pan and cook until bubbles appear.",
                "Flip and cook the other side. Serve with syrup."
            ]
        }
    };

    // Hae reseptin nimi URL-parametreista
    const params = new URLSearchParams(window.location.search);
    const recipeName = params.get("name");

    // Täytä reseptin tiedot
    if (recipes[recipeName]) {
        const recipe = recipes[recipeName];
        document.getElementById("recipe-title").textContent = recipe.title;
        document.getElementById("recipe-image").src = recipe.image;
        document.getElementById("recipe-description").textContent = recipe.description;
        document.getElementById("recipe-author").textContent = `By: ${recipe.author}`;

        const ingredientsList = document.getElementById("ingredients-list");
        recipe.ingredients.forEach(ingredient => {
            const li = document.createElement("li");
            li.textContent = ingredient;
            ingredientsList.appendChild(li);
        });

        const instructionsList = document.getElementById("instructions-list");
        recipe.instructions.forEach(step => {
            const li = document.createElement("li");
            li.textContent = step;
            instructionsList.appendChild(li);
        });
    } else {
        document.body.innerHTML = "<h1>Recipe not found!</h1>";
    }
});