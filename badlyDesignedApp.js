// badlyDesignedApp.js
const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = process.env.CLUSTER1_URI;

async function performDatabaseOperations(data, opNum) {
    const operationStartTime = Date.now();
    let client;
    try {
        // INEFFICIENT: Instantiating a new MongoClient for each operation
        client = new MongoClient(uri);

        const connectStart = Date.now();
        await client.connect();
        const connectEnd = Date.now();
        console.log(`Connected to MongoDB (new connection established).`);
        console.log(`  > Connection took: ${connectEnd - connectStart} ms`);

        const db = client.db();
        const collection = db.collection('sample');

        // --- Timing for Insert Operation ---
        const insertStart = Date.now();
        const insertResult = await collection.insertOne(data);
        const insertEnd = Date.now();
        console.log(`Document inserted with _id: ${insertResult.insertedId}`);
        console.log(`  > Insert operation took: ${insertEnd - insertStart} ms (App to DB & Back)`);

        // --- Timing for Find Operation ---
        const findStart = Date.now();
        const documents = await collection.find({}).toArray();
        const findEnd = Date.now();
        // Output only relevant fields for brevity
        console.log("Found documents:", documents.map(doc => ({ _id: doc._id, timestamp: doc.timestamp, value: doc.value })));
        console.log(`  > Find operation took: ${findEnd - findStart} ms (App to DB & Back, including data transfer)`);

    } catch (error) {
        console.error("Error performing database operations:", error);
    } finally {
        const operationEndTime = Date.now();
        // INEFFICIENT: Closing the connection after each operation
        if (client) {
            await client.close();
            console.log("MongoDB connection closed.");
        }
        console.log(`Total performDatabaseOperations function execution time: ${operationEndTime - operationStartTime} ms`);
    }
}

// Simulate multiple calls to the database operation function
async function runInefficientApp() {
    console.log("Starting inefficient app simulation...");

    // Clear the collection before running
    let client;
    try {
        client = new MongoClient(uri);
        await client.connect();
        const db = client.db();
        const collection = db.collection('sample');
        await collection.deleteMany({});
        console.log("Collection 'sample' cleared before test run.");
    } catch (error) {
        console.error("Error clearing collection before test run:", error);
    } finally {
        if (client) await client.close();
    }

    for (let i = 0; i < 5; i++) {
        console.log(`\n--- Operation ${i + 1} (Inefficient) ---`);
        await performDatabaseOperations({ timestamp: new Date(), value: `inefficient_data_${i}` }, i + 1);
        // Small delay for legibility
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log("\nInefficient app simulation finished.");
}

runInefficientApp();