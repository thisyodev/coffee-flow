import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';

interface GuestStore {
    sessionId: string | null;
    cart: CartItem[];
    initSession: () => void;
    addToCart: (item: CartItem) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getCartCount: () => number;
}

export const useGuestStore = create<GuestStore>()(
    persist(
        (set, get) => ({
            sessionId: null,
            cart: [],

            initSession: () => {
                const existingSession = localStorage.getItem('guestSessionId');
                if (existingSession) {
                    set({ sessionId: existingSession });
                } else {
                    const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                    localStorage.setItem('guestSessionId', sessionId);
                    set({ sessionId });
                }
            },

            addToCart: (item) => {
                set((state) => {
                    const existingItem = state.cart.find((i) => i.productId === item.productId);

                    if (existingItem) {
                        return {
                            cart: state.cart.map((i) =>
                                i.productId === item.productId
                                    ? { ...i, quantity: i.quantity + item.quantity }
                                    : i
                            ),
                        };
                    }

                    return { cart: [...state.cart, item] };
                });
            },

            removeFromCart: (productId) => {
                set((state) => ({
                    cart: state.cart.filter((item) => item.productId !== productId),
                }));
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeFromCart(productId);
                    return;
                }

                set((state) => ({
                    cart: state.cart.map((item) =>
                        item.productId === productId ? { ...item, quantity } : item
                    ),
                }));
            },

            clearCart: () => {
                set({ cart: [] });
            },

            getCartTotal: () => {
                return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            },

            getCartCount: () => {
                return get().cart.reduce((sum, item) => sum + item.quantity, 0);
            },
        }),
        {
            name: 'coffee-flow-cart',
            partialize: (state) => ({ cart: state.cart, sessionId: state.sessionId }),
        }
    )
);
