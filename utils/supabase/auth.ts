// utils/supabase/auth.ts - Clean, Fixed Version
import { createClient } from './client';

// User interface (for wallet connections)
export interface User {
  id: string;
  flow_address: string;
  display_name?: string;
  email?: string;
  avatar_url?: string;
  last_login: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Creator interface (for creator registration)
export interface Creator {
  id: string;
  user_id: string;
  flow_address: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  website_url?: string;
  twitter_handle?: string;
  instagram_handle?: string;
  youtube_url?: string;
  tip_count: number;
  total_tipped: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCreatorData {
  name: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  website_url?: string;
  twitter_handle?: string;
  instagram_handle?: string;
  youtube_url?: string;
}

export class SupabaseAuth {
  // STEP 1: Save user when wallet connects (AUTOMATIC)
  static async saveUserOnConnect(flowAddress: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const supabase = createClient();
      console.log('🔗 Auto-saving user on wallet connect:', flowAddress);

      // Set RLS context
      await supabase.rpc('set_config', {
        setting_name: 'app.current_user_flow_address',
        setting_value: flowAddress,
        is_local: true
      });

      // Insert or update user with last_login (UPSERT handles both new and returning users)
      const { data, error } = await supabase
        .from('users')
        .upsert({
          flow_address: flowAddress,
          last_login: new Date().toISOString(),
          is_active: true,
          // Set display_name to first 8 chars of address if new user
          display_name: `User_${flowAddress.slice(-8)}`
        }, {
          onConflict: 'flow_address',
          ignoreDuplicates: false
        })
        .select()
        .limit(1);

      if (error) {
        console.error('❌ Error saving user to Supabase:', error);
        return { success: false, error: error.message };
      }

      const user = data && data.length > 0 ? data[0] : null;
      if (!user) {
        console.error('❌ No user data returned from Supabase');
        return { success: false, error: 'No user data returned' };
      }

      console.log('✅ User auto-saved to Supabase:', {
        id: user.id,
        flow_address: user.flow_address,
        last_login: user.last_login,
        created_at: user.created_at
      });
      
      return { success: true, user };
    } catch (error) {
      console.error('❌ Error in saveUserOnConnect:', error);
      return { success: false, error: 'Failed to save user data to Supabase' };
    }
  }

  // Get user by Flow address
  static async getUserByAddress(flowAddress: string): Promise<User | null> {
    try {
      const supabase = createClient();
      console.log('📋 Fetching user from Supabase:', flowAddress);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('flow_address', flowAddress)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching user from Supabase:', error);
        return null;
      }

      if (data) {
        console.log('✅ User found in Supabase:', data.flow_address);
      } else {
        console.log('ℹ️ User not found in Supabase for address:', flowAddress);
      }

      return data;
    } catch (error) {
      console.error('❌ Error in getUserByAddress:', error);
      return null;
    }
  }

