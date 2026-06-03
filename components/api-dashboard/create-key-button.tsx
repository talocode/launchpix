"use client";

export function CreateKeyButton() {
  return (
    <button
      type="button"
      disabled
      title="Per-user API key management is coming soon. Contact support for a service key."
      className="rounded-lg bg-[#f5f5f5] px-4 py-2 text-sm font-medium text-[#050505] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Create key
    </button>
  );
}