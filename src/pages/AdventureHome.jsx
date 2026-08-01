import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useViewMode } from "@/lib/ViewModeContext";
import { buildAdventurePassport } from "@/lib/passportEngine";
import { buildLearningJourney } from "@/lib/learningJourneyEngine";
import { buildStudentLearningProfile } from "@/lib/learningProfileEngine";
import { generateAdaptiveAdventurePackage } from "@/lib/adaptiveAdventureGenerator";

// Home Section Components
import { OtanHero } from "@/components/home/OtanHero";
import { ContinueAdventureCard } from "@/components/home/ContinueAdventureCard";
import { DailyMissionCard } from "@/components/home/DailyMissionCard";
import { WorldCarousel } from "@/components/home/WorldCarousel";
import { PassportSummaryCard } from "@/components/home/PassportSummaryCard";
import { AchievementCard } from "@/components/home/AchievementCard";
import { AdventureJournalCard } from "@/components/home/AdventureJournalCard";

// UI Components & Icons
import { Compass, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

/**
 * AdventureHome Component (Phase 7B)
 * 
 * Main Student Home Experience for StudyQuest Learning Adventures.
 * Integrates Passport Engine, Learning Journey Intelligence, and World Navigation.
 */
export default function AdventureHome() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const { isParentMode, returnToParentMode } = useViewMode();

  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [profileHistory, setProfileHistory] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch student profile & learning history
  const loadHomeData = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = authUser || await base44.auth.me().catch(() => null);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const activeChildId = localStorage.getItem("active_child_session");
      let activeStudent = currentUser;

      if (currentUser.app_role === "parent" && activeChildId) {
        const childRes = await base44.childAccounts.getById(activeChildId).catch(() => null);
        if (childRes) {
          activeStudent = {
            id: childRes.id,
            name: childRes.name,
            total_xp: childRes.total_xp || 0,
            balance: childRes.coins_balance || 0,
            streak_days: childRes.streak_days || 1,
            year_level: childRes.year_level || "Tahun 1",
            avatar_url: childRes.avatar_url || "🦧"
          };
        }
      }

      setStudentData(activeStudent);

      // Construct baseline profile history snapshots
      const defaultProfile = buildStudentLearningProfile({
        studentId: activeStudent.id,
        progressRecords: [
          {
            topic: "rumah-puluh",
            topic_name: "Rumah Puluh dan Sa",
            subject: "Matematik",
            completed_missions: ["misi-1", "misi-2"],
            hints_requested: 1,
            wrong_attempts: 1
          }
        ],
        quizAttempts: [
          {
            topic: "rumah-puluh",
            topic_name: "Rumah Puluh dan Sa",
            subject: "Matematik",
            totalQuestions: 5,
            correctCount: 4,
            hintsCount: 1,
            timeSpentSeconds: 180
          }
        ]
      });

      setProfileHistory([defaultProfile]);
    } catch (err) {
      console.error("Error loading AdventureHome data:", err);
      toast({
        title: "Ralat Memuatkan Home",
        description: "Gagal memuatkan data kembara. Menggunakan profil draf Otan.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [authUser, toast]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  // Derived Passport & Journey Intelligence
  const passportData = useMemo(() => {
    return buildAdventurePassport({
      studentData: studentData || {
        id: "anon",
        name: "Wira KSSR",
        total_xp: 150,
        balance: 45,
        streak_days: 2,
        year_level: "Tahun 1"
      },
      profileHistory
    });
  }, [studentData, profileHistory]);

  const journeyData = useMemo(() => {
    return buildLearningJourney(profileHistory);
  }, [profileHistory]);

  // Handle launch adaptive mission
  const handleContinueAdventure = async () => {
    setActionLoading(true);
    try {
      const adaptivePkg = await generateAdaptiveAdventurePackage({
        learningProfile: profileHistory[0],
        subject: passportData.nextAdventure.world_name,
        topic: passportData.nextAdventure.adventure_title
      });

      sessionStorage.setItem("active_adaptive_package", JSON.stringify(adaptivePkg));
      navigate(`/study?topic=${passportData.nextAdventure.topic_slug}`);
    } catch (err) {
      console.error("Error launching adaptive adventure:", err);
      navigate("/study");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-bold text-sm text-muted-foreground animate-pulse">
          Otan sedang menyiapkan Pasport Kembara anda... 🦧✨
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* Top Bar for Parent Mode toggle or Header Navigation */}
      <div className="bg-muted/40 border-b px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-500 animate-spin-slow" />
            <span className="font-heading font-black text-sm uppercase tracking-wider text-foreground">
              StudyQuest Adventure Home
            </span>
          </div>

          {isParentMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={returnToParentMode}
              className="text-xs font-bold gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Portal Ibu Bapa
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        {/* 1. Otan Hero Section */}
        <OtanHero
          passportData={passportData}
          journeyData={journeyData}
          onContinue={handleContinueAdventure}
        />

        {/* 2. Main Grid: Continue Adventure & Daily Mission */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <ContinueAdventureCard
            nextAdventure={passportData.nextAdventure}
            onResume={handleContinueAdventure}
          />
          <DailyMissionCard
            dailyMission={passportData.dailyMission}
            onStartMission={() => navigate("/missions")}
          />
        </div>

        {/* 3. KSSR World Explorer Carousel */}
        <WorldCarousel
          worlds={passportData.worlds}
          onSelectWorld={(world) => navigate(`/study?subject=${encodeURIComponent(world.subject)}`)}
        />

        {/* 4. Secondary Grid: Passport Summary, Achievements & Journal */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          <PassportSummaryCard
            passportData={passportData}
            onOpenPassport={() => navigate("/profile")}
          />
          <AchievementCard
            badges={passportData.badges}
            collections={passportData.collections}
            onViewAll={() => navigate("/achievements")}
          />
          <AdventureJournalCard
            journeyData={journeyData}
            onOpenJournal={() => navigate("/achievements")}
          />
        </div>
      </div>
    </div>
  );
}
