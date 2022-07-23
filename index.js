const express = require('express')
const app = express()
const port = process.env.PORT || 5000
var cors = require('cors')
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');


// Middle ware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y46qz7a.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    const collection = client.db("test").collection("devices");
    
    
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!Web home')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})