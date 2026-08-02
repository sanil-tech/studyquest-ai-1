// src/components/parent/NotificationCenter.jsx
// Parent Notification Center Card displaying color-coded alerts (🟢 Improvement, 🟡 Reminder, 🔴 Needs Attention)

import React, { useState } from "react";
import { Bell, Check, AlertTriangle, TrendingUp, Sparkles, Flame, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function NotificationCenter({ notifications = [], onRefresh }) {
  const { toast } = useToast();
  const [markingId, setMarkingId] = useState(null);

  const handleMarkAsRead = async (notifId) => {
    try {
      setMarkingId(notifId);
      await base44.entities.ParentNotification.update(notifId, {
        status: "read",
      }).catch(() => {});

      toast({
        title: "Selesai",
        description: "Notifikasi telah ditanda sebagai dibaca.",
      });

      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn("Mark read error:", err);
    } finally {
      setMarkingId(null);
    }
  };

  const unreadNotifs = notifications.filter((n) => n.status === "unread");

  if (notifications.length === 0) {
    return (
      <div className="p-5 bg-stone-900/80 border border-stone-800 rounded-3xl text-center space-y-2 text-left shadow-md">
        <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" /> Notifikasi & Amaran Pembelajaran
        </h3>
        <p className="text-xs font-bold text-stone-400 text-center py-2">
          Tiada notifikasi baharu dijumpai. Anak anda sedang melakukan yang terbaik! 🌟
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-stone-900/90 border border-stone-800 rounded-3xl space-y-3 text-left shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" /> Notifikasi & Amaran AI ({unreadNotifs.length} Belum Dibaca)
        </h3>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {notifications.map((item, idx) => {
          const isHighPriority = item.priority === "high" || item.notification_type === "weakness_detected" || item.notification_type === "reward_request";
          const isImprovement = item.notification_type === "mastery_growth" || item.notification_type === "streak_milestone";
          const isRead = item.status === "read";

          let colorStyles = "bg-amber-950/20 border-amber-500/30 text-amber-200";
          let iconEmoji = "🟡";

          if (isHighPriority) {
            colorStyles = "bg-rose-950/30 border-rose-500/30 text-rose-200";
            iconEmoji = "🔴";
          } else if (isImprovement) {
            colorStyles = "bg-emerald-950/30 border-emerald-500/30 text-emerald-200";
            iconEmoji = "🟢";
          }

          return (
            <div
              key={item.id || idx}
              className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${colorStyles} ${isRead ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">{iconEmoji}</span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-black">{item.title}</h4>
                    {item.priority === "high" && (
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-black uppercase rounded-full">
                        Perhatian
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-300 font-medium leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>

              {!isRead && (
                <Button
                  onClick={() => handleMarkAsRead(item.id)}
                  disabled={markingId === item.id}
                  size="sm"
                  variant="outline"
                  className="h-8 px-2.5 border-stone-700 bg-stone-950 hover:bg-stone-800 text-stone-300 font-bold text-[11px] rounded-xl shrink-0"
                >
                  {markingId === item.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" /> Tanda Dibaca
                    </span>
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
