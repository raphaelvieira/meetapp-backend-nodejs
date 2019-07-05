require('dotenv/config');

module.exports = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  define: {
    timestamps: true, // createdAt and updatedAt columns in every Table
    underscored: true, // default with underscore for tables
    underscoredAll: true, // default with underscore for coluns and relations
  },
};
