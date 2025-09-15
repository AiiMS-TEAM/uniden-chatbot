import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 위젯 스타일로 챗봇 초기화 함수
function initUnidentChatbot(containerId = 'uniden-chatbot') {
  let container = document.getElementById(containerId);
  
  // 컨테이너가 없으면 생성
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }
  
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// 전역 함수로 노출
window.initUnidentChatbot = initUnidentChatbot;

// 기본 root 요소가 있으면 자동 초기화
const defaultRoot = document.getElementById('root');
if (defaultRoot) {
  const root = ReactDOM.createRoot(defaultRoot);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// DOM이 로드되면 자동으로 초기화 (외부 사이트에서 사용할 때)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('root')) {
      initUnidentChatbot();
    }
  });
} else {
  // 이미 DOM이 로드된 경우
  if (!document.getElementById('root')) {
    initUnidentChatbot();
  }
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
