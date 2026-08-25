"use client";

import { useState } from "react";
import type { Project } from "@/lib/api/types";

/**
 * The artifact the user came for.
 *
 * <p>Treated as the hero element, and shown with what it is <em>for</em> — the promise is that
 * pasting it over a production URL changes nothing else, and a bare string does not say that.
 *
 * <p>It is `{host}/s/{projectId}`: the project's own id, not a separate key.
 */
export function BaseUrl({ project }: { project: Project }) {
  const [copied, setCopied] = useState(false);
  const serving = project.status === "READY";

  return (
    <div className="panel">
      <div className="spread">
        <strong>Base URL</strong>
        <StatusBadge status={project.status} />
      </div>
      <p className="mono" style={{ wordBreak: "break-all", margin: "10px 0" }}>
        {project.baseUrl}
      </p>
      <div className="row">
        <button
          onClick={() => {
            void navigator.clipboard.writeText(project.baseUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <span className="muted">
          {serving
            ? "Paste this over the production URL in your app. Nothing else changes."
            : "This will answer once the sandbox is ready."}
        </span>
      </div>
      {project.authMode !== "NONE" && serving && (
        <p className="muted">
          It authenticates like the real product ({project.authMode}), so your app's auth path is
          exercised too. Issue a key in settings.
        </p>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: Project["status"] }) {
  const tone =
    status === "READY" ? "ready" : status === "GENERATING" ? "generating" : status === "FAILED" ? "failed" : "";
  return <span className={`badge ${tone}`}>{status}</span>;
}
