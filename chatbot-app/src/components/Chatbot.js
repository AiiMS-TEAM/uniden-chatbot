import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import axios from 'axios';

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

// 포맷팅된 텍스트를 렌더링하는 컴포넌트
const FormattedText = ({ text }) => {
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
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const Header = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h1`
  color: white;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin: 8px 0 0 0;
  font-size: 14px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`;

const Message = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  ${props => props.isUser ? 'flex-direction: row-reverse;' : ''}
`;

const MessageAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
    : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  };
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  max-width: 80%;
  padding: 16px 20px;
  border-radius: 20px;
  background: ${props => props.isUser 
    ? 'rgba(255, 255, 255, 0.9)' 
    : 'rgba(255, 255, 255, 0.15)'
  };
  backdrop-filter: blur(10px);
  color: ${props => props.isUser ? '#333' : 'white'};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  line-height: 1.6;
  
  ${props => props.isUser ? `
    border-bottom-right-radius: 6px;
  ` : `
    border-bottom-left-radius: 6px;
  `}
  
  /* 포맷팅된 텍스트 스타일 */
  & strong {
    font-weight: 600;
    color: ${props => props.isUser ? '#1a1a1a' : '#fff'};
  }
  
  & em {
    font-style: italic;
    opacity: 0.9;
  }
  
  & code {
    background-color: ${props => props.isUser ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)'};
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
    color: ${props => props.isUser ? '#e83e8c' : '#ffd700'};
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
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
`;

const InputContainer = styled.div`
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 16px 20px;
  border: none;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 16px;
  outline: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  &::placeholder {
    color: #999;
  }
  
  &:focus {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;

const SendButton = styled.button`
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;


const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Uniden product support assistant. Feel free to ask me anything about our products. For example, you can ask about 'camera installation' or 'product information'.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.post('https://innovate.aiims.com.au/api/query', {
        query: inputValue,
        top_k: 3
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.answer,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm unable to connect to the server at the moment. Please try again later.",
        isUser: false,
        timestamp: new Date()
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
              <FormattedText text={message.text} />
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
          <SendButton onClick={sendMessage} disabled={isLoading || !inputValue.trim()}>
            <Send size={20} />
          </SendButton>
        </InputWrapper>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chatbot;
