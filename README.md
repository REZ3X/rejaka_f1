# F1 Strategy Lab

F1 Strategy Lab is a serverless web application that allows Formula 1 fans and analysts to explore historical race data, visualize lap times, and simulate race strategies. The app is powered by Jolpica F1 data.

## Features

- **Race Explorer**: Fetch and display historical race data, including driver performance, lap times, and position charts.
- **Strategy Simulator (Core)**: A custom deterministic simulation engine that lets you build and test F1 race strategies.
  - Adjust pit stop laps
  - Select tire compounds (Soft, Medium, Hard)
  - Simulate tire degradation
  - Compare original vs. simulated lap times and time delta graphs.
- **Strategy Comparison**: Compare different race strategies side-by-side to find the optimal pit window.
- **Modern UI**: Fully responsive application with Dark/Light mode, built with Next.js App Router and Tailwind CSS.

## Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components & Icons**: [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Data Fetching**: [SWR](https://swr.vercel.app/)
- **Database / ORM**: [Prisma](https://www.prisma.io/)
- **Linting & Formatting**: [Biome](https://biomejs.dev/)

## Getting Started

First, install the project's dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Set up your environment variables by creating a `.env` file in the root of your project and configuring any required database URIs for Prisma or API keys.

Initialize the Prisma database (if applicable):

```bash
npx prisma generate
npx prisma db push
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application in action.

## Project Structure

- `src/app`: Next.js App Router pages and API routes (`/api/race`, `/api/strategy`, etc.).
- `src/components`: Reusable UI components for layout, race visualization, and strategy simulation.
- `src/hooks`: Custom React hooks (e.g., `useSimulation`, `useRaces`) for data fetching and state management.
- `src/lib`: Utility functions, Prisma database client, API handlers, and the core simulation engine logic.
- `prisma`: Prisma schema defining your database models.

## Data Source

Data powered by Jolpica F1 / Ergast Developer API.
