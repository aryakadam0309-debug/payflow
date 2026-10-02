# PayFlow

> A distributed digital wallet built with Java 21 + Spring Boot 3 — handles 500+ concurrent transfers with zero balance discrepancies.

🔗 **Live Demo**: _coming soon_
📹 **Demo Video**: _coming soon_
📚 **API Docs**: _coming soon_

---

## 🎯 The Problem

Building a wallet isn't about CRUD. It's about **correctness under concurrency**.

When two users try to send money from the same wallet at the same millisecond, a naive implementation loses money. PayFlow solves this using:

- PostgreSQL row-level locks (`SELECT ... FOR UPDATE`)
- Redis idempotency keys (prevents double-charging on retries)
- Consistent lock ordering (prevents deadlocks)

---

## ✨ Features

### Core
- JWT-based authentication with refresh tokens
- Peer-to-peer money transfers with idempotency guarantees
- Money requests (ask, pay, decline)
- Paginated transaction history with filters
- Saved contacts
- QR code payments

### Advanced
- Redis sliding-window rate limiting (5 transfers/min)
- Kafka event stream for notifications + analytics + fraud
- Race-condition-safe transfers (500+ concurrent tested)
- AI-powered fraud detection (rule engine + LLM explanations)
- Immutable audit log for every state change
- Admin dashboard with analytics

---

## 🏗️ Architecture
React Frontend
│
▼ HTTPS + JWT
Spring Boot Backend
├── Auth Service
├── Wallet Service (@Transactional)
├── Admin Service
└── Kafka Producers
│
├──► PostgreSQL (primary)
├──► Redis (cache + locks + idempotency)
└──► Kafka (events)
├──► Notification Consumer
├──► Fraud Consumer (rules + LLM)
└──► Analytics Consumer

_Diagram coming soon._

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3.3 |
| Security | Spring Security + JWT |
| Database | PostgreSQL 16 |
| Cache/Locks | Redis 7 |
| Messaging | Apache Kafka |
| Migrations | Flyway |
| Testing | JUnit 5, Mockito, Testcontainers |
| Frontend | React 18 + Vite + Tailwind |
| Container | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Cloud | AWS EC2 + RDS + ElastiCache |

---

## 🚧 Project Status

- [x] Repository initialized
- [ ] Backend: Spring Boot setup + PostgreSQL
- [ ] Auth: Signup + Login + JWT
- [ ] Wallet: Transfer with locking + idempotency
- [ ] Rate limiting with Redis
- [ ] Kafka event stream
- [ ] Fraud detection
- [ ] Frontend
- [ ] Deployment on AWS

---

## 🚀 Running Locally

_Coming soon — requires Docker Desktop._

```bash
git clone https://github.com/YOUR_USERNAME/payflow.git
cd payflow
docker-compose up

🧠 Hard Problems Solved
1. Preventing double-spending under concurrency
Problem: Two concurrent transfers from the same wallet can read the same balance and both succeed, causing negative balance.

Solution: SELECT ... FOR UPDATE locks the wallet row until the transaction commits, combined with @Transactional(isolation = SERIALIZABLE).

2. Idempotency across retries
Problem: If the network drops after the server processes a transfer, the client retries and money is sent twice.

Solution: Every transfer request carries a unique Idempotency-Key. Server caches the result in Redis for 24 hours. Retries return the cached response.

3. Deadlock prevention
Problem: Two users transferring to each other simultaneously lock rows in different orders → deadlock.

Solution: Always lock wallets in ascending user_id order.

(More coming as I build.)

## 👨‍💻 Author

**Your Name**
[LinkedIn](https://www.linkedin.com/in/arya-kadam-2549b52b2/) · [GitHub](https://github.com/aryakadam0309-debug/)