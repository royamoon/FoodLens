# FoodLens Backend

This is the NestJS backend for the FoodLens application.

## Prerequisites

- Node.js (v16 or later)
- npm or yarn

## Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Then, fill in your Supabase credentials in the `.env` file.

3.  **Run the application:**
    ```bash
    npm run start:dev
    ```
    The backend will be running on `http://localhost:3000`. 