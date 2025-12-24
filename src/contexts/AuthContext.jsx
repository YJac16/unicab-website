import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverProfile, setDriverProfile] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
        fetchDriverProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserRole(session.user.id);
        await fetchDriverProfile(session.user.id);
      } else {
        setUserRole(null);
        setDriverProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        return;
      }

      setUserRole(data?.role || 'customer');
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('customer');
    }
  };

  const fetchDriverProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching driver profile:', error);
        return;
      }

      setDriverProfile(data);
    } catch (error) {
      console.error('Error fetching driver profile:', error);
    }
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured' } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data?.user) {
      await fetchUserRole(data.user.id);
      await fetchDriverProfile(data.user.id);
    }

    return { data, error };
  };

  const signUp = async (email, password, metadata = {}) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured' } };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (!error && data?.user) {
      // Assign customer role by default
      await supabase.from('user_roles').insert({
        user_id: data.user.id,
        role: 'customer',
      });
    }

    return { data, error };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured' } };
    }

    const { error } = await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setDriverProfile(null);
    return { error };
  };

  const value = {
    user,
    userRole,
    driverProfile,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    isAdmin: userRole === 'admin',
    isDriver: userRole === 'driver',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



