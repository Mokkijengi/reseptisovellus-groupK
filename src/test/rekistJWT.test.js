//testing registering new user to database and if duplicate
//when logging in, comparing password with hashed password in database
//testing if jwt token is found when logging in

const request = require('supertest');
const app = require('../app');

describe("User registration and JWT Token Test", () => {
    const jestTestUser = {
        username: "jestTestUser",
        password: "jestTestPassword",
        fullName: "jestTestFullName",
        email: "jestTestEmail@example.com"
    };
    let token;

    //cleanup after testing so no extra users are left in database
    afterAll(async () => {
        const response = await request(app)
            .get("/userRoute/users"); //fetching users to find ID of jestTestUser
        
        const users = response.body;
        const jestTestUserEntry = users.find(user => user.username === jestTestUser.username);
        if (jestTestUserEntry) {
            await request(app)
                .delete(`/userRoute/users/${jestTestUserEntry.id}`) //delete jestTestUser with ID
                .set('Authorization', `Bearer ${token}`); //using token to authenticate
        }

        //close database connection after all tests
        if(app && app.close) {
            app.close();
        }
        const db = require('../db');
        if(db && db.end) {
            db.end(); //close database connection
        }
    });

    it('checks env variables during test', () => {
        console.log('DB_HOST:', process.env.DB_HOST);
        console.log('DB_USER:', process.env.DB_USER);
        console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
        console.log('DB_NAME:', process.env.DB_NAME);
        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        // just to see if they're empty
      });
      

    it("should register a new user", async () => {
        const response = await request(app)
            .post("/userRoute/register")
            .send(jestTestUser);
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("User registered successfully.");
    });

    it("shoudl fail to register a user with the same email already in db", async () => {
        //trying to register the same testJestUser again
        const response = await request(app)
            .post("/userRoute/register")
            .send(jestTestUser);

        //check if status code is 400 and message is correct
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("User already exists with same email or username.");
    });

    it("should fail to login with wrong password", async () => {
        const response = await request(app)
            .post("/userRoute/login")
            .send({
                username: jestTestUser.username,
                password: "wrongJestPassword"
            });
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Invalid credentials");
    });

    it("should login with the registered user and return localy saved JWT token", async () => {
        const response = await request(app)
            .post("/userRoute/login")
            .send({
                username: jestTestUser.username,
                password: jestTestUser.password
            });
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        //testing if login was successful by checking message
        expect(response.body.message).toBe("Login successful"); 
        token = response.body.token;
        console.log('JWT Token created:', token);
    });


});