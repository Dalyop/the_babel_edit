export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      imageUrl: string;
    };
  }[];
}

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: { id: string; name: string; imageUrl: string };
  onSubmit: (reviewData: { rating: number; comment: string }) => Promise<void>;
}
