// badlyDesignedApp.js
const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = process.env.CLUSTER1_URI;

async function performDatabaseOperations(data) {
    let client;
    try {
        // INEFFICIENT: Instantiating a new MongoClient for each operation
        // This creates a new connection every time this function is called.
        client = new MongoClient(uri);

        await client.connect();
        console.log("Connected to MongoDB (new connection established).");

        const db = client.db();
        const collection = db.collection('sample');

        // Example operation: Insert a document
        const result = await collection.insertOne(data);
        console.log(`Document inserted with _id: ${result.insertedId}`);

        // Example operation: Find documents
        const documents = await collection.find({}).toArray();
        console.log("Found documents:", documents);

    } catch (error) {
        console.error("Error performing database operations:", error);
    } finally {
        // INEFFICIENT: Closing the connection after each operation
        // This destroys the connection, requiring a new one for the next operation.
        if (client) {
            await client.close();
            console.log("MongoDB connection closed.");
        }
    }
}

// Simulate multiple calls to the database operation function
async function runInefficientApp() {
    console.log("Starting inefficient app simulation...");

    for (let i = 0; i < 5; i++) {
        console.log(`\n--- Operation ${i + 1} ---`);
        const startTime = Date.now();
        await performDatabaseOperations({ timestamp: new Date(), value: `data_${i}` });
        const endTime = Date.now();
        console.log(`Operation ${i + 1} completed in ${endTime - startTime} ms`);
    }

    console.log("\nInefficient app simulation finished.");
}

runInefficientApp();