import React, { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Select,
  message,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Subject, PREDEFINED_COLORS } from './types';

interface SubjectsManagerProps {
  subjects: Subject[];
  onUpdateSubjects: (subjects: Subject[]) => void;
}

const ColorPreview = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: ${props => props.color};
  border: 1px solid #d9d9d9;
`;

const StyledTable = styled(Table)`
  .ant-table-tbody > tr > td {
    vertical-align: middle;
  }
`;

const SubjectsManager: React.FC<SubjectsManagerProps> = ({
  subjects,
  onUpdateSubjects,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const handleAdd = () => {
    setEditingSubject(null);
    form.resetFields();
    form.setFieldsValue({
      color: PREDEFINED_COLORS[0],
    });
    setIsModalVisible(true);
  };

  const handleEdit = (record: Subject) => {
    setEditingSubject(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const newSubjects = subjects.filter(subject => subject.id !== id);
    onUpdateSubjects(newSubjects);
    messageApi.success('Đã xóa môn học thành công');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Check if subject name already exists
      const existingSubject = subjects.find(
        subject => 
          subject.name.toLowerCase() === values.name.toLowerCase() &&
          (!editingSubject || subject.id !== editingSubject.id)
      );

      if (existingSubject) {
        messageApi.error('Môn học này đã tồn tại!');
        return;
      }

      const newSubject: Subject = {
        id: editingSubject?.id || String(Date.now()),
        name: values.name,
        color: values.color,
      };

      if (editingSubject) {
        onUpdateSubjects(
          subjects.map(subject =>
            subject.id === editingSubject.id ? newSubject : subject
          )
        );
        messageApi.success('Đã cập nhật môn học thành công');
      } else {
        onUpdateSubjects([...subjects, newSubject]);
        messageApi.success('Đã thêm môn học mới thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns = [
    {
      title: 'Màu sắc',
      dataIndex: 'color',
      key: 'color',
      width: 80,
      render: (color: string) => <ColorPreview color={color} />,
    },
    {
      title: 'Tên môn học',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_: any, record: Subject) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa môn học"
            description="Bạn có chắc chắn muốn xóa môn học này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={subjects.length <= 1}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm môn học
        </Button>
      </Space>

      <StyledTable
        columns={columns}
        dataSource={subjects}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title={editingSubject ? 'Sửa môn học' : 'Thêm môn học mới'}
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
            color: PREDEFINED_COLORS[0],
          }}
        >
          <Form.Item
            name="name"
            label="Tên môn học"
            rules={[
              { required: true, message: 'Vui lòng nhập tên môn học!' },
              { max: 50, message: 'Tên môn học không được vượt quá 50 ký tự!' },
            ]}
          >
            <Input placeholder="Ví dụ: Toán" />
          </Form.Item>

          <Form.Item
            name="color"
            label="Màu sắc"
            rules={[{ required: true, message: 'Vui lòng chọn màu sắc!' }]}
          >
            <Select>
              {PREDEFINED_COLORS.map((color) => (
                <Select.Option key={color} value={color}>
                  <Space>
                    <ColorPreview color={color} />
                    <span>{color}</span>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubjectsManager;
