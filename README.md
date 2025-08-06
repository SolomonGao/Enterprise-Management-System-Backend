# 🚀 Enterprise Management System Backend

This is a **powerful, modular backend** for an enterprise management system, built with [Express.js](https://expressjs.com/) and [TypeScript](https://www.typescriptlang.org/).  
Designed for real-world enterprise needs, it provides a secure, scalable, and maintainable API that supports multi-role access, resource management, and future cloud deployment.

> 🟢 Currently powering a live production system, deployed on cloud infrastructure (e.g., AWS, Alibaba Cloud).

![Node.js](https://img.shields.io/badge/Node.js-v18+-green?logo=node.js)
![Express](https://img.shields.io/badge/Express.js-Fast-lightgrey?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-Strong%20Typing-blue?logo=typescript)
![License](https://img.shields.io/github/license/SolomonGao/server)

---

## ✨ Features

- 🔐 **Authentication & Role-Based Access Control**  
  Secure login system with JWT-based token authentication, supporting multiple roles like Admin, Staff, and Clients.

- 🧩 **Modular Architecture**  
  Clean separation of concerns across controllers, services, models, and routes for maintainability and scalability.

- ⚡ **High-Performance RESTful API**  
  Optimized endpoints for fast and reliable data handling.

- 📚 **Rich Business Logic Support**  
  Handles complex data relationships such as raw materials, orders, clients, inventory, etc.

- 🌐 **MongoDB with Mongoose**  
  Reliable and flexible data modeling using one of the most popular NoSQL solutions.

- 🧠 **Validation & Error Handling**  
  All inputs are validated and sanitized with meaningful error responses to prevent misuse.

- ☁️ **Cloud-Ready Deployment**  
  Easily deployable to any cloud platform, with proven production deployment on EC2 / Alibaba Cloud.

---

## 🛠 Tech Stack

| Technology     | Description                                      |
|----------------|--------------------------------------------------|
| **Express.js** | Fast and minimalist Node.js web framework        |
| **TypeScript** | Type-safe code for better reliability            |
| **MongoDB**    | NoSQL database for flexible data storage         |
| **Mongoose**   | Elegant ODM for MongoDB                          |
| **JWT**        | Token-based authentication and authorization     |
| **Helmet & CORS** | Security headers and cross-origin config     |

---

## 📁 Project Structure

```txt
server/
├── src/
│ ├── controllers/ # API controllers
│ ├── services/ # Business logic services
│ ├── models/ # MongoDB data schemas
│ ├── routes/ # Route definitions
│ ├── middlewares/ # Authentication, error handling, etc.
│ ├── utils/ # Utility functions
│ └── app.ts # Express app setup
├── .env # Environment configuration
├── tsconfig.json # TypeScript config
└── package.json # Dependencies and scripts
```

---

## 🚀 Getting Started

### ✅ Prerequisites
Node.js v18 or higher

MongoDB (local or cloud instance)

- Node.js v18+
- MongoDB instance (local or cloud)

### 📦 Installation

```bash
git clone https://github.com/SolomonGao/server.git
cd server
npm install
```

### ⚙️ Environment Configuration
Create a .env file based on .env.example:

```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/your-db
JWT_SECRET=your_jwt_secret
```

### ▶️ Start the Server

```bash
npm run dev  # For development with auto-reload (nodemon)
# or
npm start    # For production build
```

---

### 📦 API Overview
Base URL: http://localhost:8080/api

| Method | Endpoint         | Description              |
| ------ | ---------------- | ------------------------ |
| POST   | `/auth/login`    | User login               |
| POST   | `/auth/register` | User registration        |
| GET    | `/users/me`      | Get current user profile |
| GET    | `/materials/`    | List all materials       |
| POST   | `/orders/`       | Create a new order       |

---

### 📈 Example Use Cases
- Company managers can manage materials, orders, inventory, and employees.

- Employees can view assigned tasks and submit updates.

- Supports extensible modules for analytics, reporting, and external system integrations.

---

### 🧑‍💻 Author
Solomon Gao
Backend Developer & Cloud Engineer
