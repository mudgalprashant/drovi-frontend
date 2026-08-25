"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";
import type {
  Clarification,
  GenerationJob,
  GenerationProgress,
  GenerationStarted,
  Project,
} from "@/lib/api/types";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Shell } from "@/components/Shell";
import { BaseUrl } from "@/components/BaseUrl";
import { ErrorNotice } from "@/components/ErrorNotice";
import { Questions } from "@/components/Questions";

export default function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  return (
    <Shell>
      <ProjectView projectId={projectId} />
    </Shell>
  );
}

/** How often to ask while something is happening. Nothing polls while the project is idle. */
const POLL_MS = 4000;

function ProjectView({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [questions, setQuestions] = useState<Clarification[]>([]);
  const [error, setError] = useState<unknown>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    try {
      const [p, pr, js, qs] = await Promise.all([
        api.get<Project>(`/api/v1/projects/${projectId}`),
        api.get<GenerationProgress>(`/api/v1/projects/${projectId}/generations/progress`),
        api.get<GenerationJob[]>(`/api/v1/projects/${projectId}/generations`),
        api.get<Clarification[]>(`/api/v1/projects/${projectId}/clarifications`),
      ]);
      setProject(p);
      setProgress(pr);
      setJobs(js);
      setQuestions(qs);
      return { project: p, progress: pr };
    } catch (cause) {
      setError(cause);
      return null;
    }
  }, [projectId]);

  // Poll only while something is actually running. A project sitting READY does not need to be
  // asked about every four seconds, and a build waiting on a question is not running either —
  // the clock has stopped and the next event is the user's click, which reloads directly.
  useEffect(() => {
    if (!user) {
      return;
    }
    let cancelled = false;

    const tick = async () => {
      const state = await load();
      if (cancelled || !state) {
        return;
      }
      const busy = state.project.status === "GENERATING" && !state.progress.waitingForYou;
      if (busy) {
        timer.current = setTimeout(() => void tick(), POLL_MS);
      }
    };
    void tick();

    return () => {
      cancelled = true;
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [user, load]);

  if (!project) {
    return <ErrorNotice error={error} />;
  }

  const building = project.status === "GENERATING";

  return (
    <>
      <ErrorNotice error={error} />

      <h2 style={{ marginTop: 24 }}>{project.name}</h2>
      <p className="muted">imitating {project.sourceProduct}</p>

      <BaseUrl project={project} />

      {building && progress && <Progress progress={progress} />}

      {questions.length > 0 && (
        <Questions projectId={projectId} clarifications={questions} onAnswered={() => void load()} />
      )}

      {project.status === "DRAFT" || project.status === "FAILED" ? (
        <Describe projectId={projectId} project={project} onStarted={() => void load()} />
      ) : null}

      {project.status === "READY" && <Revise projectId={projectId} onDone={() => void load()} />}

      {jobs.length > 0 && <Steps jobs={jobs} />}
    </>
  );
}

/**
 * A stated wait, not a spinner.
 *
 * <p>The backend returns seconds and a sentence, so "about 3 minutes" is available — and when it
 * is waiting on the user there is deliberately no estimate, because the clock is not running and
 * counting down to nothing is worse than not counting.
 */
function Progress({ progress }: { progress: GenerationProgress }) {
  return (
    <div className="panel">
      <strong>{progress.message}</strong>
      {!progress.waitingForYou && progress.stepsRemaining > 0 && (
        <p className="muted">{progress.stepsRemaining} steps left.</p>
      )}
    </div>
  );
}

/** Describe it, paste its spec, or link to it — the three inputs the backend accepts. */
function Describe({
  projectId,
  project,
  onStarted,
}: {
  projectId: string;
  project: Project;
  onStarted: () => void;
}) {
  const [docs, setDocs] = useState("");
  const [docsUrl, setDocsUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const hasSource = docs.trim().length > 0 || docsUrl.trim().length > 0;

  return (
    <>
      <h2>{project.status === "FAILED" ? "Try again" : "Build it"}</h2>
      <div className="panel">
        <ErrorNotice error={error} />

        <label htmlFor="docs">Its documentation, an OpenAPI file, or a Postman collection</label>
        <textarea
          id="docs"
          value={docs}
          placeholder="Paste it here — a spec is read directly and gives a noticeably more accurate sandbox."
          onChange={(event) => setDocs(event.target.value)}
        />

        <label htmlFor="docsUrl">…or a link to it</label>
        <input
          id="docsUrl"
          value={docsUrl}
          placeholder="https://api.example.com or https://example.com/openapi.json"
          onChange={(event) => setDocsUrl(event.target.value)}
        />

        <div className="row" style={{ marginTop: 14 }}>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                await api.post<GenerationStarted>(`/api/v1/projects/${projectId}/generations`, {
                  product: project.sourceProduct,
                  docs: docs.trim() || undefined,
                  docsUrl: docsUrl.trim() || undefined,
                  // The opt-in that keeps "recommended" from being decorative: without docs,
                  // this has to be a choice rather than a silent fallback (ADR-0010).
                  agentResearchOnly: !hasSource,
                });
                onStarted();
              } catch (cause) {
                setError(cause);
              } finally {
                setBusy(false);
              }
            }}
          >
            {hasSource ? "Build from this" : "Research it for me"}
          </button>
          {!hasSource && (
            <span className="muted">
              We&apos;ll work from what the model knows about {project.sourceProduct}. Supplying
              docs is more accurate.
            </span>
          )}
        </div>
      </div>
    </>
  );
}

/** Changing a sandbox that already works, in words. */
function Revise({ projectId, onDone }: { projectId: string; onDone: () => void }) {
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);

  return (
    <>
      <h2>Change the data</h2>
      <div className="panel">
        <ErrorNotice error={error} />
        <div className="row">
          <input
            value={instruction}
            disabled={busy}
            placeholder="make five customers' cards blocked"
            onChange={(event) => setInstruction(event.target.value)}
          />
          <button
            disabled={busy || instruction.trim().length === 0}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                await api.post(`/api/v1/projects/${projectId}/revisions`, {
                  instruction: instruction.trim(),
                });
                setSent(instruction.trim());
                setInstruction("");
                onDone();
              } catch (cause) {
                setError(cause);
              } finally {
                setBusy(false);
              }
            }}
          >
            Ask
          </button>
        </div>
        {sent && (
          <p className="muted">
            Working on “{sent}”. Your sandbox keeps serving while it changes — and if anything is
            ambiguous, it will ask rather than guess.
          </p>
        )}
      </div>
    </>
  );
}

/**
 * What happened, per step.
 *
 * <p>Error messages here are safe to show: the backend never puts a model provider's text in one,
 * so what a user reads is always ours.
 */
function Steps({ jobs }: { jobs: GenerationJob[] }) {
  return (
    <>
      <h2>Steps</h2>
      {jobs.map((job) => (
        <div className="panel" key={job.id}>
          <div className="spread">
            <span>
              <strong>{job.kind}</strong>
              {job.attempt > 1 && <span className="muted"> · attempt {job.attempt}</span>}
            </span>
            <span className={`badge ${job.status === "SUCCEEDED" ? "ready" : job.status === "FAILED" ? "failed" : ""}`}>
              {job.status}
            </span>
          </div>
          {job.errorMessage && <p className="muted">{job.errorMessage}</p>}
        </div>
      ))}
    </>
  );
}
