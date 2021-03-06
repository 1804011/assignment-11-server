const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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
function verifyJwt(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).send({ message: "unauthorized access" });
	}
	const token = authHeader.split(" ")[1];
	jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
		if (err) return res.status(403).send({ message: "forbidden access" });

		req.decoded = decoded;
		next();
	});
}
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
		});
		app.get("/inventory-items/:email", verifyJwt, async (req, res) => {
			const authHeader = req?.headers?.authorization.split(" ")[1];
			const decodedEmail = req?.decoded?.email;

			const { email } = req.params;
			if (decodedEmail == email) {
				const database = client.db("inventory-items");
				const itemsCollection = database.collection("items");
				const query = { email };
				const result = await itemsCollection.find(query);
				const items = await result.toArray();
				res.send(items);
			} else {
				res.status(403).send({ message: "forbidden access" });
			}
		});
		app.delete("/my-items/:id", async (req, res) => {
			const { id } = req.params;
			const database = client.db("inventory-items");
			const itemsCollection = database.collection("items");
			const query = { _id: ObjectId(id) };
			const result = await itemsCollection.deleteOne(query);
			res.send(result);
		});
		app.delete("/manage-inventory/:id", async (req, res) => {
			const { id } = req.params;
			const database = client.db("inventory-items");
			const itemsCollection = database.collection("items");
			const query = { _id: ObjectId(id) };
			const result = await itemsCollection.deleteOne(query);
			res.send(result);
		});
		app.post("/login", async (req, res) => {
			const user = req.body;
			const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN);
			res.send({ accessToken });
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
