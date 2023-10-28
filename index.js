const  express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000
const cors = require('cors')
const jwt  = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
app.use(cors({
  origin:["http://localhost:5173","http://localhost:5174"],
  credentials:true
}
))
app.use(express.json())
app.use(cookieParser())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hxdwxas.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const servicesCollection = client.db("carDoctor").collection("services")
    const checkOutCollection = client.db("carDoctor").collection("checkOutServices")
    app.get('/services' , async(req,res) => {
        const cursor  = servicesCollection.find()
        const services = await cursor.toArray()
       
        res.send(services)
    })
    app.get('/services/:id' , async(req,res) => {
      const id = req.params.id
      const query ={_id: new ObjectId(id)}
      const service = await servicesCollection.findOne(query)
      res.send(service)
    })
    app.post ('/checkOutServices' , async(req , res) => {
       const service = req.body
     
       const result = await checkOutCollection.insertOne(service)
       res.send(result)
    })
    app.post ('/jwt' , async(req,res) => {
      const user = req.body
      
      
      const token = jwt.sign(user , process.env.ACCESS_SECRET , {expiresIn : '1h'})
      res
      .cookie('token',token ,{
        httpOnly:true,
        secure:false,
        
      })
      .send({result: true})

    })
    app.get ('/checkOutServices/:email' , async(req,res) => {
      const email = req.params.email
      console.log('token', req.cookies.token)
      const query = {email : email}
      const result = await checkOutCollection.find(query).toArray()
      res.send(result)
      
      
     
    })
    app.delete ('/checkOutServices/:id' , async(req , res) => {
      const id = req.params.id
      const query = {_id : id}
      const result = await checkOutCollection.deleteOne(query)
      res.send(result)
        


    })

    app.patch('/checkOutServices/:id' , async(req , res) => {
        
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/' , (req, res) => {
    res.send("The server has been started for car-doctor-server")
})
app.listen(port , () => {
    console.log(`The server is running on the port${port}`)
})
