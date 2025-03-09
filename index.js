const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const app = express();
const cors = require("cors");
require("dotenv").config()
const port = process.env.PORT || 5001;


app.use(cors({

  origin: ['http://localhost:5173','https://collagebook-e5c29.web.app', 'https://collagebook-e5c29.firebaseapp.com'], 
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
));
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xsfs6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    // await client.connect();
    const collageCollection = client.db('PlacmentDB').collection('Collagelist')
    const reviewCollection = client.db('PlacmentDB').collection('Review')
    const admissionsCollection =client.db('PlacmentDB').collection('Application')
    const userCollection = client.db('PlacmentDB').collection('user')
app.post('/users', async(req,res)=>{
  const userData=req.body;
  const query = {email: userData.email}
  const existingUser = await userCollection.findOne(query)
  if(existingUser){
    return res.send({message:'user already existed', insertedId: null})
  }
  const result = await userCollection.insertOne(userData)
  res.send(result);
})

app.get('/user/:email', async (req, res) => {
  const email = req.params.email; 
  const query = { email: email };
  
  try {
    const result = await userCollection.findOne(query);
    if (!result) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
});

app.patch('/user/:email', async (req, res) => {
  const email = req.params.email;
  const updatedData = req.body;

  try {
      const filter = { email: email };
      const updateDoc = { $set: updatedData };

      const result = await userCollection.updateOne(filter, updateDoc);
      if (result.modifiedCount === 0) {
          return res.status(400).send({ message: "No changes made" });
      }

      const updatedUser = await userCollection.findOne(filter);
      res.send(updatedUser);
  } catch (error) {
      res.status(500).send({ message: "Failed to update user data", error });
  }
});

app.get('/allcollage', async (req, res) => {
  try {
    const result = await collageCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error', message: error.message });
  }
});

const { ObjectId } = require("mongodb"); 

app.get("/college/:id", async (req, res) => {
    try {
        const collegeId = req.params.id;

       
        const college = await collageCollection.findOne({ _id: new ObjectId(collegeId) });

        if (!college) {
            return res.status(404).json({ message: "College not found" });
        }

        res.json(college); 
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});


app.post("/application/admissions", async (req, res) => {
  try {
    const { college, candidateName, subject, email, phone, address, dob, imageUrl } = req.body;


    if (!college || !candidateName || !subject || !email || !phone || !address || !dob || !imageUrl) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const admissionData = { college, candidateName, subject, email, phone, address, dob, imageUrl };

    const result = await admissionsCollection.insertOne(admissionData);

    res.status(201).json({
      message: "Admission submitted successfully",
      data: result.ops[0], 
    });
  } catch (error) {
    console.error("Error submitting admission:", error);
    res.status(500).json({ error: "Failed to submit admission", message: error.message });
  }
});

app.get("/admission/:email", async (req, res) => {
  try {
    const { email } = req.params; 
    const admissionData = await admissionsCollection.find({ "email": email }).toArray();

    if (!admissionData) {
      return res.status(404).json({ message: "No admission data found for this email" });
    }

    res.json(admissionData);  
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

app.post("/addReview", async (req, res) => {
  console.log(req.body); 
  try {
    const { userName, userImage, reviewContent, rating, reviewDate } = req.body;
    const newReview = {
      userName,
      userImage,
      reviewContent,
      rating,
      reviewDate,
    };

    const result = await reviewCollection.insertOne(newReview);

    
    if (result.acknowledged) {
      const insertedReview = {
        _id: result.insertedId,
        ...newReview, 
      };

      res.status(200).json({ message: "Review added successfully!", review: insertedReview });
    } else {
      res.status(500).json({ message: "Failed to add review" });
    }
  } catch (error) {
    console.log(error); 
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});




app.get('/allreview', async (req, res) => {
  try {
    const result = await reviewCollection.find().toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error', message: error.message });
  }
});











    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
 

  }
}



run().catch(console.dir);
app.get('/', (req,res)=>{
    res.send('Job Task')
})
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
