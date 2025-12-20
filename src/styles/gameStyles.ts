// src/styles/gameStyles.ts
export const gameStyles = {
  dezenaBola: `
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.1rem;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    color: #ffffff;
    border: 1px solid #404040;
    box-shadow: 
      0 2px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    margin: 3px;
    text-align: center;
    letter-spacing: 0.5px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s;
    }
    
    &:hover {
      transform: translateY(-2px);
      background: linear-gradient(135deg, #2d2d2d 0%, #404040 100%);
      border-color: #0ea5e9;
      box-shadow: 
        0 4px 16px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(14, 165, 233, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      color: #0ea5e9;
    }
    
    &:hover::before {
      left: 100%;
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    
    @media (max-width: 500px) {
      width: 36px;
      height: 36px;
      font-size: 0.95rem;
      border-radius: 10px;
    }
    
    @media (max-width: 400px) {
      width: 32px;
      height: 32px;
      font-size: 0.85rem;
      border-radius: 8px;
    }
  `,
  
  dezenaBolaSelected: `
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: #ffffff;
    border-color: #0284c7;
    box-shadow: 
      0 4px 16px rgba(14, 165, 233, 0.4),
      0 0 0 2px rgba(14, 165, 233, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
    
    &:hover {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      transform: scale(1.05) translateY(-1px);
    }
  `,
  
  dezenaBolaWinning: `
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: #ffffff;
    border-color: #16a34a;
    box-shadow: 
      0 4px 16px rgba(34, 197, 94, 0.4),
      0 0 0 2px rgba(34, 197, 94, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    animation: pulse 2s infinite;
    
    @keyframes pulse {
      0%, 100% { box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4), 0 0 0 2px rgba(34, 197, 94, 0.3); }
      50% { box-shadow: 0 4px 20px rgba(34, 197, 94, 0.6), 0 0 0 4px rgba(34, 197, 94, 0.4); }
    }
  `,
  
  dezenaBolaHighlight: `
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: #ffffff;
    border-color: #ea580c;
    box-shadow: 
      0 4px 16px rgba(249, 115, 22, 0.4),
      0 0 0 2px rgba(249, 115, 22, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  `,
  
  fadeInAnimation: `
    @keyframes fadeIn {
      from { 
        opacity: 0; 
        transform: translateY(20px) scale(0.95); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }
    
    @keyframes slideInFromLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes slideInFromRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  `,
  
  containerStyles: `
    background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
    border: 1px solid #2d2d2d;
    border-radius: 16px;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.5), transparent);
    }
  `,
  
  buttonPrimary: `
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-weight: 600;
    font-size: 0.95rem;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 
      0 4px 16px rgba(14, 165, 233, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      transform: translateY(-2px);
      box-shadow: 
        0 6px 20px rgba(14, 165, 233, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 
        0 2px 8px rgba(14, 165, 233, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    
    &:disabled {
      background: #404040;
      color: #888888;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `,
  
  buttonSecondary: `
    background: transparent;
    color: #ffffff;
    border: 1px solid #404040;
    border-radius: 12px;
    padding: 12px 24px;
    font-weight: 600;
    font-size: 0.95rem;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: #0ea5e9;
      color: #0ea5e9;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    &:active {
      transform: translateY(0);
      background: rgba(255, 255, 255, 0.02);
    }
  `
};