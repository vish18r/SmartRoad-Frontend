"use client";
import { EmptyState } from "@/components/common/states";
export default function CommentsPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Project communication</h1>
        <p className="mt-1 text-sm text-slate-500">Prepare discussions, replies, mentions, and attachments for projects, progress, issues, expenses, and materials.</p>
      </div>
      <div className="mt-6">
        <EmptyState title="No comments yet" description="Comments and replies, @mentions, image and document attachments" />
      </div>
    </>
  );
}
