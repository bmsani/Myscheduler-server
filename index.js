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
    const scheduleCollection = client.db("MyScheduler").collection("schedules");
    const userAvailabilityCollection = client
      .db("MyScheduler")
      .collection("userAvailability");

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

    //  Availability Api section //////////////////////////////////////////////////

    app.get("/availability/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await userAvailabilityCollection.findOne(filter);
      res.send(result);
    });

    app.put("/userAvailability/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const availability = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: availability,
      };
      const result = await userAvailabilityCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // app.put("/availability/checked/:id", async (req, res) => {
    //   const daysId = req.params.id;
    //   const { newDay, dataId } = req.body;
    //   const { id, day, start, end, checked, interval } = newDay;
    //   const filter = { _id: ObjectId(dataId) };
    //   const findData = await userAvailabilityCollection.findOne(filter);
    //   const checkedChange = findData.dayData.find((d) => d.id === daysId);
    //   const options = { upsert: true };
    //   const updateDoc = {
    //     $set: {
    //       id: id,
    //       day: day,
    //       start: start,
    //       end: end,
    //       checked: checked,
    //       interval: interval,
    //     },
    //   };
    //   const result = await userAvailabilityCollection.updateOne(
    //     options,
    //     updateDoc,
    //     checkedChange
    //   );
    //   console.log(result);
    // });

    app.put("/availability/checked/:id", verifyJWT, async (req, res) => {
      console.log(req.decoded.email);
      const email = req.query.email;
      console.log(email);
      if (req.decoded.email !== email) {
        return res.status(403).send({ message: "Access forbidden" });
      }
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const find = await userAvailabilityCollection.findOne(filter);
      const dayId = req.query.dayDataId;
      const dayData = find.dayData.find((day) => day.id === dayId);
      if (req.query.dayStatus === "false") {
        dayData.checked = false;
      } else if (req.query.dayStatus === "true") {
        dayData.checked = true;
      }
      const options = { upsert: true };
      const updateDoc = {
        $set: find,
      };
      const result = await userAvailabilityCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Demo project ///////////////////////////////////////////
    app.get("/availability", async (req, res) => {
      const result = await scheduleCollection.find().toArray();
      res.send(result);
    });

    // / ///////////////////////////////////////////////////////////  //
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
