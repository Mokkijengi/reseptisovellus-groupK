process.env.DB_HOST = "localhost";
process.env.DB_USER = "root";
process.env.DB_PASSWORD = "root";
process.env.DB_NAME = "recipedb";
process.env.JWT_SECRET = "mysecret";

const request = require('supertest');
const app = require('../app');

describe("Favorite Button Functionality Test", () => {
    const testUser = {
        username: "testUserFav",
        password: "testUserFavPass",
        fullName: "Test User Fav",
        email: "testUserFav@example.com"
    };

    let token;
    let testRecipeId = 1; // Assume there's at least one recipe in DB

    // Cleanup after testing to remove test user and favorites
    afterAll(async () => {
        if (token) {
            const response = await request(app).get("/userRoute/users");
            const users = response.body;
            const testUserEntry = users.find(user => user.username === testUser.username);

            if (testUserEntry) {
                await request(app)
                    .delete(`/userRoute/users/${testUserEntry.id}`)
                    .set('Authorization', `Bearer ${token}`);
            }

            // Remove the favorite entry from DB
            await request(app)
                .delete(`/favorites/remove`)
                .send({ recipeId: testRecipeId })
                .set('Authorization', `Bearer ${token}`);
        }

        if (app && app.close) app.close();
        const db = require('../db');
        if (db && db.end) db.end();
    });

    it("should register a new user for favorite testing", async () => {
        const response = await request(app)
            .post("/userRoute/register")
            .send(testUser);
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("User registered successfully.");
    });

    it("should login the test user and retrieve a JWT token", async () => {
        const response = await request(app)
            .post("/userRoute/login")
            .send({
                username: testUser.username,
                password: testUser.password
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        token = response.body.token;
    });

    it("should fail to add a favorite without authentication", async () => {
        const response = await request(app)
            .post("/favorites/add")
            .send({ recipeId: testRecipeId });

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Unauthorized - No token provided");
    });

    it("should successfully add a recipe to favorites", async () => {
        const response = await request(app)
            .post("/favorites/add")
            .send({ recipeId: testRecipeId })
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Recipe added to favorites!");
    });

    it("should prevent duplicate favorite entries", async () => {
        const response = await request(app)
            .post("/favorites/add")
            .send({ recipeId: testRecipeId })
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Recipe is already in favorites.");
    });

    it("should successfully remove a recipe from favorites", async () => {
        const response = await request(app)
            .delete("/favorites/remove")
            .send({ recipeId: testRecipeId })
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Favorite removed successfully.");
    });
});