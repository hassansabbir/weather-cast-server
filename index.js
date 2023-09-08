const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@webwizerd.gtwxqnt.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const bannerCollection = client.db("weatherCast").collection("banners");
    const productFeatureCollection = client
      .db("weatherCast")
      .collection("productFeatures");
    const teamDetailsCollection = client
      .db("weatherCast")
      .collection("teamDetails");
    const reviewsCollection = client.db("weatherCast").collection("reviews");
    const blogsCollection = client.db("weatherCast").collection("blogs");
    const articlesCollection = client.db("weatherCast").collection("articles");
    const userCollection = client.db("weatherCast").collection("users");
    const favLocationCollection = client.db("weatherCast").collection("favLocation");

    //bannerCollection

    app.get("/banners", async (req, res) => {
      const result = await bannerCollection.find().toArray();
      res.send(result);
    });

    //productFeatureCollection

    app.get("/productFeatures", async (req, res) => {
      const result = await productFeatureCollection.find().toArray();
      res.send(result);
    });

    //teamDetailsCollection

    app.get("/teamDetails", async (req, res) => {
      const result = await teamDetailsCollection.find().toArray();
      res.send(result);
    });

    //reviewsCollection

    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const result = await reviewsCollection.insertOne(req.body);
      res.send(result);
    });

    //blogCollection

    app.get("/blogs", async (req, res) => {
      const result = await blogsCollection.find().toArray();
      res.send(result);
    });

    //articleCollection

    app.get("/articles", async (req, res) => {
      const result = await articlesCollection.find().toArray();
      res.send(result);
    });

    app.get("/articles/:email", async (req, res) => {
      const authorEmail = req.params.email;
      const result = await articlesCollection.find({ authorEmail }).toArray();
      res.send(result);
    });

    app.post("/articles", async (req, res) => {
      const newItem = req.body;
      const result = await articlesCollection.insertOne(newItem);
      res.send(result);
    });

    app.get("/allArticles/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await articlesCollection.findOne(query);
      res.send(result);
    });

    //userCollection

    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get("/users/:email", async (req, res) => {
      const query = { email: req.params.email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const updatedUserData = req.body;
      const filter = { email: email }; // Filter by email
      const options = { upsert: true };
      const updatedUser = {
        $set: {
          contact: updatedUserData.contact,
          address: updatedUserData.address,
          country: updatedUserData.country,
        },
      };
      const result = await userCollection.updateOne(
        filter,
        updatedUser,
        options
      );
      res.send(result);
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/users/visitor/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "visitor",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/users/banned/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "banned",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exists" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

   
// Add this route to check if a city is a favorite
app.post("/checkFavorite", async (req, res) => {
  const { email, location } = req.body;
  const favorite = await favLocationCollection.findOne({ email, location });

  if (favorite) {
    res.status(200).send({ message: 'City is already a favorite' });
  } else {
    res.status(404).send({ message: 'City is not a favorite' });
  }
});

 // Favorite location 
 app.post("/favLoc", async (req, res) => {
  const user = req.body ;
  const query = { email: user.email };
  const existingUser = await userCollection.findOne(query);
  if (existingUser) {
    return res.send({ message: "User already exists" });
  }
  const result = await favLocationCollection.insertOne(user);
  res.send(result);
});

// get favorite location
app.get("/favLoc", async (req, res) => {
  const result = await favLocationCollection.find().toArray();
  res.send(result);
});

app.get("/favLoc/:email", async (req, res) => {
  const query = { email: req.params.email };
  const result = await favLocationCollection.findOne(query);
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
  res.send("weather is forecasting...");
});

app.listen(port, () => {
  console.log(`Weather is forecasting on port ${port}`);
});
