# EmpowHer Frontend

EmpowHer is an Angular-based founder support platform focused on helping women entrepreneurs assess investor readiness, build pitch materials, connect with mentors and investors, and interact with an AI pitch assistant.

## Overview

This frontend provides a complete founder workflow:

- Login into the platform
- Complete a guided startup questionnaire
- Build a founder profile
- Fetch investor readiness score, strengths, and weaknesses
- View mentor and investor matches
- Create and improve pitch decks
- Use SHERO AI for pitch-deck guidance

## Demo Video

[Watch the project video demo](https://northeastern-my.sharepoint.com/:v:/g/personal/rajaraman_sr_northeastern_edu/IQDchW6SrY0eS4wOd-6iVst2AVTUHBOXVtdxjzemvKXmeGY?e=SkYrpd)

## Core Features

### Authentication
- Login flow integrated with backend auth API
- User session data stored in local storage for frontend flow continuity

### Founder Onboarding
- Multi-step questionnaire using Angular reactive forms
- Validation across startup details, help needed, industry, funding stage, and registration status
- Animated progress screen while profile and readiness data are generated

### Dashboard
- Investor readiness score display
- Strengths and weaknesses breakdown from readiness API
- Tooltip support for readiness explanation
- Pitch deck overview cards with dynamic backgrounds
- Recommended next actions and content performance insights

### SHERO AI Assistant
- Modal-based AI pitch assistant integrated into the dashboard
- Supports pitch improvement flow through backend API
- Quick actions for creating from scratch, using a template, or improving an existing deck

### Matching and Networking
- Mentor matching integration
- Investor matching integration
- Connection request state management with pending status

### Profile and Community Experience
- Profile overview cards for expertise, achievements, company details, and funding information
- Community and connect screens integrated into the founder navigation flow

## Tech Stack

- Angular 17
- TypeScript
- SCSS
- Angular Router
- Angular HttpClient
- RxJS
- Jasmine + Karma

## Architecture Notes

The application follows a component-based Angular architecture with a frontend service layer for API communication.

Main frontend services:

- `AuthService`: handles login
- `StartupService`: handles founder profile, readiness score, mentor matching, investor matching, and pitch improvement
- `ThemeService`: manages theme switching

Routing is defined for:

- `/login`
- `/questionnaire`
- `/dashboard`
- `/profile`
- `/connect`
- `/community`

## Backend API Integration

The frontend is currently configured to call the backend directly on:

`http://localhost:8080`

Integrated backend endpoints:

- `POST /api/auth/login`
- `POST /api/founder/profile?userId=...`
- `GET /api/founder/readiness-score?userId=...`
- `GET /api/matching/mentors?userId=...&mentorMatchingFlag=...`
- `GET /api/matching/investors?userId=...&investorMatchingFlag=...`
- `POST /api/pitch/improve`

Note: signup was intentionally left out of the recent integration changes and can remain aligned with the backend separately.

## Local Development

### Prerequisites

- Node.js
- npm
- Angular CLI
- Backend server running on port `8080`

### Install dependencies

```bash
npm install
```

### Start the frontend

```bash
npm start
```

Frontend runs on:

`http://localhost:4200`

### Build for production

```bash
npm run build
```

### Run tests

```bash
npm test
```

## Project Structure

```text
src/
	app/
		components/
			login/
			questionnaire/
			dashboard/
			profile/
			connect/
			community/
		services/
			auth.service.ts
			startup.service.ts
			theme.service.ts
		app.config.ts
		app.routes.ts
```

## Notable UX Decisions

- Light, founder-friendly visual design with teal branding
- Responsive card-based dashboard layout
- Guided onboarding to reduce friction for new founders
- API fallback handling to keep the frontend usable during backend instability
- AI assistant embedded directly into the pitch-creation flow

## Current Status

The frontend supports the main founder journey end-to-end:

- login
- onboarding
- readiness evaluation
- pitch assistance
- mentor and investor discovery
- profile and dashboard experience

## Team Presentation Summary

If you need a short description for a presentation:

> EmpowHer is an Angular-based fundraising support platform for women founders, combining readiness scoring, mentor and investor matching, and an AI-powered pitch assistant to help founders prepare for fundraising more effectively.


