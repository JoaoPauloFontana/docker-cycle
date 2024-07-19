const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT
};

let db;

function handleDisconnect() {
  db = mysql.createConnection(dbConfig);

  return new Promise((resolve, reject) => {
    db.connect(err => {
      if (err) {
        console.error('Error connecting to the database:', err);
        return reject(err);
      }
      console.log('Connected to the database');

      const sqlCreateTable = `CREATE TABLE IF NOT EXISTS people (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))`;
      db.query(sqlCreateTable, (err, result) => {
        if (err) {
          console.error('Error creating the table:', err);
          return reject(err);
        }
        console.log('Table created');
        resolve();
      });
    });

    db.on('error', err => {
      console.error('Database error:', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        handleDisconnect().catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

async function startServer() {
  try {
    await handleDisconnect();

    app.get('/', (req, res) => {
      const name = 'João';
      const sql = `INSERT INTO people(name) VALUES('${name}')`;

      db.query(sql, (err, result) => {
        if (err) {
          console.error('Error inserting into the database:', err);
          return res.status(500).send('Internal Server Error');
        }

        db.query('SELECT name FROM people', (err, results) => {
          if (err) {
            console.error('Error fetching from the database:', err);
            return res.status(500).send('Internal Server Error');
          }

          let response = '<h1>Full Cycle Rocks!</h1>';
          response += '<ul>';
          results.forEach(row => {
            response += `<li>${row.name}</li>`;
          });
          response += '</ul>';

          res.send(response);
        });
      });
    });

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });

  } catch (error) {
    console.error('Error during server start:', error);
  }
}

startServer();
