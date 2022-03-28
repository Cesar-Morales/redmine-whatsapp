
//https://www.redmine.org/projects/redmine/wiki/rest_api
//https://www.redmine.org/projects/redmine/wiki/Rest_Users
//https://www.redmine.org/projects/redmine/wiki/Rest_Issues

//IMPORTANTE ACTIVAR REST web service en redmine

const express = require('express');
const venom = require('venom-bot');
const bodyParser = require('body-parser')
const fetch = require("node-fetch");
const base64= require("base-64");
const PORT = 3333;

const username = 'user';
const password = 'pass';

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
    if(message.body == 'issues'){
      fetch('http://localhost:9900/issues.xml', { method:'GET'})
      .then(response => response.text())
      .then(text => /*client.sendText('NUM@c.us', text)*/console.log(text))
      .catch(error => (console.log(error)));
      //await client.sendText(message.from + '@c.us', message);
    } else if(message.body == 'users'){
      const url = 'http://localhost:9900/users.xml';
      let headers = new fetch.Headers({'Authorization': 'Basic ' + base64.encode(username + ":" + password)});
      fetch(url, {
              headers: headers
            })
      .then(async response => {
        try {
          let xml = await response.text();
          console.log(xml);
          //client.sendText('NUM@c.us', xml);
        } catch (error) {
          console.log('Error happened here!')
          console.error(error)
        }
      })
      .catch(error => (console.log(error)));
    } else if(message.body == 'crear issue'){
      const XMLBody = '<?xml version="1.0"?><issue><project_id>1</project_id><subject>Example2</subject><priority_id>1</priority_id><tracker>1</tracker></issue>'
      let headers = new fetch.Headers({'Authorization': 'Basic ' + base64.encode(username + ":" + password)});
      fetch('http://localhost:9900/issues.xml', { method:'POST', headers: headers, body: XMLBody})
      .then(async response => {
        try {
          let xml = await response.text();
          console.log(xml);
          //client.sendText(message.from,'Carga exitosa');
        } catch (error) {
          console.log('Error happened here!')
          console.error(error)
        }
      })
      .catch(error => (console.log(error)));
    }
  });
}
