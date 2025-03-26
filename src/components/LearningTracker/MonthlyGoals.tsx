import React, { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  Space,
  Popconfirm,
  Progress,
  Card,
  Row,
  Col,
  DatePicker,
  Typography,
  Alert,
  message,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { Subject, StudySession, MonthlyGoal } from './types';

const { Title, Text } = Typography;

interface MonthlyGoalsProps {
  subjects: Subject[];
  monthlyGoals: MonthlyGoal[];
  studySessions: StudySession[];
  onUpdateGoals: (goals: MonthlyGoal[]) => void;
}

const StyledCard = styled(Card)`
  margin-bottom: 24px;
  .ant-card-head-title {
    font-size: 16px;
  }
`;

const StyledTable = styled(Table)`
  .ant-table-tbody > tr > td {
    vertical-align: middle;
  }
`;

const ProgressWrapper = styled.div`
  margin-bottom: 8px;
`;

const NoDataText = styled(Text)`
  display: block;
  text-align: center;
  margin: 20px 0;
  color: rgba(0, 0, 0, 0.45);
`;

const MonthlyGoals: React.FC<MonthlyGoalsProps> = ({
  subjects,
  monthlyGoals,
  studySessions,
  onUpdateGoals,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<MonthlyGoal | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const currentMonthGoals = useMemo(() => {
    const monthStr = selectedMonth.format('YYYY-MM');
    return monthlyGoals.filter(goal => goal.month === monthStr);
  }, [monthlyGoals, selectedMonth]);

  const calculateProgress = (subjectId: string, targetHours: number) => {
    const monthStart = selectedMonth.startOf('month').format('YYYY-MM-DD');
    const monthEnd = selectedMonth.endOf('month').format('YYYY-MM-DD');
    
    const totalMinutes = studySessions
      .filter(
        session =>
          session.subjectId === subjectId &&
          session.date >= monthStart &&
          session.date <= monthEnd
      )
      .reduce((sum, session) => sum + session.duration, 0);

    const progressPercent = Math.min(
      Math.round((totalMinutes / (targetHours * 60)) * 100),
      100
    );

    return {
      percent: progressPercent,
      hours: Math.round(totalMinutes / 60 * 10) / 10,
      status: progressPercent >= 100 ? 'success' : 'normal' as const,
    };
  };

  const handleAdd = () => {
    if (subjects.length === 0) {
      messageApi.warning('Vui lòng thêm ít nhất một môn học trước!');
      return;
    }
    setEditingGoal(null);
    form.resetFields();
    form.setFieldsValue({
      month: selectedMonth,
      subjectId: subjects[0].id,
    });
    setIsModalVisible(true);
  };

  const handleEdit = (record: MonthlyGoal) => {
    setEditingGoal(record);
    form.setFieldsValue({
      ...record,
      month: dayjs(record.month),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const newGoals = monthlyGoals.filter(goal => goal.id !== id);
    onUpdateGoals(newGoals);
    messageApi.success('Đã xóa mục tiêu thành công');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const monthStr = values.month.format('YYYY-MM');
      
      // Check if a goal already exists for this subject in the selected month
      const existingGoal = monthlyGoals.find(
        goal => 
          goal.subjectId === values.subjectId && 
          goal.month === monthStr &&
          (!editingGoal || goal.id !== editingGoal.id)
      );

      if (existingGoal) {
        messageApi.error('Đã tồn tại mục tiêu cho môn học này trong tháng đã chọn!');
        return;
      }

      const newGoal: MonthlyGoal = {
        id: editingGoal?.id || String(Date.now()),
        subjectId: values.subjectId,
        month: monthStr,
        targetHours: values.targetHours,
        completed: false,
      };

      if (editingGoal) {
        onUpdateGoals(
          monthlyGoals.map(goal =>
            goal.id === editingGoal.id ? newGoal : goal
          )
        );
        messageApi.success('Đã cập nhật mục tiêu thành công');
      } else {
        onUpdateGoals([...monthlyGoals, newGoal]);
        messageApi.success('Đã thêm mục tiêu mới thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const totalProgress = useMemo(() => {
    if (currentMonthGoals.length === 0) return 0;

    const totalTargetMinutes = currentMonthGoals.reduce(
      (sum, goal) => sum + goal.targetHours * 60,
      0
    );

    const monthStr = selectedMonth.format('YYYY-MM');
    const totalStudyMinutes = studySessions
      .filter(session => session.date.startsWith(monthStr))
      .reduce((sum, session) => sum + session.duration, 0);

    return Math.min(Math.round((totalStudyMinutes / totalTargetMinutes) * 100), 100);
  }, [currentMonthGoals, studySessions, selectedMonth]);

  const columns = [
    {
      title: 'Môn học',
      dataIndex: 'subjectId',
      key: 'subjectId',
      render: (subjectId: string) => {
        const subject = subjects.find(s => s.id === subjectId);
        return (
          <Space>
            {subject?.color && (
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: subject.color,
                  display: 'inline-block',
                  marginRight: 8,
                }}
              />
            )}
            {subject?.name || 'Không xác định'}
          </Space>
        );
      },
    },
    {
      title: 'Mục tiêu',
      dataIndex: 'targetHours',
      key: 'targetHours',
      render: (hours: number) => `${hours} giờ`,
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      render: (_, record: MonthlyGoal) => {
        const progress = calculateProgress(record.subjectId, record.targetHours);
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <ProgressWrapper>
              <Progress
                percent={progress.percent}
                status={progress.status}
                strokeColor={
                  subjects.find(s => s.id === record.subjectId)?.color
                }
              />
            </ProgressWrapper>
            <Text>
              {progress.hours} / {record.targetHours} giờ
              {progress.percent >= 100 && ' 🎉'}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_: any, record: MonthlyGoal) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa mục tiêu"
            description="Bạn có chắc chắn muốn xóa mục tiêu này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Space>
            <DatePicker
              picker="month"
              value={selectedMonth}
              onChange={(date) => setSelectedMonth(date || dayjs())}
              allowClear={false}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm mục tiêu
            </Button>
          </Space>
        </Col>
      </Row>

      <StyledCard title="Tổng tiến độ tháng">
        {currentMonthGoals.length > 0 ? (
          <Progress
            percent={totalProgress}
            status={totalProgress >= 100 ? "success" : "active"}
            strokeWidth={20}
          />
        ) : (
          <Alert
            message="Chưa có mục tiêu"
            description="Bạn chưa thiết lập mục tiêu học tập nào cho tháng này."
            type="info"
            showIcon
          />
        )}
      </StyledCard>

      {currentMonthGoals.length === 0 ? (
        <NoDataText>
          Chưa có mục tiêu nào được thiết lập cho tháng này. Hãy thêm mục tiêu đầu tiên của bạn!
        </NoDataText>
      ) : (
        <StyledTable
          columns={columns}
          dataSource={currentMonthGoals}
          rowKey="id"
          pagination={false}
        />
      )}

      <Modal
        title={editingGoal ? 'Sửa mục tiêu' : 'Thêm mục tiêu mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        maskClosable={false}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            month: selectedMonth,
          }}
        >
          <Form.Item
            name="subjectId"
            label="Môn học"
            rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
          >
            <Select>
              {subjects.map(subject => (
                <Select.Option key={subject.id} value={subject.id}>
                  <Space>
                    {subject.color && (
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: subject.color,
                          display: 'inline-block',
                        }}
                      />
                    )}
                    {subject.name}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="month"
            label="Tháng"
            rules={[{ required: true, message: 'Vui lòng chọn tháng!' }]}
          >
            <DatePicker
              picker="month"
              style={{ width: '100%' }}
              allowClear={false}
            />
          </Form.Item>

          <Form.Item
            name="targetHours"
            label="Mục tiêu (giờ)"
            rules={[
              { required: true, message: 'Vui lòng nhập số giờ mục tiêu!' },
              { type: 'number', min: 1, message: 'Mục tiêu phải lớn hơn 0!' },
              { type: 'number', max: 200, message: 'Mục tiêu không được vượt quá 200 giờ!' },
            ]}
          >
            <InputNumber
              min={1}
              max={200}
              style={{ width: '100%' }}
              placeholder="Ví dụ: 20 giờ"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MonthlyGoals;
