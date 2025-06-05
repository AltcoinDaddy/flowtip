// Creator Registration Zod Schema (Profile Picture Only)
// /lib/schemas/creator.ts

import { z } from 'zod';

// URL validation regex
const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// Social handle validation (without @ symbol)
const socialHandleRegex = /^[a-zA-Z0-9._-]+$/;

// Creator registration schema (no banner)
export const CreatorRegistrationSchema = z.object({
  // Required fields
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s._-]+$/, 'Name can only contain letters, numbers, spaces, dots, dashes, and underscores'),
  
  // Optional bio
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  
  // Profile picture URL (Cloudinary URL)
  avatar_url: z
    .string()
    .url('Please provide a valid avatar URL')
    .optional()
    .or(z.literal('')),
  
  // Website URL
  website_url: z
    .string()
    .regex(urlRegex, 'Please provide a valid website URL')
    .optional()
    .or(z.literal('')),
  
  // Social media handles (without @ symbol)
  twitter_handle: z
    .string()
    .regex(socialHandleRegex, 'Twitter handle can only contain letters, numbers, dots, dashes, and underscores')
    .max(15, 'Twitter handle must be less than 15 characters')
    .optional()
    .or(z.literal('')),
    
  instagram_handle: z
    .string()
    .regex(socialHandleRegex, 'Instagram handle can only contain letters, numbers, dots, dashes, and underscores')
    .max(30, 'Instagram handle must be less than 30 characters')
    .optional()
    .or(z.literal('')),
  
  // YouTube URL
  youtube_url: z
    .string()
    .regex(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/, 'Please provide a valid YouTube URL')
    .optional()
    .or(z.literal('')),
});

// Type inference from schema
export type CreatorRegistrationData = z.infer<typeof CreatorRegistrationSchema>;

// Validation helper function
export const validateCreatorData = (data: unknown) => {
  return CreatorRegistrationSchema.safeParse(data);
};

// Transform data for blockchain (clean up empty strings)
export const transformForBlockchain = (data: CreatorRegistrationData) => {
  return {
    name: data.name.trim(),
    bio: data.bio?.trim() || '',
    avatar_url: data.avatar_url || '',
    website_url: data.website_url || '',
    twitter_handle: data.twitter_handle || '',
    instagram_handle: data.instagram_handle || '',
    youtube_url: data.youtube_url || '',
  };
};