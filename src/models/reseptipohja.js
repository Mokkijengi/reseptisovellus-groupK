class RecipeModel {
  constructor(db) {
    this.db = db;
  }

  async getAllRecipes() {
    const [rows] = await this.db.query("SELECT * FROM recipes");
    return rows;
  }

  async addRecipe(recipe) {
    const { title, ingredients, instructions } = recipe;
    await this.db.query(
      "INSERT INTO recipes (title, ingredients, instructions) VALUES (?, ?, ?)",
      [title, ingredients, instructions]
    );
  }
}

module.exports = RecipeModel;
