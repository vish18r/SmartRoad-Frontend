# SmartRoad Frontend Implementation Guide

## Progress Summary

### ✅ Completed (Phase 0: Infrastructure)
1. **Authentication System** - Login, signup, logout, token refresh
2. **Middleware** - Protected routes, auth guards
3. **Type System** - Common types, enums, interfaces
4. **Form Components** - Input, Select, Textarea, Checkbox, Radio, validation
5. **Custom Hooks** - useApi, useMutation, useTable, usePagination, useForm, useToast
6. **Error Handling** - Error boundary, error messages, validation
7. **API Client** - Token refresh, error handling, request/response handling

### ✅ Partial (Phase 1: API & Types)
1. **Type Definitions** - Created for Projects, Contracts, Materials, Workers
2. **API Clients** - Created for projects-api, contract-api, material-api, worker-api
3. **Export Index** - Updated to include all new API modules

### ✅ Implemented (Phase 2: Pages)
1. **Materials List Page** (`/materials`) - Complete with search, filter, pagination, CRUD actions
   - Demonstrates all patterns for list pages
   - Use as template for other list pages

---

## Implementation Patterns

### 1. List Page Pattern

**File:** `/src/app/(dashboard)/[module]/page.tsx`

**Template Structure:**
```typescript
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { [moduleApi] } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useApi } from '@/hooks/useApi';
import { usePagination } from '@/hooks/usePagination';
import { useTable } from '@/hooks/useTable';

export default function ListPage() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const pagination = usePagination({ initialPage: 1, initialLimit: 20 });
  const table = useTable();

  const { data, loading, error, refetch } = useApi(
    () => [moduleApi].list(pagination.page, pagination.limit),
    { onSuccess: (d) => pagination.setMeta(d.pagination) }
  );

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Name</h1>
          <p className="text-sm text-gray-600">Description</p>
        </div>
        <Link href="/[module]/new" className="btn-primary">+ Add Item</Link>
      </div>

      {/* Search & Filters */}
      <Form onSubmit={handleSearch}>
        {/* FormInput, FormSelect for filters */}
      </Form>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        {/* Loading: spinner */}
        {/* Error: retry button */}
        {/* Empty: message */}
        {/* Data: table */}
      </div>

      {/* Pagination */}
      {/* Previous/Next buttons */}
    </div>
  );
}
```

**Key Features:**
- Search/filter with Form components
- Pagination using `usePagination` hook
- Table sorting using `useTable` hook
- Loading/error/empty states
- Delete with confirmation
- Link to detail and edit pages

### 2. Detail Page Pattern

**File:** `/src/app/(dashboard)/[module]/[id]/page.tsx`

**Template Structure:**
```typescript
'use client';
import { useParams } from 'next/navigation';
import { useApi } from '@/hooks/useApi';

export default function DetailPage() {
  const params = useParams<{ id: string }>();
  const { data: item, loading, error } = useApi(
    () => [moduleApi].getById(params.id)
  );

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header with item name and actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1>{item?.name}</h1>
          <p className="text-sm text-gray-600">Created {format(new Date(item?.createdAt))}</p>
        </div>
        <div className="space-x-2">
          <Link href={`/[module]/${item?.id}/edit`} className="btn-secondary">Edit</Link>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </div>

      {/* Tabs for different sections */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button onClick={() => setActiveTab('overview')} className={tab === 'overview' ? 'active' : ''}>
              Overview
            </button>
            <button onClick={() => setActiveTab('details')} className={tab === 'details' ? 'active' : ''}>
              Details
            </button>
            {/* More tabs */}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (/* Overview content */)}
          {activeTab === 'details' && (/* Details content */)}
          {/* More tab content */}
        </div>
      </div>

      {/* Related data sections */}
      {/* e.g., Associated BOQ items, Contracts, etc. */}
    </div>
  );
}
```

**Key Features:**
- Fetch single item using `useApi`
- Tabbed interface for different sections
- Edit and delete actions
- Related data tables
- Status badge and timestamps

### 3. Create/Edit Form Pattern

**File:** `/src/app/(dashboard)/[module]/new/page.tsx` or `/[id]/edit/page.tsx`

