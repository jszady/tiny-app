const express = require('express');
const app = express();
const PORT = 8080;
var cookieParser = require('cookie-parser')


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

/*


All my GETS


*/

// this route will handle the page where users can add a new URL
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
})


//this route will diplay all the shortened URLs
app.get('/urls', (req, res) => {
  
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  }
  
  //this will render the urls_index.ejs and show the list of URLs
  res.render('urls_index', templateVars); 
})


// this redirecrs the short URL to its original URL  
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  // redirects the user to the original URL 
  res.redirect(longURL);
});


// this route will diplay a specific URL
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  // renders the urls_show.ejs and dispplays the URLS amd short form
  res.render("urls_show", templateVars);
});

app.get('/', (req, res) => {
  res.send("Hello");
})

app.get('/urls.json', (req, res) => {
  res.send(urlDatabase);
})
/*


ALL my POSTS


*/
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  
  if(!req.body.longURL.includes('http://')){
    req.body.longURL = 'http://' + req.body.longURL;
  }
  // saves the random id and the longURL
  urlDatabase[id] = req.body.longURL;
  console.log(urlDatabase);
  // this will redirect to the id urls:id
  res.redirect(`/urls/${id}`);

});

// this will delete the url
app.post('/urls/:id/delete', (req, res) => {
  
  const id = req.params.id;
  
  delete urlDatabase[id];

  // we are going to stay on the same page but just delete the url 
  res.redirect('/urls');
})


app.post('/urls/:id', (req, res) => {
  
  const id = req.params.id;

  urlDatabase[id] = req.body.longURL;
  
  res.redirect(`/urls/`);
})

app.post('/login', (req, res) => {

  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
})

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Listening on PORT: ${PORT}`);
})


function generateRandomString() {
  let result = ''
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  for (let i = 0; i < 6; i++)
  {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}