# AI Website Cloner Frontend

This project is a frontend for the AI Website Cloner, a tool that allows users to instantly clone web page designs into HTML by providing a URL. The app communicates with a backend service to process screenshots and extract HTML from the target website.

## Features
- Enter a URL to clone its design into HTML
- Live preview of the extracted HTML
- Error handling and loading indicators
- Modern, responsive UI with React and Next.js

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Backend URL

The frontend communicates with a backend API (default: `http://127.0.0.1:8000`). To change the backend URL, set the environment variable `NEXT_PUBLIC_BACKEND_URL` in a `.env.local` file at the project root:

```
NEXT_PUBLIC_BACKEND_URL=http://your-backend-url:8000
```

The app will use this value for all API requests.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the app.

## How It Works
1. Enter a website URL in the input bar and submit.
2. The frontend sends the URL to the backend, which takes a screenshot and processes the page.
3. The backend returns a screenshot and begins extracting the HTML.
4. The frontend polls the backend for extraction progress and displays the HTML preview when ready.
5. Errors and loading states are shown in the UI as needed.

## Project Structure
- `src/app/page.tsx` — Main page and logic
- `src/app/components/` — UI components

## Customization
- Update styles in the CSS modules under `src/app/components/` and `src/app/`
- Adjust backend endpoints in the code if your API differs from the default
