'use client';

import React, { useEffect, useState } from 'react';
import { getCreatorByAddress, getCreatorTips, Creator, Tip } from '../../../lib/flow/scripts';
import CreatorProfile from '@/components/creator/creator-profile';
import { useRouter } from 'next/navigation';

export default function CreatorProfilePage({ params }: { params: { id: string } }) {

  const router = useRouter();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchCreatorData() {
      try {
        setIsLoading(true);
        const creatorData = await getCreatorByAddress(params.id);
        
        if (!creatorData) {
          setError('Creator not found');
          return;
        }
        
        setCreator(creatorData);

        console.log("Creator", creatorData)
        
        const tipsData = await getCreatorTips(params.id);
        setTips(tipsData);
      } catch (error) {
        console.error("Error fetching creator data:", error);
        setError('Failed to load creator profile');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (params.id) {
      fetchCreatorData();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading creator profile...</p>
      </div>
    );
  }
  
  if (error || !creator) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{error || 'Creator not found'}</p>
        <button 
          onClick={() => router.push('/creators')}
          className="mt-4 text-purple-600 hover:text-purple-800"
        >
          Back to Discover
        </button>
      </div>
    );
  }

  return <CreatorProfile creator={creator} tips={tips} />;
}