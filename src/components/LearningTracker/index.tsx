import React, { useState, useEffect } from 'react';
import { Tabs, message } from 'antd';
import styled from 'styled-components';
import SubjectsManager from './SubjectsManager';
import StudyProgress from './StudyProgress';
import MonthlyGoals from './MonthlyGoals';
import { StorageData, STORAGE_KEY, DEFAULT_SUBJECTS } from './types';

const StyledTabs = styled(Tabs)`
  .ant-tabs-content {
    min-height: 500px;
  }
`;

const LearningTracker: React.FC = () => {
  const [data, setData] = useState<StorageData>({
    subjects: [],
    studySessions: [],
    monthlyGoals: [],
  });

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    // Load data from localStorage
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
      } catch (error) {
        console.error('Error parsing stored data:', error);
        messageApi.error('Có lỗi khi tải dữ liệu. Đã khôi phục về mặc định.');
        setData({
          subjects: DEFAULT_SUBJECTS,
          studySessions: [],
          monthlyGoals: [],
        });
      }
    } else {
      // Initialize with default subjects if no data exists
      setData({
        subjects: DEFAULT_SUBJECTS,
        studySessions: [],
        monthlyGoals: [],
      });
    }
  }, [messageApi]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const handleUpdateSubjects = (newSubjects: StorageData['subjects']) => {
    setData(prev => ({ ...prev, subjects: newSubjects }));
  };

  const handleUpdateStudySessions = (newSessions: StorageData['studySessions']) => {
    setData(prev => ({ ...prev, studySessions: newSessions }));
  };

  const handleUpdateMonthlyGoals = (newGoals: StorageData['monthlyGoals']) => {
    setData(prev => ({ ...prev, monthlyGoals: newGoals }));
  };

  const items = [
    {
      key: '1',
      label: 'Môn học',
      children: (
        <SubjectsManager
          subjects={data.subjects}
          onUpdateSubjects={handleUpdateSubjects}
        />
      ),
    },
    {
      key: '2',
      label: 'Tiến độ học tập',
      children: (
        <StudyProgress
          subjects={data.subjects}
          studySessions={data.studySessions}
          onUpdateStudySessions={handleUpdateStudySessions}
        />
      ),
    },
    {
      key: '3',
      label: 'Mục tiêu tháng',
      children: (
        <MonthlyGoals
          subjects={data.subjects}
          monthlyGoals={data.monthlyGoals}
          studySessions={data.studySessions}
          onUpdateGoals={handleUpdateMonthlyGoals}
        />
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <StyledTabs
        defaultActiveKey="1"
        items={items}
        destroyInactiveTabPane
      />
    </div>
  );
};

export default LearningTracker;
