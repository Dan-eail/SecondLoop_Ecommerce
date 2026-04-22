import { useQuery } from 'react-query';
import { productService } from '../services/productService';

export const useProducts = (params = {}) => {
  return useQuery(['products', params], () => productService.getProducts(params), { keepPreviousData: true });
};

export const useProduct = (id) => {
  return useQuery(['product', id], () => productService.getProductById(id), { enabled: !!id });
};
