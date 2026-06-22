# Pavilion Hotel Suite

## Project Overview

A modern, responsive hotel booking website built with React and vanilla CSS. Features include:

- Professional booking calendar with date selection
- Responsive design for all device sizes
- Smooth navigation and animations
- Mobile-friendly interface
- Room showcase section
- Contact and events sections

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Features

### 📅 Booking System
- Interactive calendar with month/year navigation
- Date range selection (check-in/check-out)
- Guest count dropdown (1-4 adults)
- Smart date validation (future dates only)
- Direct navigation to rooms section

### 🎨 Design
- Clean, professional interface
- Consistent color scheme (#C08A4B gold accents)
- Responsive layout for mobile, tablet, and desktop
- Smooth animations and transitions

### 📱 Mobile Optimized
- Touch-friendly interface
- Hamburger menu with solid black overlay
- Optimized calendar for small screens
- Adaptive grid layouts

## Technology Stack

- **Frontend**: React.js (JavaScript)
- **Styling**: Vanilla CSS (converted from Tailwind)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Testing**: Vitest





Simply run `npm run build` and deploy the `dist` folder.

## Development

### Folder Structure
```
src/
├── components/          # React components
│   ├── BookingSection/   # Main booking calendar
│   ├── Navbar/          # Navigation header
│   ├── HeroSection/     # Landing hero section
│   └── ...              # Other UI components
├── pages/              # Page components
└── assets/             # Images and static files
```

### Key Components

**BookingSection.jsx** - Main booking interface with calendar functionality
**Navbar.jsx** - Responsive navigation with mobile menu
**HeroSection.jsx** - Landing page hero with call-to-action

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License
