const express = require('express');
const app = express();
const PORT = 8080;


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}


app.get('/urls.json', (req, res) => {
  res.send(urlDatabase);
})


app.get('/urls', (req, res) => {
  
  const templateVars = {
    urls: urlDatabase
  }
  
  res.render('urls_index', templateVars);
 
})

app.post("/urls", (req, res) => {
  const id = generateRandomString();

  // saves the random id and the longURL
  urlDatabase[id] = req.body.longURL;

  // this will redirect to the id urls:id
  res.redirect(`/urls/${id}`);

});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
})
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});


app.get('/', (req, res) => {
  res.send("Hello");
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