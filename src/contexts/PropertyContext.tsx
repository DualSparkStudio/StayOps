// ============================================
// Property Context Provider - React Context for Multi-Tenancy
// ============================================
// This provides property context throughout the React app

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Property,
  getSubdomain,
  setCurrentProperty,
  getCurrentProperty,
  clearPropertyContext,
} from '../lib/property-context';

interface PropertyContextType {
  property: Property | null;
  propertyId: string | null;
  isLoading: boolean;
  error: string | null;
  refetchProperty: () => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: React.ReactNode }) {
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperty = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if property is already in session
      const cachedProperty = getCurrentProperty();
      if (cachedProperty) {
        setProperty(cachedProperty);
        setIsLoading(false);
        return;
      }

      // Get subdomain from URL
      const subdomain = getSubdomain();
      
      if (!subdomain) {
        // No subdomain means we're on the main site (stayops.net)
        // This could be the marketing site or super admin panel
        setProperty(null);
        setIsLoading(false);
        return;
      }

      // Fetch property from database
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('subdomain', subdomain)
        .eq('status', 'active')
        .single();

      if (fetchError) {
        console.error('Error fetching property:', fetchError);
        setError(`Property not found: ${subdomain}`);
        setProperty(null);
        setIsLoading(false);
        return;
      }

      if (!data) {
        setError(`Property not found: ${subdomain}`);
        setProperty(null);
        setIsLoading(false);
        return;
      }

      // Store in session and state
      setCurrentProperty(data as Property);
      setProperty(data as Property);
      setIsLoading(false);
    } catch (err) {
      console.error('Error in fetchProperty:', err);
      setError('Failed to load property');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, []);

  const refetchProperty = async () => {
    clearPropertyContext();
    await fetchProperty();
  };

  const value: PropertyContextType = {
    property,
    propertyId: property?.id || null,
    isLoading,
    error,
    refetchProperty,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
}

// Hook to get just the property ID (most common use case)
export function usePropertyId(): string | null {
  const { propertyId } = useProperty();
  return propertyId;
}
