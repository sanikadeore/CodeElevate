"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Internship,
  Enrollment,
  Application,
  ComputedTaskStatus,
  EnrollmentProgress,
} from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Download,
  ArrowRight,
  Layers,
  Sparkles,
  Hourglass,
  FolderDown,
} from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { toast } from "sonner";

interface LearningContentProps {
  enrollment: (Enrollment & { internship: Internship }) | null;
  completedEnrollments?: any[];
  pendingApplication: Application | null;
  progress: EnrollmentProgress;
  taskStatuses: ComputedTaskStatus[];
}

export function LearningContent({
  enrollment,
  completedEnrollments = [],
  pendingApplication,
  progress,
  taskStatuses,
}: LearningContentProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [downloadingResourceId, setDownloadingResourceId] = useState<string | null>(null);

  // 1. PENDING STATE: Show Under Review card with no curriculum access
  if (!enrollment && pendingApplication?.status === "PENDING") {
    return (
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Enrolled Track
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Learning Track
          </h1>
        </div>

        {/* Collage Hourglass Card */}
        <div className="rounded-3xl border border-amber-200 bg-white p-8 sm:p-12 text-center space-y-5 shadow-sm max-w-2xl mx-auto">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 shadow-inner">
            <Hourglass className="h-10 w-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-xs py-1 px-3">
              APPLICATION UNDER REVIEW
            </Badge>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 pt-2">
              Your application is currently under review
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              Our academic evaluators are reviewing your details for{" "}
              <span className="font-bold text-slate-900">
                {pendingApplication.internship?.title || "your selected internship"}
              </span>
              . You will receive access to the full module curriculum, learning materials, and practical tasks immediately upon approval.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard/applications">
              <Button variant="outline" className="rounded-xl text-xs font-bold gap-2">
                <FileText className="h-4 w-4" />
                <span>View Application Details</span>
              </Button>
            </Link>
            <Link href="/internships">
              <Button className="rounded-xl text-xs font-bold gap-2 shadow-md shadow-blue-500/20">
                <span>Explore Other Tracks</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. COMPLETED ENROLLMENTS (No active track, but has past completions)
  // NOTE: `enrollment` is only null when page.tsx found zero ACTIVE rows.
  // If a new ACTIVE enrollment exists it is passed as `enrollment` and this block is skipped.
  if (!enrollment && completedEnrollments && completedEnrollments.length > 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Graduation & Certification
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Learning Tracks
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            You have successfully completed and graduated from your enrolled internship tracks.
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-200/80 bg-white p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-inner">
            <BookOpen className="h-10 w-10 text-emerald-600" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs py-1 px-3.5 inline-block">
              ALL TRACKS COMPLETED & CERTIFIED 🎓
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 pt-1">
              Congratulations on graduating!
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              You have completed the full curriculum, submitted all required deliverables, and earned your verified certificates.
            </p>
          </div>

          {/* List of completed tracks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left pt-2">
            {completedEnrollments.map((enr: any) => (
              <div
                key={enr.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">
                    {enr.internship?.title || "Internship"}
                  </p>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 100% Completed & Certified
                  </span>
                </div>
                <Link href="/dashboard/certificates">
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                  >
                    View Certificate →
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard/certificates">
              <Button className="h-11 px-6 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-md shadow-emerald-500/20">
                <span>View My Certificates</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/internships">
              <Button
                variant="outline"
                className="h-11 px-6 rounded-xl text-xs font-bold gap-2"
              >
                <span>Explore New Internships</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. NO ENROLLMENT OR APPLICATIONS
  if (!enrollment) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <BookOpen className="h-7 w-7" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-base font-bold text-slate-900">
            No active learning track found
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Apply for an internship track to access modules, weekly milestone deliverables, and downloadable guides.
          </p>
        </div>
        <Link href="/internships">
          <Button className="h-10 px-5 rounded-xl text-xs font-bold gap-2 shadow-md shadow-blue-500/20">
            <span>Browse Internships</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  // 3. APPROVED ENROLLMENT: Render Full Learning Workspace
  const internship = enrollment.internship;
  const modules = internship?.modules || [];
  const activeModule =
    modules.find((m) => m.id === selectedModuleId) || modules[0] || null;

  // Compute days remaining
  let daysRemaining = 0;
  if (enrollment.end_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = parseISO(enrollment.end_date);
    daysRemaining = Math.max(0, differenceInDays(endDate, today));
  }

  // Extract all uploaded resources across all tasks in this internship
  const allTrackResources = (internship.tasks || []).flatMap((t: any) =>
    (t.resources || []).map((r: any) => ({
      ...r,
      taskTitle: t.title,
      moduleTitle: t.module?.title,
    }))
  );

  // Handle secure resource download
  const handleDownloadResource = async (resourceId: string, title?: string) => {
    setDownloadingResourceId(resourceId);
    try {
      const res = await fetch("/api/resources/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId }),
      });

      const data = await res.json();
      if (!res.ok || !data.signedUrl) {
        toast.error(data.error || "Could not retrieve download link for this material.");
        return;
      }

      window.open(data.signedUrl, "_blank");
    } catch {
      toast.error("Error opening resource.");
    } finally {
      setDownloadingResourceId(null);
    }
  };

  const handleDownloadMainPack = () => {
    if (allTrackResources.length > 0) {
      const firstResource = allTrackResources[0];
      handleDownloadResource(firstResource.id, firstResource.title);
    } else {
      toast.info(`No custom PPT/PDF slide deck uploaded for ${internship.title} yet.`);
    }
  };

  return (
    <div className="space-y-8">
      {/* ────────────────── COURSE HEADER BANNER ────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 p-3 border border-blue-100 shadow-sm">
              <Image
                src={internship.icon_url || "/icons/open-book.png"}
                alt={internship.title}
                width={42}
                height={42}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                  ACTIVE BATCH
                </Badge>
                <Badge variant="outline" className="text-[10px] text-slate-600">
                  {internship.category || "Development"}
                </Badge>
                <Badge variant="outline" className="text-[10px] text-blue-600 bg-blue-50/50">
                  100% Remote
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mt-1">
                {internship.title}
              </h1>
              <p className="text-xs text-slate-500">
                Batch Schedule: {enrollment.start_date} to {enrollment.end_date}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-center sm:text-right">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Timeline Left
                </span>
                <p className="text-lg font-black text-slate-900">{daysRemaining} Days</p>
              </div>
            </div>

            <Link href="/dashboard/tasks">
              <Button className="rounded-xl text-xs font-bold h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Submit Internship Work</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ────────────────── LEARNING WORKSPACE TABS ────────────────── */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="overview"
            className="rounded-xl px-4 py-2 text-xs font-bold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="modules"
            className="rounded-xl px-4 py-2 text-xs font-bold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Layers className="h-3.5 w-3.5 mr-1.5" />
            <span>Modules & Curriculum</span>
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="rounded-xl px-4 py-2 text-xs font-bold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <FolderDown className="h-3.5 w-3.5 mr-1.5" />
            <span>Learning Materials (PPT/PDF)</span>
          </TabsTrigger>
        </TabsList>

        {/* ──────── TAB 1: OVERVIEW & TIMELINE ──────── */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  About this Internship Track
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {internship.description}
                </p>

                {internship.technologies && internship.technologies.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Target Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {internship.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-xl bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Quick Links */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900">
                  Quick Actions
                </h3>
                <div className="space-y-2.5">
                  <Link href="/dashboard/tasks" className="block">
                    <Button variant="outline" className="w-full justify-between text-xs font-bold rounded-xl h-10 border-slate-200">
                      <span>View All Tasks</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>

                  <Link href="/dashboard/submissions" className="block">
                    <Button variant="outline" className="w-full justify-between text-xs font-bold rounded-xl h-10 border-slate-200">
                      <span>My Submissions</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ──────── TAB 2: MODULES & TASKS ──────── */}
        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar list of modules */}
            <div className="space-y-3">
              {modules.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModuleId(m.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    (activeModule?.id === m.id)
                      ? "bg-blue-50/70 border-blue-200 shadow-sm"
                      : "bg-white border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      Week {m.position || idx + 1}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                    {m.title}
                  </h4>
                </button>
              ))}
            </div>

            {/* Active Module Tasks */}
            <div className="lg:col-span-2 space-y-6">
              {activeModule ? (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      Module Content
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">
                      {activeModule.title}
                    </h3>
                    {activeModule.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {activeModule.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Practical Tasks
                    </h4>
                    <div className="divide-y divide-slate-100">
                      {(activeModule.tasks || []).map((t, tIdx) => (
                        <div
                          key={t.id}
                          className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400">#{tIdx + 1}</span>
                              <p className="text-xs sm:text-sm font-bold text-slate-900">{t.title}</p>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {t.description}
                            </p>
                          </div>

                          <Link href={`/dashboard/tasks/${t.id}`}>
                            <Button size="sm" variant="outline" className="h-8 px-3 rounded-xl text-xs font-bold gap-1 shrink-0">
                              <span>Read Task</span>
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </TabsContent>

        {/* ──────── TAB 3: RESOURCES ──────── */}
        <TabsContent value="resources" className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Internship Learning Materials
              </h3>
              <p className="text-xs text-slate-500">
                Official presentation slides (PPT), reference code snippets, and deliverable specifications uploaded for {internship.title}.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Complete Track Learning Pack
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {internship.title} - Complete Curriculum & Slides (PPT / PDF)
                </h4>
                <p className="text-xs text-slate-600">
                  {allTrackResources.length > 0
                    ? `${allTrackResources.length} PPT/PDF resources available for this track.`
                    : "Contains all module slide decks, architectural diagrams, project requirements, and API specs."}
                </p>
              </div>

              <Button
                onClick={handleDownloadMainPack}
                disabled={downloadingResourceId !== null}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl h-10 px-5 gap-2 shrink-0 shadow-md shadow-blue-500/20"
              >
                <Download className="h-4 w-4" />
                <span>Download Material Pack</span>
              </Button>
            </div>

            {/* List of uploaded PPT / PDF resources */}
            {allTrackResources.length > 0 ? (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Uploaded Slide Decks & Documents ({allTrackResources.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allTrackResources.map((res: any) => (
                    <div
                      key={res.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            {res.type || "PPT/PDF"}
                          </span>
                          {res.taskTitle && (
                            <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[150px]">
                              {res.taskTitle}
                            </span>
                          )}
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 pt-1 leading-snug">
                          {res.title}
                        </h5>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadResource(res.id, res.title)}
                        disabled={downloadingResourceId === res.id}
                        className="w-full text-xs font-bold rounded-xl h-9 gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 shadow-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>
                          {downloadingResourceId === res.id ? "Preparing File..." : "Download / Open Material"}
                        </span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <FolderDown className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No PPT / PDF slide decks uploaded yet</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  When the admin attaches PPT presentations or PDF reference guides to tasks in {internship.title}, they will appear here for instant download.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
