"use client";

import { useState } from "react";
import { api } from "@/lib/api/client";
import type { Clarification } from "@/lib/api/types";
import { ErrorNotice } from "./ErrorNotice";

/**
 * The questions a generation stopped to ask.
 *
 * <p><strong>The moment most likely to be got wrong.</strong> Generation does not guess when a
 * request is ambiguous — it stops, and nothing happens until the question is answered. So an
 * open question is the primary thing on the page, not a badge somewhere: a build that is waiting
 * and does not say so is a build that appears hung.
 *
 * <p>"You decide" is a real button rather than a link, because for most doubts a plausible
 * assumption beats a blocked build and a user who does not care should not be made to care.
 * What was assumed is shown afterwards — an assumption nobody can look up later is
 * indistinguishable from a bug, which is why answered questions are kept forever.
 */
export function Questions({
  projectId,
  clarifications,
  onAnswered,
}: {
  projectId: string;
  clarifications: Clarification[];
  onAnswered: () => void;
}) {
  const open = clarifications.filter((c) => c.status === "OPEN");
  const settled = clarifications.filter((c) => c.status !== "OPEN");

  return (
    <>
      {open.length > 0 && (
        <>
          <h2>
            {open.length === 1 ? "One question before this can finish" : `${open.length} questions before this can finish`}
          </h2>
          {open.map((question) => (
            <OpenQuestion
              key={question.id}
              projectId={projectId}
              question={question}
              onAnswered={onAnswered}
            />
          ))}
        </>
      )}

      {settled.length > 0 && (
        <>
          <h2>Already settled</h2>
          {settled.map((question) => (
            <div className="panel" key={question.id}>
              <div className="spread">
                <span>{question.question}</span>
                <span className="badge">{question.status === "ASSUMED" ? "we decided" : "you decided"}</span>
              </div>
              <p className="muted">{question.answer}</p>
            </div>
          ))}
        </>
      )}
    </>
  );
}

function OpenQuestion({
  projectId,
  question,
  onAnswered,
}: {
  projectId: string;
  question: Clarification;
  onAnswered: () => void;
}) {
  const [freeText, setFreeText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const base = `/api/v1/projects/${projectId}/clarifications/${question.id}`;

  async function send(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      // Answering the LAST open question resumes the build, so the page has to move on by
      // itself rather than wait for someone to refresh.
      onAnswered();
    } catch (cause) {
      setError(cause);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <strong>{question.question}</strong>
      {question.detail && <p className="muted">{question.detail}</p>}

      <ErrorNotice error={error} />

      <div className="row" style={{ marginTop: 10 }}>
        {question.options.map((option) => (
          <button
            key={option.id}
            disabled={busy}
            title={option.detail ?? undefined}
            onClick={() => void send(() => api.post(`${base}/answer`, { optionId: option.id }))}
          >
            {option.label}
          </button>
        ))}
        {question.allowsAssumption && (
          <button
            className="secondary"
            disabled={busy}
            onClick={() => void send(() => api.post(`${base}/assume`))}
          >
            You decide
          </button>
        )}
      </div>

      <label htmlFor={`free-${question.id}`}>Or answer in your own words</label>
      <div className="row">
        <input
          id={`free-${question.id}`}
          value={freeText}
          disabled={busy}
          placeholder="neither — use state = FROZEN"
          onChange={(event) => setFreeText(event.target.value)}
        />
        <button
          className="secondary"
          disabled={busy || freeText.trim().length === 0}
          onClick={() => void send(() => api.post(`${base}/answer`, { answer: freeText.trim() }))}
        >
          Send
        </button>
      </div>
    </div>
  );
}
