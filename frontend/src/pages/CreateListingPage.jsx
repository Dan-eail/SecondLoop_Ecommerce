import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { productService } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiDollarSign } from 'react-icons/fi';

const CATEGORIES = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Home Appliances', 'Vehicles', 'Sports & Outdoors', 'Baby & Kids'];
const CONDITIONS = [{ value: 'new', label: 'New' }, { value: 'like_new', label: 'Like New' }, { value: 'good', label: 'Good' }, { value: 'fair', label: 'Fair' }, { value: 'for_parts', label: 'For Parts' }];
const CITIES = ['Addis Ababa', 'Dire Dawa', 'Hawassa', 'Bahir Dar', 'Mekelle', 'Gondar', 'Adama', 'Jimma'];

const CreateListingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 8) { toast.error('Max 8 images'); return; }
    setImages(prev => [...prev, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const onSubmit = async (data) => {
    if (!images.length) { toast.error('Please add at least 1 image'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => formData.append(k, v));
      formData.append('location', JSON.stringify({ city: data.city, subcity: data.subcity || '' }));
      images.forEach(img => formData.append('images', img));
      const result = await productService.createProduct(formData);
      toast.success('Listing created!');
      navigate(`/products/${result.productId}`);
    } catch (e) { toast.error(e.response?.data?.error?.message || 'Failed to create listing'); }
    setLoading(false);
  };

  return (
    <>
      <Helmet><title>Create Listing | ተና SecondLoop</title></Helmet>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
          <p className="text-gray-500 mt-1">Fill in the details to list your item for sale</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Images */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="font-bold mb-4">📷 Photos <span className="text-sm text-gray-400 font-normal">(1–8 images)</span></h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {previews.map((src, i) => (
                <div key={i} className="relative w-24 h-24">
                  <img src={src} alt="" className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-red-600">
                    <FiX size={12} />
                  </button>
                  {i === 0 && <span className="absolute bottom-1 left-1 bg-primary-orange text-white text-xs px-1 rounded">Main</span>}
                </div>
              ))}
              {images.length < 8 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-orange hover:bg-orange-50 transition">
                  <FiUpload className="text-gray-400" size={20} />
                  <span className="text-xs text-gray-400 mt-1">Add</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImages} />
                </label>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
            <h2 className="font-bold mb-2">📝 Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-gray-400">(10–100 chars)</span></label>
              <input type="text" placeholder="e.g. Samsung Galaxy S21 Used Good Condition" className={`input-field ${errors.title ? 'border-red-400' : ''}`}
                {...register('title', { required: 'Title required', minLength: { value: 10, message: 'Min 10 characters' }, maxLength: { value: 100, message: 'Max 100 characters' } })} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-gray-400">(50–2000 chars)</span></label>
              <textarea rows={5} placeholder="Describe your item in detail…" className={`input-field resize-none ${errors.description ? 'border-red-400' : ''}`}
                {...register('description', { required: 'Description required', minLength: { value: 50, message: 'Min 50 characters' }, maxLength: { value: 2000, message: 'Max 2000 characters' } })} />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select className={`input-field ${errors.category ? 'border-red-400' : ''}`} {...register('category', { required: 'Category required' })}>
                  <option value="">Select…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Condition</label>
                <select className={`input-field ${errors.condition ? 'border-red-400' : ''}`} {...register('condition', { required: 'Condition required' })}>
                  <option value="">Select…</option>
                  {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition.message}</p>}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
            <h2 className="font-bold mb-2">💰 Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (ETB)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">ETB</span>
                  <input type="number" placeholder="0" className={`input-field pl-12 ${errors.price ? 'border-red-400' : ''}`}
                    {...register('price', { required: 'Price required', min: { value: 1, message: 'Min 1 ETB' }, max: { value: 1000000, message: 'Max 1,000,000 ETB' } })} />
                </div>
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Original Price (optional)</label>
                <input type="number" placeholder="0" className="input-field" {...register('originalPrice')} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary-orange" {...register('negotiable')} />
              <span className="text-sm text-gray-600">Price is negotiable</span>
            </label>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
            <h2 className="font-bold mb-2">📍 Location</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <select className={`input-field ${errors.city ? 'border-red-400' : ''}`} defaultValue={user?.location?.city || ''}
                  {...register('city', { required: 'City required' })}>
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subcity / Area</label>
                <input type="text" placeholder="e.g. Bole, Kazanchis" className="input-field" {...register('subcity')} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Publishing…
              </span>
            ) : '🚀 Publish Listing'}
          </button>
        </form>
      </div>
    </>
  );
};
export default CreateListingPage;
