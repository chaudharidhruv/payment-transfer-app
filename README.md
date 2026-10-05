# I-Pay

A full-stack peer-to-peer payment platform built with Next.js, TypeScript,
Supabase, and Stripe, supporting user-to-user transfers, payment requests,
transaction history, real-time balance updates, and account activity
analytics.

## Overview

I-Pay is a full-stack payment application implementing core peer-to-peer
payment functionality. Users can authenticate with Google, send money to one
or more recipients, request money from other users, add optional payment
notes, and track their payment history.

The application combines a Next.js frontend with Supabase for persistent
account and transaction data and Stripe for card-based payments. Backend
workflows and database triggers coordinate payment processing, transaction
logging, balance updates, and notifications.

## Features

### Authentication

- Google OAuth sign-in and sign-out using Supabase authentication
- Persistent user sessions across the application
- Authenticated access to account and payment functionality

### Payments

- Send money to one or more recipients
- Add optional notes to payment transactions
- Request money from another user
- Process card payments through Stripe in test mode
- Maintain user balances and transaction records

### Notifications

- In-app notification system for incoming payment requests
- Notification indicator in the navigation bar
- Browse multiple payment requests using previous/next controls

### Transaction History

- View recent payment activity
- Track incoming and outgoing transactions
- Store transaction history using Supabase
- Display payment activity associated with the user's account

### Dashboard & Analytics

- Home dashboard displaying the user's current balance
- Personalized user greeting
- Balance-over-time line graph showing changes in account balance
- Navigation across Home, Send Money, Request Money, and Transactions

### UI & Responsiveness

- Built with Tailwind CSS v4
- Responsive layouts for different screen sizes
- Persistent light/dark theme preference
- Clear focus states and accessible interactive elements
- Smooth scrolling and consistent navigation styling

## Architecture

The application is split between a Next.js frontend and backend services
provided by Supabase and Stripe.

### Frontend

The Next.js application handles authentication state, navigation, payment
forms, transaction displays, notifications, and dashboard analytics. Tailwind
CSS is used for responsive styling and theming.

### Database & Backend

Supabase stores user accounts, balances, payment records, and transaction
history. Database triggers and backend workflows are used to coordinate
payment-related updates and notifications.

### Payments

Stripe is integrated in test mode to process card payments. Payment activity
is recorded in the application's database so that account balances and
transaction history remain synchronized with application activity.

## Validation

The application was tested across 150 test accounts to verify payment flows,
account balances, transaction history, notifications, and interactions
between multiple users.

## Running Locally

Install the project dependencies:

    npm install

Start the development server:

    npm run dev

Open the local development URL shown in the terminal to view the application
in your browser.

## Tech Stack

- **Frontend:** Next.js, TypeScript, React, Tailwind CSS v4
- **Backend & Database:** Supabase, PostgreSQL
- **Payments:** Stripe
- **Authentication:** Google OAuth, Supabase Auth
- **Deployment:** Vercel