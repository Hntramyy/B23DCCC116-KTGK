import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import LearningTrackerApp from '@/components/LearningTracker';

const LearningTrackerPage: React.FC = () => {
  return (
    <PageContainer>
      <LearningTrackerApp />
    </PageContainer>
  );
};

export default LearningTrackerPage;
