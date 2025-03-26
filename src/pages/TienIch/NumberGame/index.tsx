import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import NumberGuessingGame from '@/components/NumberGuessingGame';

const NumberGamePage: React.FC = () => {
  return (
    <PageContainer>
      <NumberGuessingGame />
    </PageContainer>
  );
};

export default NumberGamePage;
