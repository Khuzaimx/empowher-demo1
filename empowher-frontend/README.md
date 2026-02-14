# EmpowHer Frontend

The frontend interface for EmpowHer - a privacy-first, research-grounded emotional wellness platform. Built with Next.js 14 and Tailwind CSS.

## Features

- 🎨 **Modern UI/UX**: Responsive, accessible design with Tailwind CSS.
- 📝 **Research-Based Check-In**: 
  - Interactive multi-step form for PHQ-2, GAD-2, and WHO-5 assessments.
  - Simplified language toggle for accessibility.
  - Real-time progress tracking.
- 📊 **Insights Dashboard**:
  - Visual charts for wellbeing trends (WHO-5).
  - Risk analysis visualization (PHQ-2, GAD-2).
  - Historical data view.
- 🤖 **AI Integration**:
  - Displays personalized insights from the Multi-Agent system.
  - Crisis resource visibility when needed.
- 🔒 **Secure Client**:
  - HttpOnly cookie handling.
  - Protected routes and authentication state management.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Charts**: Chart.js / react-chartjs-2
- **State Management**: React Hooks
- **Icons**: Heroicons (via direct SVG or wrapper)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app`: App Directory (Next.js 14+)
  - `/page.tsx`: Landing page
  - `/login`, `/signup`: Authentication pages
  - `/dashboard`: Protected user area
    - `/checkin`: Daily assessment form
    - `/insights`: Data visualization page
    - `/profile`: User settings
- `/lib`: Utilities
  - `api.ts`: Centralized API client with error handling
- `/components`: Reusable UI components

## Key Flows

### Daily Check-In
1. User navigates to `/dashboard/checkin`.
2. Completes PHQ-2 (Depression screening).
3. Completes GAD-2 (Anxiety screening).
4. Completes WHO-5 (Wellbeing index).
5. (Optional) Adds a private journal entry.
6. Submits to backend -> AgentOrchestrator processes data.
7. Redirects to Results page with immediate feedback.

### Insights View
1. User navigates to `/dashboard/insights`.
2. Fetches historical data from `/api/emotional/history`.
3. Displays trends over time to help users spot patterns in their wellbeing.

## Deployment

The application is designed to be deployed on Vercel or any Node.js hosting platform.

Build for production:
```bash
npm run build
npm start
```

## Learn More

To learn more about Next.js, take a look at the following resources:
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
