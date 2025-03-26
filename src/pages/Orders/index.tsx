import { PageContainer } from '@ant-design/pro-layout';
import { useModel } from 'umi';
import { Button, Card, Input, Select, Space, Table, message, Modal } from 'antd';
import { useState } from 'react';
import type { IOrder, OrderStatus } from '@/models/order';
import OrderForm from './components/OrderForm';
import { SearchOutlined, PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import styles from './index.less';

const { Search } = Input;
const { confirm } = Modal;

const OrderList: React.FC = () => {
  const { orders, cancelOrder, getCustomers } = useModel('order');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<IOrder | null>(null);
  const customers = getCustomers();

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleStatusFilter = (value: OrderStatus | 'all') => {
    setStatusFilter(value);
  };

  const showCancelConfirm = (orderId: string, customerName: string) => {
    confirm({
      title: 'Xác nhận hủy đơn hàng',
      icon: <ExclamationCircleFilled />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn hủy đơn hàng này?</p>
          <p><strong>Mã đơn:</strong> {orderId}</p>
          <p><strong>Khách hàng:</strong> {customerName}</p>
          <p style={{ color: '#ff4d4f' }}>Lưu ý: Hành động này không thể hoàn tác!</p>
        </div>
      ),
      okText: 'Hủy đơn hàng',
      okType: 'danger',
      cancelText: 'Không',
      onOk() {
        const success = cancelOrder(orderId);
        if (success) {
          message.success('Đơn hàng đã được hủy thành công');
        } else {
          message.error('Không thể hủy đơn hàng này');
        }
      },
    });
  };

  const filteredOrders = orders.filter((order) => {
    const customer = customers.find((c) => c.id === order.customerId);
    const matchesSearch =
      order.id.toLowerCase().includes(searchText.toLowerCase()) ||
      customer?.name.toLowerCase().includes(searchText.toLowerCase()) ||
      '';
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      sorter: (a: IOrder, b: IOrder) => a.id.localeCompare(b.id),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerId',
      key: 'customerId',
      render: (customerId: string) => {
        const customer = customers.find((c) => c.id === customerId);
        return customer?.name || 'N/A';
      },
    },
    {
      title: 'Ngày đặt hàng',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
      sorter: (a: IOrder, b: IOrder) =>
        new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime(),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => amount.toLocaleString('vi-VN') + ' đ',
      sorter: (a: IOrder, b: IOrder) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => {
        const statusMap = {
          pending: { text: 'Chờ xác nhận', color: '#faad14' },
          shipping: { text: 'Đang giao', color: '#1890ff' },
          completed: { text: 'Hoàn thành', color: '#52c41a' },
          cancelled: { text: 'Đã hủy', color: '#ff4d4f' },
        };
        return (
          <span style={{ color: statusMap[status].color }}>
            {statusMap[status].text}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: IOrder) => {
        const customer = customers.find((c) => c.id === record.customerId);
        return (
          <Space>
            <Button
              type="primary"
              onClick={() => {
                setEditingOrder(record);
                setIsModalVisible(true);
              }}
            >
              Sửa
            </Button>
            {record.status === 'pending' && (
              <Button 
                danger 
                onClick={() => showCancelConfirm(record.id, customer?.name || 'N/A')}
              >
                Hủy
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <Card>
        <div className={styles.toolbar}>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingOrder(null);
                setIsModalVisible(true);
              }}
            >
              Thêm đơn hàng
            </Button>
            <Search
              placeholder="Tìm theo mã đơn hoặc tên khách hàng"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Select
              defaultValue="all"
              style={{ width: 150 }}
              onChange={handleStatusFilter}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="pending">Chờ xác nhận</Select.Option>
              <Select.Option value="shipping">Đang giao</Select.Option>
              <Select.Option value="completed">Hoàn thành</Select.Option>
              <Select.Option value="cancelled">Đã hủy</Select.Option>
            </Select>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <OrderForm
          visible={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingOrder(null);
          }}
          editingOrder={editingOrder}
        />
      </Card>
    </PageContainer>
  );
};

export default OrderList;
