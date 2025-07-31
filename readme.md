# MongoDB Connection Demo

This repository demonstrates two different approaches to connecting a Node.js application to MongoDB:

- **badlyDesignedApp.js**: Shows an inefficient way to manage MongoDB connections.
- **wellDesignedApp.js**: Shows a best-practice, efficient way to manage MongoDB connections using connection pooling.

## Overview

### badlyDesignedApp.js
- **What it does:**
  - For each database operation, it creates a new MongoDB client, connects, performs the operation, and then closes the connection.
  - This is inefficient and can lead to performance issues, especially under load, because it repeatedly opens and closes connections.

### wellDesignedApp.js
- **What it does:**
  - Initializes a single MongoDB client and reuses it for all operations, leveraging connection pooling.
  - Only closes the connection when the application is finished.
  - This is the recommended approach for production applications.

## Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- A running MongoDB instance (local or cloud, e.g., [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Clone the Repository
```sh
git clone https://github.com/TJSlattery/connectionDemo.git
cd connectionDemo
```

### 2. Install Dependencies
Both scripts use only the `mongodb` package. Install it with:
```sh
npm install mongodb
```

### 3. Configure MongoDB Connection
Set the `CLUSTER1_URI` environment variable to your MongoDB connection string. You can do this in your shell or by creating a `.env` file (with [dotenv](https://www.npmjs.com/package/dotenv), if you wish to use it).

**Example (Unix/macOS):**
```sh
export CLUSTER1_URI='mongodb://localhost:27017/yourdbname'
```
Or for MongoDB Atlas:
```sh
export CLUSTER1_URI='mongodb+srv://<username>:<password>@cluster0.mongodb.net/yourdbname?retryWrites=true&w=majority'
```

### 4. Run the Applications

#### Run the Inefficient App
```sh
node badlyDesignedApp.js
```

#### Run the Efficient App
```sh
node wellDesignedApp.js
```


## What to Observe
- Both scripts will insert and fetch documents in a collection (named `sample` in the inefficient app, `mycollection` in the efficient app).
- The inefficient app will repeatedly connect and disconnect, which is slow and resource-intensive.
- The efficient app will connect once, reuse the connection, and close it at the end, which is much faster and scalable.

## Sample Test Results

### Slow App (`badlyDesignedApp.js`)
```
MongoDB connection closed.
Operation 5 completed in 1531 ms
```

### Fast App (`wellDesignedApp.js`)
```
Total performDatabaseOperationsEfficiently function execution time: 238 ms
MongoDB connection gracefully closed.
```

## Why is Connection Pooling Faster?

Connection pooling reuses a single connection for many operations, avoiding the slow process of repeatedly opening and closing connections. This reduces latency, saves resources, and allows your app to handle more requests efficiently. As shown above, the efficient app is much faster, especially as the number of operations increases.

## License
MIT
