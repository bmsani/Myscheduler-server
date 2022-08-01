const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
var cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y46qz7a.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Access forbidden" });
    }
    req.decoded = decoded;
    next();
  });
};

async function run() {
  try {
    await client.connect();

    const usersCollection = client.db("MyScheduler").collection("users");
    const scheduleCollection = client.db("MyScheduler").collection("schedule");

    app.get("/user/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const user = await usersCollection.findOne(filter);
      res.send(user);
    });

    app.put("/updatedUser/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const { name, message, mobile } = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: name,
          message: message,
          mobile: mobile,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.put("/brandLogo/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const brandLogo = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updatedDoc = {
        $set: brandLogo,
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      console.log(user);
      const filter = { email: email };
      const options = { upsert: true };
      const updatedDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      res.send({ result, token });
    });

    // Scheduling Api section

    app.get("/schedule/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const filter = { appointUser: email };
      const result = await scheduleCollection.find(filter).toArray();
      res.send(result);
    });

    app.post("/schedule/:email", async (req, res) => {
      const data = req.body;
      const result = await scheduleCollection.insertOne(data);
      res.send(result);
    });

    app.patch("/updateSchedule/:id", async (req, res) => {
      const id = req.params.id;
      const { appointDay, appointName, appointTime } = req.body;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          appointDay: appointDay,
          appointName: appointName,
          appointTime: appointTime,
        },
      };
      const result = await scheduleCollection.updateOne(
        filter,
        updatedDoc
      );
      res.send(result);
    });

    app.delete("/schedule/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await scheduleCollection.deleteOne(filter);
      res.send(result);
    });

    // ///////////////////////////////////////////////////////////////////////////////
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World! from MyScheduler");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
