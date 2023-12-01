const { assert } = require('chai');

const { findUserByEmail, generateRandomString, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca", userID:"userRandomID"},
  "9sm5xK": {longURL:"http://www.google.com", userID: "user2RandomID"},
  "H3lpM3": {longURL:"http://www.youtube.com", userID: "user2RandomID"}
};

describe('findUserByEmail', () => {
  it('should return true if the emails are the same', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    // Write your assert statement here
    assert.exists(user.email, testUsers);
  });
  it('should return null for no match email', function() {
    const user = findUserByEmail('asdasd@gmail.com', testUsers);
    assert.isNull(user);
  });
  it('should return null for empty email', function () {
    const user = findUserByEmail('', testUsers);
    assert.isNull(user);
  });
});

describe('urlsForUser()', () => {
  it('should return true for the same URL', () => {
    const userURL = urlsForUser('userRandomID', urlDatabase);
    const expectedURL = {
      "b2xVn2": {longURL:"http://www.lighthouselabs.ca", userID:"userRandomID"},
    }
    assert.deepEqual(userURL, expectedURL);
  });
  it("should return true for both urls that are the same", () => {
    const userURL = urlsForUser('user2RandomID', urlDatabase);
    const expectedURL = {
      "9sm5xK": {longURL:"http://www.google.com", userID: "user2RandomID"},
      "H3lpM3": {longURL:"http://www.youtube.com", userID: "user2RandomID"}
    }
    assert.deepEqual(userURL, expectedURL);
  });

})