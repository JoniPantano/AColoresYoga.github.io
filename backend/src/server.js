require("dotenv").config();
const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const membershipRoutes = require("./routes/membership.routes");
const { errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

app.use("/api/auth", authRoutes);
app.use("/api", membershipRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${env.PORT}`);
});
