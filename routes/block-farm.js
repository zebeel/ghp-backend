var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  if (err) {
    console.log(`Database connect failed. ${err}`);
  }
});

router.post('/add', async function(req, res) {
  try {
    const date = req.body.date;
    const account = req.body.account;
    const collection = client.db("tool").collection("block-farm");
    const data = { 
      account,
      date,
      done: false,
    };
    await collection.insertOne(data);
    res.status(200).json({ status: true, data });
  } catch (error) {
    console.log(error)
    res.status(200).json({ status: false });
  }
});

router.post('/load-dates', async function(req, res) {
  try {
    const collection = client.db("tool").collection("block-farm");
    
    collection.find().toArray(function(err, result) {
      if (err) throw err;
      // const reactions = [];
      // for (const doc of result) {
      //   reactions[doc.post_id] = doc.reaction;
      // }
      res.status(200).json({ status: true, dates: result });
    });
  } catch (error) {
    console.log(error)
    res.status(200).json({ status: false });
  }
});

router.post('/done', async function(req, res) {
  try {
    const filter = { _id: require('mongodb').ObjectId(req.body.id) };
    const updateDocument = {
      $set: {
        done: req.body.done,
      },
    };
    const collection = client.db("tool").collection("block-farm");
    await collection.updateOne(filter, updateDocument);
    res.status(200).json({ status: true });
  } catch (error) {
    console.log(error)
    res.status(200).json({ status: false });
  }
});

router.post('/delete', async function(req, res) {
  try {
    const filter = { _id: require('mongodb').ObjectId(req.body.id) };
    const collection = client.db("tool").collection("block-farm");
    await collection.deleteOne(filter);
    res.status(200).json({ status: true });
  } catch (error) {
    console.log(error)
    res.status(200).json({ status: false });
  }
});

module.exports = router;
