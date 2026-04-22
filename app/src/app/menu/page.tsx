'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { useGuestStore } from '@/store/guestStore';
import { useUser } from '@/hooks/useUser';
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';
import toast from 'react-hot-toast';

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const initSession = useGuestStore((state) => state.initSession);
  const cartCount = useGuestStore((state) => state.getCartCount);
  const { user, loading: userLoading, logout, membership } = useUser();

  useEffect(() => {
    initSession();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        // Use mock data if Supabase not configured
        setProducts(getMockProducts());
      } else if (data) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setProducts(getMockProducts());
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(products.map((p) => p.category))];
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-amber-700 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold shrink-0">☕ Coffee Flow</h1>

          <div className="flex items-center gap-3">
            {/* User profile / login */}
            {!userLoading && (
              user ? (
                <div className="flex items-center gap-2">
                  {/* Tier badge */}
                  {membership?.tier && (
                    <span
                      className="hidden sm:inline-block text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: membership.tier.badge_color, color: '#fff' }}
                    >
                      {membership.tier.name}
                    </span>
                  )}
                  {/* Points */}
                  {membership && (
                    <span className="hidden sm:inline-block text-xs text-amber-200">
                      {membership.current_points} pts
                    </span>
                  )}
                  {/* Avatar + name */}
                  <div className="flex items-center gap-2 bg-amber-600 rounded-lg px-3 py-1.5">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.name || 'User'}
                        width={28}
                        height={28}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-sm font-bold">
                        {user.name?.[0] ?? '?'}
                      </div>
                    )}
                    <span className="text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                  </div>
                  <a href="/loyalty" className="text-xs text-amber-200 hover:text-white transition-colors">Loyalty</a>
                  <button onClick={logout} className="text-xs text-amber-200 hover:text-white transition-colors">
                    Logout
                  </button>
                </div>
              ) : (
                <a
                  href="/login"
                  className="text-sm bg-amber-600 hover:bg-amber-500 px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  Login with LINE
                </a>
              )
            )}

            {/* Cart icon */}
            <a href="/checkout" className="relative p-2 hover:bg-amber-600 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount()}
                </span>
              )}
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Products Section */}
          <div className="flex-1">
            {/* Category Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg h-48 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                No products found in this category
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:w-80">
            <div className="lg:sticky lg:top-24">
              <Cart />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Mock products for development without Supabase
function getMockProducts(): Product[] {
  return [
    { id: '1', name: 'Espresso', price: 3.50, category: 'Espresso', image_url: null, description: 'Rich and bold', is_available: true, created_at: '' },
    { id: '2', name: 'Double Espresso', price: 4.50, category: 'Espresso', image_url: null, description: 'Two shots', is_available: true, created_at: '' },
    { id: '3', name: 'Americano', price: 4.00, category: 'Espresso', image_url: null, description: 'Espresso with water', is_available: true, created_at: '' },
    { id: '4', name: 'Latte', price: 5.00, category: 'Espresso', image_url: null, description: 'Espresso with milk', is_available: true, created_at: '' },
    { id: '5', name: 'Cappuccino', price: 5.00, category: 'Espresso', image_url: null, description: 'Foamy delight', is_available: true, created_at: '' },
    { id: '6', name: 'Mocha', price: 5.50, category: 'Espresso', image_url: null, description: 'Chocolate espresso', is_available: true, created_at: '' },
    { id: '7', name: 'Iced Latte', price: 5.50, category: 'Cold', image_url: null, description: 'Chilled espresso', is_available: true, created_at: '' },
    { id: '8', name: 'Cold Brew', price: 5.00, category: 'Cold', image_url: null, description: 'Smooth & cold', is_available: true, created_at: '' },
    { id: '9', name: 'Matcha Latte', price: 5.50, category: 'Specialty', image_url: null, description: 'Japanese matcha', is_available: true, created_at: '' },
    { id: '10', name: 'Chai Latte', price: 5.00, category: 'Specialty', image_url: null, description: 'Spiced tea', is_available: true, created_at: '' },
    { id: '11', name: 'Croissant', price: 3.50, category: 'Food', image_url: null, description: 'Buttery pastry', is_available: true, created_at: '' },
    { id: '12', name: 'Blueberry Muffin', price: 3.50, category: 'Food', image_url: null, description: 'Fresh baked', is_available: true, created_at: '' },
  ];
}
