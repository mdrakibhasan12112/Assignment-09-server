const express = require('express');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 8080;

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
);

// middleware
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      message: 'Unauthorized Access',
    });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      message: 'Invalid Token',
    });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log(payload);
    next();
  } catch (error) {
    return res.status(403).json({ message: 'something wrong' });
  }
};

async function run() {
  try {
    // await client.connect();
    // await client.db('admin').command({ ping: 1 });

    const db = client.db('drive-fleet-car');
    const carsCollection = db.collection('explore-car');
    const bookingCollection = db.collection('bookings');

    // app.get('/explore-car', async (req, res) => {
    //   const result = await carsCollection.find().toArray()
    //   res.json(result)
    // })

    app.get('/explore-car', async (req, res) => {
      const search = req.query.search || '';
      const type = req.query.type || '';

      let query = {};

      if (search) {
        query.CarName = {
          $regex: search,
          $options: 'i',
        };
      }

      if (type) {
        query.carType = type;
      }

      const result = await carsCollection.find(query).toArray();

      res.json(result);
    });

    // find all data in explore-car
    app.post('/explore-car', verifyToken, async (req, res) => {
      const carsData = req.body;
      console.log(carsData);
      const result = await carsCollection.insertOne(carsData);
      res.json(result);
    });

    // middlewire
    app.get('/explore-car/:id', verifyToken, async (req, res) => {
      const { id } = req.params;
      const result = await carsCollection.findOne({ _id: new ObjectId(id) });
      res.json(result);
    });

    // edit car model
    app.patch('/explore-car/:id', verifyToken, async (req, res) => {
      const { id } = req.params;
      const updatedData = req.body;

      const result = await carsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData },
      );
      res.json(result);
    });

    // delete car data
    app.delete('/explore-car/:id', verifyToken, async (req, res) => {
      const { id } = req.params;
      const result = await carsCollection.deleteOne({ _id: new ObjectId(id) });
      res.json(result);
    });

    // sent booking data in forntend
    app.get('/my-bookings/:userId', async (req, res) => {
      const { userId } = req.params;
      const result = await bookingCollection.find({ userId: userId }).toArray();
      res.json(result);
    });

    // recive booking data
    app.post('/my-bookings', verifyToken, async (req, res) => {
      const bookingData = req.body;
      const result = await bookingCollection.insertOne(bookingData);
      res.json(result);
    });

    // delete booking card
    app.delete('/my-bookings/:bookingId', verifyToken, async (req, res) => {
      const { bookingId } = req.params;
      const result = await bookingCollection.deleteOne({
        _id: new ObjectId(bookingId),
      });
      res.json(result);
    });

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
