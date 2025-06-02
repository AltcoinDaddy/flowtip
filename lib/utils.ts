import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import toast from 'react-hot-toast';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Single function that handles everything with react-hot-toast
export const copyProfileLink = async (userAddress: string, baseUrl?: string): Promise<boolean> => {
  try {
    // Generate the profile link
    const domain = baseUrl || (typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL);
    const profileLink = `${domain}/creators/${userAddress}`;
    
    // Copy to clipboard
    if (navigator.clipboard && window.isSecureContext) {
      // Modern browsers
      await navigator.clipboard.writeText(profileLink);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = profileLink;
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (!successful) {
        throw new Error('Copy command failed');
      }
    }
    
    // Show success toast
    toast.success('Profile link copied to clipboard!', {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#10b981',
        color: '#ffffff',
        fontWeight: '600',
        borderRadius: '12px',
        padding: '12px 20px',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#10b981',
      },
    });
    
    return true;
    
  } catch (error) {
    console.error('Failed to copy profile link:', error);
    
    // Show error toast
    toast.error('Failed to copy profile link. Please try again.', {
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#ef4444',
        color: '#ffffff',
        fontWeight: '600',
        borderRadius: '12px',
        padding: '12px 20px',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#ef4444',
      },
    });
    
    return false;
  }
};

// Alternative version with custom toast messages
export const copyProfileLinkCustom = async (
  userAddress: string, 
  baseUrl?: string,
  successMessage?: string,
  errorMessage?: string
): Promise<boolean> => {
  try {
    const domain = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com');
    const profileLink = `${domain}/creators/${userAddress}`;
    
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(profileLink);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = profileLink;
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (!successful) {
        throw new Error('Copy command failed');
      }
    }
    
    toast.success(successMessage || 'Profile link copied to clipboard!');
    return true;
    
  } catch (error) {
    console.error('Failed to copy profile link:', error);
    toast.error(errorMessage || 'Failed to copy profile link. Please try again.');
    return false;
  }
};