const express = require('express');
const dotenv = require("dotenv")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors");
dotenv.config();
const app = express();
app.use(cors())
const port = process.env.PORT || 8080;

// 
// 

const uri =
  'mongodb+srv://drive-fleet-car:wgycOBqDcZfut8nI@cluster0.uqfhva4.mongodb.net/?appName=Cluster0';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
   
   const db = client.db("drive-fleet-car");
   const carsCollection = db.collection("explore-car")
   
   // find all data in explore-car
   app.get('/explore-car', async (req, res) => {
    const cursor = carsCollection.find();
    const result = await cursor.toArray();
    res.send(result)
   })

   // find one data in explore-car and get _id
   app.get('/explore-car/:carId', async (req, res) => {
    const { carId } = req.params;
    const query = { _id: new ObjectId(carId) };
    const result = await carsCollection.findOne(query);
    res.send(result)
   })
   
   
   
   
   
   
   
   console.log(
      'Pinged your deployment. You successfully connected to MongoDB!',
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
