'use client';

import Image from 'next/image';
import { Product } from '@/types';
import { useGuestStore } from '@/store/guestStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useGuestStore((state) => state.addToCart);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url || undefined,
    });
    toast.success(`${product.name} added to cart!`);
  };

  if (!product.is_available) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 opacity-60">
        <div className="relative h-40 bg-gray-200 rounded-md mb-3">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover rounded-md"
            />
          )}
        </div>
        <h3 className="font-semibold text-gray-500">{product.name}</h3>
        <p className="text-gray-400">${product.price.toFixed(2)}</p>
        <span className="text-xs text-red-500">Unavailable</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="relative h-40 bg-amber-100 rounded-md mb-3 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-amber-600">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 21h18v-2H2v2zm2-4h14V9H4v8zm2-6v2h10V7H6z" />
            </svg>
          </div>
        )}
      </div>

      <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
      <p className="text-sm text-gray-500 mb-2">{product.category}</p>

      <div className="flex items-center justify-between mt-3">
        <span className="text-lg font-bold text-amber-700">
          ${product.price.toFixed(2)}
        </span>
        <button
          onClick={handleAddToCart}
          className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}
