"use client";

import { useRef } from "react";

export default function CVViewer() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function exportPdf() {
    const win = iframeRef.current?.contentWindow as (Window & { exportFormattedPDF?: () => void }) | null;
    win?.exportFormattedPDF?.();
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={exportPdf}
          className="rounded-full bg-[#3fb950] px-5 py-2 text-sm font-semibold text-black transition hover:bg-[#52d869]"
        >
          Download PDF
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <iframe
          ref={iframeRef}
          src="/resume/iim_editor.html?viewer=1"
          title="Guhan Srinivasan CV"
          className="h-[85vh] w-full bg-[#e7e7e7]"
        />
      </div>
    </>
  );
}
