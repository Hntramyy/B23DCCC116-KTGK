import React, { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  Space,
  Popconfirm,
  Typography,
  message,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { Subject, StudySession } from './types';

const { Text } = Typography;
const { TextArea } = Input;

interface StudyProgressProps {
  subjects: Subject[];
  studySessions: StudySession[];
  onUpdateSessions: (sessions: StudySession[]) => void;
}

const StyledTable = styled(Table)`
  .ant-table-tbody > tr > td {
    vertical-align: middle;
  }
`;

const NoDataText = styled(Text)`
  display: block;
  text-align: center;
  margin: 20px 0;
  color: rgba(0, 0, 0, 0.45);
`;

const StudyProgress: React.FC<StudyProgressProps> = ({
  subjects,
  studySessions,
  onUpdateSessions,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const handleAdd = () => {
    if (subjects.length === 0) {
      messageApi.warning('Vui lòng thêm ít nhất một môn học trước!');
      return;
    }
    setEditingSession(null);
    form.resetFields();
    form.setFieldsValue({
      date: dayjs(),
      duration: 60,
      subjectId: subjects[0].id,
    });
    setIsModalVisible(true);
  };

  const handleEdit = (record: StudySession) => {
    setEditingSession(record);
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const newSessions = studySessions.filter(session => session.id !== id);
    onUpdateSessions(newSessions);
    messageApi.success('Đã xóa buổi học thành công');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const newSession: StudySession = {
        id: editingSession?.id || String(Date.now()),
        subjectId: values.subjectId,
        date: values.date.format('YYYY-MM-DD'),
        duration: values.duration,
        content: values.content,
        notes: values.notes,
      };

      if (editingSession) {
        onUpdateSessions(
          studySessions.map(session =>
            session.id === editingSession.id ? newSession : session
          )
        );
        messageApi.success('Đã cập nhật buổi học thành công');
      } else {
        onUpdateSessions([...studySessions, newSession]);
        messageApi.success('Đã thêm buổi học mới thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

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
      filters: subjects.map(subject => ({
        text: subject.name,
        value: subject.id,
      })),
      onFilter: (value: string, record: StudySession) => record.subjectId === value,
    },
    {
      title: 'Ngày học',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a: StudySession, b: StudySession) => 
        dayjs(a.date).unix() - dayjs(b.date).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Thời lượng',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration} phút`,
      sorter: (a: StudySession, b: StudySession) => a.duration - b.duration,
    },
    {
      title: 'Nội dung đã học',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: '30%',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      width: '20%',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: StudySession) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa buổi học"
            description="Bạn có chắc chắn muốn xóa buổi học này?"
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
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAdd}
        style={{ marginBottom: 16 }}
      >
        Thêm buổi học
      </Button>

      {studySessions.length === 0 ? (
        <NoDataText>
          Chưa có buổi học nào được ghi lại. Hãy thêm buổi học đầu tiên của bạn!
        </NoDataText>
      ) : (
        <StyledTable
          columns={columns}
          dataSource={studySessions}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} buổi học`,
          }}
        />
      )}

      <Modal
        title={editingSession ? 'Sửa buổi học' : 'Thêm buổi học mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        maskClosable={false}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            date: dayjs(),
            duration: 60,
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
            name="date"
            label="Ngày học"
            rules={[{ required: true, message: 'Vui lòng chọn ngày học!' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Thời lượng (phút)"
            rules={[
              { required: true, message: 'Vui lòng nhập thời lượng học!' },
              { type: 'number', min: 1, message: 'Thời lượng phải lớn hơn 0!' },
              { type: 'number', max: 720, message: 'Thời lượng không được vượt quá 12 giờ!' },
            ]}
          >
            <InputNumber
              min={1}
              max={720}
              style={{ width: '100%' }}
              placeholder="Ví dụ: 60 phút"
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung đã học"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung đã học!' }]}
          >
            <TextArea
              rows={3}
              placeholder="Mô tả những gì bạn đã học được trong buổi học này"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea
              rows={2}
              placeholder="Ghi chú thêm về buổi học (không bắt buộc)"
              showCount
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudyProgress;