**Template Structure:**
```typescript
'use client';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from '@/hooks/useForm';
import { useApi } from '@/hooks/useApi';
import { Form, FormInput, FormSelect, FormSubmitButton, FormError } from '@/components/ui/form';
import { validateForm } from '@/lib/utils/validation';

const validationSchema = {
  name: [{ type: 'required', message: 'Name is required' }],
  email: [
    { type: 'required', message: 'Email is required' },
    { type: 'email', message: 'Invalid email' },
  ],
  // ... more fields
};

export default function CreateEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const isEdit = !!params?.id;

  // Fetch existing item if editing
  const { data: item, loading } = useApi(
    () => (isEdit ? [moduleApi].getById(params.id) : Promise.resolve(null)),
    { skip: !isEdit }
  );

  const form = useForm({
    defaultValues: item || { name: '', email: '' },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEdit) {
          await [moduleApi].update(params.id, values);
          toast.success('Updated successfully');
        } else {
          await [moduleApi].create(values);
          toast.success('Created successfully');
        }
        router.push('/[module]');
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1>{isEdit ? 'Edit' : 'Create'} Item</h1>

      <Form onSubmit={form.handleSubmit}>
        <FormError message={form.formError} />

        <FormInput
          label="Name"
          error={form.errors.name}
          required
          {...form.register('name')}
        />

        <FormInput
          label="Email"
          type="email"
          error={form.errors.email}
          required
          {...form.register('email')}
        />

        {/* More fields */}

        <div className="flex space-x-4">
          <FormSubmitButton loading={form.isSubmitting}>
            {isEdit ? 'Update' : 'Create'}
          </FormSubmitButton>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </Form>
    </div>
  );
}
```

**Key Features:**
- Reusable for both create and edit
- Form validation with `useForm`
- Error display for each field
- Loading state while fetching existing data
- Success/error toast notifications
- Cancel button to go back

---

## Quick Start: Creating New Modules

### Step 1: Create Types
**File:** `/src/types/[module].ts`

```typescript
import type { BaseEntity } from '@/types/common';

export type ModuleStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface ModuleResponse extends BaseEntity {
  name: string;
  description?: string;
  status: ModuleStatus;
  // ... other fields
}

export interface ModuleCreateRequest {
  name: string;
  description?: string;
  status: ModuleStatus;
  // ... other fields
}

export interface ModuleUpdateRequest {
  name?: string;
  description?: string;
  status?: ModuleStatus;
  // ... other fields (optional)
}
```

### Step 2: Create API Client
**File:** `/src/lib/api/[module]-api.ts`

```typescript
import { apiClient } from './api-client';
import type { ApiResponse, ApiListResponse } from '@/types/api';
import type { ModuleResponse, ModuleCreateRequest, ModuleUpdateRequest } from '@/types/module';

export const [module]Api = {
  create: (body: ModuleCreateRequest): Promise<ApiResponse<ModuleResponse>> =>
    apiClient.post<ModuleResponse>('/[modules]', body),

  list: (page: number = 1, limit: number = 20): Promise<ApiResponse<ApiListResponse<ModuleResponse>>> =>
    apiClient.get<ApiListResponse<ModuleResponse>>('/[modules]', {
      headers: { 'x-page': String(page), 'x-limit': String(limit) },
    }),

  getById: (id: string): Promise<ApiResponse<ModuleResponse>> =>
    apiClient.get<ModuleResponse>(`/[modules]/${id}`),

  update: (id: string, body: ModuleUpdateRequest): Promise<ApiResponse<ModuleResponse>> =>
    apiClient.put<ModuleResponse>(`/[modules]/${id}`, body),

  delete: (id: string): Promise<ApiResponse<null>> =>
    apiClient.delete<null>(`/[modules]/${id}`),

  // Add domain-specific methods as needed
};
```

### Step 3: Export API Module
**File:** `/src/lib/api/index.ts`

Add to exports:
```typescript
export { [module]Api } from "./[module]-api";
```

### Step 4: Create Pages
- **List:** `/src/app/(dashboard)/[module]/page.tsx` - Use materials list as template
- **Detail:** `/src/app/(dashboard)/[module]/[id]/page.tsx` - Use detail page pattern
- **Create:** `/src/app/(dashboard)/[module]/new/page.tsx` - Use form pattern
- **Edit:** `/src/app/(dashboard)/[module]/[id]/edit/page.tsx` - Use form pattern

---

## File Structure

