import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import axios from 'axios';

// 쿠키 관리 유틸리티 함수들
const setCookie = (name, value, days = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};


// 마크다운을 HTML로 변환하는 간단한 파서
const parseMarkdown = (text) => {
  if (!text) return '';
  
  // 볼드 텍스트 (**text** -> <strong>text</strong>)
  let parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // 이탤릭 텍스트 (*text* -> <em>text</em>)
  parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // 인라인 코드 (`code` -> <code>code</code>)
  parsed = parsed.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // 개행 처리 (두 개의 개행 -> 문단 분리)
  parsed = parsed.replace(/\n\n/g, '</p><p>');
  
  // 단일 개행 -> 줄바꿈
  parsed = parsed.replace(/\n/g, '<br>');
  
  // 문단으로 감싸기
  if (parsed.includes('</p><p>')) {
    parsed = '<p>' + parsed + '</p>';
  }
  
  return parsed;
};

// 타이핑 애니메이션 컴포넌트 (HTML 기반)
const TypewriterText = ({ text, speed = 20, onComplete, onUpdate }) => {
  const [displayedHTML, setDisplayedHTML] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [textNodes, setTextNodes] = useState([]);

  // 초기화: HTML을 파싱하여 텍스트 노드들 추출
  useEffect(() => {
    if (!text) return;
    
    const parsedHTML = parseMarkdown(text);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = parsedHTML;
    
    const extractTextNodes = (element, path = []) => {
      const nodes = [];
      
      for (let i = 0; i < element.childNodes.length; i++) {
        const node = element.childNodes[i];
        
        if (node.nodeType === Node.TEXT_NODE) {
          // 텍스트 노드인 경우, 각 글자를 개별 노드로 분리
          const textContent = node.textContent;
          for (let j = 0; j < textContent.length; j++) {
            nodes.push({
              type: 'text',
              char: textContent[j],
              path: [...path],
              elementTag: path.length > 0 ? path[path.length - 1] : null
            });
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // 엘리먼트 노드인 경우, 재귀적으로 탐색
          const elementInfo = {
            tag: node.tagName.toLowerCase(),
            attributes: {}
          };
          
          // 속성 복사
          for (let attr of node.attributes) {
            elementInfo.attributes[attr.name] = attr.value;
          }
          
          const childNodes = extractTextNodes(node, [...path, elementInfo]);
          nodes.push(...childNodes);
        }
      }
      
      return nodes;
    };
    
    const nodes = extractTextNodes(tempDiv);
    setTextNodes(nodes);
  }, [text]);

  // 타이핑 애니메이션
  useEffect(() => {
    if (textNodes.length === 0) return;
    
    if (currentIndex < textNodes.length) {
      const timer = setTimeout(() => {
        // 현재까지의 노드들로 HTML 구성
        const currentNodes = textNodes.slice(0, currentIndex + 1);
        const html = buildHTML(currentNodes);
        setDisplayedHTML(html);
        setCurrentIndex(prev => prev + 1);
        
        // 타이핑 중 스크롤 업데이트 콜백 호출
        onUpdate?.();
      }, speed);

      return () => clearTimeout(timer);
    } else if (isTyping) {
      setIsTyping(false);
      onComplete?.();
    }
  }, [currentIndex, textNodes, speed, isTyping, onComplete, onUpdate]);

  const buildHTML = (nodes) => {
    if (nodes.length === 0) return '';
    
    let html = '';
    let openTags = [];
    
    nodes.forEach((node, index) => {
      // 현재 노드의 경로와 이전 경로 비교
      const currentPath = node.path;
      const prevPath = index > 0 ? nodes[index - 1].path : [];
      
      // 닫아야 할 태그들 찾기
      let closeCount = 0;
      for (let i = Math.min(openTags.length, prevPath.length) - 1; i >= 0; i--) {
        if (i >= currentPath.length || 
            openTags[i].tag !== currentPath[i].tag ||
            JSON.stringify(openTags[i].attributes) !== JSON.stringify(currentPath[i].attributes)) {
          closeCount = openTags.length - i;
          break;
        }
      }
      
      // 태그 닫기
      for (let i = 0; i < closeCount; i++) {
        const tagToClose = openTags.pop();
        html += `</${tagToClose.tag}>`;
      }
      
      // 열어야 할 태그들 찾기
      for (let i = openTags.length; i < currentPath.length; i++) {
        const tagInfo = currentPath[i];
        const attributes = Object.entries(tagInfo.attributes)
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ');
        
        html += `<${tagInfo.tag}${attributes ? ' ' + attributes : ''}>`;
        openTags.push(tagInfo);
      }
      
      // 텍스트 추가
      html += node.char;
    });
    
    // 남은 태그들 모두 닫기
    while (openTags.length > 0) {
      const tagToClose = openTags.pop();
      html += `</${tagToClose.tag}>`;
    }
    
    return html;
  };

  return (
    <div>
      <span dangerouslySetInnerHTML={{ __html: displayedHTML }} />
      {isTyping && (
        <span
          style={{
            display: 'inline-block',
            width: '2px',
            height: '1em',
            backgroundColor: 'currentColor',
            marginLeft: '2px',
            animation: 'blink 1s infinite'
          }}
        />
      )}
    </div>
  );
};

// 포맷팅된 텍스트를 렌더링하는 컴포넌트 (타이핑 효과 없는 버전)
const FormattedText = ({ text, typing = false, onTypingComplete, onTypingUpdate }) => {
  if (typing) {
    return <TypewriterText text={text} onComplete={onTypingComplete} onUpdate={onTypingUpdate} />;
  }
  
  const formattedText = parseMarkdown(text);
  return (
    <div dangerouslySetInnerHTML={{ __html: formattedText }} />
  );
};

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 600px;
  width: 400px;
  border-radius: 24px;
  box-shadow: 
    0 32px 64px rgba(0, 0, 0, 0.12),
    0 16px 32px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.04);
  background: linear-gradient(145deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  position: relative;
  
  /* 글래스모피즘 효과를 위한 오버레이 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0.02) 100%
    );
    pointer-events: none;
    z-index: 1;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 480px) {
    width: 100%;
    height: 100vh;
    border-radius: 0;
  }
  
  @media (max-width: 768px) {
    width: calc(100vw - 40px);
    height: 80vh;
    border-radius: 20px;
  }
  
  /* 다크모드 지원 */
  @media (prefers-color-scheme: dark) {
    box-shadow: 
      0 32px 64px rgba(0, 0, 0, 0.3),
      0 16px 32px rgba(0, 0, 0, 0.2),
      0 8px 16px rgba(0, 0, 0, 0.1);
  }
  
  /* 모션 감소 설정 지원 */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  
  /* 커서 깜빡임 애니메이션 */
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

const Header = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  padding: 24px 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  position: relative;
  z-index: 2;
  
  /* 헤더 상단 하이라이트 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 20px;
    right: 20px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
  }
`;

const Title = styled.h1`
  color: white;
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  letter-spacing: -0.02em;
  background: linear-gradient(145deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.85);
  margin: 8px 0 0 0;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.01em;
`;


const MessagesContainer = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 2;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.3) 100%);
  }
`;

const Message = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  ${props => props.isUser ? 'flex-direction: row-reverse;' : ''}
  animation: messageSlideIn 0.3s ease-out;
  
  @keyframes messageSlideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MessageAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  };
  box-shadow: 
    0 8px 16px rgba(0, 0, 0, 0.12),
    0 4px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 
      0 12px 24px rgba(0, 0, 0, 0.15),
      0 6px 12px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
`;

const MessageContent = styled.div`
  max-width: 80%;
  padding: 18px 22px;
  border-radius: ${props => props.isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px'};
  background: ${props => props.isUser 
    ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)' 
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.12) 100%)'
  };
  backdrop-filter: blur(20px);
  color: ${props => props.isUser ? '#1f2937' : 'white'};
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, ${props => props.isUser ? '0.6' : '0.2'});
  word-wrap: break-word;
  line-height: 1.6;
  border: 1px solid ${props => props.isUser ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  position: relative;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.12),
      0 6px 20px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, ${props => props.isUser ? '0.7' : '0.3'});
  }
  
  /* 포맷팅된 텍스트 스타일 */
  & strong {
    font-weight: 700;
    color: ${props => props.isUser ? '#111827' : '#fff'};
  }
  
  & em {
    font-style: italic;
    opacity: 0.9;
  }
  
  & code {
    background-color: ${props => props.isUser ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)'};
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.9em;
    font-family: 'SF Mono', 'Monaco', 'Consolas', 'Courier New', monospace;
    color: ${props => props.isUser ? '#dc2626' : '#fbbf24'};
    border: 1px solid ${props => props.isUser ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
  }
  
  & p {
    margin: 0 0 12px 0;
  }
  
  & p:last-child {
    margin: 0;
  }
  
  & br {
    margin: 4px 0;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.85);
  font-style: italic;
  font-weight: 500;
  
  /* \ub85c\ub529 \uc810\uc810\uc810 \uc560\ub2c8\uba54\uc774\uc158 */
  &::after {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: currentColor;
    animation: loadingDots 1.4s infinite ease-in-out;
    margin-left: 4px;
  }
  
  @keyframes loadingDots {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const InputContainer = styled.div`
  padding: 24px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  position: relative;
  z-index: 2;
  
  /* 하단 하이라이트 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 24px;
    right: 24px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
  }
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 18px 24px;
  border: none;
  border-radius: 28px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
  color: #1f2937;
  font-size: 16px;
  font-weight: 500;
  outline: none;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
  
  &::placeholder {
    color: #6b7280;
    font-weight: 400;
  }
  
  &:focus {
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.12),
      0 6px 20px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.7),
      0 0 0 3px rgba(99, 102, 241, 0.1);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  width: 54px;
  height: 54px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 8px 32px rgba(59, 130, 246, 0.3),
    0 4px 16px rgba(59, 130, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
  border: 2px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 
      0 12px 40px rgba(59, 130, 246, 0.4),
      0 6px 20px rgba(59, 130, 246, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: translateY(-1px) scale(1.02);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.1),
      0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;


const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Uniden product support assistant. Feel free to ask me anything about our products. For example, you can ask about 'camera installation' or 'product information'.",
      isUser: false,
      timestamp: new Date(),
      typing: false,
      isComplete: true
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState('');
  const messagesEndRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // 컴포넌트 마운트 시 쿠키에서 thread_id 로드
  useEffect(() => {
    const savedThreadId = getCookie('uniden_chatbot_thread_id');
    if (savedThreadId) {
      setThreadId(savedThreadId);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // API 요청 데이터 구성
      const requestData = {
        query: currentQuery,
        top_k: 3
      };

      // thread_id가 있으면 포함
      if (threadId) {
        requestData.thread_id = threadId;
      }

      const response = await axios.post('https://innovate.aiims.com.au/api/query', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // 응답에서 thread_id를 받아서 상태와 쿠키에 저장
      if (response.data.thread_id) {
        setThreadId(response.data.thread_id);
        setCookie('uniden_chatbot_thread_id', response.data.thread_id, 30);
      }

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.answer,
        isUser: false,
        timestamp: new Date(),
        typing: true,
        isComplete: false
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm unable to connect to the server at the moment. Please try again later.",
        isUser: false,
        timestamp: new Date(),
        typing: true,
        isComplete: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTypingComplete = (messageId) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, typing: false, isComplete: true }
          : msg
      )
    );
  };

  const handleTypingUpdate = () => {
    // 타이핑 중에도 스크롤을 맨 아래로 이동 (throttled)
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      scrollToBottom();
    }, 50); // 50ms throttle
  };


  return (
    <ChatContainer>
      <Header>
        <Title>Uniden Assistant</Title>
        <Subtitle>AI-powered product support</Subtitle>
      </Header>
      
      <MessagesContainer>
        {messages.map((message) => (
          <Message key={message.id} isUser={message.isUser}>
            <MessageAvatar isUser={message.isUser}>
              {message.isUser ? <User size={20} /> : <Bot size={20} />}
            </MessageAvatar>
            <MessageContent isUser={message.isUser}>
              <FormattedText 
                text={message.text} 
                typing={message.typing && !message.isUser}
                onTypingComplete={() => handleTypingComplete(message.id)}
                onTypingUpdate={handleTypingUpdate}
              />
            </MessageContent>
          </Message>
        ))}
        
        {isLoading && (
          <Message>
            <MessageAvatar>
              <Bot size={20} />
            </MessageAvatar>
            <MessageContent>
              <LoadingMessage>
                <Loader2 size={16} className="animate-spin" />
                Generating response...
              </LoadingMessage>
            </MessageContent>
          </Message>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer>
        <InputWrapper>
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <SendButton 
            onClick={sendMessage} 
            disabled={isLoading || !inputValue.trim()}
            title="메시지 전송"
            aria-label="메시지 전송"
          >
            <Send size={20} />
          </SendButton>
        </InputWrapper>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chatbot;
