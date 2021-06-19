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
const secretKey = `J8F7&?ik74<'('*^/ddFrp="qn3+P3^N>#k][kgwdx3V}ZvM6uZdsld*qwz%S"4`;

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('posts response');
});

router.post('/approve', async function(req, res) {
  try {
    if (req.body.secretKey !== secretKey) {
      throw 'Invalid secret key!';
    }
    const filter = { _id: require('mongodb').ObjectId(req.body.id) };
    const updateDocument = {
      $set: {
        approved: !!req.body.approved,
      },
    };
    const collection = client.db("ourway").collection("comment");
    await collection.updateOne(filter, updateDocument);
    res.status(200).json({ status: true });
  } catch (error) {
    console.log(error)
    res.status(200).json({ status: false });
  }
});

router.post('/delete', async function(req, res) {
  try {
    if (req.body.secretKey !== secretKey) {
      throw 'Invalid secret key!';
    }
    const filter = { _id: require('mongodb').ObjectId(req.body.id) };
    const collection = client.db("ourway").collection("comment");
    await collection.deleteOne(filter);
    res.status(200).json({ status: true });
  } catch (error) {
    console.log(error)
    res.status(200).json({ status: false });
  }
});

router.post('/auth', async function(req, res) {
  try {
    if (req.body.secretKey !== secretKey) {
      throw 'Invalid secret key!';
    }
    const collection = client.db("ourway").collection("comment");
    collection.find().toArray(function(err, result) {
      if (err) throw err;
      const comments = [];
      for (const doc of result) {
        comments.push(doc);
      }
      res.status(200).json({ status: true, comments: comments });
    });
  } catch (error) {
    console.log(error)
    res.status(200).json({ status: false });
  }
});

module.exports = router;