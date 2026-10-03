import express, { json } from "express";
import dotenv from "dotenv";

// Wczytanie zmiennych środowiskowych z pliku .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware do obsługi danych w formacie JSON
app.use(json());

// Przykładowy punkt końcowy (Route)
app.get("/", (req, res) => {
  res.send("Witaj w Express.js!");
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});
