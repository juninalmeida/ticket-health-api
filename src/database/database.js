import fs from "node:fs/promises";

const DATABASE_PATH = new URL("db.json", import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(DATABASE_PATH, "utf8")
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    fs.writeFile(DATABASE_PATH, JSON.stringify(this.#database));
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();
  }

  select(table, filters) {
    let data = this.#database[table] ?? [];

    if (filters) {
      data = data.filter((row) => {
        return Object.entries(filters).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase());
        });
      });
    }

    return data;
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      this.#database[table][rowIndex] = {
        ...this.#database[table][rowIndex],
        ...data,
      };
    }

    this.#persist();
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
    }
  }
}
