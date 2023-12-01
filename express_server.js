const express = require('express');
const app = express();
const PORT = 8080;

const bcrypt = require("bcryptjs");
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');

const helpers = require('./helpers');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000
}));

const urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca", userID:"userRandomID"},
  "9sm5xK": {longURL:"http://www.google.com", userID: "user2RandomID"},
}

const usersDb = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
}

/*


All my GETS


*/

/*
this will check if a user is by looking at session ID 
  if not logged in 
    rederect to login page 
  if logged in
    render the urls_new temp while passing in the users info
*/
app.get('/urls/new', (req, res) => {
  const userId = req.session.user_id;

  if(!userId || !usersDb[userId])
  {
    return res.redirect('/login')
  }
  const templateVars = {
    user: usersDb[userId],
    urls: urlDatabase
  }
  res.render('urls_new', templateVars);
})


/*
  this will see if the user is logged in 
      if not send a 403 error (no premission to acess page)
    if logged in get all the urls for that user 
    render the urls_index temp
*/
app.get('/urls', (req, res) => {
  
  const userId = req.session.user_id;
  if(!userId)
  {
   return res.redirect('/login');
  }
  const userUrls = helpers.urlsForUser(userId, urlDatabase);
  const templateVars = {
    user: usersDb[userId],
    urls: userUrls,
  }

  res.render('urls_index', templateVars); 
})


/*
  gets the shortURL form the from request
  if this url isnt found
    send an error 404 (page not found)
  else this will redirect us to the real URL
*/
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  if(!urlDatabase[shortURL])
  {
    return res.status(404).send("Short URL doesnt exist !!");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});


/*
  first we need to make sure user is logged in 
  if the url doesnt exist or if the url doesnt belong to the user
    return 403 error
  else we will render the urls show temp
*/
app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(403).send("You must be logged in to access URLs.");
  }
  //split these up 
  const urlBelongsToUser = urlDatabase[req.params.id].userID === userId;
  const urlObj = urlDatabase[req.params.id];

  if (!urlObj || !urlBelongsToUser) {
    return res.status(403).send("This URL does not belong to you.");
  }
  const templateVars = { 
    id: req.params.id, 
    longURL: urlObj.longURL, 
    user: usersDb[userId]
  };
  
  res.render("urls_show", templateVars);
});


/*
  this the user is logged in bring them to url page
  else we will ask them to log in and render the register temp
*/
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  if(userId && usersDb[userId])
  {
    return res.redirect('/urls')
  }
  const templateVars = { user: null };
  res.render('register', templateVars);
});

/*
  if the user is logged in redirect to the urls page
  if not render the login page
*/
app.get("/login", (req,res) => {
  const userId = req.session.user_id;
  if(userId && usersDb[userId])
  {
    return res.redirect('/urls')
  }
  const templateVars = { user: null };
  res.render('login', templateVars)
})

/*
rederet to login if not loggedin 
or shuld bring you to URLs if logged in
*/

app.get('/', (req, res) => {
  res.send("Hello");
})

app.get('/urls.json', (req, res) => {
  res.send(urlDatabase);
})
/*


ALL my POSTS


*/

/*
  if not logged in return 403 error
  
  gen a random string and save it in the database
  redirect to the page with new url
*/
app.post("/urls", (req, res) => {
  
  const userId = req.session.user_id;

  if(!userId)
  {
    return res.status(403).send("Yout must be logged in to see short URLS");
  }

  const id = helpers.generateRandomString();
  urlDatabase[id] = {longURL: req.body.longURL, userID: userId};
  res.redirect(`/urls/${id}`);

});

/*
  delete
*/
/*
  check is user owns url 
*/
app.post('/urls/:id/delete', (req, res) => {
  
  const userId = req.session.user_id;
  const id = req.params.id;
  const sameUser = urlDatabase[id].userID === userId

  if(!urlDatabase[id] || !sameUser) {
    res.status(403).send('you cant delete that url');
  }
  
  delete urlDatabase[id];
  
  res.redirect('/urls');
})

/*
  update long url 
  rederiect to the urls
*/
/*
  check is user owns url 
*/
app.post('/urls/:id', (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id;
  const sameUser = urlDatabase[id].userID === userId

  if(!urlDatabase[id] || !sameUser) {
    return res.status(403).send('you dont have presmission to edit this');
  }
  urlDatabase[id].longURL = req.body.longURL;
  res.redirect(`/urls`);
})

/*
  get the email and password from body
  we need to find the user in the database
  compare the password with the hash
    if they match rederect to urls
  else 401 status
*/
app.post('/login', (req, res) => {

  const {email, password} = req.body;
  const user = helpers.findUserByEmail(email, usersDb);

  if(user && bcrypt.compareSync(password, user.password))
  {
    req.session.user_id = user.id;

    return res.redirect('/urls');
  }

  res.status(401).send('Not authorized');
})

/*
  clear the cookie
*/
app.post('/logout', (req, res) => {
  req.session = null;

  res.redirect('/login');
})

/*
  get email and password from body
  hash the password
  if the email or password are empty we will return an error 
  
  then we see if the user exists (same email)
  if not 
  we generate a random string 
  and save the user in the database with that string
*/

app.post('/register', (req,res) => {
  const { email, password} = req.body;
  
  if(!email || !password) {
    return res.status(400).send('email and password cant be empty');
  }
  
  const userExists = helpers.findUserByEmail(email, usersDb);
  
  if(userExists) {
    return res.status(400).send('user already exists');
  }
  const userId = helpers.generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  usersDb[userId] = {
    id: userId,
    email,
    password: hashedPassword,
  }

  req.session.user_id = userId;
  
  res.redirect('/urls');
})

/*
LINDA LINDA LINDA LISTEN TO ME LINDA !!!!!
*/
app.listen(PORT, () => {
  console.log(`Listening on PORT: ${PORT}`);
})