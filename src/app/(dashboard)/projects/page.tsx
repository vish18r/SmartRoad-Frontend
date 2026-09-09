'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { projectApi } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useApi } from '@/hooks/useApi';
import { usePagination } from '@/hooks/usePagination';
import { useTable } from '@/hooks/useTable';
import { Form, FormInput, FormSelect, FormSubmitButton } from '@/components/ui/form';
import type { ProjectResponse } from '@/types/project';

export default function ProjectsPage() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get('organizationId');

  // Pagination
  const pagination = usePagination({ initialPage: 1, initialLimit: 20 });

  // Table state
  const table = useTable<ProjectResponse>({
    onSortChange: (sort) => {
      // Handle sort changes
    },
    onFilterChange: (filters) => {
      pagination.goToFirstPage();
    },
  });

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // API call - Note: projectApi.list() requires organizationId
  const { data: response, loading, error, refetch } = useApi(
    () => {
      if (!organizationId) {
        return Promise.reject({
          status: 400,
          message: 'Organization ID is required',
        });
      }
      return projectApi.list(organizationId, pagination.page, pagination.limit, {
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });
    },
    {
      skip: !organizationId,
      onSuccess: (data) => {
        if (Array.isArray(data)) {
          // API returns array, not paginated response
          // Adjust based on actual backend response structure
        }
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to load projects');
      },
    }
  );

  const projects = response || [];

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      pagination.goToFirstPage();
      await refetch();
    },
    [pagination, refetch]
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectApi.delete(id);
      toast.success('Project deleted successfully');
      refetch();
    } catch (err) {
      const error = err as any;
      toast.error(error.message || 'Failed to delete project');
    }
  };

  if (!organizationId) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-600 mb-4'>Please select an organization first</p>
        <Link
          href='/organizations'
          className='inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700'
        >
          Go to Organizations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse, filter, and manage all road construction projects
          </p>
        </div>
        <Link
          href={`/projects/new?organizationId=${organizationId}`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          + New Project
        </Link>
      </div>

      {/* Filters */}
      <Form onSubmit={handleSearch} className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="Search"
            placeholder="Search by name, code, or location"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FormSelect
            label="Status"
            options={[
              { label: 'All', value: '' },
              { label: 'Draft', value: 'DRAFT' },
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'On Hold', value: 'ON_HOLD' },
              { label: 'Cancelled', value: 'CANCELLED' },
              { label: 'Archived', value: 'ARCHIVED' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <div className="flex items-end">
            <FormSubmitButton className="w-full">Search</FormSubmitButton>
          </div>
        </div>
      </Form>

      {/* Results Info */}
      {!loading && (
        <div className="text-sm text-gray-600">
          Showing{' '}
          <span className="font-medium">
            {projects.length === 0
              ? 0
              : (pagination.page - 1) * pagination.limit + 1}
            -
            {(pagination.page - 1) * pagination.limit + projects.length}
          </span>{' '}
          of <span className="font-medium">{pagination.totalRecords}</span> projects
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 mb-4">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No projects found. Create one to get started.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {project.code || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {project.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {project.location || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{project.budget.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {project.progress || 0}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : project.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800'
                          : project.status === 'DRAFT'
                          ? 'bg-gray-100 text-gray-800'
                          : project.status === 'ON_HOLD'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {project.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                    <Link
                      href={`/projects/${project.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="space-x-2">
            <button
              onClick={pagination.previousPage}
              disabled={!pagination.hasPreviousPage}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={pagination.nextPage}
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
