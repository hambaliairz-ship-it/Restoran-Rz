"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from "sonner";
import { useLanguage } from "@/components/providers/language-provider";

export type CartItem = {
  id: string; // This can be unique per item in cart (e.g. menuItemId + options)
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  notes?: string;
};

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity' | 'id'>) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { t } = useLanguage();

  // Hydrate from local storage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedItems = JSON.parse(savedCart);
        // Validate if items have valid UUIDs (simple check) to prevent old mock data errors
        const isValid = Array.isArray(parsedItems) && parsedItems.every(item => 
          item.menuItemId && item.menuItemId.length > 10 // UUIDs are long, "m1" is short
        );
        
        if (isValid) {
            setItems(parsedItems);
        } else {
            console.warn("Clearing invalid legacy cart data");
            localStorage.removeItem('cart');
            setItems([]);
        }
      } catch (e) {
        console.error("Failed to parse cart", e);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: Omit<CartItem, 'quantity' | 'id'>) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.menuItemId === newItem.menuItemId);
      if (existing) {
        return prev.map((item) =>
          item.menuItemId === newItem.menuItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...newItem, quantity: 1, id: newItem.menuItemId }];
    });
    
    // Show toast outside of setState to avoid double triggers
    // We can infer if it was an addition or new item, but for simplicity generic success
    toast.success(`${newItem.name} ${t('addedToCart')}`);
  };

  const removeItem = (menuItemId: string) => {
    setItems((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
    toast.info(t('itemRemoved'));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    // Removed toast to prevent double notification on checkout
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
