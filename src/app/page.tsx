"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api/client";
import type { Entitlements, Project } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Shell } from "@/components/Shell";
import { StatusBadge } from "@/components/BaseUrl";
import { ErrorNotice } from "@/components/ErrorNotice";

export default function ProjectsPage() {
  return (
    <Shell>
      <Projects />
    </Shell>
  );
}

function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [plan, setPlan] = useState<Entitlements | null>(null);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    try {
      const [list, entitlements] = await Promise.all([
        api.get<Project[]>("/api/v1/projects"),
        api.get<Entitlements>("/api/v1/me/entitlements"),
      ]);
      setProjects(list);
      setPlan(entitlements);
    } catch (cause) {
      setError(cause);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void load();
    }
  }, [user, load]);

  return (
    <>
      <ErrorNotice error={error} />

      <div className="spread">
        <h2 style={{ margin: "24px 0 0" }}>Your sandboxes</h2>
        {plan && (
          // Read from the server, never computed here. Entitlements are the server's and a
          // client that decides its own limit is a client that can be edited.
          <span className="muted">
            {projects?.length ?? 0} of {plan.maxProjects} on {plan.displayName}
          </span>
        )}
      </div>

      {projects?.length === 0 && (
        <p className="muted">Nothing yet. Create one below and describe what it should imitate.</p>
      )}

      {projects?.map((project) => (
        <a
          key={project.id}
          href={`/project?id=${project.id}`}
          className="panel"
          style={{ display: "block", textDecoration: "none", color: "inherit" }}
        >
          <div className="spread">
            <strong>{project.name}</strong>
            <StatusBadge status={project.status} />
          </div>
          <div className="muted">imitating {project.sourceProduct}</div>
          <div className="mono muted" style={{ marginTop: 6, wordBreak: "break-all" }}>
            {project.baseUrl}
          </div>
        </a>
      ))}

      <CreateProject
        atLimit={Boolean(plan && projects && projects.length >= plan.maxProjects)}
        onCreated={load}
      />
    </>
  );
}

function CreateProject({ atLimit, onCreated }: { atLimit: boolean; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [sourceProduct, setSourceProduct] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  return (
    <>
      <h2>New sandbox</h2>
      <div className="panel">
        <ErrorNotice error={error} />

        <label htmlFor="name">What to call it</label>
        <input
          id="name"
          value={name}
          placeholder="Payment tests"
          onChange={(event) => setName(event.target.value)}
        />

        <label htmlFor="product">What it imitates</label>
        <input
          id="product"
          value={sourceProduct}
          placeholder="Stripe's card API"
          onChange={(event) => setSourceProduct(event.target.value)}
        />

        <div className="row" style={{ marginTop: 14 }}>
          <button
            disabled={busy || atLimit || !name.trim() || !sourceProduct.trim()}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                // authMode is left to the server. Generation sets it from the imitated product,
                // because a replica that waves everything through never exercises the caller's
                // own auth path.
                await api.post<Project>("/api/v1/projects", {
                  name: name.trim(),
                  sourceProduct: sourceProduct.trim(),
                });
                setName("");
                setSourceProduct("");
                onCreated();
              } catch (cause) {
                setError(cause);
              } finally {
                setBusy(false);
              }
            }}
          >
            Create
          </button>
          {atLimit && (
            <span className="muted">
              Your plan is full. Archive one, or upgrade — the limit is the server&apos;s.
            </span>
          )}
        </div>
      </div>
    </>
  );
}
