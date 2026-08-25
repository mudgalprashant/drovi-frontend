import { ApiError } from "@/lib/api/client";

/**
 * How a failure is shown.
 *
 * <p>The correlation id is the point. The backend stamps one on every error and logs under it,
 * so quoting it turns "it broke this morning" into one query. Hiding it costs a support
 * conversation nothing but time.
 */
export function ErrorNotice({ error }: { error: unknown }) {
  if (!error) {
    return null;
  }
  const apiError = error instanceof ApiError ? error : null;
  return (
    <div className="error">
      <div>{apiError ? apiError.message : String(error)}</div>
      {apiError?.correlationId && (
        <div className="muted" style={{ color: "inherit", marginTop: 6 }}>
          Reference: <code>{apiError.correlationId}</code>
        </div>
      )}
    </div>
  );
}
