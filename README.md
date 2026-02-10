# Chocolabs CryptoTracker

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tech Stack](https://img.shields.io/badge/stack-FullStack-orange.svg)

**CryptoTracker** is a high-performance investment dashboard designed to track cryptocurrency portfolios in real-time. Built with a robust **Spring Boot** backend and a modern **Astro + React** frontend, it features live market data integration, intelligent caching, and dynamic P&L (Profit and Loss) calculation.

![Dashboard Preview](./screenshots/dashboard-preview.png)

---

## Key Features

### Portfolio Intelligence
- **Real-time Valuation:** Automatically calculates current asset value based on live market data.
- **P&L Analysis:** Tracks individual transaction performance (Profit/Loss %) and global asset performance.
- **Smart Grouping:** Aggregates scattered transactions into a clean, asset-based accordion view.

### Technical Highlights
- **Backend Caching:** Implemented an in-memory caching mechanism to optimize API calls to CoinGecko and prevent rate-limiting.
- **Batch Processing:** Fetches market prices in batches to reduce network overhead.
- **Clean Architecture:** Backend follows a strict `Controller -> Service -> Repository` pattern with DTOs for data transfer.
- **Glassmorphism UI:** A modern, dark-themed interface built with custom CSS and interactive React components.

---

## Tech Stack

### Backend (The Core)
- **Java 21** (Spring Boot 3)
- **Spring Data JPA** (Hibernate)
- **PostgreSQL** (Dockerized Database)
- **Maven** (Dependency Management)

### Frontend (The View)
- **Astro** (Static Site Generation & Islands Architecture)
- **React** (Interactive Components)
- **CSS3** (Custom Glassmorphism styles & Grid Layouts)
- **React Icons**

### DevOps & Tools
- **Docker & Docker Compose** (Containerization)
- **PowerShell** (Automation scripts for dev environment)
- **CoinGecko API** (External Data Source)

---

## Project Structure

```bash
chocolabs-cryptotracker/
├── backend/
│   ├── src/main/java/com/chocolabs/cryptotracker/
│   │   ├── controller/   # REST Endpoints
│   │   ├── service/      # Business Logic & Caching
│   │   ├── repository/   # Database Queries (JPQL)
│   │   ├── model/        # JPA Entities
│   │   └── dto/          # Data Transfer Objects
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # React Components (Accordion, Modals)
│   │   ├── pages/        # Astro Pages
│   │   └── layouts/      # Main Layouts
│   └── astro.config.mjs
└── docker-compose.yml
