// src/components/parent/RewardApprovalCard.jsx
// Displays child reward redemption requests requiring parent authorization

import React, { useState } from "react";
import { Gift, Coins, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function RewardApprovalCard({ requests = [], onRefresh }) {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState(null);

  const pendingRequests = requests.filter((r) => r.status === "pending");

  const handleDecision = async (requestId, action) => {
    try {
      setLoadingId(requestId);
      const res = await base44.functions.invoke("manageRewardApproval", {
        request_id: requestId,
        action: action,
      });

      if (res.data?.success) {
        toast({
          title: action === "approve" ? "Ganjaran Diluluskan! 🎉" : "Ganjaran Ditolak",
          description: res.data.message,
        });
        if (onRefresh) onRefresh();
      } else {
        toast({
          title: "Ralat",
          description: res.data?.error || "Gagal memproses permohonan.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Ralat Sistem",
        description: "Gagal memproses permohonan.",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  if (pendingRequests.length === 0) {
    return (
      <div className="p-5 bg-stone-900/80 border border-stone-800 rounded-3xl text-center space-y-2 text-left">
        <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
          <Gift className="w-4 h-4 text-amber-400" /> Kelulusan Ganjaran Anak
        </h3>
        <p className="text-xs font-bold text-stone-400 text-center py-2">
          Tiada permohonan tebus ganjaran menunggu pengesahan.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-stone-900/90 border border-stone-800 rounded-3xl space-y-3 text-left shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
          <Gift className="w-4 h-4 text-amber-400" /> Permohonan Ganjaran Anak ({pendingRequests.length})
        </h3>
      </div>

      <div className="space-y-2.5">
        {pendingRequests.map((req) => (
          <div
            key={req.id}
            className="p-4 bg-stone-950/90 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Gift className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-black text-white">
                  {req.reward_title || req.reward_type || "Tebus Ganjaran Avatar"}
                </h4>
                <div className="flex items-center gap-2 text-[11px] font-bold text-stone-400">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Coins className="w-3.5 h-3.5 text-amber-400" /> {req.cost_coins || req.coins_requested || 50} Syiling
                  </span>
                  <span>•</span>
                  <span>{req.student_name || "Anak"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                onClick={() => handleDecision(req.id, "approve")}
                disabled={loadingId === req.id}
                className="flex-1 sm:flex-initial h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl border-b-2 border-emerald-700 active:translate-y-0.5 transition-all flex items-center justify-center gap-1"
              >
                {loadingId === req.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Luluskan
                  </>
                )}
              </Button>

              <Button
                onClick={() => handleDecision(req.id, "reject")}
                disabled={loadingId === req.id}
                variant="outline"
                className="flex-1 sm:flex-initial h-9 px-3 border-stone-700 bg-stone-800 hover:bg-stone-700 text-rose-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Tolak
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
