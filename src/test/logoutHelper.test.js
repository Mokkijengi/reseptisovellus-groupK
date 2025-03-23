/**
 * @jest-environment jsdom
 */
//Juuressa ensin : npm install --save-dev jest-environment-jsdom

const logout = require("../utils/logoutHelper");


// Simuloidaan localStorage ja sessionStorage Jestin ympäristössä
global.localStorage = {
    storage: {},
    setItem(key, value) {
      this.storage[key] = value;
    },
    getItem(key) {
      return this.storage[key];
    },
    removeItem(key) {
      delete this.storage[key];
    },
    clear() {
      this.storage = {};
    }
  };
  
  global.sessionStorage = {
    storage: {},
    setItem(key, value) {
      this.storage[key] = value;
    },
    getItem(key) {
      return this.storage[key];
    },
    removeItem(key) {
      delete this.storage[key];
    },
    clear() {
      this.storage = {};
    }
  };
  


describe("logout", () => {
  beforeEach(() => {
    // Resetoi tilat
    localStorage.setItem("token", "test123");
    sessionStorage.setItem("token", "test456");
    delete window.location;
    window.location = { href: "" };
    global.alert = jest.fn(); // mockataan alert
  });

  test("poistaa tokenit ja ohjaa etusivulle", () => {
    logout();

    expect(localStorage.getItem("token")).toBeNull();
    expect(sessionStorage.getItem("token")).toBeNull();
    expect(alert).toHaveBeenCalledWith("You have been logged out.");
    expect(window.location.href).toBe("/");
  });
});
