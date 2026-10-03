import express, { json } from "express";
import dotenv from "dotenv";

// Wczytanie zmiennych środowiskowych z pliku .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware do obsługi danych w formacie JSON
app.use(json());

// Przykładowy punkt końcowy (Route)
app.get("/health", (req, res) => {
  res.status(200).json({ message: "Healthy" });
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
