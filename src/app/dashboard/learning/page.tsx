import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getStudentEnrollments,
  getStudentApplications,
  getEnrollmentProgress,
  getEnrollmentTaskStatuses,
  getInternshipBySlug,
} from "@/lib/queries/internships";
import { LearningContent } from "./learning-content";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `My Learning | ${APP_NAME}`,
  description: "Access your enrolled internship curriculum, modules, and tasks.",
};

export const revalidate = 0;

export default async function LearningPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/learning");
  }

  const { track: trackSlug } = await searchParams;

  // 1. Fetch all enrollments & applications
  const enrollments = await getStudentEnrollments(supabase, user.id);
  const applications = await getStudentApplications(supabase, user.id);

  // 2. Pick the target enrollment:
  //    - If ?track=slug is provided, find that specific enrollment (any status)
  //    - Otherwise fall back to the first ACTIVE enrollment
  const activeEnrollment = trackSlug
    ? (enrollments.find((e) => e.internship?.slug === trackSlug) ||
       enrollments.find((e) => e.status === "ACTIVE") ||
       null)
    : (enrollments.find((e) => e.status === "ACTIVE") || null);

  const completedEnrollments = enrollments.filter((e) => e.status === "COMPLETED");
  const pendingApplication =
    applications.find((a) => a.status === "PENDING") || null;

  let fullEnrollment = null;
  let progress = { approved_required: 0, total_required: 0, percent: 0 };
  let taskStatuses: any[] = [];

  if (activeEnrollment && activeEnrollment.internship) {
    // Fetch full internship with modules & tasks
    const detailedInternship = await getInternshipBySlug(
      supabase,
      activeEnrollment.internship.slug
    );

    fullEnrollment = {
      ...activeEnrollment,
      internship: detailedInternship || activeEnrollment.internship,
    };

    progress = await getEnrollmentProgress(supabase, activeEnrollment.id);
    taskStatuses = await getEnrollmentTaskStatuses(supabase, activeEnrollment.id);
  }

  return (
    <LearningContent
      enrollment={fullEnrollment as any}
      completedEnrollments={completedEnrollments as any}
      pendingApplication={pendingApplication}
      progress={progress}
      taskStatuses={taskStatuses}
    />
  );
}
