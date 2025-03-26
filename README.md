# Advance Node.js Express TypeScript Boilerplate

This is a **Node.js Express TypeScript** boilerplate designed to follow a structured architecture similar to **NestJS**, making it highly **scalable, maintainable, and modular**.  
It is built with best practices in mind, incorporating **Prisma ORM**, **Swagger API documentation**, **Redis caching**, and **Winston logging**.

## 🚀 Why Use This Boilerplate?

Unlike basic Express.js boilerplates that lack structure and scalability, this boilerplate offers:

✅ **Modular Architecture** – Inspired by NestJS, separating concerns into `controllers`, `services`, and `routes`.  
✅ **Pre-configured TypeScript** – Ensuring type safety, better development experience, and maintainability.  
✅ **Built-in Authentication** – Includes JWT authentication out of the box.  
✅ **Prisma ORM Integration** – Provides an easy-to-use and scalable database management system.  
✅ **Redis Caching** – Optimized for performance with `ioredis` for caching.  
✅ **Centralized Logging** – Uses `winston` for logging with MongoDB and file-based storage.  
✅ **API Documentation** – Auto-generated API documentation using `swagger-ui-express`.  
✅ **Security Best Practices** – Pre-configured `helmet`, `hpp`, `cors`, and rate limiting for enhanced security.  
✅ **Unit Testing Setup** – Pre-configured with Jest & Supertest.  
✅ **Production-Ready** – Includes scripts for deployment and Docker support (if needed).  

## 🛠 Features

- **Express.js** - Minimal and fast web framework.
- **TypeScript** - Static typing for better maintainability.
- **Prisma ORM** - Database management with migrations and type safety.
- **Swagger** - API documentation (`swagger-ui-express`).
- **Redis** - Caching for improved performance (`ioredis`).
- **Winston** - Logging to both files and MongoDB.
- **JWT Authentication** - Secure authentication flow.
- **Security Middleware** - `helmet`, `hpp`, `cors`, rate limiting, and more.
- **File Uploads** - `multer` integration for handling file uploads.
- **Testing Framework** - Uses Jest & Supertest.
- **ESLint & Prettier** - Code linting and formatting.

---

## 🚀 Quick Start

### Clone the Repository
```sh
git clone https://github.com/TKAkhter/advance-expressjs-boilerplate.git
cd advance-expressjs-boilerplate
```

### Install Dependencies
```sh
npm install
```

### Setup Environment Variables
Create a `.env` file and configure necessary variables:
```
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url
JWT_SECRET=your_jwt_secret
```

### Run the Development Server
```sh
npm run dev
```

### Build and Run in Production
```sh
npm run build
npm start
```

### Run Tests
```sh
npm test
```

### Lint and Format Code
```sh
npm run lint
npm run prettier
```

### Prisma Database Setup
```sh
npm run prisma:gen     # Generate Prisma client
npm run prisma:push    # Push schema to the database
```

---

## 📖 Project Structure

This project follows a modular and scalable structure, similar to NestJS.

```
/src
├── controllers/   # Handles HTTP requests and responses
├── services/      # Business logic and database interactions
├── middleware/    # Express middlewares for security, logging, etc.
├── models/        # Database models (Prisma schemas)
├── routes/        # API route definitions
├── utils/         # Utility functions and helpers
├── config/        # Configuration files (env, database, etc.)
├── tests/         # Unit and integration tests
├── server.ts      # Application entry point
```

### 🔹 Code Structure Explained

- **Controllers** → Handle incoming requests and return responses.
- **Services** → Contain the business logic and interact with the database via Prisma.
- **Middleware** → Includes authentication, logging, and security layers.
- **Routes** → Define API endpoints, connecting controllers to Express.
- **Models** → Represent the database schema using Prisma.
- **Utils** → Common utility functions like error handling, response formatting, etc.
- **Config** → Stores configuration variables (like env settings).

---

## 📜 API Documentation

Swagger documentation is auto-generated and available at:
```
http://localhost:3000/api-docs
```

---

## **🚀 GitHub Releases & Versioning**

This project follows **Semantic Versioning (`vX.Y.Z`)** with automatic **tags and releases** on every PR merged into `main`.

### **🔹 Version Rules:**
| Change Type | Keyword in PR Title/Body | Example Version Change
|--|--|--| 
| Major Update | `#major` |`v1.0.0 → v2.0.0` |
| Minor Update | `#minor` |`v1.0.0 → v1.1.0` |
| Patch Update | _(Default, no keyword)_ |`v1.0.0 → v1.0.1` |

### Example PRs and Resulting Versions

#### **PR with a Patch Version Bump (Default)**

📌 **PR Title:** `Fixed authentication bug`  
📌 **PR Body:** _"Resolved a minor issue in login flow."_  
🔹 **Result:** `v1.0.0 → v1.0.1`

----------

#### **PR with a Minor Version Bump**

📌 **PR Title:** `Added new profile feature #minor`  
📌 **PR Body:** _"Implemented user profile page."_  
🔹 **Result:** `v1.0.0 → v1.1.0`

----------

#### **PR with a Major Version Bump**

📌 **PR Title:** `Revamped API structure #major`  
📌 **PR Body:** _"Breaking changes: Updated API structure."_  
🔹 **Result:** `v1.0.0 → v2.0.0`

----------

### **🛠 How Releases Work Automatically**

**When a PR is merged into `main`**, GitHub Actions runs the release workflow.  
It checks the **PR title and body** for `#major` or `#minor`.  
**Creates a new tag and GitHub release** based on the versioning rule.

### **🎯 Steps to Enable Auto Releases**
1.  **Ensure the GitHub workflow file is in place** at `.github/workflows/release.yml`.
2.  **Create PRs with meaningful titles & descriptions**.
3.  **Merge the PR into `main`**, and a new version **tag & release** will be created automatically.

## 🏗 Deployment

### **Docker (Optional)**
This project can be easily containerized using Docker. A `Dockerfile` can be created as follows:

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
EXPOSE 3000
```

### **Deploying to Production**
Ensure to set the correct environment variables and use a process manager like `pm2`:

```sh
pm2 start dist/server.js --name "express-app"
pm2 save
pm2 startup
```

---

## 📜 License

This project is licensed under the MIT License.
