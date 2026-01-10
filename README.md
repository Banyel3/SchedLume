# SchedLume 📚

A mobile-first, offline-capable class schedule viewer built with Next.js. Perfect for students who want quick access to their class schedules without an internet connection.

![SchedLume](public/icons/icon-192x192.svg)

## ✨ Features

- **📱 Mobile-First Design** - Optimized for smartphones with touch-friendly UI
- **📶 Offline Support** - Works without internet using PWA technology
- **📅 Multiple Views** - Today, Week, and Calendar views for flexible scheduling
- **📝 Class Notes** - Add personal notes to any class with auto-save
- **🔄 Day Overrides** - Handle schedule changes, cancellations, and room swaps
- **📤 CSV Import** - Easily import schedules from spreadsheets
- **💾 Local Storage** - All data stored securely in IndexedDB on your device
- **🎨 Beautiful UI** - Clean, modern interface with coral accent colors

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/schedlume.git
cd schedlume
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## 📊 CSV Import Format

Import your class schedule using a CSV file with these columns:

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| Subject | ✅ | Class name | Mathematics |
| Day | ✅ | Day of week | Monday / Mon / M |
| Start | ✅ | Start time | 9:00 AM / 09:00 |
| End | ✅ | End time | 10:30 AM / 10:30 |
| Room | ❌ | Room/Location | Room 201 |
| Instructor | ❌ | Teacher name | Dr. Smith |

### Sample CSV
```csv
Subject,Day,Start,End,Room,Instructor
Mathematics,Monday,9:00 AM,10:30 AM,Room 201,Dr. Smith
Physics,Monday,11:00 AM,12:30 PM,Lab A,Prof. Johnson
English,Tuesday,9:00 AM,10:00 AM,Room 105,Ms. Davis
```

## 🏗️ Project Structure

```
schedlume/
├── app/                    # Next.js App Router pages
│   ├── today/             # Today's schedule view
│   ├── week/              # Week view
│   ├── calendar/          # Calendar month view
│   └── settings/          # Settings & import
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components (nav, header)
│   ├── schedule/          # Schedule-related components
│   ├── calendar/          # Calendar components
│   ├── forms/             # Form components
│   └── pwa/               # PWA components
├── hooks/                 # Custom React hooks
├── lib/
│   ├── db/               # IndexedDB operations
│   ├── csv/              # CSV parsing & validation
│   ├── utils/            # Utility functions
│   └── schedule/         # Schedule resolution logic
├── types/                # TypeScript type definitions
└── public/
    ├── icons/            # PWA icons
    └── sw.js             # Service worker
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State**: Zustand (global), React hooks (local)
- **Storage**: IndexedDB (Dexie-like patterns)
- **PWA**: Service Worker + Web Manifest

## 📱 PWA Installation

### iOS
1. Open in Safari
2. Tap Share → "Add to Home Screen"

### Android
1. Open in Chrome
2. Tap menu → "Install app" or "Add to Home Screen"

### Desktop
1. Look for install icon in address bar
2. Click "Install"

## 🎨 Generating PWA Icons

If you need to regenerate PWA icons:

```bash
npm install sharp --save-dev
node scripts/generate-icons.js
```

Or manually convert `public/icons/icon-512x512.svg` to PNG at various sizes.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🚀 Deploy on Vercel

The easiest way to deploy SchedLume is on [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/schedlume)
