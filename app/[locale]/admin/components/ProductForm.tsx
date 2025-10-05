'use client';

import React, { useState, useEffect } from 'react';
import { Product, Collection } from '@/app/store/types';
import Button from '@/app/components/ui/Button/Button';
import { apiRequest, API_ENDPOINTS } from '@/app/lib/api';
import { toast } from 'react-hot-toast';

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
    comparePrice: product.comparePrice || 0,
    collectionId: product.collectionId || '',
    images: product.images || [],
    stock: product.stock ?? 0,
    sizes: product.sizes || [],
    colors: product.colors || [],
    tags: product.tags || [],
    weight: product.weight || 0,
    dimensions: product.dimensions || '',
    isActive: product.isActive ?? true,
    isFeatured: product.isFeatured ?? false,
  });

  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      comparePrice: product.comparePrice || 0,
      collectionId: product.collectionId || '',
      images: product.images || [],
      stock: product.stock ?? 0,
      sizes: product.sizes || [],
      colors: product.colors || [],
      tags: product.tags || [],
      weight: product.weight || 0,
      dimensions: product.dimensions || '',
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
    });
  }, [product]);

  const fetchCollections = async () => {
    setCollectionsLoading(true);
    try {
      const response = await apiRequest<{ collections: Collection[] }>(
        API_ENDPOINTS.COLLECTIONS.LIST,
        { requireAuth: false }
      );
      // Sort collections by sortOrder, then by name
      const sortedCollections = response.collections
        .filter(collection => collection.isActive)
        .sort((a, b) => {
          const orderA = a.sortOrder ?? 0; // default to 0 if undefined/null
          const orderB = b.sortOrder ?? 0;

          if (orderA !== orderB) {
            return orderA - orderB;
          }
          return a.name.localeCompare(b.name);
        });
      setCollections(sortedCollections);
    } catch (error) {
      toast.error('Failed to fetch collections');
      console.error('Error fetching collections:', error);
    } finally {
      setCollectionsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['price', 'comparePrice', 'weight'].includes(name)
        ? parseFloat(value) || 0
        : ['stock'].includes(name)
          ? parseInt(value) || 0
          : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'images' | 'sizes' | 'colors' | 'tags') => {
    const value = e.target.value;
    const arrayValue = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item); // Remove empty strings
    setFormData((prev) => ({
      ...prev,
      [field]: arrayValue,
    }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.collectionId) newErrors.collectionId = 'Please select a collection';
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
      comparePrice: product.comparePrice || 0,
      collectionId: product.collectionId || '',
      images: product.images || [],
      stock: product.stock ?? 0,
      sizes: product.sizes || [],
      colors: product.colors || [],
      tags: product.tags || [],
      weight: product.weight || 0,
      dimensions: product.dimensions || '',
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
    });
    setErrors({});
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
          {/* Product Name */}
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

          {/* Collection Dropdown */}
          <div className="sm:col-span-2">
            <label htmlFor="collection" className="block text-sm font-medium leading-6 text-gray-900">
              Collection
            </label>
            <div className="mt-2">
              <select
                name="collectionId"
                id="collection"
                value={formData.collectionId || ''}
                onChange={handleChange}
                disabled={collectionsLoading}
                className="block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                required
              >
                <option value="">
                  {collectionsLoading ? 'Loading collections...' : 'Select a collection'}
                </option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
              {errors.collectionId && (
                <p className="mt-1 text-sm text-red-600">{errors.collectionId}</p>
              )}
            </div>
          </div>

          {/* Description */}
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
                className="block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Enter product description"
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Price and Compare Price */}
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
            <label htmlFor="comparePrice" className="block text-sm font-medium leading-6 text-gray-900">
              Compare Price (Optional)
            </label>
            <div className="mt-2">
              <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600">
                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">$</span>
                <input
                  type="number"
                  name="comparePrice"
                  id="comparePrice"
                  value={formData.comparePrice || ''}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  placeholder="0.00"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Original price for discount display
              </p>
            </div>
          </div>

          {/* Stock */}
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
                className="block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="0"
              />
            </div>
          </div>

          {/* Images */}
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
                onChange={(e) => handleArrayChange(e, 'images')}
                className="block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Enter comma-separated image URLs"
                required
              />
              {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
              <p className="mt-1 text-sm text-gray-500">
                Add multiple image URLs separated by commas
              </p>
            </div>
          </div>

          {/* Sizes */}
          <div className="sm:col-span-3">
            <label htmlFor="sizes" className="block text-sm font-medium leading-6 text-gray-900">
              Available Sizes
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="sizes"
                id="sizes"
                value={Array.isArray(formData.sizes) ? formData.sizes.join(', ') : ''}
                onChange={(e) => handleArrayChange(e, 'sizes')}
                className="block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="e.g., XS, S, M, L, XL"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter sizes separated by commas
              </p>
            </div>
          </div>

          {/* Colors */}
          <div className="sm:col-span-3">
            <label htmlFor="colors" className="block text-sm font-medium leading-6 text-gray-900">
              Available Colors
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="colors"
                id="colors"
                value={Array.isArray(formData.colors) ? formData.colors.join(', ') : ''}
                onChange={(e) => handleArrayChange(e, 'colors')}
                className="block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="e.g., Red, Blue, Black, White"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter colors separated by commas
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="sm:col-span-4">
            <label htmlFor="tags" className="block text-sm font-medium leading-6 text-gray-900">
              Product Tags
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="tags"
                id="tags"
                value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
                onChange={(e) => handleArrayChange(e, 'tags')}
                className="block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="e.g., summer, casual, trending"
              />
              <p className="mt-1 text-sm text-gray-500">
                Tags help customers find your product
              </p>
            </div>
          </div>

          {/* Weight */}
          <div className="sm:col-span-1">
            <label htmlFor="weight" className="block text-sm font-medium leading-6 text-gray-900">
              Weight (lbs)
            </label>
            <div className="mt-2">
              <input
                type="number"
                name="weight"
                id="weight"
                value={formData.weight || ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="0.0"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="sm:col-span-1">
            <label htmlFor="dimensions" className="block text-sm font-medium leading-6 text-gray-900">
              Dimensions
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="dimensions"
                id="dimensions"
                value={formData.dimensions || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="L×W×H"
              />
            </div>
          </div>

          {/* Status Checkboxes */}
          <div className="sm:col-span-6 space-y-3">
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive ?? true}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="isActive" className="font-medium text-gray-900">
                  Active Product
                </label>
                <p className="text-gray-500">
                  Product is visible to customers and available for purchase
                </p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured ?? false}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="isFeatured" className="font-medium text-gray-900">
                  Featured Product
                </label>
                <p className="text-gray-500">
                  Display this product in featured sections and homepage
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
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