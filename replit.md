# Overview

HealthLink AI is a comprehensive health management application that provides AI-powered symptom analysis, clinic location services, health tracking, and intelligent chat assistance. The platform helps users make informed health decisions by combining artificial intelligence with practical healthcare resources.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern React application using functional components and hooks
- **Routing**: Wouter for client-side routing with page-based organization
- **UI Framework**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **State Management**: TanStack Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Server Framework**: Express.js with TypeScript for REST API endpoints
- **Database Layer**: Drizzle ORM with PostgreSQL database (Neon serverless)
- **Data Storage**: Abstracted storage interface with in-memory fallback implementation
- **API Structure**: RESTful endpoints organized by feature domains (health-logs, symptoms, chat, clinics)
- **Development Setup**: Vite for frontend bundling with hot module replacement

## Core Features
- **Symptom Analysis**: AI-powered symptom checker using OpenAI GPT models
- **Health Logging**: Track symptoms, medications, vitals, exercise, and mood with severity ratings
- **Clinic Finder**: Location-based healthcare facility search with Google Maps integration
- **AI Chat**: Conversational health assistant for personalized guidance
- **Data Visualization**: Interactive charts for health trend analysis using Recharts

## Database Schema
- **Users**: Basic user authentication and profile management
- **Health Logs**: Structured health data with type categorization and metadata
- **Chat Sessions**: Persistent chat history with AI assistant
- **Symptom Analyses**: AI analysis results for symptom assessments
- **Clinics**: Healthcare facility directory with location and rating data

## Security & Data Management
- **Schema Validation**: Zod schemas for request/response validation
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Database Migrations**: Drizzle Kit for schema management and migrations

# External Dependencies

## AI Services
- **OpenAI**: GPT-5 model for symptom analysis and chat functionality
- **Configuration**: Uses environment variables for API key management

## Location Services
- **Google Maps API**: Geocoding and Places API for clinic search functionality
- **Google Maps JavaScript API**: Interactive map visualization for clinic locations

## Database
- **Neon PostgreSQL**: Serverless PostgreSQL database for production
- **Connection**: Uses DATABASE_URL environment variable

## UI Components
- **Radix UI**: Headless UI primitives for accessibility and functionality
- **Lucide Icons**: Icon library for consistent visual elements
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens

## Development Tools
- **Vite**: Frontend build tool and development server
- **Replit Integration**: Specialized plugins for Replit environment
- **TypeScript**: Static typing across the entire application stack