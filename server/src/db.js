// require('dotenv').config();

// const monk = require('monk');
// const db = monk(process.env.DATABASE_URL);

// db.then(() => {
//     console.log('Connected to MongoDB');
//   }).catch((error) => {
//     console.error('Error connecting to MongoDB:', error);
//   });

// module.exports = db;

const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const monk = require('monk');
const db = monk(process.env.DATABASE_URL);

db.then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

module.exports = db;
