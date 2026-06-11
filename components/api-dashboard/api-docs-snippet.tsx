export function ApiDocsSnippet() {
  return (
    <div className="api-dashboard-card rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#111111] p-5 sm:p-6">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8a8a8a]">Quick example</p>
      <pre className="mt-4 overflow-x-auto rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0a0a0a] p-4 font-mono text-xs leading-6 text-[#d4d4d4]">
        <code>{`POST /v1/launch-pack

{
  "productName": "TeraAI",
  "description": "AI learning companion for students and builders",
  "launchGoal": "announce product launch",
  "style": "clean startup launch graphic"
}`}</code>
      </pre>
      <p className="mt-3 text-xs leading-5 text-[#8a8a8a]">
        Docs-only example. Production routes use{" "}
        <span className="font-mono text-[#a1a1a1]">/api/v1/projects</span> and generation endpoints today.
      </p>
    </div>
  );
}