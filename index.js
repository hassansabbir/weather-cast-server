const express = require("express");
const app = express();
const cors = require("cors");
const SSLCommerzPayment = require("sslcommerz-lts");
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

const store_id = process.env.DONATION_PAYMENT_ID;
const store_passwd = process.env.DONATION_PAYMENT_PASS;
const is_live = false;

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
    const postCollection = client.db("weatherCast").collection("post");
    const favLocationCollection = client
      .db("weatherCast")
      .collection("favLocation");

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

    app.get("/allProductFeatures/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productFeatureCollection.findOne(query);
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

    //blogsCollection

    // search blog by title
    const indexKey = { title: 1 };
    const indexOptions = { name: "titleNameIndex" };
    const result = await blogsCollection.createIndex(indexKey, indexOptions);
    app.get("/searchBlog/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await blogsCollection
        .find({
          $or: [{ title: { $regex: searchText, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });

    // pagination
    app.get("/blogs", async (req, res) => {
      const page = parseInt(req.query.page || 1);
      const perPage = parseInt(req.query.perPage || 6);
      const skip = (page - 1) * perPage;
      const blogs = await blogsCollection
        .find({})
        .skip(skip)
        .limit(perPage)
        .toArray();
      res.send(blogs);
    });

    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogsCollection.findOne(query);
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

    app.patch("/articles/approve/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "approved",
        },
      };
      const result = await articlesCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/articles/denied/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "denied",
        },
      };
      const result = await articlesCollection.updateOne(filter, updateDoc);
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

    //PostCollection

    app.get("/post", async (req, res) => {
      const result = await postCollection.find().toArray();
      res.send(result);
    });

    app.get("/post/:email", async (req, res) => {
      const authorEmail = req.params.email;
      const result = await postCollection.find({ authorEmail }).toArray();
      res.send(result);
    });

    app.post("/post", async (req, res) => {
      const newItem = req.body;
      newItem.comments = [];

      try {
        newItem.createdAt = new Date();

        const result = await postCollection.insertOne(newItem);
        res.json({ insertedId: result.insertedId });
      } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.get("/post/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const post = await postCollection.findOne(query);

      if (!post.comments) {
        post.comments = [];
      }

      res.send(post);
    });

    app.delete("/post/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      try {
        const result = await postCollection.deleteOne(query);

        if (result.deletedCount === 1) {
          res.json({ message: "Post deleted successfully" });
        } else {
          res.status(404).json({ message: "Post not found" });
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.put("/post/:postId", async (req, res) => {
      const { postId } = req.params;
      const { content } = req.body;

      try {
        const query = { _id: new ObjectId(postId) };
        const update = { $set: { content } };

        const result = await postCollection.updateOne(query, update);

        if (result.modifiedCount === 1) {
          const updatedPost = await postCollection.findOne(query);
          return res.status(200).json(updatedPost);
        } else {
          return res.status(404).json({ message: "Post not found" });
        }
      } catch (error) {
        console.error("Error updating post:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
    });

    //Like

    app.post("/post/:id/like", async (req, res) => {
      const postId = req.params.id;

      try {
        const query = { _id: new ObjectId(postId) };
        const update = {
          $inc: { likes: 1 },
          $set: { likedByCurrentUser: true },
        };

        const result = await postCollection.updateOne(query, update);

        if (result.modifiedCount === 1) {
          res.json({ message: "Post liked" });
        } else {
          res.status(404).json({ message: "Post not found" });
        }
      } catch (error) {
        console.error("Error liking the post:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    //unlike
    app.post("/post/:id/unlike", async (req, res) => {
      const postId = req.params.id;

      try {
        const query = { _id: new ObjectId(postId) };
        const update = {
          $inc: { likes: -1 },
          $set: { likedByCurrentUser: false },
        };

        const result = await postCollection.updateOne(query, update);

        if (result.modifiedCount === 1) {
          res.json({ message: "Post unliked" });
        } else {
          res.status(404).json({ message: "Post not found" });
        }
      } catch (error) {
        console.error("Error unliking the post:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // new comment
    app.post("/post/:id/comment", async (req, res) => {
      const postId = req.params.id;
      const { content, userId, userName } = req.body;

      try {
        const post = await postCollection.findOne({
          _id: new ObjectId(postId),
        });

        if (!post) {
          return res.status(404).json({ message: "Post not found" });
        }

        if (!post.comments) {
          post.comments = [];
        }

        const createdAt = new Date();
        const newComment = {
          _id: new ObjectId(),
          userId,
          userName,
          content,
          createdAt,
        };

        post.comments.push(newComment);

        const result = await postCollection.updateOne(
          { _id: new ObjectId(postId) },
          { $set: { comments: post.comments } }
        );

        if (result.modifiedCount === 1) {
          res.json({ message: "Comment added" });
        } else {
          res.status(500).json({ message: "Error adding comment" });
        }
      } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.get("/post/:id/comments", async (req, res) => {
      const postId = req.params.id;

      try {
        const post = await postCollection.findOne({
          _id: new ObjectId(postId),
        });

        if (!post) {
          return res.status(404).json({ message: "Post not found" });
        }

        res.json({ comments: post.comments });
      } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Internal server error" });
      }
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

    // Favorite location

    app.post("/favLoc", async (req, res) => {
      const favoriteLoc = req.body; // Receive the favoriteLoc object from the request body
      const query = {
        email: favoriteLoc.email,
        location: favoriteLoc.location,
      };
      const existingFavoriteLoc = await favLocationCollection.findOne(query);

      if (existingFavoriteLoc) {
        return res.send({ message: "Favorite location already exists" });
      }

      const result = await favLocationCollection.insertOne(favoriteLoc);
      res.send(result);
    });

    app.get("/favLoc/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { email: userEmail };
      const cursor = favLocationCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    const donationCollection = client.db("weatherCast").collection("donation");

    const tran_id = new ObjectId().toString();

    app.post("/donation", async (req, res) => {
      const { donationAmount, displayName, email } = req.body;

      // console.log("Donation Amount:", donationAmount);
      // console.log("Display Name:", displayName);
      // console.log("Email:", email);

      const data = {
        total_amount: donationAmount,
        currency: "BDT",
        tran_id: tran_id,
        success_url: `https://weather-cast-server.vercel.app/payment/success/${tran_id}`,
        fail_url: `https://weather-cast-server.vercel.app/payment/fail/${tran_id}`,
        cancel_url: "https://weather-cast-server.vercel.app/cancel",
        ipn_url: "https://weather-cast-server.vercel.app/ipn",
        shipping_method: "Courier",
        product_name: "Computer.",
        product_category: "Electronic",
        product_profile: "general",
        cus_name: displayName,
        cus_email: email,
        cus_add1: "Dhaka",
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: "01711111111",
        cus_fax: "01711111111",
        ship_name: "Customer Name",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };
      console.log(data);
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      sslcz.init(data).then((apiResponse) => {
        let GatewayPageURL = apiResponse.GatewayPageURL;
        res.send({ url: GatewayPageURL });

        const completeDonation = {
          donationAmount,
          displayName,
          email,
          paidStatus: false,
          tranjectionId: tran_id,
          paymentTime: new Date(),
        };

        const result = donationCollection.insertOne(completeDonation);
        console.log("Redirecting to: ", GatewayPageURL);
      });
    });

    app.post("/payment/success/:tranId", async (req, res) => {
      console.log(req.params.tranId);

      const result = await donationCollection.updateOne(
        { tranjectionId: req.params.tranId },
        {
          $set: {
            paidStatus: true,
          },
        }
      );
      if (result.modifiedCount > 0) {
        res.redirect(`https://weather-cast-six.vercel.app/community/Payment`);
      }
    });

    app.post("/payment/fail/:tranId", async (req, res) => {
      const tranId = req.params.tranId;

      const existingDonation = await donationCollection.findOne({
        tranjectionId: tranId,
      });
      if (existingDonation && existingDonation.paidStatus === true) {
        return res.redirect(
          `https://weather-cast-six.vercel.app/community/Payment`
        );
      }

      const result = await donationCollection.updateOne(
        { tranjectionId: tranId },
        {
          $set: {
            paidStatus: false,
          },
        }
      );

      if (result.modifiedCount >= 0) {
        res.redirect(`https://weather-cast-six.vercel.app/community/Payment`);
      } else {
        res.status(404).json({
          message: "Donation not found or already marked as failed.",
        });
      }
    });

    app.get("/payment/success", async (req, res) => {
      try {
        const successfulPayments = await donationCollection
          .find({ paidStatus: true })
          .toArray();

        console.log("Successful Payments:", successfulPayments);

        res.json(successfulPayments);
      } catch (error) {
        console.error("Error retrieving successful payments:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/payment/success/:email", async (req, res) => {
      try {
        const authorEmail = req.params.email;
        const result = await donationCollection
          .find({ email: authorEmail })
          .toArray();

        if (result) {
          res.json(result);
        } else {
          res.status(404).json({ error: "No matching records found." });
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/payment/fail", async (req, res) => {
      try {
        const failPayments = await donationCollection
          .find({ paidStatus: false })
          .toArray();

        console.log("Fail Payments:", failPayments);

        res.json(failPayments);
      } catch (error) {
        console.error("Error retrieving fail payments:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/payment/fail/:email", async (req, res) => {
      try {
        const authorEmail = req.params.email;
        const result = await donationCollection
          .find({ email: authorEmail })
          .toArray();

        if (result) {
          res.json(result);
        } else {
          res.status(404).json({ error: "No matching records found." });
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/payment", async (req, res) => {
      try {
        const successfulPayments = await donationCollection
          .find({ paidStatus: true, paidStatus: false })
          .toArray();

        console.log("Successful Payments:", successfulPayments);

        res.json(successfulPayments);
      } catch (error) {
        console.error("Error retrieving successful payments:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.delete("/favLoc/:email/:location", async (req, res) => {
      try {
        const userEmail = req.params.email;
        const location = req.params.location;
        const query = { email: userEmail, location: location };

        const result = await favLocationCollection.deleteOne(query);

        if (result.deletedCount === 1) {
          res.send({ message: "Location removed from favorites" });
        } else {
          res.status(404).send({ message: "Location not found in favorites" });
        }
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ message: "Internal server error" });
      }
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
  res.send("weatherCast is forecasting...");
});

app.listen(port, () => {
  console.log(`Weather is forecasting on port ${port}`);
});
