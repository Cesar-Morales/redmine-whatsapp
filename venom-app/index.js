const express = require('express');
const venom = require('venom-bot');
const bodyParser = require('body-parser')
const fetch = require("node-fetch");
const base64= require("base-64");
require('dotenv').config('.env')

// Optimizar
let flowState = false;
let caseNumber = 999;
let issueText;
let issueTitle;

const username = process.env.USR
const password = process.env.PASS
const PORT = process.env.PORT;


function runServer(){
  let app = express();
  app.use(bodyParser.json());
  app.listen(PORT, ()=>{
    console.log('Server running on port ' + PORT);
  });

  app.post('/sendtext', async(req, res) => {
    const { number, message } = req.body;
    await client.sendText(number + '@c.us', message);
  });
}


venom
  .create()
  .then((client) => startVenom(client))
  .catch((erro) => {
    console.log(erro);
  });

function startVenom(client) {

  runServer();

  client.onMessage(async(message) => {
    
    // GET ISSUES
    if(message.body.toUpperCase() == 'ISSUES'){
      fetch('http://localhost:9900/issues.json')
      .then(response => response.text())
      .then(text => console.log(text))      /*client.sendText('NUM@c.us', text)*/
      .catch(error => (console.log(error)));
      //await client.sendText(message.from + '@c.us', message);
    } 
    // GET A USERS (NEED AUTH)
    else if(message.body.toUpperCase() == 'USERS'){
      const url = 'http://localhost:9900/users.json';
      let headers = new fetch.Headers({'Authorization': 'Basic ' + base64.encode(username + ":" + password)});
      fetch(url, { headers: headers })
      .then(async(resp) => {
        try {
          let xml = await resp.text();
          console.log(xml);               //send contact NUM ==> client.sendText('NUM@c.us', xml);
        } catch (error) {
          console.log('Error happened here!')
          console.error(error)
        }
      })
      .catch(error => (console.log(error)));
    } 
    // CREATE A ISSUE (NEED AUTH)
    else if(message.body.toUpperCase() == 'CREATE ISSUE'){
      const jsonToSend = '{"issue": {"project_id": 1,"subject": "Example54","priority_id": 2}}'
      let headers = new fetch.Headers({'Accept': 'application/json','Content-Type': 'application/json','Authorization': 'Basic ' + base64.encode(username + ":" + password)});
      fetch('http://localhost:9900/issues.xml', { method:'POST', headers: headers, body: jsonToSend })
      .then(async (resp) => {
        try {
          let xmlRecived = await resp.text();
          console.log(xmlRecived);  //client.sendText(message.from,'Carga exitosa');
        } catch (error) {
          console.log('Error happened here!')
          console.error(error)
        }
      })
      .catch(error => (console.log(error)));
    }
    // WELCOME MESSAGE
    else if(message.body.toUpperCase() == 'HOLA'){
      client.sendText(message.from, "Bienvenido a nuestro sistema automatico de tickets, si desea levantar un incidente escriba incidente.")
      .then(() => {
        caseNumber = 0
      })
    // ISSUE MESSAGE
    }else if(message.body.toUpperCase() == 'INCIDENTE'){
      client.sendText(message.from, "Por favor escriba el titulo de su incidente.")
    // ONLY WHEN SOMEONE SAYS HELLO CHANGE CASE NUMBER AND THIS WORK 
    }else{
      // POST WELCOME MESSAGE
      if(caseNumber == 0){
        caseNumber = 1
        flowState = !flowState
        issueTitle = message.body
        client.sendText(message.from, "Muchas gracias, ahora por favor escriba con detalles en un solo texto su incidente")
      // POST-POST WELCOME MESSAGE
      }else if(caseNumber == 1){
        caseNumber = 999
        flowState = !flowState
        issueText = message.body
        client.sendText(message.from, "Uno de nuestros técnicos estará revisando su pedido.")
        .then(() => {
          client.sendText(message.from, "Issue Title: " + issueTitle + "\nIssue Text: " + issueText)
        })
      }
      // UNTIL SOMEONE SAYS HELLO AGAIN IT DOESN'T WORK 
    }
  }
  );
}
