Sentinel – AI-Powered Stock Tracking Platform

Overview

Sentinel is a modern web-based stock tracking platform designed to provide users with real-time market insights, intelligent analytics, and automated alerting capabilities. The system integrates financial data APIs with artificial intelligence to deliver meaningful interpretations of stock trends, helping users make informed decisions.

The application enables users to monitor selected stocks, visualize historical price movements, receive automated alerts, and generate AI-driven insights based on market data.

⸻

Key Features
	•	Real-time stock data retrieval using external financial APIs
	•	Interactive and responsive stock charts for data visualization
	•	Personalized watchlist management
	•	AI-generated insights for stock analysis
	•	Automated alert system for price tracking
	•	Secure authentication and session management
	•	Background job processing for scheduled tasks

⸻

Technology Stack

Frontend
	•	Next.js (React Framework)
	•	TypeScript
	•	Tailwind CSS
	•	Component-based UI architecture

Backend
	•	Next.js API Routes (Server-side logic)
	•	Node.js runtime environment

Database
	•	MongoDB (NoSQL database)

Authentication
	•	NextAuth.js (secure authentication system)

APIs and Services
	•	Finnhub API (stock market data)
	•	Google Gemini API (AI insights generation)

Automation and Background Jobs
	•	Inngest (event-driven workflows and scheduling)

⸻

System Architecture

The system follows a modular full-stack architecture:
	1.	The frontend built with Next.js handles user interaction and UI rendering.
	2.	API routes act as backend endpoints to process requests.
	3.	External APIs (Finnhub) provide stock data.
	4.	AI services (Gemini) generate insights based on fetched data.
	5.	MongoDB stores user data, watchlists, and alerts.
	6.	Inngest handles background jobs such as alert checking and scheduled tasks.

⸻

Project Structure

sentinel/
├── app/                # Application routes and pages
├── components/         # Reusable UI components
├── lib/                # Utility functions and configurations
├── scripts/            # Data seeding scripts
├── public/             # Static assets
├── next.config.ts      # Next.js configuration
├── package.json        # Project dependencies
├── .env.example        # Environment variable template

⸻

Installation and Setup

Prerequisites
	•	Node.js (v18 or above)
	•	npm or yarn
	•	MongoDB (local or cloud instance)

⸻

Step 1: Clone the Repository

git clone https://github.com/priyanshum08/sentinel-stock-tracker.git
cd sentinel-stock-tracker

⸻

Step 2: Install Dependencies

npm install

⸻

Step 3: Configure Environment Variables

Create a .env.local file and add the following:

FINNHUB_API_KEY=your_finnhub_api_key
GEMINI_API_KEY=your_gemini_api_key
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000

⸻

Step 4: Run the Application

npm run dev

The application will run on:
http://localhost:3000

⸻

Step 5: Run Inngest Development Server

npx inngest-cli@latest dev

This enables background jobs and automation workflows.

⸻

Usage
	1.	Register or log in to the platform
	2.	Browse available stocks and add them to your watchlist
	3.	View detailed stock pages with historical data and charts
	4.	Generate AI insights for deeper analysis
	5.	Set alerts to monitor price changes
	6.	Background processes will automatically evaluate alerts

⸻

API Endpoints
	•	/api/stock → Fetch stock data
	•	/api/watchlist → Manage user watchlist
	•	/api/alerts → Handle alert creation and tracking
	•	/api/ingest → Event processing for Inngest workflows

⸻

Known Limitations
	•	Free-tier API keys may have rate limits
	•	Chart rendering depends on availability of external data
	•	AI insights require valid API credentials
	•	Performance may vary with network latency

⸻

Future Enhancements
	•	Integration with additional financial data providers
	•	Advanced predictive analytics using machine learning models
	•	Portfolio tracking and profit/loss analysis
	•	Mobile application support
	•	Enhanced UI/UX improvements
	•	Real-time notifications

⸻

Conclusion

Sentinel demonstrates the integration of modern web technologies, real-time data processing, and artificial intelligence in a single platform. The project showcases full-stack development capabilities, event-driven architecture, and practical application of AI in financial systems.

⸻

Author

Priyanshu Mishra

⸻

License

This project is developed for academic purposes and is not intended for commercial use.
