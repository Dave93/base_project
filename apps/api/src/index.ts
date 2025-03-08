import cluster from "node:cluster";
import { cpus } from "node:os";
import app from "./app";

// Get the number of available CPU cores
const numCPUs = cpus().length;

// Use Node.js cluster for multi-core utilization
if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    // Fork workers for each CPU core
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Handle worker crashes
    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code: ${code} and signal: ${signal}`);
        console.log("Starting a new worker");
        cluster.fork();
    });
} else {
    // Worker process - create and start the Elysia app
    app.listen(process.env.PORT || 3000);

    console.log(`🦊 Worker ${process.pid} started, Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
} 