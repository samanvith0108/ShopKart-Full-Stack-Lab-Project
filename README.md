# ShopKart

ShopKart is a full-stack shopping application built with React, Express, and MongoDB. It includes account authentication, a seeded product catalog, cart and wishlist management, and Razorpay test checkout.

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [API overview](#api-overview)
- [Payment testing](#payment-testing)
- [Troubleshooting](#troubleshooting)
- [Security notes](#security-notes)

## Features

- Sign up, log in, and log out with HTTP-only cookie authentication
- Protected shopping pages and session checks
- Browse, search, and filter 20 sample products
- Add products to a cart, change quantities, and remove items
- Save and remove wishlist items
- Enter shipping details and create an order
- Use Razorpay Test Mode checkout and verify payment signatures on the server
- View order history and payment status

## Tech stack

- **Frontend:** React, Vite, React Router, Axios, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT in an HTTP-only cookie, bcrypt password hashing
- **Payments:** Razorpay Test Mode

## Requirements

- Node.js and npm
- MongoDB running locally, or a MongoDB connection URI
- Razorpay Test Mode API keys to exercise checkout

## Getting started

Run the following commands from the repository root. Use a separate terminal for the backend and frontend.

### 1. Configure the backend

In PowerShell:

```powershell
Copy-Item Server\.env.example Server\.env
```

Open `Server/.env` and set the values described in [Environment variables](#environment-variables). The `.env` file is local and must not be committed.

### 2. Install backend dependencies and seed products

```powershell
cd Server
npm install
npm run seed:products
```

The seed script adds the 20 sample products to the configured database. It is safe to run again: products with matching names are not duplicated or overwritten.

### 3. Start the backend

From the `Server` directory:

```powershell
npm run dev
```

The API listens at `http://localhost:8000`.

### 4. Install and start the frontend

In a second terminal, from the repository root:

```powershell
cd Client\vite-project
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The frontend currently sends API requests to `http://localhost:8000`.

### 5. Try the shopping flow

1. Register an account and log in.
2. Browse products and add one to your cart.
3. Open the cart and proceed to checkout.
4. Enter a valid shipping address and complete a payment using Razorpay Test Mode.
5. Check the order confirmation and **My Orders**.

## Environment variables

Set these in `Server/.env`:

| Variable | Description | Local example |
|---|---|---|
| `dbURL` | MongoDB connection URI | `mongodb://127.0.0.1:27017/shopkart` |
| `JWT_SECRET` | Private signing secret used for login tokens | Replace the example with a long, random secret |
| `RAZORPAY_KEY_ID` | Razorpay Test Mode key ID | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Secret paired with that Test Mode key ID | Obtain it from the Razorpay Dashboard |

The `Server/.env.example` file contains placeholders. Replace them in `Server/.env`; do not put real credentials in the example file.

## Available scripts

Run each command from its project directory:

### Server (`Server/`)

| Command | Description |
|---|---|
| `npm run dev` | Start the API with Nodemon |
| `npm start` | Start the API with Node.js |
| `npm run seed:products` | Add missing sample products to MongoDB |

### Client (`Client/vite-project/`)

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production frontend build in `dist/` |
| `npm run preview` | Preview a production build locally |
| `npm run lint` | Run Oxlint |

## API overview

The backend base URL is `http://localhost:8000`. Cart, wishlist, and order endpoints require a valid login cookie.

| Endpoint | Method | Description |
|---|---|---|
| `/customers/register` | `POST` | Register an account |
| `/customers/login` | `POST` | Log in and set the authentication cookie |
| `/customers/me` | `GET` | Get the current authenticated user |
| `/customers/logout` | `POST` | Log out and clear the authentication cookie |
| `/products` | `GET` | List products; supports `search` and `category` query parameters |
| `/products/:id` | `GET` | Get product details |
| `/cart` | `GET` | Get the signed-in user's cart |
| `/cart/:productId` | `POST` | Add a product to the cart |
| `/cart/:productId` | `PATCH` | Change a cart item's quantity |
| `/cart/:productId` | `DELETE` | Remove a cart item |
| `/wishlist` | `GET` | Get the signed-in user's wishlist |
| `/wishlist/:productId` | `POST` | Add a product to the wishlist |
| `/wishlist/:productId` | `DELETE` | Remove a wishlist item |
| `/orders/create-payment-order` | `POST` | Validate checkout details and create a Razorpay order |
| `/orders/verify-payment` | `POST` | Verify payment signature and place the order |
| `/orders/payment-failed` | `POST` | Confirm and record a failed Razorpay payment |
| `/orders` | `GET` | List the signed-in user's orders and payment statuses |
| `/orders/:id` | `GET` | Get one of the signed-in user's orders |

## Payment testing

- Use a matching **Test Mode** key ID and key secret from the Razorpay Dashboard.
- Test keys simulate payments; they do not collect real money.
- Never expose the key secret in frontend code, commit it, or share it publicly.
- The backend checks the Razorpay signature before marking an order paid or clearing the cart.
- If payment setup fails, verify both keys in `Server/.env` and restart the backend.

## Troubleshooting

- **MongoDB connection error:** Make sure MongoDB is running and `dbURL` points to the correct database.
- **Products list is empty:** Run `npm run seed:products` from `Server/`.
- **Login or cart returns `401`:** Log in again; the app uses an HTTP-only cookie for authenticated requests.
- **Browser cannot reach the API:** Start the backend on port `8000` and use the Vite origin allowed by the backend CORS configuration.
- **Razorpay authentication failed:** Confirm that the Test Mode key ID and secret belong to the same key pair, then restart the backend.

## Security notes

- Keep `Server/.env` private. It is excluded by `Server/.gitignore`.
- Use only placeholders in `.env.example`.
- Do not use Razorpay Test Mode keys for real transactions.
- The current API and CORS setup is configured for local development; update it before deploying to hosted domains.
