import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import productsRouter from "./routes/productsRoute.js";
import userRouter from "./routes/userRoute.js";
import Cartrouter from "./routes/cartRoute.js";
import dns from "dns";
import orderRouter from "./routes/orderRoute.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

dotenv.config();

const app = express();

//Middleware
app.use(express.json())
app.use(cors({ origin: ["http://localhost:5173", "https://cafe-imperium.netlify.app/"] }))
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});
app.use("/products", productsRouter);
app.use("/users", userRouter);
app.use("/carts", Cartrouter);
app.use("/orders", orderRouter)

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_DB_URI)
.then(() => {
    console.log("BASE DE DATOS CONECTADA");
    app.listen(PORT, () => {
        console.log(`Servidor levantado en http://localhost:${PORT}`);
    });
})
.catch(err => console.error(err));
