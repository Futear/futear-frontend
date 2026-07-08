# Futear ⚽

Futear is a football trivia platform built with Next.js, featuring multiple daily game modes, dynamic scopes, global datasets and a modern responsive interface.

The project is designed to support different football experiences (clubs, competitions and global modes) while sharing the same game engine and UI components.

## Features

- ⚽ Multiple football trivia game modes
- 🌍 Dynamic scopes (Global, Clubs, Competitions)
- 📅 Daily rotating content
- 📊 Rankings and player statistics
- 🎵 Audio support
- 🌙 Dark mode
- 📱 Responsive design
- ⚡ Optimized for performance and SEO

## Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Zustand
- Cloudflare CDN (datasets & caching)

## Getting Started

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/futear-frontend.git
```

Install dependencies:

```bash
npm install
```

Create your environment variables:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

## Project Structure

```
app/
components/
config/
hooks/
lib/
services/
stores/
public/
styles/
```

## Production

Build the project:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## License

This project is licensed under the MIT License.
