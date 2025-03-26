import { Form, Modal, Select, InputNumber, Button, Space, message, Card, Typography } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import type { IOrder, IOrderItem } from '@/models/order';
import { useEffect, useState } from 'react';

const { Text } = Typography;

interface OrderFormProps {
  visible: boolean;
  onCancel: () => void;
  editingOrder: IOrder | null;
}

const OrderForm: React.FC<OrderFormProps> = ({
  visible,
  onCancel,
  editingOrder,
}) => {
  const [form] = Form.useForm();
  const { addOrder, updateOrder, getProducts, getCustomers } = useModel('order');
  const products = getProducts();
  const customers = getCustomers();
  const [totalAmount, setTotalAmount] = useState<number>(0);

  useEffect(() => {
    if (editingOrder) {
      form.setFieldsValue({
        customerId: editingOrder.customerId,
        status: editingOrder.status,
        items: editingOrder.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      setTotalAmount(editingOrder.totalAmount);
    } else {
      form.resetFields();
      setTotalAmount(0);
    }
  }, [editingOrder, form]);

  const calculateItemTotal = (productId: string, quantity: number): number => {
    const product = products.find((p) => p.id === productId);
    return (product?.price || 0) * quantity;
  };

  const updateTotalAmount = () => {
    const items = form.getFieldValue('items') || [];
    const total = items.reduce((sum: number, item: any) => {
      if (item?.productId && item?.quantity) {
        return sum + calculateItemTotal(item.productId, item.quantity);
      }
      return sum;
    }, 0);
    setTotalAmount(total);
  };

  const handleProductChange = () => {
    updateTotalAmount();
  };

  const handleQuantityChange = () => {
    updateTotalAmount();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const items = values.items.map((item: any) => ({
        ...item,
        price: products.find((p) => p.id === item.productId)?.price || 0,
      }));

      const orderData = {
        customerId: values.customerId,
        orderDate: new Date().toISOString(),
        items,
        totalAmount,
        status: values.status || 'pending',
      };

      if (editingOrder) {
        updateOrder(editingOrder.id, orderData);
        message.success('Cập nhật đơn hàng thành công');
      } else {
        addOrder(orderData);
        message.success('Thêm đơn hàng thành công');
      }

      onCancel();
      form.resetFields();
      setTotalAmount(0);
    } catch (error) {
      message.error('Vui lòng điền đầy đủ thông tin');
    }
  };

  return (
    <Modal
      title={editingOrder ? 'Sửa đơn hàng' : 'Thêm đơn hàng mới'}
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {editingOrder ? 'Cập nhật' : 'Thêm'}
        </Button>,
      ]}
      width={800}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="customerId"
          label="Khách hàng"
          rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
        >
          <Select placeholder="Chọn khách hàng">
            {customers.map((customer) => (
              <Select.Option key={customer.id} value={customer.id}>
                {customer.name} - {customer.phone}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Card title="Danh sách sản phẩm" style={{ marginBottom: 16 }}>
          <Form.List
            name="items"
            rules={[
              {
                validator: async (_, items) => {
                  if (!items || items.length === 0) {
                    return Promise.reject(new Error('Thêm ít nhất một sản phẩm'));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline" style={{ marginBottom: 8, display: 'flex' }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'productId']}
                      rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                    >
                      <Select 
                        placeholder="Chọn sản phẩm" 
                        style={{ width: 300 }}
                        onChange={handleProductChange}
                      >
                        {products.map((product) => (
                          <Select.Option key={product.id} value={product.id}>
                            {product.name} - {product.price.toLocaleString('vi-VN')}đ
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Nhập số lượng' }]}
                    >
                      <InputNumber
                        min={1}
                        placeholder="Số lượng"
                        style={{ width: 100 }}
                        onChange={handleQuantityChange}
                      />
                    </Form.Item>
                    {fields.length > 1 && (
                      <MinusCircleOutlined onClick={() => {
                        remove(name);
                        setTimeout(updateTotalAmount, 0);
                      }} />
                    )}
                    <Text type="secondary">
                      {(() => {
                        const item = form.getFieldValue(['items', name]);
                        if (item?.productId && item?.quantity) {
                          return calculateItemTotal(item.productId, item.quantity).toLocaleString('vi-VN') + 'đ';
                        }
                        return '';
                      })()}
                    </Text>
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm sản phẩm
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Text strong>Tổng tiền: </Text>
          <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
            {totalAmount.toLocaleString('vi-VN')}đ
          </Text>
        </div>

        {editingOrder && (
          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Select.Option value="pending">Chờ xác nhận</Select.Option>
              <Select.Option value="shipping">Đang giao</Select.Option>
              <Select.Option value="completed">Hoàn thành</Select.Option>
              <Select.Option value="cancelled">Đã hủy</Select.Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default OrderForm;
