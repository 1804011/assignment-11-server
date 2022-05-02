const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xgdpd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});
async function run() {
	try {
		await client.connect();
		app.post("/inventory-items", async (req, res) => {
			const database = client.db("inventory-items");
			const itemsCollection = database.collection("items");
			const result = await itemsCollection.insertOne(req.body);
			res.send(result);
		});
		app.get("/inventory-items", async (req, res) => {
			const limit = parseInt(req.query?.limit);
			const database = client.db("inventory-items");
			const itemsCollection = database.collection("items");
			const query = {};
			let result;
			if (!limit) result = await itemsCollection.find(query);
			else result = await itemsCollection.find(query).limit(limit);
			const items = await result.toArray();
			res.send(items);
		});
		app.get("/inventory/:id", async (req, res) => {
			const { id } = req.params;
			const database = client.db("inventory-items");
			const itemsCollection = database.collection("items");
			const query = { _id: ObjectId(id) };
			const result = await itemsCollection.findOne(query);
			res.send(result);
		});
		app.put("/inventory/:id", async (req, res) => {
			const { id } = req.params;

			const database = client.db("inventory-items");
			const itemsCollection = database.collection("items");
			const query = { _id: ObjectId(id) };
			const updateDoc = {
				$set: {
					quantity: req.body.quantity,
				},
			};
			const result = await itemsCollection.updateOne(query, updateDoc);
			res.send(result);
			console.log(result);
		});
		app.get("/inventory-items/:email", async (req, res) => {
			const { email } = req.params;
			const database = client.db("inventory-items");
			const itemsCollection = database.collection("items");
			const query = { email };
			const result = await itemsCollection.find(query);
			const items = await result.toArray();
			res.send(items);
		});
		app.delete("/my-items/:id", async (req, res) => {
			const { id } = req.params;
			const database = client.db("inventory-items");
			const itemsCollection = database.collection("items");
			const query = { _id: ObjectId(id) };
			const result = await itemsCollection.deleteOne(query);
			console.log(result);
			res.send(result);
		});
		// create a document to insert
	} finally {
		//await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send({ id: 8 });
});
app.listen(port, () => {
	console.log("listening");
});
