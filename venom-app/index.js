const express = require('express');
const venom = require('venom-bot');
const bodyParser = require('body-parser')
const fetch = require("cross-fetch");
const PORT = 3333;

venom
  .create()
  .then((client) => startVenom(client))
  .catch((erro) => {
    console.log(erro);
  });

function startVenom(client) {
  
  var app = express();
  app.use(bodyParser.json());
  app.listen(PORT, ()=>{
    console.log('Server running on port ' + PORT);
  });

  app.post('/sendtext', async(req, res) => {
    const { number, message } = req.body;
    await client.sendText(number + '@c.us', message);
  });

  client.onMessage(async(message) => {
    if(message.body == 'HOLA'){
      fetch('http://localhost:8080/issues.xml', { method:'GET'})
      .then(response => response.text())
      .then(text => console.log(text))
      .catch(error => (console.log(error)));
      //await client.sendText(message.from + '@c.us', message);
    } else if(message.body == 'CHAU'){
      fetch('http://localhost:8080/users.xml', {
        method:'GET', 
        headers: {
          'Authorization': 'Basic ' 
          + Buffer.from(admin + ":" + pass).toString('base64')
        }
      })
      .then(response => response.text())
      .then(text => console.log(text))
      .catch(error => (console.log(error)));
    }
  });
}

