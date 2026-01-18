# The Babel Edit (Frontend)

This is the frontend for The Babel Edit, a full-stack e-commerce platform. It's a [Next.js](https://nextjs.org) application built with TypeScript, Tailwind CSS, and `next-i18next` for internationalization.

## Features
- **Multi-language Support**: Easily switch between languages (English and French configured by default).
- **Modern Tech Stack**: Built with Next.js 16+, React 19, and TypeScript.
- **Responsive Design**: Styled with Tailwind CSS for a seamless experience on all devices.
- **State Management**: Client-side state managed by Zustand.
- **E-commerce Components**: Includes a shopping cart, product carousels, and a checkout process with Stripe integration.
- **User Authentication**: Forms for login, registration, and profile management.
- **Static Typing**: Full TypeScript support for robust and maintainable code.

## Getting Started

First, ensure the backend server is running. Then, you can set up and run the frontend application.

```bash
# From the root of the project, navigate to the frontend directory
cd the_babel_edit

npm install

# Create a .env.local file to point to the backend API
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Run the development server
npm run dev
```
The frontend will be available at `http://localhost:3000`.

## Available Scripts

- `npm run dev`: Starts the development server with Turbopack.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts a production server.
- `npm run lint`: Lints the codebase.
