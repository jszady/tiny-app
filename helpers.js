const findUserByEmail = function(email, DB) {
  for (let userId in DB) {
    if (DB[userId].email === email) {
      return DB[userId];
    }
  }
  return null;
};

// Generate a random string
const generateRandomString = function() {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Find URLs for a user
const urlsForUser = function(id, DB) {
  let userURLs = {};
  for (let urlId in DB) {
    if (DB[urlId].userID === id) {
      userURLs[urlId] = DB[urlId];
    }
  }
  return userURLs;
};

module.exports = { findUserByEmail, generateRandomString, urlsForUser };