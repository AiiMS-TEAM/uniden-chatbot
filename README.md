# Uniden Chatbot

AI-powered Uniden product support chatbot built with React. The built JS files can be used directly in HTML.

## 🚀 Features

- **AI-powered responses**: Accurate product information via Uniden API
- **Modern UI/UX**: Gradient and glassmorphism design
- **Real-time chat**: Smooth animations and loading states
- **Reference documents**: Related documents and confidence scores with answers
- **Responsive design**: Support for both mobile and desktop

## 📁 Project Structure

```
uniden-chatbot/
├── chatbot-app/           # React project
│   ├── src/
│   │   ├── components/
│   │   │   └── Chatbot.js # Main chatbot component
│   │   ├── App.js         # App entry point
│   │   └── App.css        # Styles
│   └── build/             # Built files
│       └── static/
│           ├── js/        # JavaScript files
│           └── css/       # CSS files
├── test.html              # Detailed test page
├── simple-test.html       # Simple test page
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

Upload the built files to a web server and modify the paths in the HTML files.

### CDN Usage Example

```html
<!-- React CDN -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

<!-- Built files -->
<link rel="stylesheet" href="https://your-cdn.com/static/css/main.1b95f591.css">
<script src="https://your-cdn.com/static/js/453.8f92d47a.chunk.js"></script>
<script src="https://your-cdn.com/static/js/main.0db3fc22.js"></script>
```

## 🔍 Usage Examples

1. Ask "How to install camera"
2. Request "Guardian App Cam 24 information"
3. Search for "product manual"

The chatbot will provide accurate answers by referencing relevant documents.

## 📄 License

This project is licensed under the MIT License.