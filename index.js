const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 2132;

const app = express();

// middlewares

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mongodbexploring.ykpstem.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection = client.db("ParcelDB").collection("users");
    const bookingCollection = client.db("ParcelDB").collection("bookings");

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get("/user", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      ``;
      res.send(result);
    });

    // get user role
    app.get("/users/role/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      let deliveryMen = false;
      if (user?.role === "admin") {
        admin = user?.role === "admin";
      } else if (user?.role === "provider") {
        deliveryMen = user?.role === "provider";
      }
      res.send({ admin, deliveryMen });
    });

    //  get allDeliveryMen
    app.get("/allDeliveryMen", async (req, res) => {
      const query = { role: "provider" };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    // update delivery count 
    app.patch('/countDelivery/:id', async(req, res) => {
      const id = req.params.id;
      console.log('Count Delivery ', id);
      const countDelivery = req.body;
      const query = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: {
          countDelivery: countDelivery.countDelivery
        }
      }
      const result = await userCollection.updateOne(query, updatedDoc)
      res.send(result)

    })

    // user post
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // get all bookings 
    app.get('/allBookings', async(req, res) => {
      const result = await bookingCollection.find().toArray();
      res.send(result);
    })
    // get bookings by user
    app.get("/bookings", async (req, res) => {
      const user = req.query.email;
      console.log(user);
      const query = { bookingUserEmail: user };
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    // get myDelivery list
    app.get("/myDelivery/:id", async (req, res) => {
      const id = req?.params?.id;
      const query = {deliveryMenId : id}
      const result = await bookingCollection.find(query).toArray();
      res.send(result)
    });

    app.get("/allBookings", async (req, res) => {
      const result = await bookingCollection.find().toArray();
      res.send(result);
    });

    app.get("/singleBooking/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.findOne(query);
      res.send(result);
    });

    // update booking
    app.patch("/updateBooking/:id", async (req, res) => {
      const doc = req.body;
      console.log(doc);
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          requestedDeliveryDate: doc.requestedDeliveryDate,
          bookingUserPhone: doc.bookingUserPhone,
          deliveryAddress: doc.deliveryAddress,
          recieverPhone: doc.recieverPhone,
          deliveryPrice: doc.deliveryPrice,
          recieverName: doc.recieverName,
          parcelType: doc.parcelType,
          longitude: doc.longitude,
          latitude: doc.latitude,
          weight: doc.weight,
        },
      };
      const result = await bookingCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    // update booking status by user
    app.patch("/updateStatus/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const status = req.body;
      const updatedDoc = {
        $set: {
          status: status.status,
        },
      };

      const result = await bookingCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    // update booking status by admin
    app.patch("/updateDeliveryMen/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updated = req.body;
      const updatedDoc = {
        $set: {
          status: updated.status,
          approximateDeliveryDate: updated.approximateDeliveryDate,
          deliveryMenId: updated.deliveryMenId,
        },
      };

      const result = await bookingCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // update user role
    app.patch("/updateRole/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const role = req.body;
      const updatedDoc = {
        $set: {
          role: role.role,
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // booking post
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(`Parcel management is running on ${port}`);
});

app.listen(port, (req, res) => {
  console.log("Parcel mangement server is running on ", port);
});
