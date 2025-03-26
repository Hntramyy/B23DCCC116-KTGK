import React, { useState, useEffect } from 'react';
import { Input, Button, Card, Typography, Space, Progress } from 'antd';
import styled from 'styled-components';
import { keyframes } from 'styled-components';
import { TrophyOutlined, ReloadOutlined, SendOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const bounceAnimation = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

const GameContainer = styled(Card)`
  max-width: 600px;
  margin: 20px auto;
  text-align: center;
  background: linear-gradient(145deg, #ffffff, #f0f2f5);
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
`;

const GuessInput = styled(Input)`
  width: 200px;
  margin: 10px;
  border-radius: 8px;
  font-size: 16px;
`;

const StyledButton = styled(Button)`
  border-radius: 8px;
  height: 40px;
  font-weight: bold;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const MessageText = styled(Text)<{ $success?: boolean }>`
  display: block;
  margin: 15px 0;
  font-size: 18px;
  font-weight: ${props => props.$success ? 'bold' : 'normal'};
  color: ${props => props.$success ? '#52c41a' : 'inherit'};
`;

const Trophy = styled(TrophyOutlined)<{ $visible: boolean }>`
  font-size: 48px;
  color: gold;
  margin: 20px;
  animation: ${props => props.$visible ? bounceAnimation : 'none'} 1s ease;
  display: ${props => props.$visible ? 'inline-block' : 'none'};
`;

const GameHeader = styled.div`
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #1890ff20, #1890ff10);
  border-radius: 12px;
`;

const NumberGuessingGame: React.FC = () => {
  const [randomNumber, setRandomNumber] = useState<number>(0);
  const [guess, setGuess] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('Hãy đoán một số từ 1 đến 100!');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const maxAttempts = 10;

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    setRandomNumber(Math.floor(Math.random() * 100) + 1);
    setAttempts(0);
    setGameOver(false);
    setGuess('');
    setMessage('Hãy đoán một số từ 1 đến 100!');
    setIsSuccess(false);
  };

  const handleGuess = () => {
    const guessNumber = parseInt(guess);

    if (isNaN(guessNumber) || guessNumber < 1 || guessNumber > 100) {
      setMessage('Vui lòng nhập một số hợp lệ từ 1 đến 100!');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guessNumber === randomNumber) {
      setMessage(`🎉 Chúc mừng! Bạn đã đoán đúng số ${randomNumber}!`);
      setGameOver(true);
      setIsSuccess(true);
    } else if (newAttempts >= maxAttempts) {
      setMessage(`😔 Bạn đã hết lượt! Số đúng là ${randomNumber}.`);
      setGameOver(true);
    } else {
      const hint = guessNumber < randomNumber ? '📈 Bạn đoán quá thấp!' : '📉 Bạn đoán quá cao!';
      setMessage(hint);
    }
    setGuess('');
  };

  return (
    <GameContainer>
      <GameHeader>
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>🎮 Trò Chơi Đoán Số</Title>
      </GameHeader>

      <Progress 
        percent={(attempts / maxAttempts) * 100} 
        showInfo={false}
        status={gameOver ? (isSuccess ? "success" : "exception") : "active"}
        style={{ padding: '0 20px' }}
      />
      
      <Text strong style={{ fontSize: '16px' }}>
        Số lượt còn lại: {maxAttempts - attempts}
      </Text>

      <Trophy $visible={isSuccess} />
      
      <MessageText $success={isSuccess}>{message}</MessageText>

      <Space direction="vertical" size="large" style={{ width: '100%', padding: '20px' }}>
        <Space>
          <GuessInput
            type="number"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onPressEnter={handleGuess}
            disabled={gameOver}
            placeholder="Nhập số từ 1-100"
            min={1}
            max={100}
            size="large"
          />
          <StyledButton 
            type="primary"
            onClick={handleGuess}
            disabled={gameOver}
            icon={<SendOutlined />}
            size="large"
          >
            Đoán
          </StyledButton>
        </Space>

        {gameOver && (
          <StyledButton 
            type="primary"
            onClick={startNewGame}
            icon={<ReloadOutlined />}
            style={{ 
              background: isSuccess ? '#52c41a' : '#ff4d4f',
              borderColor: isSuccess ? '#52c41a' : '#ff4d4f'
            }}
            size="large"
          >
            Chơi lại
          </StyledButton>
        )}
      </Space>
    </GameContainer>
  );
};

export default NumberGuessingGame;
