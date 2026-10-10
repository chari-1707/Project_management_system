import "dotenv/config";
import app from "./app.js";
import connectMongoDB from "./db/connection.js";

const PORT = process.env.PORT ?? 3000;

connectMongoDB()
    .then(() => {
        
        app.listen(PORT, () => {
            console.log(`Server is up and running on the port ${PORT}`)
        })
    })
    .catch((error) => {
        console.error(error);
    })