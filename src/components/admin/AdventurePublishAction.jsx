import React from "react";
import { Button } from "@/components/ui/button";
import { Save, CheckCircle, Send, Loader2 } from "lucide-react";

/**
 * AdventurePublishAction Component
 * 
 * Provides action buttons for saving draft, approving, and publishing an AdventurePackage.
 * 
 * @param {Object} props
 * @param {Function} props.onSaveDraft - Save draft handler
 * @param {Function} props.onApprove - Approve handler
 * @param {Function} props.onPublish - Publish handler
 * @param {string} [props.status="draft"] - Status ("draft" | "approved" | "published")
 * @param {boolean} [props.isValid=true] - Whether schema validation passed
 * @param {boolean} [props.loading=false] - Async action loading state
 */
export function AdventurePublishAction({
  onSaveDraft,
  onApprove,
  onPublish,
  status = "draft",
  isValid = true,
  loading = false
}) {
  return (
    <div className="p-4 border-2 rounded-xl bg-card text-card-foreground flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs">
        <span className="font-bold text-muted-foreground uppercase">Status Kembara:</span>
        <span
          className={`px-2.5 py-0.5 rounded-full font-black text-xs uppercase tracking-wider ${
            status === "published"
              ? "bg-emerald-500 text-white"
              : status === "approved"
              ? "bg-indigo-600 text-white"
              : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
          }`}
        >
          {status === "published" ? "🚀 Diterbitkan" : status === "approved" ? "✓ Diluluskan" : "📝 Draf AI"}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {/* Action 1: Save Draft */}
        <Button
          size="sm"
          variant="outline"
          onClick={onSaveDraft}
          disabled={loading}
          className="flex-1 sm:flex-initial gap-1.5"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-stone-500" />}
          Simpan Draf
        </Button>

        {/* Action 2: Approve Adventure */}
        <Button
          size="sm"
          variant="outline"
          onClick={onApprove}
          disabled={loading || !isValid || status === "published"}
          className="flex-1 sm:flex-initial gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Luluskan Kembara
        </Button>

        {/* Action 3: Publish Adventure */}
        <Button
          size="sm"
          onClick={onPublish}
          disabled={loading || !isValid}
          className="flex-1 sm:flex-initial gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Terbitkan Kembara
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default AdventurePublishAction;
