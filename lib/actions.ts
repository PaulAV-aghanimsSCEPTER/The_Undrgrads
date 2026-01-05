// lib/actions.ts
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
}

interface CartItem {
  id: number;
  name: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
}

export async function placeOrder(customerDetails: CustomerDetails, cartItems: CartItem[]) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // 1. Create order records from cart items
  const orderData = cartItems.map((item: CartItem) => ({
    name: customerDetails.name,
    phone: customerDetails.phone,
    address: customerDetails.address,
    design: item.name,
    color: item.color, // Assuming color is selected
    size: item.size,   // Assuming size is selected
    price: item.price,
    quantity: item.quantity,
    payment_status: 'pending',
  }));

  const { data, error } = await supabase.from('orders').insert(orderData).select();

  if (error) {
    console.error('Supabase order insert error:', error);
    return { success: false, error: 'Failed to place order.' };
  }

  // 2. Log the activity
  try {
    await supabase.from('activity_logs').insert({
      activity_type: 'NEW_ORDER',
      details: { customerName: customerDetails.name, itemCount: cartItems.length, orderIds: data.map(d => d.id) },
    });
  } catch (logError) {
    console.error('Failed to log new order activity:', logError);
    // Don't fail the whole transaction if logging fails, but log it.
  }
  
  // 3. Revalidate paths if needed (though real-time should handle the dashboard)
  revalidatePath('/dashboard');

  return { success: true, orderIds: data.map(d => d.id) };
}
