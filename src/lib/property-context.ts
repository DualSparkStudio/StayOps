// ============================================
// Property Context - Multi-Tenant Property Management
// ============================================
// This module handles property detection and context management
// for the multi-tenant SaaS system

export interface Property {
  id: string;
  name: string;
  subdomain: string;
  plan_type: 'basic' | 'pro' | 'premium';
  status: 'active' | 'suspended' | 'trial' | 'inactive';
  subscription_status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  primary_color?: string;
  
  // Feature flags
  qr_enabled: boolean;
  custom_domain_enabled: boolean;
  analytics_enabled: boolean;
  room_limit: number;
  
  created_at: string;
  updated_at: string;
}

/**
 * Extract subdomain from current hostname
 * Examples:
 * - grandvalley.stayops.net → 'grandvalley'
 * - localhost:5173 → 'grandvalley' (default for development)
 * - stayops.net → null (main site)
 */
export function getSubdomain(): string | null {
  const hostname = window.location.hostname;
  
  // Development mode - use default property
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Check if there's a subdomain override in localStorage for testing
    const devSubdomain = localStorage.getItem('dev_subdomain');
    if (devSubdomain) {
      return devSubdomain;
    }
    // Default to grandvalley for development
    return 'grandvalley';
  }
  
  // Production mode - extract subdomain
  const parts = hostname.split('.');
  
  // If hostname is just stayops.net (2 parts), no subdomain
  if (parts.length <= 2) {
    return null;
  }
  
  // Return the first part as subdomain
  return parts[0];
}

/**
 * Get the current property ID from context
 * This should be called after property is loaded
 */
export function getCurrentPropertyId(): string | null {
  // Try to get from sessionStorage first (set after property lookup)
  const propertyId = sessionStorage.getItem('current_property_id');
  return propertyId;
}

/**
 * Set the current property in session
 */
export function setCurrentProperty(property: Property): void {
  sessionStorage.setItem('current_property_id', property.id);
  sessionStorage.setItem('current_property', JSON.stringify(property));
}

/**
 * Get the current property from session
 */
export function getCurrentProperty(): Property | null {
  const propertyJson = sessionStorage.getItem('current_property');
  if (!propertyJson) return null;
  
  try {
    return JSON.parse(propertyJson) as Property;
  } catch {
    return null;
  }
}

/**
 * Clear property context (useful for logout or switching properties)
 */
export function clearPropertyContext(): void {
  sessionStorage.removeItem('current_property_id');
  sessionStorage.removeItem('current_property');
}

/**
 * Check if a feature is enabled for the current property
 */
export function isFeatureEnabled(feature: keyof Pick<Property, 'qr_enabled' | 'custom_domain_enabled' | 'analytics_enabled'>): boolean {
  const property = getCurrentProperty();
  if (!property) return false;
  
  return property[feature] === true;
}

/**
 * Get plan-based limits
 */
export function getPlanLimits(planType: Property['plan_type']) {
  const limits = {
    basic: {
      rooms: 10,
      qr_enabled: false,
      custom_domain: false,
      analytics: false,
      branding_removal: false,
    },
    pro: {
      rooms: 50,
      qr_enabled: true,
      custom_domain: true,
      analytics: false,
      branding_removal: false,
    },
    premium: {
      rooms: 200,
      qr_enabled: true,
      custom_domain: true,
      analytics: true,
      branding_removal: true,
    },
  };
  
  return limits[planType];
}
