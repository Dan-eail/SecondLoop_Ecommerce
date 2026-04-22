import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { productService } from '../services/productService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Home Appliances', 'Vehicles', 'Sports & Outdoors', 'Baby & Kids'];
const CONDITIONS = [{ value: 'new', label: 'New' }, { value: 'like_new', label: 'Like New' }, { value: 'good', label: 'Good' }, { value: 'fair', label: 'Fair' }, { value: 'for_parts', label: 'For Parts' }];
const CITIES = ['Addis Ababa', 'Dire Dawa', 'Hawassa', 'Bahir Dar', 'Mekelle', 'Gondar', 'Adama', 'Jimma'];

const EditListingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { data: product, isLoading } = useQuery(['product-edit', id], () => productService.getProduct(id));
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (product) reset({ title: product.title, description: product.description, price: product.price, originalPrice: product.originalPrice, category: product.category, condition: product.condition, negotiable: product.negotiable, city: product.location?.city, subcity: product.location?.subcity });
  }, [product, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => v !== undefined && fd.append(k, v));
      fd.append('location', JSON.stringify({ city: data.city, subcity: data.subcity || '' }));
      await productService.updateProduct(id, fd);
      toast.success('Listing updated!');
      navigate('/my-listings');
    } catch { toast.error('Failed to update'); }
    setLoading(false);
  };

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <>
      <Helmet><title>Edit Listing | ተና SecondLoop</title></Helmet>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Listing</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
              <input type="text" className="input-field" {...register('title', { required: true, minLength: 10, maxLength: 100 })} />
              {errors.title && <p className="text-red-500 text-xs mt-1">Title required (10-100 chars)</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea rows={5} className="input-field resize-none" {...register('description', { required: true, minLength: 50 })} />
              {errors.description && <p className="text-red-500 text-xs mt-1">Description required (min 50 chars)</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select className="input-field" {...register('category', { required: true })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Condition</label>
                <select className="input-field" {...register('condition', { required: true })}>
                  {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (ETB)</label>
                <input type="number" className="input-field" {...register('price', { required: true, min: 1 })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <select className="input-field" {...register('city', { required: true })}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
            {loading ? 'Saving…' : '💾 Save Changes'}
          </button>
        </form>
      </div>
    </>
  );
};
export default EditListingPage;
