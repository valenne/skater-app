const { Pool } = require("pg");

// config object
const config = {
  user: "postgres",
  host: "localhost",
  database: "skatepark",
  password: "Megustaelagua1*",
  port: 5432,
};

// innit the pool
const pool = new Pool(config);

module.exports = {
  newUser: async (email, nombre, password, experiencia, especialidad, foto) => {
    try {
      const consult = {
        text: `INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad,foto, estado) VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *`,
        values: [email, nombre, password, experiencia, especialidad, foto],
      };

      const response = await pool.query(consult);
      return response.rows[0];
    } catch (err) {
      console.log(`Error wrong with database: ${err}`);
    }
  },

  getSkaters: async () => {
    try {
      const consult = {
        text: `SELECT * FROM skaters`,
      };
      const response = await pool.query(consult);
      return response.rows;
    } catch (err) {
      console.log(`Something failure with the consult to database ${err}`);
    }
  },
  setSkaterStatus: async (id, estado) => {
    try {
      const consult = {
        text: `UPDATE skaters SET estado = $1 WHERE id=$2 RETURNING *`,
        values: [estado, id],
      };

      const response = await pool.query(consult);

      console.log(`The follow data was updated: ${response.rows[0].nombre}`);

      return response.rows[0];
    } catch (err) {
      console.log(`Something failure with the consult to database: ${err}`);
    }
  },

  getSkater: async (email, password) => {
    try {
      const consult = {
        text: `SELECT * FROM skaters WHERE email=$1 AND password=$2`,
        values: [email, password],
      };
      const response = await pool.query(consult);
      return response.rows[0];
    } catch (err) {
      console.log(`Something failure with the consult to database: ${err}`);
    }
  },

  getSkaterForID: async (email, id) => {
    try {
      consult = {
        text: `SELECT * FROM skaters WHERE email=$1 AND id=$2`,
        values: [email, id],
      };

      const response = await pool.query(consult);
      return response.rows[0];
    } catch (err) {
      console.log(`Something failure with the consult to database: ${err}`);
    }
  },

  getUpdateSkater: async (nombre, password, experiencia, especialidad, id) => {
    try {
      const consult = {
        text: `UPDATE skaters SET nombre=$1, password=$2, anos_experiencia=$3, especialidad=$4 WHERE id=$5 RETURNING *`,
        values: [nombre, password, experiencia, especialidad, id],
      };

      const response = await pool.query(consult);

      console.log(`database`, response.rows[0]);
      return response.rows[0];
    } catch (err) {
      console.log(`Something failure with the consult to database: ${err}`);
    }
  },

  deleteSkater: async (id) => {
    try {
      const consult = {
        text: `DELETE FROM skaters WHERE id=$1`,
        values: [id],
      };
      const response = await pool.query(consult);

      return response.rowCount;
    } catch (err) {
      console.log(`Something failure with the consult to database: ${err}`);
    }
  },
};
