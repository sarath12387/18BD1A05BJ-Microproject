//reqire modules
const express = require("express");
const app = express();

//conect server.js and middleware.js
const server = require('./server');
const middleware = require('./middleware');

//body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.json());

//connecting to mongodb
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'hospitalInventory';
MongoClient.connect(url, {
    useUnifiedTopology: true
}, (err, client) => {
    if (err) return console.log(err);

    db = client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
});

app.get('/', (req, res) => {
    console.log("Home Page");
    res.send("Home Page");
});


//FETCHING HOSPITAL 
app.get('/hospitaldetails', middleware.checkToken, (req, res) => {
    console.log("fetching data from hospital...");
    const data = db.collection('hospital').find().toArray().then(result => res.json(result));
});

//FETCHING VENTILATORS DETAILS 
app.get('/ventilatordetails', middleware.checkToken, (req, res) => {
    console.log("fetching data for ventilators...");
    const data = db.collection('ventilators').find().toArray().then(result => res.json(result));
});

//SEARCH VENTILATORS BY STATUS
app.post('/searchventbystatus', middleware.checkToken, (req, res) => {
    const status = req.query.status;
    console.log(status);
    const ventilatordetails = db.collection('ventilators').find({
        "status": status
    }).toArray().then(result => result.length ? res.json(result) : res.status(404).send("No ventilator found with given status"));

});

//SEARCH VENTILATORS IN HOSPITAL BY NAME
app.post('/searchventbyname', middleware.checkToken, (req, res) => {
    const name = req.query.name;
    console.log(name);
    const ventilatordetails = db.collection('ventilators').find({
        "name": new RegExp(name, 'i')
    }).toArray().then(result => result.length ? res.json(result) : res.status(404).send("No ventilator found with given name"));
});

//SEARCH HOSPITAL
app.post('/searchhospital', middleware.checkToken, (req, res) => {
    const name = req.query.name;
    console.log(name);
    const hospitaldetails = db.collection('hospital').find({
        "name": new RegExp(name, 'i')
    }).toArray().then(result => result.length ? res.json(result) : res.status(404).send("No hospital found with given name"));
});

//ADDING VENTILATORS
app.post('/addventilatorsbyuser', middleware.checkToken, (req, res) => {
    const hId = req.body.hId;
    const ventilatorId = req.body.ventilatorId;
    const status = req.body.status;
    const name = req.body.name;

    if (!hId || !ventilatorId || !status || !name) {
        res.status(400).send("All 4 fields should be filled");
        return;
    }
    const item = {
        hId: hId,
        ventilatorId: ventilatorId,
        status: status,
        name: name
    };
    db.collection('ventilators').insertOne(item, function (err, result) {
        res.json('Item inserted');
    });
});


//UPDATE VENTILATOR DETAILS USING ventID
app.put('/updateventilator', middleware.checkToken, (req, res) => {

    const ventid = {
        ventilatorId: req.body.ventilatorId
    };
    const newvalues = {
        $set: {
            status: req.body.status
        }
    };
    db.collection('ventilators').updateOne(ventid, newvalues, function (err, result) {
        if (err) throw err;
        res.json('1 document updated');
    })
});

//DELETE VENTILATOR BY ventID
app.delete('/deletebyid', middleware.checkToken, (req, res) => {
    const ventid = req.body.ventilatorId;
    console.log(ventid);
    const value = {
        ventilatorId: ventid
    };
    db.collection('ventilators').deleteOne(value, function (err, obj) {
        if (err) throw err;
        res.json('1 document deleted');
    });
})



app.listen(process.env.PORT || 9000);