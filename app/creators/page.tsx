'use client';

import React, { useEffect, useState } from 'react';
import { getCreators, Creator } from '../../lib/flow/scripts';
import CreatorCard from "@/components/creator/creator-card";
import { Input } from '../../components/ui/input';

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
    async function fetchCreators() {
      try {
        const data = await getCreators();
        setCreators(data);
      } catch (error) {
        console.error("Error fetching creators:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCreators();
  }, []);
  
  const filteredCreators = creators.filter(creator => 
    creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    creator.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Discover Creators</h1>
        <p className="text-xl text-gray-600">
          Find and support content creators who inspire you
        </p>
      </div>
      
      <div className="mb-8">
        <Input
          placeholder="Search creators..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md mx-auto"
        />
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading creators...</p>
        </div>
      ) : filteredCreators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No creators found</p>
          {searchTerm && (
            <p className="text-gray-500 mt-2">
              Try different search terms or check back later
            </p>
          )}
        </div>
      )}
    </div>
  );
}