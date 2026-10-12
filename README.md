# ShopKart

ShopKart is a React and Express shopping app with MongoDB storage, cookie-based authentication, cart and order management, and Razorpay test checkout.

## Run locally

1. Install Node.js and MongoDB.
2. Copy `Server/.env.example` to `Server/.env` and set the database URL, a private JWT secret, and Razorpay **test** keys.
3. In one terminal:

   ```powershell
   cd Server
   npm install
   npm run seed:products
   npm run dev
   ```

4. In another terminal:

   ```powershell
   cd Client/vite-project
   npm install
   npm run dev
   ```

The client runs at `http://localhost:5173`; the API runs at `http://localhost:8000`.

## Deploy

### 1. Create a MongoDB Atlas database

Create a database and a database user in Atlas. In **Network Access**, allow connections from your API host. For a quick Render setup you can temporarily allow `0.0.0.0/0`; use a restricted IP range where your hosting plan supports stable outbound IPs. Copy the Atlas connection string and replace its username, password, and database name as needed.

### 2. Deploy the API to Render

In Render, create a **Blueprint** from this GitHub repository and apply the root `render.yaml`. Set these environment values when prompted:

- `dbURL`: the Atlas connection string
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`: a matching Razorpay **Test Mode** key pair
- `CLIENT_ORIGIN`: temporarily enter `http://localhost:5173`; after deploying the client, replace it with the exact Vercel site origin, for example `https://shopkart-example.vercel.app` (no trailing slash), and save the change

Render generates `JWT_SECRET`. After deploy, confirm the API health endpoint returns `{"status":"ok"}` at `https://<your-render-service>.onrender.com/health`.

### 3. Deploy the client to Vercel

Import the same repository into Vercel and set the project **Root Directory** to `Client/vite-project`. Set this environment variable:

- `VITE_API_URL`: the Render API origin, for example `https://<your-render-service>.onrender.com` (no trailing slash)

Deploy the client. If its Vercel URL changes, update Render's `CLIENT_ORIGIN` to the exact new origin and redeploy/restart the API.

The API uses secure cross-site cookies in production. Keep the client and API on HTTPS, configure the exact client origin, and do not expose secret environment values in Vite variables or commit them to Git. Since the frontend and API use separate hosting domains, test login and refresh in the browsers you intend to support; browser privacy settings that block third-party cookies can prevent cookie-based login from persisting.

## Scripts

- Server: `npm run dev`, `npm start`, `npm run seed:products`
- Client: `npm run dev`, `npm run build`, `npm run lint`
