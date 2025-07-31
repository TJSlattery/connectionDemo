const { MongoClient, ObjectId } = require('mongodb'); // Import ObjectId as well for clarity in output

// Get the MongoDB connection URI from environment variable
const uri = process.env.CLUSTER1_URI;

// Global/Module-scoped client variable to maintain the single connection instance
let client;

/**
 * Establishes a connection to MongoDB if one doesn't already exist.
 * This function ensures that the MongoClient is initialized only once.
 * @returns {Promise<MongoClient>} The connected MongoClient instance.
 */
async function connectToMongo() {
    if (!uri) {
        console.error("Error: CLUSTER1_URI environment variable is not set.");
        console.error("Please set it in your .env file or as an environment variable (e.g., export CLUSTER1_URI='mongodb://...')");
        process.exit(1); // Exit if URI is not configured
    }

    if (!client) {
        // Instantiate MongoClient - connection pooling is built-in
        // No need for useNewUrlParser or useUnifiedTopology in driver versions >= 4.0.0
        client = new MongoClient(uri, {
            maxPoolSize: 10, // Optional: Configure pool size (default is 5 in recent versions)
            serverSelectionTimeoutMS: 5000, // Optional: Timeout for server selection
        });

        try {
            await client.connect();
            console.log("Connected to MongoDB (connection pooled).");
        } catch (error) {
            console.error("Failed to connect to MongoDB:", error);
            // Ensure client is null so next attempt tries to reconnect
            client = null;
            throw error; // Re-throw to propagate the connection error
        }
    }
    return client;
}

/**
 * Performs example database operations (insert and find) efficiently by
 * reusing the pooled MongoDB connection.
 * @param {object} data - The data to insert into the collection.
 */
async function performDatabaseOperationsEfficiently(data) {
    const operationStartTime = Date.now(); // Start timer for the whole function call

    try {
        // Get the connected client instance (will be reused from the pool)
        const connectedClient = await connectToMongo();
        const db = connectedClient.db();
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
        console.error("Error performing database operations efficiently:", error);
        // Depending on error, you might want to consider reconnect logic or specific error handling
    } finally {
        const operationEndTime = Date.now();
        console.log(`Total performDatabaseOperationsEfficiently function execution time: ${operationEndTime - operationStartTime} ms`);
    }
}

/**
 * Gracefully closes the MongoDB connection when the application is shutting down.
 */
async function closeMongoConnection() {
    if (client) {
        try {
            await client.close();
            console.log("MongoDB connection gracefully closed.");
        } catch (error) {
            console.error("Error closing MongoDB connection:", error);
        }
    }
}

/**
 * Main function to simulate the efficient application's behavior
 * by performing multiple database operations.
 */
async function runEfficientApp() {
    console.log("Starting efficient app simulation...");

    // Ensure connection is established once at the very beginning
    try {
        await connectToMongo();
    } catch (error) {
        console.error("Application failed to start due to MongoDB connection error.");
        return; // Exit if initial connection fails
    }

    // Clear the collection before running
    try {
        const connectedClient = await connectToMongo();
        const db = connectedClient.db();
        const collection = db.collection('sample');
        await collection.deleteMany({});
        console.log("Collection 'sample' cleared before test run.");
    } catch (error) {
        console.error("Error clearing collection before test run:", error);
    }

    // Simulate multiple calls to the database operation function
    for (let i = 0; i < 5; i++) {
        console.log(`\n--- Operation ${i + 1} (Efficient) ---`);
        await performDatabaseOperationsEfficiently({
            timestamp: new Date(),
            value: `efficient_data_${i}`
        });
        // Introduce a small delay to better observe individual operation times
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Ensure the connection is closed when the app is done
    await closeMongoConnection();
    console.log("\nEfficient app simulation finished.");
}

// Start the application
runEfficientApp();