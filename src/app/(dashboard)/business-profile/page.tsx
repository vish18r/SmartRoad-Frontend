'use client';

import { useSearchParams } from 'next/navigation';
import { businessProfileApi } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useApi } from '@/hooks/useApi';
import type { CompleteBusinessProfile, BusinessProfileResponse } from '@/types/business-profile';

export default function BusinessProfilePage() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get('organizationId');

  // Fetch business profile with complete data
  const { data: profile, loading, error, refetch } = useApi(
    () => {
      if (!organizationId) {
        return Promise.reject({
          status: 400,
          message: 'Organization ID is required',
        });
      }
      return businessProfileApi.getByOrganization(organizationId);
    },
    {
      skip: !organizationId,
      onError: (err) => {
        toast.error(err.message || 'Failed to load business profile');
      },
    }
  );

  // Fetch complete profile (with contacts and services) when profile ID is available
  const { data: completeProfile, loading: completeLoading, refetch: refetchComplete } = useApi(
    () => {
      if (!profile?.id) {
        return Promise.reject({
          status: 400,
          message: 'Profile not found',
        });
      }
      return businessProfileApi.getComplete(profile.id);
    },
    {
      skip: !profile?.id,
      onError: (err) => {
        toast.error(err.message || 'Failed to load complete profile');
      },
    }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading business profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-red-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Business Profile Found</h3>
            <p className="text-gray-600">
              {error?.message || 'Business profile could not be loaded. Please check your organization.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Profile</h1>
          <p className="text-gray-600">View and manage business details, contacts, and services</p>
        </div>

        {/* Business Information Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Business Name</p>
                <p className="text-lg text-gray-900">{profile.businessName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Business Type</p>
                <p className="text-lg text-gray-900">{profile.businessType || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Address Section */}
        {(profile.addressStreet || profile.addressCity || profile.addressPinCode) && (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Address</h2>
            </div>
            <div className="px-6 py-6">
              <div className="space-y-2 text-gray-900">
                {profile.addressStreet && <p>{profile.addressStreet}</p>}
                {profile.addressCity && <p>{profile.addressCity}</p>}
                {profile.addressPinCode && <p className="font-medium">{profile.addressPinCode}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Contacts Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Contacts</h2>
          </div>
          <div className="px-6 py-6">
            {completeLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-600">Loading contacts...</p>
              </div>
            ) : completeProfile?.contacts && completeProfile.contacts.length > 0 ? (
              <div className="space-y-4">
                {completeProfile.contacts.map((contact) => (
                  <div key={contact.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{contact.contactName}</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {contact.contactRole === 'main_founder' ? 'Main Founder' : 'Additional Contact'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {contact.phoneNumber1 && (
                            <p className="text-sm text-gray-600">
                              <a href={`tel:${contact.phoneNumber1}`} className="text-blue-600 hover:text-blue-800 font-medium">
                                {contact.phoneNumber1}
                              </a>
                            </p>
                          )}
                          {contact.phoneNumber2 && (
                            <p className="text-sm text-gray-600">
                              <a href={`tel:${contact.phoneNumber2}`} className="text-blue-600 hover:text-blue-800 font-medium">
                                {contact.phoneNumber2}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No contacts configured</p>
              </div>
            )}
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Services</h2>
          </div>
          <div className="px-6 py-6">
            {completeLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-600">Loading services...</p>
              </div>
            ) : completeProfile?.services && completeProfile.services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completeProfile.services.map((service) => (
                  <div key={service.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="ml-3 text-gray-900 font-medium">{service.serviceName}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No services configured</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
