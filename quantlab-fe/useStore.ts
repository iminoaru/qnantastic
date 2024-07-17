import { create } from 'zustand';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import axios from 'axios';

interface StoreState {
  session: string | null;
  userID: string | null;
  email: string | null; 
  customerID: string | null;
  isPaidUser: boolean;
  isLoading: boolean;
  fetchSessionAndUserStatus: () => Promise<void>;
}

const useStore = create<StoreState>((set) => ({
  session: null,
  userID: null,
  email: null,
  customerID: null,
  isPaidUser: false,
  isLoading: true,
  fetchSessionAndUserStatus: async () => {
    set({ isLoading: true });
    const supabase = createSupabaseBrowser();

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const userToken = sessionData.session?.access_token;
      const userID = sessionData.session?.user?.id;
      const userEmail = sessionData.session?.user?.email;

      if (!userID || !userToken || !userEmail) {
        set({ session: null, userID: null, email: null , isPaidUser: false, isLoading: false });
        return;
      }

      set({ session: userToken, userID: userID, email : userEmail });

      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/user-subscription-status`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        params: { user_id: userID },
      });

      if (res.data.status === 'active') {
        set({ isPaidUser: true, isLoading: false, customerID: res.data.customer_id });
      } 
      if (res.data.status === 'inactive') {
        set({ isPaidUser: false, isLoading: false, customerID: res.data.customer_id });
      }

      
    } catch (error) {
      console.error('An error occurred:', error);
      set({ session: null, userID: null, email: null, isPaidUser: false, isLoading: false });
    }
  },
}));

export default useStore;