```
src/
├── types/
│   ├── common.ts         ✅ Base types, enums, interfaces
│   ├── api.ts           ✅ ApiResponse, ApiError
│   ├── auth.ts          ✅ Auth types
│   ├── project.ts       ✅ Project types
│   ├── contract.ts      ✅ Contract types
│   ├── material.ts      ✅ Material types
│   ├── worker.ts        ✅ Worker types
│   ├── machine.ts       ⏳ TODO
│   ├── finance.ts       ⏳ TODO
│   ├── approval.ts      ⏳ TODO
│   ├── document.ts      ⏳ TODO
│   ├── boq.ts           ✅ BOQ types (stub)
│   └── ... (30+ more)
│
├── lib/
│   ├── api/
│   │   ├── api-client.ts      ✅ Base HTTP client
│   │   ├── auth-api.ts        ✅ Auth endpoints
│   │   ├── project-api.ts     ✅ Project CRUD
│   │   ├── contract-api.ts    ✅ Contract CRUD
│   │   ├── material-api.ts    ✅ Material CRUD
│   │   ├── worker-api.ts      ✅ Worker CRUD
│   │   ├── machine-api.ts     ⏳ TODO
│   │   ├── finance-api.ts     ⏳ TODO
│   │   ├── approval-api.ts    ⏳ TODO
│   │   └── ... (20+ more)
│   │
│   ├── auth/
│   │   ├── auth.ts            ✅ Auth service
│   │   └── token.ts           ✅ Token storage
│   │
│   └── utils/
│       ├── validation.ts      ✅ Form validation
│       └── ... (other utils)
│
├── hooks/
│   ├── useApi.ts              ✅ Fetch hook
│   ├── useForm.ts             ✅ Form state
│   ├── useTable.ts            ✅ Table state
│   ├── usePagination.ts       ✅ Pagination
│   ├── useToast.ts            ✅ Toast notifications
│   ├── useAuth.ts             ✅ Auth context
│   └── ...
│
├── components/
│   ├── ui/
│   │   ├── form.tsx           ✅ Form components
│   │   ├── card.tsx           ✅ Card component
│   │   ├── modal.tsx          ⏳ TODO
│   │   └── ...
│   │
│   ├── common/
│   │   ├── error-boundary.tsx ✅ Error handling
│   │   ├── toast-provider.tsx ✅ Toast system
│   │   ├── module-page.tsx    ✅ Placeholder
│   │   ├── header.tsx         ✅ Navigation
│   │   ├── sidebar.tsx        ✅ Menu
│   │   └── ...
│   │
│   └── ...
│
└── app/
    ├── (auth)/
    │   ├── login/page.tsx          ✅ Login
    │   ├── register/page.tsx       ✅ Signup
    │   ├── forgot-password/        ✅ Forgot PW
    │   └── ...
    │
    └── (dashboard)/
        ├── dashboard/page.tsx      ✅ Main dashboard
        ├── materials/
        │   ├── page.tsx            ✅ List (implemented)
        │   ├── new/page.tsx        ⏳ TODO
        │   ├── [id]/
        │   │   ├── page.tsx        ⏳ TODO
        │   │   └── edit/page.tsx   ⏳ TODO
        │
        ├── projects/               ⏳ TODO (5 pages)
        ├── contracts/              ⏳ TODO (4 pages)
        ├── workers/                ⏳ TODO (5 pages)
        ├── machines/               ⏳ TODO (4 pages)
        ├── approvals/              ⏳ TODO (3 pages)
        ├── payments/               ⏳ TODO (3 pages)
        ├── documents/              ⏳ TODO (4 pages)
        ├── reports/                ⏳ TODO (3 pages)
        └── ... (50+ more)
```

---

## Key Hooks Usage Guide

### useApi
```typescript
const { data, loading, error, refetch } = useApi(
  () => api.list(),
  {
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error),
    skip: false, // Set true to skip the initial call
  }
);

// Refetch
await refetch();
```

### useForm
```typescript
const form = useForm({
  defaultValues: { name: '', email: '' },
  validationSchema: {
    name: [{ type: 'required', message: 'Name required' }],
    email: [
      { type: 'required', message: 'Email required' },
      { type: 'email', message: 'Invalid email' },
    ],
  },
  onSubmit: async (values) => {
    await api.create(values);
  },
});

// In JSX
<input {...form.register('name')} />
{form.errors.name && <span>{form.errors.name}</span>}
<button onClick={form.handleSubmit}>Submit</button>
```

