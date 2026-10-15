import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveEnrollment } from "@/lib/enrollments";
import {
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

<<<<<<< HEAD
interface LearningPageProps {
  searchParams: Promise<{ enrollment?: string }>;
}

export default async function LearningPage({ searchParams }: LearningPageProps) {
=======
export default async function LearningPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
>>>>>>> 6538fd4164ccf418f33c1b1b58299cfb96402034
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/learning");
  }

<<<<<<< HEAD
  const { enrollment: requestedEnrollmentId } = (await searchParams) || {};

  // 1. Resolve enrollment following Rule 6 & Rule 8
  const { resolved, allEnrollments, redirectNeeded } = await resolveEnrollment(
    user.id,
    requestedEnrollmentId,
    supabase
  );

  // If redirected needed (e.g. no parameter provided, or untrusted/invalid ID given),
  // redirect with ?enrollment=<id> so the URL always reflects what is shown.
  if (redirectNeeded && resolved) {
    redirect(`/dashboard/learning?enrollment=${resolved.id}`);
  }

  const applications = await getStudentApplications(supabase, user.id);
  const completedEnrollments = allEnrollments.filter((e) => e.status === "COMPLETED");
=======
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
>>>>>>> 6538fd4164ccf418f33c1b1b58299cfb96402034
  const pendingApplication =
    applications.find((a) => a.status === "PENDING") || null;

  let fullEnrollment = null;
  let progress = { approved_required: 0, total_required: 0, percent: 0 };
  let taskStatuses: any[] = [];

  if (resolved && resolved.internship) {
    // Fetch full internship with modules & tasks
    const detailedInternship = await getInternshipBySlug(
      supabase,
      resolved.internship.slug
    );

    fullEnrollment = {
      ...resolved,
      internship: detailedInternship || resolved.internship,
    };

    progress = await getEnrollmentProgress(supabase, resolved.id);
    taskStatuses = await getEnrollmentTaskStatuses(supabase, resolved.id);
  }

  return (
    <LearningContent
      enrollment={fullEnrollment as any}
      allEnrollments={allEnrollments}
      completedEnrollments={completedEnrollments as any}
      pendingApplication={pendingApplication}
      progress={progress}
      taskStatuses={taskStatuses}
    />
  );
}
