// Product types
export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image_url: string | null;
    description: string | null;
    is_available: boolean;
    created_at: string;
}

// Cart item
export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
}

// Order types
export interface Order {
    id: string;
    user_id: string | null;
    session_id: string | null;
    customer_name: string | null;
    customer_email: string | null;
    status: 'pending' | 'preparing' | 'ready' | 'picked_up' | 'cancelled';
    total: number;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: number;
    product?: Product;
}

// User types
export interface User {
    id: string;
    email: string | null;
    name: string | null;
    avatar_url: string | null;
    line_user_id: string | null;
    created_at: string;
}

// Membership types
export interface MembershipTier {
    id: string;
    name: string;
    points_required: number;
    badge_color: string;
    benefits: string[];
}

export interface UserMembership {
    id: string;
    user_id: string;
    tier_id: string;
    current_points: number;
    total_points_earned: number;
    created_at: string;
    updated_at: string;
    tier?: MembershipTier;
}

// Guest session
export interface GuestSession {
    session_id: string;
    created_at: string;
}
