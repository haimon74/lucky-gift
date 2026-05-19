# Lucky Gift — Product Objective

## Vision
Lucky Gift is a web and mobile application that lets anyone send a virtual lucky lottery gift card to friends and family. Recipients receive a beautifully designed email that links to a personalized gift reveal experience where their lucky lottery numbers are dramatically unveiled.

## Goals
- Make gift-giving fun and interactive by combining the excitement of lottery numbers with a personalized message
- Support three major US lottery formats: Powerball, Mega Millions, and Millionaire for Life
- Deliver a luxurious, dark-themed UI with gold accents and playful animations
- Support both web (Next.js) and mobile (React Native/Expo) clients sharing the same business logic
- Allow senders to reach up to 5 recipients per gift, each with a unique reveal experience

## Target Users
- **Senders**: Anyone wanting to send a fun, unique gift for birthdays, anniversaries, holidays, or just because
- **Recipients**: People receiving surprise lottery number reveals via email or mobile
- **Admins**: Site operators managing configuration via the `/settings` dashboard

## Phase 1 (current)
- Full wizard flow (game + occasion + message + recipients + sender)
- Free to use — payment flow is scaffolded but disabled via `payments_enabled` setting
- Brevo email delivery
- SQLite database via Drizzle ORM
- Web app (Next.js 15) + Mobile app (Expo / React Native)

## Phase 2 (future)
- Enable Stripe payment ($10 flat fee per gift send)
- Replace emoji occasion visuals with custom illustrations/photos
- Expand lottery game options
- Analytics dashboard
