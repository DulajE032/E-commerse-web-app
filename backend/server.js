


 const express = require("express");
 const cors = require("cors");
 const dotenv = require("dotenv");
 const connectDB = require("./config/db");
 
 dotenv.config();
 connectDB();
 
 const app = express();
 app.use(express.json());
 app.use(cors({ origin: process.env.CLIENT_URL, credentials: 
true }));
 
 app.use("/api/auth", require("./routes/authRoutes"));
 app.use("/api/products", require("./routes/productRoutes"));
 app.use("/api/cart", require("./routes/cartRoutes"));
 app.use("/api/orders", require("./routes/orderRoutes"));
 
 app.get("/api/health", (req, res) => res.json({ ok: true }));
 
 app.listen(process.env.PORT, () => {
   console.log(`Server running on ${process.env.PORT}`);
 });