# 💳 Digilet - Digital Wallet System

A secure and scalable digital wallet backend system built with Node.js, Express, TypeScript, and MongoDB with Mongoose. Digilet provides comprehensive wallet management, money transfers, and transaction tracking capabilities for users, agents, and administrators.

## 🔗 Links

- **Live API**: [https://digilet-server.vercel.app/](https://digilet-server.vercel.app)

## 🌟 Features

- **Multi-role Authentication**: Supports Users, Agents, and Admins with role-based access control
- **Wallet Management**: Create, manage, and track digital wallets
- **Money Operations**: Add money, withdraw, send money, cash-in, and cash-out functionality
- **Transaction History**: Complete transaction tracking and history
- **Agent System**: Dedicated agent portal for cash-in/cash-out services
- **Admin Dashboard**: Comprehensive admin controls for user and transaction management
- **Security**: JWT-based authentication with bcrypt password hashing
- **Validation**: Robust request validation using Zod schemas

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Passport.js
- **Validation**: Zod
- **Security**: bcryptjs for password hashing
- **Development**: ts-node-dev for hot reloading

## 📋 Prerequisites

Before running the application, ensure you have:

- Node.js (v16 or higher)
- MongoDB database
- npm or pnpm package manager

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/anowarzz/digilet-backend.git
cd digilet-backend
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using pnpm
pnpm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DB_URL=mongodb://localhost:27017/digilet

# JWT Configuration
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_EXPIRES=1d
JWT_REFRESH_EXPIRES=30d

# Security
BCRYPT_SALT_ROUNDS=10

# Optional Configuration
FRONTEND_URL=http://localhost:5173

# Wallet Configuration
INITIAL_WALLET_BALANCE=50

# Super Admin Credentials (Required for Initial Admin creation)
SUPER_ADMIN_PHONE=01234567890
SUPER_ADMIN_EMAIL=super@digilet.com
SUPER_ADMIN_PASSWORD=superadmin123
```

**Important**: The super admin credentials are **required** for the initial setup. This creates the first admin user in the system, which is necessary before any other admins can be created. Make sure to change these credentials in production.

**First Admin Login Credentials:**

- **Phone**: `01234567890`
- **Password**: `superadmin123`

Use these exact credentials to log in as the first admin. Once logged in, you can create additional admins through the admin panel.

### 4. Build and Run

#### Development Mode

```bash
# Using npm
npm run dev

# Or using pnpm
pnpm dev
```

#### Production Mode

```bash
# Using npm
npm run build
npm start

# Or using pnpm
pnpm build
pnpm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📚 API Endpoints

### 🔐 Authentication & Authorization

For protected routes, include the JWT token directly in the Authorization header:

```bash
Authorization: <your_jwt_token>
```

#### Using Postman:

- Go to the **Authorization** tab
- Then manually add the Authorization header in Headers tab:
  - **Key**: `Authorization`
  - **Value**: `your_jwt_token_here`

**Note**: Upon successful login, the JWT token is provided in two ways:

1. **Response Body**: Available as `accessToken` in the login response JSON
2. **HTTP Cookies**: Automatically set as secure cookies

For API testing tools like Postman, copy the `accessToken` from the login response and use it directly in the Authorization header.

### 🔍 Query Parameters

Several endpoints support query parameters for filtering, sorting, and pagination:

**Available Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Sort by field (e.g., `createdAt`, `-createdAt` for descending)
- Filter by any field (e.g., `role=USER`, `status=ACTIVE`)

**Example Query Usage:**

```bash
GET /api/v1/admin/users/all?page=2&limit=5&sort=-createdAt&role=USER&status=ACTIVE
GET /api/v1/admin/transactions/all?page=1&limit=20&sort=-createdAt&transactionType=SEND_MONEY
GET /api/v1/admin/wallets/all?limit=50&isBlocked=false&sort=balance
```

### Authentication

| Method | Endpoint              | Description | Access        |
| ------ | --------------------- | ----------- | ------------- |
| POST   | `/api/v1/auth/login`  | User login  | Public        |
| POST   | `/api/v1/auth/logout` | User logout | Authenticated |

#### Login Request Body Example:

```json
{
  "phone": "01712345678", // Required: Bangladeshi format (+8801XXXXXXXXX or 01XXXXXXXXX)
  "password": "SecurePass@123" // Required: Min 6 chars, 1 uppercase, 1 special character
}
```

### User Management

| Method | Endpoint                | Description              | Access        |
| ------ | ----------------------- | ------------------------ | ------------- |
| POST   | `/api/v1/user/register` | Register new user        | Public        |
| GET    | `/api/v1/user/me`       | Get current user profile | Authenticated |
| PATCH  | `/api/v1/user/:id`      | Update user profile      | Authenticated |

#### User Registration Request Body Example:

```json
{
  "phone": "01712345678", // Required: Bangladeshi format (+8801XXXXXXXXX or 01XXXXXXXXX)
  "password": "SecurePass@123", // Required: Min 6 chars, 1 uppercase, 1 special character
  "name": "John Doe", // Required: 3-25 characters
  "email": "john@example.com", // Optional: Valid email format
  "userName": "johndoe", // Optional: 3-20 chars, alphanumeric + underscore
  "role": "USER", // Optional: Only "USER" or "AGENT" allowed
  "picture": "https://example.com/photo.jpg", // Optional: Valid URL
  "nidNumber": "1234567890", // Optional: Digits only
  "address": "123 Main St" // Optional: Max 200 characters
}
```

#### Update User Profile Request Body Example:

```json
{
  "name": "Updated Name", // Optional: 3-25 characters
  "email": "new@example.com", // Optional: Valid email format
  "userName": "newusername", // Optional: 3-20 chars, alphanumeric + underscore
  "picture": "https://example.com/new-photo.jpg", // Optional: Valid URL
  "address": "456 New Address" // Optional: Max 200 characters
}
```

### Wallet Operations

| Method | Endpoint                    | Description                | Access     |
| ------ | --------------------------- | -------------------------- | ---------- |
| GET    | `/api/v1/wallet/me`         | Get current user's wallet  | User/Agent |
| POST   | `/api/v1/wallet/add-money`  | Add money to wallet        | User/Agent |
| POST   | `/api/v1/wallet/withdraw`   | Withdraw money from wallet | User/Agent |
| POST   | `/api/v1/wallet/send-money` | Send money to another user | User/Agent |

#### Add Money Request Body Example:

```json
{
  "agentPhone": "01712345678", // Required: Valid agent phone number
  "amount": 1000, // Required: Positive number > 0
  "description": "Monthly salary" // Optional: Transaction description
}
```

#### Withdraw Money Request Body Example:

```json
{
  "agentPhone": "01712345678", // Required: Valid agent phone number
  "amount": 500, // Required: Positive number > 0
  "description": "Cash withdrawal" // Optional: Transaction description
}
```

#### Send Money Request Body Example:

```json
{
  "receiverPhone": "01798765432", // Required: Valid receiver phone number
  "amount": 200, // Required: Positive number > 0
  "description": "Payment for service" // Optional: Transaction description
}
```

### Agent Operations

| Method | Endpoint                 | Description                | Access |
| ------ | ------------------------ | -------------------------- | ------ |
| POST   | `/api/v1/agent/cash-in`  | Cash-in service for users  | Agent  |
| POST   | `/api/v1/agent/cash-out` | Cash-out service for users | Agent  |

#### Cash-In Request Body Example:

```json
{
  "userPhone": "01712345678", // Required: Valid user phone number
  "amount": 1000, // Required: Positive number > 0
  "description": "Cash deposit" // Optional: Transaction description
}
```

#### Cash-Out Request Body Example:

```json
{
  "userPhone": "01712345678", // Required: Valid user phone number
  "amount": 500, // Required: Positive number > 0
  "description": "Cash withdrawal" // Optional: Transaction description
}
```

### Transaction Management

| Method | Endpoint                         | Description                  | Access     | Query Support |
| ------ | -------------------------------- | ---------------------------- | ---------- | ------------- |
| GET    | `/api/v1/transaction/me/history` | Get user transaction history | User/Agent | ✅            |

#### Query Examples for Transaction History:

```bash
GET /api/v1/transaction/me/history?page=1&limit=20&sort=-createdAt
GET /api/v1/transaction/me/history?transactionType=SEND_MONEY&status=COMPLETED
GET /api/v1/transaction/me/history?sort=-amount&limit=50
```

### Admin Operations

| Method | Endpoint                                  | Description           | Access | Query Support |
| ------ | ----------------------------------------- | --------------------- | ------ | ------------- |
| POST   | `/api/v1/admin/create-admin`              | Create new admin      | Admin  | ❌            |
| GET    | `/api/v1/admin/users/all`                 | Get all users         | Admin  | ✅            |
| GET    | `/api/v1/admin/users/:userId`             | Get single user       | Admin  | ❌            |
| PATCH  | `/api/v1/admin/users/update/:userId`      | Update user profile   | Admin  | ❌            |
| DELETE | `/api/v1/admin/users/delete/:userId`      | Delete user           | Admin  | ❌            |
| PATCH  | `/api/v1/admin/users/block/:userId`       | Block user wallet     | Admin  | ❌            |
| PATCH  | `/api/v1/admin/users/unblock/:userId`     | Unblock user wallet   | Admin  | ❌            |
| GET    | `/api/v1/admin/transactions/all`          | Get all transactions  | Admin  | ✅            |
| GET    | `/api/v1/admin/transactions/user/:userId` | Get user transactions | Admin  | ✅            |
| GET    | `/api/v1/admin/wallets/all`               | Get all wallets       | Admin  | ✅            |
| GET    | `/api/v1/admin/wallets/:walletId`         | Get single wallet     | Admin  | ❌            |
| PATCH  | `/api/v1/admin/wallets/add-balance/:id`   | Add balance to wallet | Admin  | ❌            |
| PATCH  | `/api/v1/admin/agents/approve/:agentId`   | Approve agent         | Admin  | ❌            |
| PATCH  | `/api/v1/admin/agents/suspend/:agentId`   | Suspend agent         | Admin  | ❌            |

#### Query Examples for Admin Endpoints:

**Get All Users with Filtering:**

```bash
GET /api/v1/admin/users/all
GET /api/v1/admin/users/all?role=USER&status=ACTIVE&page=1&limit=10&sort=-createdAt
```

**Get All Transactions with Filtering:**

```bash
GET /api/v1/admin/transactions/all?transactionType=SEND_MONEY&status=COMPLETED&page=2&limit=20
GET /api/v1/admin/transactions/all?sort=-createdAt&limit=50
```

**Get User-Specific Transactions:**

```bash
GET /api/v1/admin/transactions/user/60f7b3b3b3b3b3b3b3b3b3b3?page=1&limit=15&sort=-createdAt
GET /api/v1/admin/transactions/user/60f7b3b3b3b3b3b3b3b3b3b3?transactionType=ADD_MONEY&status=COMPLETED
```

**Get All Wallets with Filtering:**

```bash
GET /api/v1/admin/wallets/all?isBlocked=false&currency=BDT&page=1&limit=25
GET /api/v1/admin/wallets/all?sort=balance&limit=100
```

#### Create Admin Request Body Example:

```json
{
  "phone": "01712345678", // Required: Bangladeshi format
  "password": "AdminPass@123", // Required: Min 6 chars, 1 uppercase, 1 special character
  "name": "Admin User", // Required: 3-25 characters
  "email": "admin@example.com" // Optional: Valid email format
}
```

#### Add Balance to Wallet Request Body Example:

```json
{
  "amount": 1000, // Required: Positive number > 0
  "description": "Admin top-up" // Optional: Balance addition description
}
```

## 🔐 User Roles

### USER

- Register and manage personal account
- Add/withdraw money from wallet
- Send money to other users
- View transaction history

### AGENT

- All user capabilities
- Provide cash-in services to users
- Provide cash-out services to users
- Requires admin approval

### ADMIN

- Full system access
- User management (create, update, delete, block/unblock)
- Transaction monitoring and management
- Wallet management and balance adjustments
- Agent approval and suspension

## 🔄 Transaction Types

- **ADD_MONEY**: User adding funds to their wallet through an agent
- **WITHDRAW**: User withdrawing funds from wallet through an agent
- **SEND_MONEY**: Transferring money between users
- **CASH_IN**: Agent helping user add money to wallet
- **CASH_OUT**: Agent helping user withdraw money from wallet
- **ADMIN_TOPUP**: Admin adding balance to any user/agent wallet

## 🛡️ Security Features

- JWT-based authentication with access and refresh tokens
- Password hashing using bcryptjs
- Role-based access control
- Request validation using Zod schemas
- Environment variable configuration
- CORS protection

## 📁 Project Structure

```
src/
├── app/
│   ├── config/          # Configuration files
│   ├── middlewares/     # Custom middleware
│   ├── modules/         # Feature modules
│   │   ├── auth/        # Authentication
│   │   ├── user/        # User management
│   │   ├── wallet/      # Wallet operations
│   │   ├── transaction/ # Transaction handling
│   │   ├── agent/       # Agent operations
│   │   └── admin/       # Admin operations
│   ├── routes/          # Route definitions
│   └── utils/           # Utility functions
├── app.ts               # Express app configuration
└── server.ts            # Server entry point
```

## 🚀 Available Scripts

- `npm run dev` / `pnpm dev` - Start development server with hot reload
- `npm run build` / `pnpm build` - Build the project for production
- `npm start` / `pnpm start` - Start production server
- `npm run lint` / `pnpm lint` - Run ESLint for code quality

---

**Built with ❤️ for secure and efficient digital wallet management**
