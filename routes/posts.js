var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  if (err) {
    console.log(`Database connect failed. ${err}`);
  } else {
    console.log('Database connected.');
  }
});

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('posts response');
});

router.post('/react', async function(req, res) {
  try {
    let post_id = req.body.postID;
    if (!(Number.isInteger(post_id) && post_id > 0 && post_id < 100)) post_id = 0;
    let count = req.body.count;
    if (!(Number.isInteger(count) && count > 0 && count < 5)) count = 1;
    const collection = client.db("ourway").collection("reaction");
    const result = await collection.findOne({ post_id: post_id });
    let reaction = 1;
    if (!result) {
      await collection.insertOne({ post_id: post_id, reaction: 1 });
    } else {
      reaction = result.reaction + count;
      const updateDoc = {
        $set: {
          reaction: reaction,
        },
      };
      await collection.updateOne({ post_id: post_id }, updateDoc);
    }
    res.status(200).json({ status: true, reaction: reaction });
  } catch (error) {
    console.log(error)
    res.status(200).json({ status: false });
  }
});

router.post('/comment', async function(req, res) {
  try {
    const post_id = req.body.postID;
    const content = req.body.content;
    const by = req.body.by;
    if (!content || !by) throw 'content and by not null';
    const collection = client.db("ourway").collection("comment");
    const data = { 
      post_id: post_id,
      content: content,
      by: by,
      at: new Date(),
    };
    await collection.insertOne(data);
    res.status(200).json({ status: true, comment: data });
  } catch (error) {
    console.log(error)
    res.status(200).json({ status: false });
  }
});

router.post('/load-reactions', async function(req, res) {
  try {
    const collection = client.db("ourway").collection("reaction");
    
    collection.find().toArray(function(err, result) {
      if (err) throw err;
      const reactions = [];
      for (const doc of result) {
        reactions[doc.post_id] = doc.reaction;
      }
      res.status(200).json({ status: true, reactions: reactions });
    });
  } catch (error) {
    console.log(error)
    res.status(200).json({ status: false });
  }
});

router.post('/load-comments', async function(req, res) {
  try {
    const collection = client.db("ourway").collection("comment");
    collection.find().toArray(function(err, result) {
      if (err) throw err;
      const comments = [];
      for (const doc of result) {
        if (!doc.approved) continue;
        if (!comments[doc.post_id]) comments[doc.post_id] = [];
        comments[doc.post_id].push(doc);
      }
      res.status(200).json({ status: true, comments: comments });
    });
  } catch (error) {
    console.log(error)
    res.status(200).json({ status: false });
  }
});

module.exports = router;