import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EditorActions } from "../../../src/components/islands/word-editor.jsx";
import {
  $forkSyncStatus,
  $isWordSubmitLoading,
  $isWordSubmitted,
  $wordEditor,
} from "../../../src/lib/stores/dictionary.js";

describe("EditorActions", () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    $forkSyncStatus.set("checking");
    $isWordSubmitLoading.set(false);
    $isWordSubmitted.set(false);
    $wordEditor.set({
      title: "Valid term",
      content: "An updated definition.",
      initialContent: "Original definition.",
      inititalContent: "Original definition.",
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  async function renderActions(fetchImplementation) {
    vi.stubGlobal("fetch", vi.fn(fetchImplementation));
    await act(async () => {
      root.render(<EditorActions />);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }

  it("shows a green current status and enables submission", async () => {
    await renderActions(() =>
      Promise.resolve({ ok: true, json: async () => ({ status: "current" }) }),
    );

    expect(container.textContent).toContain("All set!");
    expect(
      container.querySelector('[aria-label="Fork is up to date"]'),
    ).toBeInTheDocument();
    expect(container.querySelector('button[type="submit"]').disabled).toBe(
      false,
    );
  });

  it.each([
    ["blank title", { title: "" }],
    ["whitespace-only title", { title: "   " }],
    ["blank content", { content: "" }],
    ["whitespace-only content", { content: "  \n  " }],
    ["unchanged content", { content: "Original definition." }],
  ])("disables submission for %s", async (_caseName, changes) => {
    $wordEditor.set({
      ...$wordEditor.get(),
      ...changes,
      initialContent: "Original definition.",
      inititalContent: "Original definition.",
    });

    await renderActions(() =>
      Promise.resolve({ ok: true, json: async () => ({ status: "current" }) }),
    );

    expect(container.querySelector('button[type="submit"]').disabled).toBe(
      true,
    );
  });

  it("updates submit readiness as content changes", async () => {
    await renderActions(() =>
      Promise.resolve({ ok: true, json: async () => ({ status: "current" }) }),
    );

    const submitButton = container.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(false);

    await act(async () => {
      $wordEditor.setKey("content", "Original definition.");
    });
    expect(submitButton.disabled).toBe(true);

    await act(async () => {
      $wordEditor.setKey("content", "A replacement definition.");
    });
    expect(submitButton.disabled).toBe(false);
  });

  it("shows a spinning status icon while checking the fork", async () => {
    await renderActions(() => new Promise(() => {}));

    const status = container.querySelector(
      '[role="status"][aria-label="Checking fork status"]',
    );
    expect(status).toBeInTheDocument();
    expect(status.querySelector("svg.animate-spin")).toBeInTheDocument();
    expect(container.querySelector('button[type="submit"]').disabled).toBe(
      true,
    );
  });

  it("requires an explicit update before submission when stale", async () => {
    await renderActions((_url, options) =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          status: options?.method === "POST" ? "current" : "out-of-date",
        }),
      }),
    );

    expect(container.textContent).toContain("Out of date");
    expect(container.querySelector('button[type="submit"]').disabled).toBe(
      true,
    );

    await act(async () => {
      container.querySelector('button[type="button"]').click();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.textContent).toContain("All set!");
    expect(
      container.querySelector('[aria-label="Fork is up to date"]'),
    ).toBeInTheDocument();
    expect(container.querySelector('button[type="submit"]').disabled).toBe(
      false,
    );
  });

  it("shows the spinning status icon while updating a stale fork", async () => {
    let finishSync;
    await renderActions((_url, options) => {
      if (options?.method === "POST") {
        return new Promise((resolve) => {
          finishSync = resolve;
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({ status: "out-of-date" }),
      });
    });

    await act(async () => {
      container.querySelector('button[type="button"]').click();
      await Promise.resolve();
    });

    const status = container.querySelector(
      '[role="status"][aria-label="Updating fork"]',
    );
    expect(status).toBeInTheDocument();
    expect(status.querySelector("svg.animate-spin")).toBeInTheDocument();
    expect(container.querySelector('button[type="submit"]').disabled).toBe(
      true,
    );

    await act(async () => {
      finishSync({ ok: true, json: async () => ({ status: "current" }) });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.querySelector('button[type="submit"]').disabled).toBe(
      false,
    );
  });

  it("keeps first-time submission available when no fork exists", async () => {
    await renderActions(() =>
      Promise.resolve({ ok: true, json: async () => ({ status: "missing" }) }),
    );

    expect(container.textContent).toContain("All set!");
    expect(
      container.querySelector(
        '[aria-label="Fork created on first submission"]',
      ),
    ).toBeInTheDocument();
    expect(container.querySelector("span[title]").title).toBe(
      "Fork will be created on first submission",
    );
    expect(container.querySelector('button[type="submit"]').disabled).toBe(
      false,
    );
  });

  it("allows submission after a status check error and offers retry", async () => {
    await renderActions(() => Promise.reject(new Error("Network unavailable")));

    expect(container.textContent).toContain("Network unavailable");
    expect(container.querySelector('button[type="button"]').textContent).toBe(
      "Retry",
    );
    expect(container.querySelector('button[type="submit"]').disabled).toBe(
      false,
    );
  });
});
