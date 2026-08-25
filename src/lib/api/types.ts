/**
 * The console API's payloads.
 *
 * ⚠️ HAND-WRITTEN, and that is a deviation. The tech-stack doc says these are generated from an
 * OpenAPI document; the backend does not publish one yet, so they are not. The consequence is
 * real: this file can drift from the server and nothing will catch it.
 *
 * Until a document exists, `drovi-backend/docs/03-api/console-api.md` is the source of truth.
 * Change a type only against it, and keep every API shape here — one place paying the cost of
 * drift is bad enough without each component paying it too.
 */

/** Whether a project's sandbox is worth calling. Not inferable from its job list. */
export type ProjectStatus = "DRAFT" | "GENERATING" | "READY" | "FAILED" | "ARCHIVED";

/** How the replica authenticates ITS callers, mirroring the product it imitates. */
export type AuthMode = "NONE" | "BEARER" | "HEADER_KEY" | "BASIC";

export interface Project {
  id: string;
  /** The artifact the user came for: `{host}/s/{id}`. There is no separate project key. */
  baseUrl: string;
  name: string;
  sourceProduct: string;
  sourceDocsUrl: string | null;
  status: ProjectStatus;
  authMode: AuthMode;
  authHeaderName: string | null;
  latencyMs: number;
  createdAt: string;
}

export interface Entitlements {
  planCode: string;
  displayName: string;
  maxProjects: number;
  maxEndpointsPerProject: number;
  maxRecordsPerProject: number;
  maxStoredBytesPerProject: number;
}

export interface Account {
  accountId: string;
  email: string | null;
  planCode: string;
}

export interface StartGenerationRequest {
  product?: string;
  /** A pasted spec, a Postman collection, or plain documentation. */
  docs?: string;
  /** A link — to a spec, or to an API whose spec is discoverable. */
  docsUrl?: string;
  /**
   * Required when no docs are supplied. Absent and false mean the same thing, and the job
   * fails asking for one or the other — documentation is recommended, never mandatory, and
   * the opt-in is what keeps that from being decorative (ADR-0010).
   */
  agentResearchOnly?: boolean;
}

export interface GenerationStarted {
  jobId: string;
  status: string;
  estimatedSeconds: number | null;
  message: string;
}

/**
 * How much longer — or that the clock has stopped.
 *
 * `waitingForYou` carries no estimate on purpose: nothing is happening until a question is
 * answered, and a countdown to nothing is worse than no countdown.
 */
export interface GenerationProgress {
  waitingForYou: boolean;
  openQuestions: number;
  stepsRemaining: number;
  estimatedSeconds: number | null;
  message: string;
}

export type JobKind = "RESEARCH" | "SPEC" | "SEED" | "REVISE";
export type JobStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";

export interface GenerationJob {
  id: string;
  kind: JobKind;
  status: JobStatus;
  attempt: number;
  errorCode: string | null;
  /** Always ours, never the model provider's. Safe to show. */
  errorMessage: string | null;
  createdAt: string | null;
  finishedAt: string | null;
}

export interface ClarificationOption {
  id: string;
  label: string;
  detail: string | null;
}

/**
 * A doubt the system had rather than guessed at.
 *
 * Kept after answering, deliberately: "we assumed status = BLOCKED because you did not say" is
 * something a user needs to find weeks later, so the console must show resolved ones too.
 */
export interface Clarification {
  id: string;
  question: string;
  detail: string | null;
  subject: Record<string, unknown>;
  options: ClarificationOption[];
  /** False only where a guess would make the sandbox confidently wrong about the request. */
  allowsAssumption: boolean;
  status: "OPEN" | "ANSWERED" | "ASSUMED";
  answer: string | null;
  createdAt: string | null;
  answeredAt: string | null;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    /** What makes a support conversation short. Surface it. */
    correlationId?: string;
  };
}
