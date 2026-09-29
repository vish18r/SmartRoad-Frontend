"use client";
import { useEffect, useState } from "react";
import { organizationsApi } from "@/lib/api/organizations-api";
import type { OrganizationResponse, OrganizationCreateRequest } from "@/types/organization";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<OrganizationCreateRequest>({ name: "" });
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<OrganizationCreateRequest>({ name: "" });
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const data = await organizationsApi.list();
        setOrganizations(data);
        setError(null);
      } catch (err) {
        setError((err as any).message || "Failed to load organizations");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const newOrg = await organizationsApi.create(formData);
      setOrganizations([...organizations, newOrg]);
      setFormData({ name: "" });
      setShowCreateForm(false);
    } catch (err) {
      setError((err as any).message || "Failed to create organization");
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (org: OrganizationResponse) => {
    setEditingId(org.id);
    setEditData({
      name: org.name,
      legalName: org.legalName,
      gstNumber: org.gstNumber,
      email: org.email,
      phoneNumber: org.phoneNumber,
      address: org.address,
    });
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      setCreating(true);
      const updated = await organizationsApi.update(editingId, editData);
      setOrganizations(organizations.map(org => org.id === editingId ? updated : org));
      setEditingId(null);
      setEditData({ name: "" });
    } catch (err) {
      setError((err as any).message || "Failed to update organization");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteOrganization = async (id: string) => {
    if (!confirm("Are you sure you want to delete this organization?")) return;
    try {
      setDeleting(id);
      await organizationsApi.delete(id);
      setOrganizations(organizations.filter(org => org.id !== id));
    } catch (err) {
      setError((err as any).message || "Failed to delete organization");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="p-8">Loading organizations...</div>;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-slate-600">Switch between contractor companies and manage organization profile, members, GST details, and settings.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          {showCreateForm ? "Cancel" : "+ New Organization"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={handleCreateOrganization} className="mb-8 rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Create New Organization</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700">Organization Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="e.g., Site Dash Test Org"
            />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Legal Name</label>
              <input
                type="text"
                value={formData.legalName || ""}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">GST Number</label>
              <input
                type="text"
                value={formData.gstNumber || ""}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber || ""}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700">Address</label>
            <input
              type="text"
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Organization"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {organizations.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="font-semibold text-slate-900">No organizations yet</p>
          <p className="text-sm text-slate-600">Create your first organization to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <div key={org.id} className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">{org.name}</h3>
              <p className="text-sm text-slate-600">{org.legalName || org.address || "No details"}</p>
              {org.gstNumber && <p className="text-xs text-slate-500">GST: {org.gstNumber}</p>}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEditClick(org)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button className="text-sm text-blue-600 hover:underline">Members</button>
                <button
                  onClick={() => handleDeleteOrganization(org.id)}
                  disabled={deleting === org.id}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  {deleting === org.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <form onSubmit={handleUpdateOrganization} className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Edit Organization</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700">Organization Name *</label>
              <input
                type="text"
                required
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700">Legal Name</label>
              <input
                type="text"
                value={editData.legalName || ""}
                onChange={(e) => setEditData({ ...editData, legalName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700">GST Number</label>
              <input
                type="text"
                value={editData.gstNumber || ""}
                onChange={(e) => setEditData({ ...editData, gstNumber: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={editData.email || ""}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700">Phone Number</label>
              <input
                type="tel"
                value={editData.phoneNumber || ""}
                onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700">Address</label>
              <input
                type="text"
                value={editData.address || ""}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
