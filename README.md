# MOMent

A web app that helps moms in Kraków find childcare **close to both home and work**: institutions within a chosen radius, plus nannies who are available right now. Built at HackYeah.

## Features

- Search institutions near the user's home **and** work address, merged into one list sorted by distance
- Results on a map (Leaflet + OpenStreetMap)
- **Nannies** tab with currently available nannies
- Login with token-based authentication

## Stack

React + Vite, Node.js + Express + TypeScript, PostgreSQL + PostGIS, Prisma ORM 8, GUGiK geocoder, Docker Compose

## Quick start

Requires only [Docker](https://docs.docker.com/get-docker/).

```bash
git clone https://github.com/clt-coding/hackyeah.git
cd hackyeah
docker compose up --build
```

Open **http://localhost:5173**. The first start creates the database and loads fictional demo data.

Then create an account.

To reset the data: `docker compose down -v`, then start again.

## Development without Docker

```bash
docker compose up -d db                    # database only
cd backend && npm install && cp .env.example .env && npm run dev
cd frontend && npm install && npm run dev
```

After changing `contract.prisma`, run `npx prisma contract emit` and restart the backend. Demo data and schema live in `db/init/` (loaded alphabetically on first start).

## Limitations

- Kraków only
- The geocoder needs a building number, so some addresses (for example housing estates) may need manual coordinates
- Opening hours and days of the week are not taken into account

## Team

Backend Devs:
Iga Głowacz
Weronika Szacka

Frontend Devs:
Wiktoria Woronecka
Maja Markiewicz
Joanna Kamińska

Fullstack Dev & Leader:
Wiktoria Zollondz

## by clt-coding group -> https://www.instagram.com/clt_coding/
