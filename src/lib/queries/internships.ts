import { SupabaseClient } from "@supabase/supabase-js";
import {
  Internship,
  InternshipModule,
  Task,
  Application,
  Enrollment,
  Certificate,
  ComputedTaskStatus,
  EnrollmentProgress,
} from "@/types/database";

/**
 * Fetches all published internships with optional category filtering and search.
 */
export async function getPublishedInternships(
  supabase: SupabaseClient,
  options?: {
    category?: string;
    search?: string;
    limit?: number;
  }
): Promise<Internship[]> {
  let query = supabase
    .from("internships")
    .select("*")
    .ilike("status", "published")
    .order("created_at", { ascending: true });

  if (options?.category && options.category !== "all" && options.category !== "All Domains") {
    query = query.eq("category", options.category);
  }

  if (options?.search && options.search.trim()) {
    query = query.ilike("title", `%${options.search.trim()}%`);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching published internships:", error);
    return [];
  }

  return data as Internship[];
}

export const getAllPublishedInternships = getPublishedInternships;

/**
 * Fetches a single internship by slug with its modules, tasks, and task resources.
 */
export async function getInternshipBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<Internship | null> {
  const { data: internship, error: intError } = await supabase
    .from("internships")
    .select("*")
    .eq("slug", slug)
    .single();

  if (intError || !internship) {
    console.error("Error fetching internship by slug:", intError);
    return null;
  }

  // Fetch modules ordered by position
  const { data: modules, error: modError } = await supabase
    .from("internship_modules")
    .select("*")
    .eq("internship_id", internship.id)
    .order("position", { ascending: true });

  if (modError) {
    console.error("Error fetching modules:", modError);
  }

  // Fetch tasks ordered by position
  const { data: tasks, error: taskError } = await supabase
    .from("tasks")
    .select("*, resources:task_resources(*)")
    .eq("internship_id", internship.id)
    .eq("status", "PUBLISHED")
    .order("position", { ascending: true });

  if (taskError) {
    console.error("Error fetching tasks:", taskError);
  }

  const typedModules = (modules || []) as InternshipModule[];
  const typedTasks = (tasks || []) as Task[];

  // Attach tasks to respective modules
  const modulesWithTasks = typedModules.map((m) => ({
    ...m,
    tasks: typedTasks.filter((t) => t.module_id === m.id),
  }));

  return {
    ...internship,
    modules: modulesWithTasks,
    tasks: typedTasks,
  } as Internship;
}

/**
 * Fetches student's applications with internship data and their enrollment status.
 */
export async function getStudentApplications(
  supabase: SupabaseClient,
  userId: string
): Promise<(Application & { enrollment_status?: string | null })[]> {
  const { data, error } = await supabase
    .from("applications")
    .select("*, internship:internships(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching student applications:", error);
    return [];
  }

  // Fetch enrollments to attach their status to each application
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("internship_id, status")
    .eq("user_id", userId);

  const enrollmentMap = new Map(
    (enrollments || []).map((e: any) => [e.internship_id, e.status])
  );

  return (data || []).map((app: any) => ({
    ...app,
    course: app.internship,
    enrollment_status: enrollmentMap.get(app.internship_id) ?? null,
  }));
}

/**
 * Fetches student's active and completed enrollments.
 */
export async function getStudentEnrollments(
  supabase: SupabaseClient,
  userId: string
): Promise<Enrollment[]> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("*, internship:internships(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching student enrollments:", error);
    return [];
  }

  return (data || []).map((enr: any) => ({
    ...enr,
    course: enr.internship,
  })) as Enrollment[];
}

/**
 * Fetches computed task statuses for a student's active enrollment.
 */
export async function getEnrollmentTaskStatuses(
  supabase: SupabaseClient,
  enrollmentId: string
): Promise<ComputedTaskStatus[]> {
  const { data, error } = await supabase.rpc("get_task_statuses", {
    p_enrollment_id: enrollmentId,
  });

  if (error) {
    console.error("Error fetching computed task statuses:", error);
    return [];
  }

  return (data || []) as ComputedTaskStatus[];
}

/**
 * Fetches computed enrollment progress from the database.
 */
export async function getEnrollmentProgress(
  supabase: SupabaseClient,
  enrollmentId: string
): Promise<EnrollmentProgress> {
  const { data, error } = await supabase.rpc("get_enrollment_progress", {
    p_enrollment_id: enrollmentId,
  });

  if (error || !data || data.length === 0) {
    console.error("Error calculating enrollment progress:", error);
    return { approved_required: 0, total_required: 0, percent: 0 };
  }

  return data[0] as EnrollmentProgress;
}

/**
 * Fetches student certificates.
 */
export async function getStudentCertificates(
  supabase: SupabaseClient,
  userId: string
): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from("certificates")
    .select("*, internship:internships(*), template:certificate_templates(*)")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });

  if (error) {
    console.error("Error fetching certificates:", error);
    return [];
  }

  return (data || []) as Certificate[];
}
