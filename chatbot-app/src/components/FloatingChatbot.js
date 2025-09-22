import React, { useState } from 'react';
import styled from 'styled-components';
import { MessageCircle, X } from 'lucide-react';
import Chatbot from './Chatbot';

const FloatingContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ChatButton = styled.button`
  width: 64px;
  height: 64px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(145deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 16px 32px rgba(99, 102, 241, 0.3),
    0 8px 16px rgba(139, 92, 246, 0.2),
    0 4px 8px rgba(236, 72, 153, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 
      0 20px 40px rgba(99, 102, 241, 0.4),
      0 12px 24px rgba(139, 92, 246, 0.3),
      0 6px 12px rgba(236, 72, 153, 0.2);
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
    0 32px 64px rgba(0, 0, 0, 0.2),
    0 16px 32px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.05);
  background: white;
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
    border-radius: 0;
    transform: ${props => props.isOpen ? 'scale(1) translateY(0)' : 'scale(1) translateY(100%)'};
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
  background: rgba(255, 255, 255, 0.9);
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    color: #333;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  background: linear-gradient(145deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
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

  return (
    <FloatingContainer>
      <ChatButton 
        onClick={toggleChat}
        title={isOpen ? "챗봇 닫기" : "챗봇 열기"}
        aria-label={isOpen ? "챗봇 닫기" : "챗봇 열기"}
        aria-expanded={isOpen}
      >
        {!isOpen && <PulseAnimation />}
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </ChatButton>
      
      <ChatWindow isOpen={isOpen}>
        <CloseButton 
          onClick={toggleChat}
          title="챗봇 닫기"
          aria-label="챗봇 닫기"
        >
          <X size={16} />
        </CloseButton>
        <Chatbot />
      </ChatWindow>
    </FloatingContainer>
  );
};

export default FloatingChatbot;
