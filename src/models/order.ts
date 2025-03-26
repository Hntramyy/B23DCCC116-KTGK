import { useState } from 'react';

export type OrderStatus = 'pending' | 'shipping' | 'completed' | 'cancelled';

export interface IProduct {
  id: string;
  name: string;
  price: number;
}

export interface ICustomer {
  id: string;
  name: string;
  phone: string;
}

export interface IOrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface IOrder {
  id: string;
  customerId: string;
  orderDate: string;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
}

// Mock data
const mockProducts: IProduct[] = [
  { id: 'P1', name: 'Laptop Gaming Asus', price: 25000000 },
  { id: 'P2', name: 'iPhone 15 Pro Max', price: 34990000 },
  { id: 'P3', name: 'Tai nghe Sony WH-1000XM4', price: 8490000 },
  { id: 'P4', name: 'iPad Air 5', price: 15990000 },
  { id: 'P5', name: 'Apple Watch Series 9', price: 10990000 },
  { id: 'P6', name: 'Samsung Galaxy S24 Ultra', price: 31990000 },
];

const mockCustomers: ICustomer[] = [
  { id: 'C1', name: 'Nguyễn Văn An', phone: '0901234567' },
  { id: 'C2', name: 'Trần Thị Bình', phone: '0901234568' },
  { id: 'C3', name: 'Lê Văn Cường', phone: '0901234569' },
  { id: 'C4', name: 'Phạm Thị Dung', phone: '0901234570' },
  { id: 'C5', name: 'Hoàng Văn Em', phone: '0901234571' },
];

const mockOrders: IOrder[] = [
  {
    id: 'ORD001',
    customerId: 'C1',
    orderDate: '2025-03-26T07:00:00.000Z',
    items: [
      { productId: 'P1', quantity: 1, price: 25000000 },
      { productId: 'P3', quantity: 1, price: 8490000 },
    ],
    totalAmount: 33490000,
    status: 'pending',
  },
  {
    id: 'ORD002',
    customerId: 'C2',
    orderDate: '2025-03-25T15:30:00.000Z',
    items: [
      { productId: 'P2', quantity: 1, price: 34990000 },
      { productId: 'P5', quantity: 1, price: 10990000 },
    ],
    totalAmount: 45980000,
    status: 'shipping',
  },
  {
    id: 'ORD003',
    customerId: 'C3',
    orderDate: '2025-03-24T09:15:00.000Z',
    items: [
      { productId: 'P4', quantity: 1, price: 15990000 },
    ],
    totalAmount: 15990000,
    status: 'completed',
  },
  {
    id: 'ORD004',
    customerId: 'C4',
    orderDate: '2025-03-23T14:20:00.000Z',
    items: [
      { productId: 'P6', quantity: 1, price: 31990000 },
      { productId: 'P3', quantity: 2, price: 8490000 },
    ],
    totalAmount: 48970000,
    status: 'cancelled',
  },
  {
    id: 'ORD005',
    customerId: 'C5',
    orderDate: '2025-03-26T06:45:00.000Z',
    items: [
      { productId: 'P2', quantity: 1, price: 34990000 },
    ],
    totalAmount: 34990000,
    status: 'pending',
  },
];

export default () => {
  const [orders, setOrders] = useState<IOrder[]>(() => {
    const savedOrders = localStorage.getItem('orders');
    return savedOrders ? JSON.parse(savedOrders) : mockOrders;
  });

  const addOrder = (order: Omit<IOrder, 'id'>) => {
    const newOrder = {
      ...order,
      id: `ORD${Date.now()}`,
    };
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const updateOrder = (orderId: string, updatedOrder: Partial<IOrder>) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, ...updatedOrder } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const cancelOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order && order.status === 'pending') {
      updateOrder(orderId, { status: 'cancelled' });
      return true;
    }
    return false;
  };

  const getProducts = () => mockProducts;
  const getCustomers = () => mockCustomers;

  return {
    orders,
    addOrder,
    updateOrder,
    cancelOrder,
    getProducts,
    getCustomers,
  };
};
