import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);
app.get("/", (_req, res) => res.send("AtmosCheck API OK"));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server listening http://localhost:${PORT}`));