### useTable
```typescript
const table = useTable<Item>({
  onSortChange: (sort) => {},
  onFilterChange: (filters) => {},
});

// In JSX
<button onClick={() => table.sort('name')}>Name</button>
{table.isRowSelected(item.id) && <span>Selected</span>}
```

### usePagination
```typescript
const pagination = usePagination({
  initialPage: 1,
  initialLimit: 20,
});

// In JSX
Page {pagination.page} of {pagination.totalPages}
<button onClick={pagination.nextPage} disabled={!pagination.hasNextPage}>
  Next
</button>
```

### useToast
```typescript
const toast = useToast();

toast.success('Operation successful');
toast.error('Something went wrong');
toast.info('Information message');
toast.warning('Warning message');
```

---

## Common Error Handling Patterns

### API Error Response
```typescript
try {
  await api.create(data);
  toast.success('Created');
} catch (error) {
  const err = error as ApiError;
  
  // Handle specific status codes
  if (err.status === 409) {
    toast.error('This item already exists');
  } else if (err.status === 401) {
    // Redirect to login
    router.push('/login');
  } else {
    toast.error(err.message || 'An error occurred');
  }
}
```

### Form Submission Error
```typescript
const form = useForm({
  onSubmit: async (values) => {
    try {
      await api.create(values);
    } catch (error) {
      const err = error as ApiError;
      
      // Server returned field-specific errors
      if (err.errors) {
        Object.entries(err.errors).forEach(([field, msg]) => {
          form.setFieldError(field as keyof typeof values, msg);
        });
      } else {
        form.setFormError(err.message);
      }
    }
  },
});
```

---

## Environment Setup

### Required ENV Variables
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

### Start Development Server
```bash
cd Nextenti-Frontend
npm install
npm run dev
```

Navigate to `http://localhost:3000`

---

## Next Steps (Phase 3-6)

### Phase 3: Complete All Types & APIs (15 modules)
- Create types for: Machine, Fuel, Equipment, Finance, Approvals, Documents, etc.
- Create API clients for each module
- Update `/src/lib/api/index.ts` to export all

### Phase 4: Implement Page Templates (70+ pages)
- Projects (5 pages): list, detail, edit, create, health dashboard
- Contracts (4 pages): list, detail, edit, create
- Workers (5 pages): list, detail, edit, create, attendance
- Materials (4 pages): list, detail, edit, create (1 already done)
- Machines (4 pages): list, detail, edit, create
- Finance (10+ pages): payments, expenses, budget, payroll, etc.
- Approvals (3 pages): inbox, workflow, dashboard
- Reports (5+ pages): report list, builder, templates, export

### Phase 5: Advanced Features
- Search across all modules
- Advanced filtering (date range, multi-select, etc.)
- Bulk actions (delete, status change, export)
- Data export (CSV, PDF, Excel)
- Real-time notifications
- Activity logs and audit trails

### Phase 6: Testing & Polish
- Unit tests for hooks
- Integration tests for pages
- E2E tests for critical flows
- Performance optimization
- Mobile responsiveness verification
- Accessibility audit

---

## Code Quality Checklist

- [ ] All components use TypeScript (no `any`)
- [ ] All forms have proper validation
- [ ] All API calls have error handling
- [ ] All pages have loading/error/empty states
- [ ] All pages are responsive (mobile-first)
- [ ] All toast notifications work
- [ ] All forms have proper success/error feedback
- [ ] All data is from real APIs (no mocks)
- [ ] No console errors or warnings
- [ ] Code follows naming conventions
- [ ] No unused imports or variables

---

## Troubleshooting

### Common Issues

**"Cannot find module '@/types/X'"**
- Ensure the type file exists in `/src/types/`
- Check the import path spelling

**"API returns 401 Unauthorized"**
- Token may have expired; check token refresh logic in `api-client.ts`
- Check that token is stored correctly in localStorage
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct in `.env.local`

**"Form validation not working"**
- Ensure validation schema is passed to `useForm`
- Check that rule types match available validators in `validation.ts`
- Verify error is displayed in the form via `form.errors`

**"Pagination not working"**
- Check that API returns `pagination` metadata
- Verify pagination hook is receiving metadata via `setMeta`
- Ensure page/limit parameters are sent to API

---

## Support & References

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Last Updated:** 2025-09-03
**Status:** Phase 0-1 Complete, Phase 2 In Progress
**Estimated Completion:** 6-9 weeks (44-62 working days)
