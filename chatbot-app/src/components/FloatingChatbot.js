import React, { useState } from 'react';
import styled from 'styled-components';
import { MessageCircle, X } from 'lucide-react';
import Chatbot from './Chatbot';

const FloatingContainer = styled.div`
  position: fixed;
  bottom: 70px;
  right: 20px;
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ChatButton = styled.button`
  width: 64px;
  height: 64px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 50%, #000000 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 16px 32px rgba(0, 0, 0, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.3),
    0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.5),
      0 12px 24px rgba(0, 0, 0, 0.4),
      0 6px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(-2px) scale(1.02);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg, 
      rgba(255, 255, 255, 0.2) 0%, 
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 100%
    );
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const ChatWindow = styled.div`
  position: absolute;
  bottom: 84px;
  right: 0;
  width: 400px;
  height: 600px;
  border-radius: 24px;
  box-shadow: 
    0 32px 64px rgba(0, 0, 0, 0.4),
    0 16px 32px rgba(0, 0, 0, 0.3),
    0 8px 16px rgba(0, 0, 0, 0.2);
  background: #1a1a1a;
  overflow: hidden;
  transform: ${props => props.isOpen ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(24px)'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: ${props => props.isOpen ? 'auto' : 'none'};
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  /* 배경 블러 효과 */
  backdrop-filter: blur(20px);
  
  @media (max-width: 480px) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    height: 100dvh; /* 동적 뷰포트 높이 */
    border-radius: 0;
    transform: ${props => props.isOpen ? 'scale(1) translateY(0)' : 'scale(1) translateY(100%)'};
    z-index: 9999;
  }
  
  @media (max-width: 768px) and (min-width: 481px) {
    width: calc(100vw - 40px);
    height: calc(100vh - 120px);
    right: -20px;
    bottom: 84px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const PulseAnimation = styled.div`
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  background: linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 50%, #000000 100%);
  animation: pulse 2.5s ease-in-out infinite;
  z-index: -1;
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.3);
      opacity: 0;
    }
  }
`;

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // 모바일에서 챗봇이 열렸을 때만 배경 스크롤 방지
  React.useEffect(() => {
    const isMobile = window.innerWidth <= 480;
    
    if (isOpen && isMobile) {
      // 현재 스크롤 위치 저장
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // 스크롤 위치 복원
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      // 컴포넌트 언마운트 시 정리
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <FloatingContainer>
      <ChatButton 
        onClick={toggleChat}
        title={isOpen ? "Close Chatbot" : "Open Chatbot"}
        aria-label={isOpen ? "Close Chatbot" : "Open Chatbot"}
        aria-expanded={isOpen}
      >
        {!isOpen && <PulseAnimation />}
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </ChatButton>
      
      <ChatWindow isOpen={isOpen}>
        <CloseButton 
          onClick={toggleChat}
          title="Close Chatbot"
          aria-label="Close Chatbot"
        >
          <X size={16} />
        </CloseButton>
        <Chatbot />
      </ChatWindow>
    </FloatingContainer>
  );
};

export default FloatingChatbot;
