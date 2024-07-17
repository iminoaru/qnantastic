"use client";

import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import UserProfile from '@/components/supaauth/user-profile';
import { BGbeams } from '@/components/BGbeams';
import { WobbleCards } from '@/components/WobbleCards';
import { InfiniteCards } from '@/components/InfiniteCards';
import Footer from '@/components/Footer';
import Price from '@/components/subscription/Price';

export default function Home() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    
    async function getSession() {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error);
      } else {
        setSession(data.session);
      }
      setLoading(false);
    }

    getSession();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      {session ? <UserProfile /> : <div>Please log in</div>}
      <BGbeams />
      <Price />
      <WobbleCards />
      <InfiniteCards />
      <Footer />
    </main>
  );
}