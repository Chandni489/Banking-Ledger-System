# Banking-Ledger-System

A backend banking system built with **Node.js, Express.js, MongoDB, and Mongoose**. The project demonstrates user authentication, bank account management, fund transfers, and a **ledger-based transaction system** for maintaining accurate transaction history and account balances.

## 🚀 Features

* User registration and login
* JWT-based authentication
* Password hashing using bcrypt
* Bank account creation and management
* Fund transfer between accounts
* Initial fund/deposit functionality
* Double-entry ledger system using **DEBIT** and **CREDIT**
* Account balance calculation using MongoDB aggregation
* Transaction history
* Idempotency keys to help prevent duplicate transactions
* Role-based authorization for system/banker operations
* Email notifications for registration and transactions
* MongoDB transactions for atomic money transfers
* API testing using Postman

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication & Security

* JWT (JSON Web Token)
* bcrypt
* Cookie-based authentication

### API Testing

* Postman

### Other Tools

* Nodemailer
* dotenv

## 📂 Project Structure

```text
Banking-Ledger-System/
│
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   └── config/
│
├── server.js
├── package.json
├── .env
├── .gitignore
└── README.md
```

## 🔐 Authentication Flow

The system uses JWT authentication to identify and authorize users.

```text
User Registration
       ↓
Password Hashing
       ↓
User Stored in MongoDB
       ↓
User Login
       ↓
JWT Token Generated
       ↓
Token Stored in Cookie
       ↓
Protected API Request
       ↓
JWT Verification
       ↓
User Authorized
```

## 💰 Banking Flow

The main banking process works like this:

```text
User Registration
       ↓
User Login
       ↓
Account Creation
       ↓
Initial Funds Added
       ↓
Transaction Created
       ↓
Ledger Entries Created
       ↓
Account Balance Updated/Calculated
```

## 📒 Ledger System

The project uses a **double-entry ledger** to record financial transactions.

For example, if Account A sends ₹1,000 to Account B:

```text
Account A
DEBIT  ₹1,000

Account B
CREDIT ₹1,000
```

The ledger keeps a permanent history of money movements.

Account balance is calculated as:

```text
Balance = Total Credit - Total Debit
```

This approach makes it possible to maintain an audit trail instead of simply changing a balance value.

## 🔄 Transaction Flow

```text
Account A
   │
   │  ₹1,000
   ▼
Transaction
   │
   ├── DEBIT  ₹1,000 → Account A
   │
   └── CREDIT ₹1,000 → Account B
```

The transaction is processed atomically using MongoDB transactions so that both ledger entries succeed together or the operation is rolled back.

## 🛡️ Idempotency

The system uses an **idempotency key** for transactions.

For example:

```json
{
  "fromAccount": "ACCOUNT_A_ID",
  "toAccount": "ACCOUNT_B_ID",
  "amount": 1000,
  "idempotencyKey": "transfer-001"
}
```

If the same request is accidentally sent multiple times with the same idempotency key, the system can prevent the same transaction from being processed twice.

## 📊 Balance Calculation

Account balances are calculated from ledger entries using MongoDB aggregation.

Conceptually:

```text
Total Credits
      -
Total Debits
      =
Current Balance
```

This ensures the balance is derived from the transaction history.

## 🔑 Authorization

The application separates normal user operations from system/banker operations.

For example:

* Normal users can manage their accounts and perform transactions.
* Authorized system users can perform administrative banking operations such as adding initial funds.

## 📧 Email Notifications

The project also includes email functionality using **Nodemailer**.

Emails can be sent for events such as:

* User registration
* Successful transactions
* Transaction-related notifications

## 🧪 API Testing

All APIs can be tested using **Postman**.

Example API categories:

```text
Authentication
├── Register
├── Login
└── L
```

