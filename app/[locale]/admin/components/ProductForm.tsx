'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/app/store/types';
import Button from '@/app/components/ui/Button/Button';

interface ProductFormProps {
  product: Partial<Product>;
  onSubmit: (productData: Partial<Product>) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: product.name || '',
    description: product.description || '',
    price: product.price || 0,
    images: product.images || [],
    stock: product.stock ?? 0,
    isActive: product.isActive ?? true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      images: product.images || [],
      stock: product.stock ?? 0,
      isActive: product.isActive ?? true,
    });
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      isActive: e.target.checked,
    }));
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const imageArray = value
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url); // Remove empty strings
    setFormData((prev) => ({
      ...prev,
      images: imageArray,
    }));
    setErrors((prev) => ({ ...prev, images: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.images?.length) newErrors.images = 'At least one image URL is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      images: product.images || [],
      stock: product.stock ?? 0,
      isActive: product.isActive ?? true,
    });
    setErrors({});
    onCancel();
  };


  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label htmlFor="product-name" className="block text-sm font-medium leading-6 text-gray-900">
              Product Name
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="name"
                id="product-name"
                value={formData.name || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Enter product name"
                required
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
              Description
            </label>
            <div className="mt-2">
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Enter product description"
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">
              Price
            </label>
            <div className="mt-2">
              <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600">
                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">$</span>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={formData.price || ''}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="0.00"
                  required
                />
              </div>
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="stock" className="block text-sm font-medium leading-6 text-gray-900">
              Stock Quantity
            </label>
            <div className="mt-2">
              <input
                type="number"
                name="stock"
                id="stock"
                value={formData.stock || ''}
                onChange={handleChange}
                min="0"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="0"
              />
              {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="images" className="block text-sm font-medium leading-6 text-gray-900">
              Images
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="images"
                id="images"
                value={Array.isArray(formData.images) ? formData.images.join(', ') : ''}
                onChange={handleImagesChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Enter comma-separated image URLs (e.g., image1.jpg, image2.jpg)"
                required
              />
              {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
              <p className="mt-1 text-sm text-gray-500">
                Add multiple image URLs separated by commas
              </p>
            </div>
          </div>

          <div className="sm:col-span-6">
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive ?? true}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  aria-describedby="isActive-description"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="isActive" className="font-medium text-gray-900">
                  Active Product
                </label>
                <p id="isActive-description" className="text-gray-500">
                  Check if the product should be visible to customers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-x-4 border-t border-gray-200 pt-6 mt-6">
        <Button
          type="button"
          onClick={handleCancel}
          variant="ghost"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          {product.id ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;