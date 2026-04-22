import { useQuery, useMutation, useQueryClient } from 'react-query';
import { orderService } from '../services/orderService';
import toast from 'react-hot-toast';

export const useOrders = (params = {}) => {
  return useQuery(['orders', params], () => orderService.getUserOrders(params));
};

export const useOrder = (id) => {
  return useQuery(['order', id], () => orderService.getOrderById(id), { enabled: !!id });
};

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation(orderService.createOrder, {
    onSuccess: () => { qc.invalidateQueries('orders'); toast.success('Order placed!'); },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Order failed'),
  });
};