  // STEP 2: Check if user is a creator
  static async getCreatorByAddress(flowAddress: string): Promise<Creator | null> {
    try {
      const supabase = createClient();
      console.log('🔍 Checking creator status in Supabase for:', flowAddress);
      
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('flow_address', flowAddress)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching creator from Supabase:', error);
        return null;
      }

      if (data) {
        console.log('✅ Creator found in Supabase:', {
          name: data.name,
          flow_address: data.flow_address,
          tip_count: data.tip_count
        });
      } else {
        console.log('ℹ️ No creator profile found in Supabase for:', flowAddress);
      }

      return data;
    } catch (error) {
      console.error('❌ Error in getCreatorByAddress:', error);
      return null;
    }
  }

  // STEP 2: Register as creator
  static async registerCreator(
    flowAddress: string, 
    creatorData: CreateCreatorData
  ): Promise<{ success: boolean; creator?: Creator; error?: string }> {
    try {
      const supabase = createClient();
      console.log('👑 Registering creator for:', flowAddress, creatorData);

      // First, ensure user exists
      let user = await this.getUserByAddress(flowAddress);
      if (!user) {
        console.log('ℹ️ User not found, creating user first...');
        const userResult = await this.saveUserOnConnect(flowAddress);
        if (!userResult || !userResult.success || !userResult.user) {
          console.error('❌ Failed to create user account before creator registration');
          return { success: false, error: 'Failed to create user account' };
        }
        user = userResult.user;
        console.log('✅ User created for creator registration:', user.flow_address);
      }

      // Set RLS context
      await supabase.rpc('set_config', {
        setting_name: 'app.current_user_flow_address',
        setting_value: flowAddress,
        is_local: true
      });

      // Create creator profile
      const { data, error } = await supabase
        .from('creators')
        .insert({
          user_id: user.id,
          flow_address: flowAddress,
          ...creatorData
        })
        .select()
        .limit(1);

      if (error) {
        console.error('❌ Error registering creator in Supabase:', error);
        return { success: false, error: error.message };
      }

      const creator = data && data.length > 0 ? data[0] : null;
      if (!creator) {
        console.error('❌ No creator data returned from Supabase');
        return { success: false, error: 'No creator data returned' };
      }

      console.log('✅ Creator registered successfully in Supabase:', {
        id: creator.id,
        name: creator.name,
        flow_address: creator.flow_address
      });
      
      return { success: true, creator };
    } catch (error) {
      console.error('❌ Error in registerCreator:', error);
      return { success: false, error: 'Failed to register as creator' };
    }
  }

  // Update creator profile
  static async updateCreator(
    flowAddress: string, 
    updateData: Partial<CreateCreatorData>
  ): Promise<{ success: boolean; creator?: Creator; error?: string }> {
    try {
      const supabase = createClient();
      console.log('✏️ Updating creator for:', flowAddress);

      // Set RLS context
      await supabase.rpc('set_config', {
        setting_name: 'app.current_user_flow_address',
        setting_value: flowAddress,
        is_local: true
      });

      const { data, error } = await supabase
        .from('creators')
        .update(updateData)
        .eq('flow_address', flowAddress)
        .select()
        .limit(1);

      if (error) {
        console.error('❌ Error updating creator in Supabase:', error);
        return { success: false, error: error.message };
      }

      const creator = data && data.length > 0 ? data[0] : null;
      if (!creator) {
        console.error('❌ Creator not found for update:', flowAddress);
        return { success: false, error: 'Creator not found' };
      }

      console.log('✅ Creator updated successfully in Supabase:', {
        name: creator.name,
        flow_address: creator.flow_address
      });
      
      return { success: true, creator };
    } catch (error) {
      console.error('❌ Error in updateCreator:', error);
      return { success: false, error: 'Failed to update creator profile' };
    }
  }

  // Upload file for creator
  static async uploadCreatorFile(
    file: File,
    flowAddress: string,
    fileType: 'avatar' | 'banner'
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const supabase = createClient();
      console.log(`📁 Uploading ${fileType} for:`, flowAddress, {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        fileType: file.type
      });

      // Validate file
      if (!file.type.startsWith('image/')) {
        const error = 'File must be an image';
        console.error('❌ File validation failed:', error);
        return { success: false, error };
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        const error = 'File size must be less than 5MB';
        console.error('❌ File validation failed:', error);
        return { success: false, error };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${flowAddress}/${fileType}_${timestamp}.${fileExt}`;

      console.log(`📤 Uploading to storage path:`, fileName);

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('creator-images')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Supabase storage upload error:', uploadError);
        return { success: false, error: uploadError.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('creator-images')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log('✅ File uploaded successfully to:', publicUrl);

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('❌ Error in uploadCreatorFile:', error);
      return { success: false, error: 'Failed to upload file to storage' };
    }
  }

  // Delete file from storage
  static async deleteCreatorFile(
    flowAddress: string,
    fileType: 'avatar' | 'banner'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();
      console.log(`🗑️ Deleting ${fileType} for:`, flowAddress);

      // List files to find the one to delete
      const { data: files, error: listError } = await supabase.storage
        .from('creator-images')
        .list(`${flowAddress}/`, {
          search: fileType
        });

      if (listError) {
        console.error('❌ Error listing files for deletion:', listError);
        return { success: false, error: listError.message };
      }

      if (!files || files.length === 0) {
        console.log('ℹ️ No files found to delete for:', fileType);
        return { success: true }; // No file to delete
      }

      // Delete the most recent file matching the type
      const fileToDelete = files
        .filter(f => f.name.includes(fileType))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

      if (fileToDelete) {
        const fileName = `${flowAddress}/${fileToDelete.name}`;
        console.log('🗑️ Deleting file:', fileName);
        
        const { error: deleteError } = await supabase.storage
          .from('creator-images')
          .remove([fileName]);

        if (deleteError) {
          console.error('❌ Error deleting file from storage:', deleteError);
          return { success: false, error: deleteError.message };
        }

        console.log('✅ File deleted successfully:', fileName);
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Error in deleteCreatorFile:', error);
      return { success: false, error: 'Failed to delete file from storage' };
    }
  }

  // Get all users (admin function)
  static async getAllUsers(): Promise<User[]> {
    try {
      const supabase = createClient();
      console.log('📋 Fetching all users from Supabase...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching all users:', error);
        return [];
      }

      console.log(`✅ Retrieved ${data?.length || 0} users from Supabase`);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getAllUsers:', error);
      return [];
    }
  }

  // Get all creators (public function)
  static async getAllCreators(): Promise<Creator[]> {
    try {
      const supabase = createClient();
      console.log('👑 Fetching all creators from Supabase...');
      
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching all creators:', error);
        return [];
      }

      console.log(`✅ Retrieved ${data?.length || 0} active creators from Supabase`);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getAllCreators:', error);
      return [];
    }
  }
}