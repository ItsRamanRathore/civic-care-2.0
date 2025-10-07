import { supabase } from '../lib/supabase';

// Helper function to get Supabase storage URL for images
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;

  // Get the public URL from Supabase storage
  const { data } = supabase.storage.from('issue-images').getPublicUrl(imagePath);
  return data?.publicUrl || null;
};

export const getAllCivicIssues = async () => {
  try {
    const { data, error } = await supabase
      .from('civic_issues')
      .select(`
        *,
        issue_images(id, image_path, image_url, caption),
        issue_updates(status, comment, created_at, is_public)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Process the data to include image URLs
    const processedData = data.map(issue => ({
      ...issue,
      issue_images: issue.issue_images.map(image => ({
        ...image,
        image_url: image.image_url || getImageUrl(image.image_path)
      }))
    }));

    return processedData;
  } catch (error) {
    console.error('Error fetching all civic issues:', error);
    throw error;
  }
};

export const getCivicIssuesByUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('civic_issues')
      .select(`
        *,
        issue_images(id, image_path, image_url, caption),
        issue_updates(status, comment, created_at, is_public)
      `)
      .eq('reporter_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Process the data to include image URLs
    const processedData = data.map(issue => ({
      ...issue,
      issue_images: issue.issue_images.map(image => ({
        ...image,
        image_url: image.image_url || getImageUrl(image.image_path)
      }))
    }));

    return processedData;
  } catch (error) {
    console.error('Error fetching user civic issues:', error);
    throw error;
  }
};

export const civicIssueService = {
  // Get all civic issues with optional filters
  async getIssues(filters = {}) {
    try {
      console.log('🔍 Fetching issues with filters:', filters);
      
      // Start with a simple query first, then add joins if they exist
      let query = supabase?.from('civic_issues')?.select(`
          *
        `)?.order('created_at', { ascending: false });

      // Apply filters
      if (filters?.category) {
        query = query?.eq('category', filters?.category);
      }
      if (filters?.status) {
        query = query?.eq('status', filters?.status);
      }
      if (filters?.priority) {
        query = query?.eq('priority', filters?.priority);
      }
      if (filters?.limit) {
        query = query?.limit(filters?.limit);
      }

      console.log('📊 Executing basic issues query...');
      const { data: basicIssues, error: basicError } = await query;

      if (basicError) {
        console.error('❌ Basic issues query failed:', basicError);
        throw basicError;
      }

      console.log('✅ Basic issues fetched:', basicIssues?.length || 0);

      if (!basicIssues || basicIssues.length === 0) {
        return { data: [], error: null };
      }

      // Try to enhance with related data (non-blocking)
      const enhancedIssues = await Promise.all(
        basicIssues.map(async (issue) => {
          try {
            // Try to get user profile
            let userProfile = null;
            if (issue.reporter_id) {
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('full_name, email')
                .eq('id', issue.reporter_id)
                .single();
              userProfile = profile;
            }

            // Try to get images
            let images = [];
            try {
              const { data: issueImages } = await supabase
                .from('issue_images')
                .select('id, image_path, image_url, caption')
                .eq('issue_id', issue.id);
              images = issueImages || [];
            } catch (imageError) {
              console.warn('Could not fetch images for issue:', issue.id);
            }

            // Try to get votes
            let votes = [];
            try {
              const { data: issueVotes } = await supabase
                .from('issue_votes')
                .select('vote_type')
                .eq('issue_id', issue.id);
              votes = issueVotes || [];
            } catch (voteError) {
              console.warn('Could not fetch votes for issue:', issue.id);
            }

            // Try to get updates
            let updates = [];
            try {
              const { data: issueUpdates } = await supabase
                .from('issue_updates')
                .select('status, comment, created_at, is_public')
                .eq('issue_id', issue.id)
                .eq('is_public', true)
                .order('created_at', { ascending: false });
              updates = issueUpdates || [];
            } catch (updateError) {
              console.warn('Could not fetch updates for issue:', issue.id);
            }

            return {
              ...issue,
              user_profiles: userProfile,
              issue_images: images.map(image => ({
                ...image,
                image_url: image.image_url || getImageUrl(image.image_path)
              })),
              issue_votes: votes,
              issue_updates: updates,
              upvoteCount: votes.filter(vote => vote.vote_type === 'upvote').length || 0,
              importantCount: votes.filter(vote => vote.vote_type === 'important').length || 0,
              imageCount: images.length || 0,
              updateCount: updates.length || 0,
              // Transform GPS coordinates for map compatibility
              coordinates: issue.latitude && issue.longitude ? {
                lat: parseFloat(issue.latitude),
                lng: parseFloat(issue.longitude)
              } : null,
              // Keep original fields for backward compatibility
              address: issue.address,
              location: issue.address
            };
          } catch (enhanceError) {
            console.warn('Could not enhance issue:', issue.id, enhanceError);
            // Return basic issue if enhancement fails
            return {
              ...issue,
              user_profiles: null,
              issue_images: [],
              issue_votes: [],
              issue_updates: [],
              upvoteCount: 0,
              importantCount: 0,
              imageCount: 0,
              updateCount: 0,
              // Transform GPS coordinates for map compatibility
              // Check for valid numeric values (including 0)
              coordinates: (issue.latitude !== null && issue.latitude !== undefined &&
                           issue.longitude !== null && issue.longitude !== undefined &&
                           !isNaN(issue.latitude) && !isNaN(issue.longitude)) ? {
                lat: parseFloat(issue.latitude),
                lng: parseFloat(issue.longitude)
              } : null,
              // Keep original fields for backward compatibility
              address: issue.address,
              location: issue.address
            };
          }
        })
      );

      // Apply filters
      if (filters?.category) {
        query = query?.eq('category', filters?.category);
      }
      if (filters?.status) {
        query = query?.eq('status', filters?.status);
      }
      if (filters?.priority) {
        query = query?.eq('priority', filters?.priority);
      }
      if (filters?.limit) {
        query = query?.limit(filters?.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      console.log('✅ Issues enhanced successfully');
      return { data: enhancedIssues, error: null };
    } catch (error) {
      console.error('Error fetching civic issues:', error);
      return { data: null, error: error?.message };
    }
  },

  // Get a single issue by ID
  async getIssueById(id) {
    try {
      const { data, error } = await supabase?.from('civic_issues')?.select(`
          *,
          departments(name, description, contact_email, contact_phone),
          user_profiles!reporter_id(full_name, email, phone),
          issue_images(id, image_path, image_url, caption, created_at),
          issue_votes(id, vote_type, user_id),
          issue_updates(id, status, comment, created_at, is_public, user_profiles(full_name))
        `)?.eq('id', id)?.single();

      if (error) {
        throw error;
      }

      // Process image URLs
      if (data?.issue_images) {
        data.issue_images = data.issue_images.map(image => ({
          ...image,
          image_url: image.image_url || getImageUrl(image.image_path)
        }));
      }

      // Transform GPS coordinates for map compatibility
      if (data) {
        data.coordinates = (data.latitude !== null && data.latitude !== undefined &&
                           data.longitude !== null && data.longitude !== undefined &&
                           !isNaN(data.latitude) && !isNaN(data.longitude)) ? {
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude)
        } : null;
        data.location = data.address;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching issue:', error);
      return { data: null, error: error?.message };
    }
  },

  // Get civic issues for a specific user
  async getCivicIssuesByUser(userId) {
    try {
      const { data, error } = await supabase
        .from('civic_issues')
        .select(`
          *,
          issue_images(id, image_path, image_url, caption),
          issue_updates(status, comment, created_at, is_public)
        `)
        .eq('reporter_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Process the data to include image URLs
      const processedData = data.map(issue => ({
        ...issue,
        issue_images: issue.issue_images.map(image => ({
          ...image,
          image_url: image.image_url || getImageUrl(image.image_path)
        }))
      }));

      return processedData;
    } catch (error) {
      console.error('Error fetching user civic issues:', error);
      throw error;
    }
  },

  // Get all civic issues with optional filters
  async getAllCivicIssues() {
    try {
      const { data, error } = await supabase
        .from('civic_issues')
        .select(`
          *,
          issue_images(id, image_path, image_url, caption),
          issue_updates(status, comment, created_at, is_public)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Process the data to include image URLs
      const processedData = data.map(issue => ({
        ...issue,
        issue_images: issue.issue_images.map(image => ({
          ...image,
          image_url: image.image_url || getImageUrl(image.image_path)
        }))
      }));

      return processedData;
    } catch (error) {
      console.error('Error fetching all civic issues:', error);
      throw error;
    }
  },

  // Create a new civic issue - ROBUST VERSION
  async createIssue(issueData) {
    console.log('🚀 Creating issue with robust error handling...');
    
    try {
      // Step 1: Validate input data
      if (!issueData?.title || !issueData?.description || !issueData?.category || !issueData?.location?.address) {
        throw new Error('Missing required fields: title, description, category, or location');
      }

      // Step 2: Get current user session
      const { data: { session }, error: sessionError } = await supabase?.auth?.getSession();
      
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }

      if (!session?.user) {
        throw new Error('User not authenticated. Please log in to submit a report.');
      }

      const user = session.user;
      console.log('✅ User authenticated:', user.email);

      // Step 3: Get user profile (with fallback)
      let userProfile = null;
      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!profileError) {
          userProfile = profile;
          console.log('✅ User profile loaded');
        } else {
          console.warn('⚠️ Could not load user profile:', profileError.message);
        }
      } catch (profileFetchError) {
        console.warn('⚠️ Profile fetch failed:', profileFetchError.message);
      }

      // Step 4: Prepare issue data with robust fallbacks
      const issueToCreate = {
        title: String(issueData.title).trim(),
        description: String(issueData.description).trim(),
        category: issueData.category,
        priority: issueData.priority || 'medium',
        status: 'submitted',
        address: String(issueData.location.address).trim(),
        latitude: issueData.location.coordinates?.lat || null,
        longitude: issueData.location.coordinates?.lng || null,
        reporter_id: user.id,
        reporter_name: issueData.contactInfo?.name || 
                     userProfile?.full_name || 
                     user.user_metadata?.full_name || 
                     user.email.split('@')[0],
        reporter_email: issueData.contactInfo?.email || 
                       userProfile?.email || 
                       user.email,
        reporter_phone: issueData.contactInfo?.phone || 
                       userProfile?.phone || 
                       user.user_metadata?.phone || 
                       null,
        created_at: new Date().toISOString()
      };

      console.log('📱 Phone number for notifications:', issueToCreate.reporter_phone);
      console.log('📝 Issue data prepared:', {
        title: issueToCreate.title,
        category: issueToCreate.category,
        address: issueToCreate.address,
        reporter_email: issueToCreate.reporter_email
      });

      // Step 5: Remove undefined values
      Object.keys(issueToCreate).forEach(key => {
        if (issueToCreate[key] === undefined) {
          delete issueToCreate[key];
        }
      });

      // Step 6: Create the issue in database
      console.log('💾 Inserting issue into database...');
      const { data: issue, error: insertError } = await supabase
        .from('civic_issues')
        .insert([issueToCreate])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Database insertion failed:', insertError);
        
        // Provide user-friendly error messages
        if (insertError.message.includes('permission denied')) {
          throw new Error('Permission denied. Please ensure you are logged in and try again.');
        } else if (insertError.message.includes('violates check constraint')) {
          throw new Error('Invalid data provided. Please check all required fields and try again.');
        } else if (insertError.message.includes('duplicate key')) {
          throw new Error('A similar report already exists. Please check existing reports.');
        } else {
          throw new Error(`Database error: ${insertError.message}`);
        }
      }

      console.log('✅ Issue created successfully:', issue.id);

      // Step 7: Handle image uploads (non-blocking)
      if (issueData?.images && issueData.images.length > 0) {
        console.log('📸 Processing image uploads...');
        try {
          const uploadedImages = await this.uploadIssueImages(issue.id, issueData.images, user.id);
          issue.issue_images = uploadedImages;
          console.log(`✅ Images uploaded: ${uploadedImages.length}/${issueData.images.length}`);
        } catch (imageError) {
          console.error('⚠️ Image upload failed (non-critical):', imageError);
          // Don't fail the issue creation for image upload errors
        }
      }

      // Step 8: Send notifications (non-blocking)
      console.log('📱 Scheduling notifications...');
      setTimeout(async () => {
        try {
          const { notificationService } = await import('./notificationService');
          const result = await notificationService.sendIssueNotifications(issue, 'created');
          console.log('📨 Notification result:', result);
          
          if (result.user?.success) {
            console.log('✅ User WhatsApp notification sent successfully');
          } else {
            console.warn('⚠️ User notification failed:', result.user?.error);
          }
          
          if (result.admin?.success) {
            console.log('✅ Admin WhatsApp notification sent successfully');
          } else {
            console.warn('⚠️ Admin notification failed:', result.admin?.error);
          }
        } catch (notificationError) {
          console.error('📱 Notification error (non-critical):', notificationError);
          // Notifications are optional - don't affect issue creation
        }
      }, 500); // Small delay to ensure issue is fully created

      return { data: issue, error: null, success: true };

    } catch (error) {
      console.error('💥 Issue creation failed:', error);
      
      // Return user-friendly error message
      let errorMessage = error.message;
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('JWT')) {
        errorMessage = 'Session expired. Please log in again.';
      }
      
      return { 
        data: null, 
        error: errorMessage, 
        success: false 
      };
    }
  },

  // Upload images for an issue
  async uploadIssueImages(issueId, images, userId) {
    const uploadedImages = [];

    for (const image of images) {
      try {
        // Generate unique filename
        const fileExt = image.file.name.split('.').pop();
        const fileName = `${issueId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('issue-images')
          .upload(fileName, image.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('issue-images')
          .getPublicUrl(fileName);

        // Create image record in database
        const { data: imageRecord, error: imageError } = await supabase
          .from('issue_images')
          .insert([{
            issue_id: issueId,
            image_path: fileName,
            image_url: urlData.publicUrl,
            caption: image.caption || null,
            uploaded_by: userId
          }])
          .select()
          .single();

        if (imageError) {
          console.error('Error creating image record:', imageError);
          continue;
        }

        uploadedImages.push(imageRecord);
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }

    return uploadedImages;
  },

  // Update issue status (admin only)
  async updateIssueStatus(issueId, status, comment = null) {
    try {
      const { data, error } = await supabase?.from('civic_issues')?.update({
        status,
        updated_at: new Date()?.toISOString(),
        ...(status === 'resolved' && { resolved_at: new Date()?.toISOString() })
      })?.eq('id', issueId)?.select()?.single();

      if (error) {
        throw error;
      }

      // Create an update record if comment provided
      if (comment) {
        await this.addIssueUpdate(issueId, status, comment);
      }

      // Send status update notifications (non-blocking)
      setTimeout(async () => {
        try {
          console.log('Attempting to send status update notifications for issue:', issueId);
          const { notificationService } = await import('./notificationService');
          const result = await notificationService.sendIssueNotifications(data, status);
          console.log('Status notification result:', result);
        } catch (notificationError) {
          console.error('Failed to send status update notifications:', notificationError);
          // Notifications are optional - don't affect status update
        }
      }, 100); // Send notifications asynchronously

      return { data, error: null };
    } catch (error) {
      console.error('Error updating issue status:', error);
      return { data: null, error: error?.message };
    }
  },

  // Add issue update/comment
  async addIssueUpdate(issueId, status, comment, isPublic = true) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();

      const { data, error } = await supabase?.from('issue_updates')?.insert([{
        issue_id: issueId,
        status,
        comment,
        updated_by: user?.id,
        is_public: isPublic
      }])?.select(`
          *,
          user_profiles(full_name)
        `)?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error adding issue update:', error);
      return { data: null, error: error?.message };
    }
  },

  // Vote on an issue
  async voteOnIssue(issueId, voteType = 'upvote') {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();

      if (!user) {
        throw new Error('Authentication required to vote');
      }

      // Check if user already voted with this type
      const { data: existingVote } = await supabase?.from('issue_votes')?.select('id')?.eq('issue_id', issueId)?.eq('user_id', user?.id)?.eq('vote_type', voteType)?.single();

      if (existingVote) {
        // Remove the vote (toggle)
        const { error } = await supabase?.from('issue_votes')?.delete()?.eq('id', existingVote?.id);

        if (error) throw error;
        return { data: { action: 'removed' }, error: null };
      } else {
        // Add the vote
        const { data, error } = await supabase?.from('issue_votes')?.insert([{
          issue_id: issueId,
          user_id: user?.id,
          vote_type: voteType
        }])?.select()?.single();

        if (error) throw error;
        return { data: { action: 'added', vote: data }, error: null };
      }
    } catch (error) {
      console.error('Error voting on issue:', error);
      return { data: null, error: error?.message };
    }
  },

  // Get user's votes for issues
  async getUserVotes(issueIds) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();

      if (!user) {
        return { data: [], error: null };
      }

      const { data, error } = await supabase?.from('issue_votes')?.select('issue_id, vote_type')?.eq('user_id', user?.id)?.in('issue_id', issueIds);

      if (error) {
        throw error;
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching user votes:', error);
      return { data: [], error: error?.message };
    }
  },

  // Get issues statistics
  async getIssuesStats() {
    try {
      const { data, error } = await supabase?.from('civic_issues')?.select('status, category, priority, created_at');

      if (error) {
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        byStatus: {},
        byCategory: {},
        byPriority: {},
        recentCount: 0
      };

      const oneWeekAgo = new Date();
      oneWeekAgo?.setDate(oneWeekAgo?.getDate() - 7);

      data?.forEach(issue => {
        // Count by status
        stats.byStatus[issue.status] = (stats?.byStatus?.[issue?.status] || 0) + 1;

        // Count by category
        stats.byCategory[issue.category] = (stats?.byCategory?.[issue?.category] || 0) + 1;

        // Count by priority
        stats.byPriority[issue.priority] = (stats?.byPriority?.[issue?.priority] || 0) + 1;

        // Count recent issues
        if (new Date(issue.created_at) > oneWeekAgo) {
          stats.recentCount++;
        }
      });

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching issues stats:', error);
      return { data: null, error: error?.message };
    }
  },

  // Real-time subscription for issue changes
  subscribeToIssueChanges(callback) {
    const subscription = supabase?.channel('civic_issues_changes')?.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'civic_issues'
      },
      (payload) => {
        callback?.(payload);
      }
    )?.subscribe();

    return subscription;
  },

  // Assign issue to department
  async assignToDepartment(issueId, departmentId) {
    try {
      const { data, error } = await supabase?.from('civic_issues')?.update({
        assigned_department_id: departmentId,
        updated_at: new Date()?.toISOString()
      })?.eq('id', issueId)?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error assigning issue to department:', error);
      return { data: null, error: error?.message };
    }
  },

  // Unsubscribe from real-time changes
  unsubscribeFromChanges(subscription) {
    if (subscription) {
      supabase?.removeChannel(subscription);
    }
  },

  // Track complaint by ID and email
  async trackComplaint(complaintId, email) {
    try {
      console.log('🔍 Tracking complaint:', complaintId, 'for email:', email);
      
      // First try to find by exact ID match
      let query = supabase
        .from('civic_issues')
        .select(`
          *,
          issue_images(id, image_path, image_url, caption, created_at),
          issue_updates(status, comment, created_at, is_public),
          user_profiles!reporter_id(full_name, email)
        `)
        .eq('id', complaintId);

      let { data: complaint, error } = await query.single();

      // If not found by ID, try searching by title or other fields
      if (error && error.code === 'PGRST116') {
        console.log('🔍 Complaint not found by ID, searching by other criteria...');
        
        query = supabase
          .from('civic_issues')
          .select(`
            *,
            issue_images(id, image_path, image_url, caption, created_at),
            issue_updates(status, comment, created_at, is_public),
            user_profiles!reporter_id(full_name, email)
          `)
          .or(`title.ilike.%${complaintId}%,description.ilike.%${complaintId}%`)
          .limit(10);

        const { data: complaints, error: searchError } = await query;
        
        if (searchError) {
          throw searchError;
        }

        // Find the best match by email
        complaint = complaints?.find(c =>
          c.reporter_email?.toLowerCase() === email.toLowerCase() ||
          c.user_profiles?.email?.toLowerCase() === email.toLowerCase()
        );

        if (!complaint) {
          return { data: null, error: 'Complaint not found' };
        }
      } else if (error) {
        throw error;
      }

      // Verify email matches
      const emailMatches =
        complaint.reporter_email?.toLowerCase() === email.toLowerCase() ||
        complaint.user_profiles?.email?.toLowerCase() === email.toLowerCase();

      if (!emailMatches) {
        return { data: null, error: 'Email does not match complaint records' };
      }

      // Process image URLs
      if (complaint.issue_images) {
        complaint.issue_images = complaint.issue_images.map(image => ({
          ...image,
          image_url: image.image_url || getImageUrl(image.image_path)
        }));
      }

      // Filter public updates only
      if (complaint.issue_updates) {
        complaint.issue_updates = complaint.issue_updates
          .filter(update => update.is_public)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      console.log('✅ Complaint found and verified');
      return { data: complaint, error: null };

    } catch (error) {
      console.error('❌ Error tracking complaint:', error);
      return { data: null, error: error.message };
    }
  }
};

export default civicIssueService;