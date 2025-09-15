# Uniden Chatbot

AI-powered Uniden product support chatbot built with React. Features markdown text formatting, responsive design, and can be embedded in any website.

## 🌐 Live Demo

Visit the live demo: [https://your-vercel-url.vercel.app](https://your-vercel-url.vercel.app)

## 🚀 Features

- **AI-powered responses**: Accurate product information via Uniden API
- **Markdown formatting**: **Bold text**, *italic text*, and `code blocks` support
- **Modern UI/UX**: Gradient and glassmorphism design
- **Real-time chat**: Smooth animations and loading states
- **Reference documents**: Related documents and confidence scores with answers
- **Responsive design**: Support for both mobile and desktop
- **Easy embedding**: Can be added to any website with simple script tags

## 📁 Project Structure

```
uniden-chatbot/
├── chatbot-app/           # React project
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chatbot.js       # Main chatbot component
│   │   │   └── FloatingChatbot.js # Floating widget component
│   │   ├── App.js         # App entry point
│   │   └── index.js       # Entry point with widget functionality
│   └── build/             # Built files (auto-generated)
│       └── static/
│           ├── js/        # JavaScript files
│           └── css/       # CSS files
├── index.html             # Main demo page (for Vercel deployment)
├── test.html              # Local test page
├── vercel.json            # Vercel deployment configuration
└── README.md              # This file
```

## 🛠️ Installation and Setup

### Run in development environment

```bash
cd chatbot-app
npm install
npm start
```

### Build

```bash
cd chatbot-app
npm run build
```

### Use in HTML

1. Open `test.html` or `simple-test.html` in your browser
2. The chatbot will load automatically

## 🔧 API Integration

The chatbot uses the following API endpoint:

```bash
curl -X POST https://innovate.aiims.com.au/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "How to install the camera?", "top_k": 3}'
```

### Response Format

```json
{
  "answer": "Response content",
  "query": "User question",
  "sources": [
    {
      "chunk_index": 0.0,
      "filename": "52245.pdf",
      "score": 0.630802155
    }
  ],
  "success": true
}
```

## 🎨 Design Features

- **Gradient background**: Purple-blue gradient
- **Glassmorphism**: Semi-transparent background with blur effects
- **Smooth animations**: Message sending and loading animations
- **Icons**: Lucide React icons
- **Typography**: System font stack

## 📱 Responsive Support

- Desktop: 400px width chatbot
- Mobile: Full screen width
- Touch-friendly interface

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the `vercel.json` configuration
3. The site will be deployed with `index.html` as the main page
4. All chatbot assets will be properly served

### Manual Deployment

Upload the following files to your web server:
- `index.html` (main page)
- `chatbot-app/build/` (entire directory)

### Embed in External Website

```html
<!-- React CDN -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

<!-- Chatbot files from your deployment -->
<link rel="stylesheet" href="https://your-site.vercel.app/chatbot-app/build/static/css/main.f815b5d0.css">
<script src="https://your-site.vercel.app/chatbot-app/build/static/js/453.8f92d47a.chunk.js"></script>
<script src="https://your-site.vercel.app/chatbot-app/build/static/js/main.e38298e1.js"></script>

<!-- The chatbot will automatically appear in the bottom-right corner -->
```

## 🔍 Usage Examples

1. Ask "How to install camera"
2. Request "Guardian App Cam 24 information"
3. Search for "product manual"

The chatbot will provide accurate answers by referencing relevant documents.

## 📄 License

This project is licensed under the MIT License.