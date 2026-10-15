import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const reviewAppSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().optional(),
  adminNote: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminApi();
    if (!authResult.isAdmin) {
      return authResult.errorResponse;
    }

    const { id: applicationId } = await params;
    const body = await request.json();
    const parsed = reviewAppSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid review status" }, { status: 400 });
    }

    const { status, reason, adminNote } = parsed.data;
    const note = adminNote || reason || null;
    const supabaseAdmin = createAdminClient();

    // 1. Fetch application
    const { data: app, error: appError } = await supabaseAdmin
      .from("applications")
      .select("*, internship:internships(id, title)")
      .eq("id", applicationId)
      .maybeSingle();

    if (appError || !app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (status === "APPROVED") {
      // 2. Approve Application: Call DB RPC or execute directly
      const startDate = app.start_date || new Date().toISOString().split("T")[0];
      // Fallback: if end_date missing, default to start + 30 days
      const endDate =
        app.end_date ||
        new Date(
          new Date(startDate).getTime() + 30 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0];

      // Update application
      await supabaseAdmin
        .from("applications")
        .update({
          status: "APPROVED",
          admin_note: note,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      // Check if enrollment already exists for this user + internship
      const { data: existingEnrollment } = await supabaseAdmin
        .from("enrollments")
        .select("id")
        .eq("user_id", app.user_id)
        .eq("internship_id", app.internship_id)
        .maybeSingle();

      let enrollment: any = null;
      let enrError: any = null;

      if (existingEnrollment) {
        // Update existing enrollment to ACTIVE
        const { data, error } = await supabaseAdmin
          .from("enrollments")
          .update({
            application_id: applicationId,
            start_date: startDate,
            end_date: endDate,
            status: "ACTIVE",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingEnrollment.id)
          .select()
          .single();
        enrollment = data;
        enrError = error;
      } else {
        // Insert new enrollment
        const { data, error } = await supabaseAdmin
          .from("enrollments")
          .insert({
            user_id: app.user_id,
            internship_id: app.internship_id,
            application_id: applicationId,
            start_date: startDate,
            end_date: endDate,
            status: "ACTIVE",
          })
          .select()
          .single();
        enrollment = data;
        enrError = error;
      }

      if (enrError) {
        console.error("Enrollment creation error:", enrError);
        return NextResponse.json(
          { error: "Application approved but enrollment creation failed: " + enrError.message },
          { status: 500 }
        );
      }

      // Send notification
      await supabaseAdmin.from("notifications").insert({
        user_id: app.user_id,
        title: "Application Approved! 🎉",
        message: `Your application for ${app.internship?.title || "your internship"} has been approved. Your 1-month learning curriculum is now active!`,
        link: enrollment?.id
          ? `/dashboard/learning?enrollment=${enrollment.id}`
          : "/dashboard/learning",
      });

      return NextResponse.json({
        success: true,
        status: "APPROVED",
        enrollment,
      });
    } else {
      // 3. Reject Application
      if (!note) {
        return NextResponse.json(
          { error: "A reason is required when declining an application." },
          { status: 400 }
        );
      }

      await supabaseAdmin
        .from("applications")
        .update({
          status: "REJECTED",
          admin_note: note,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      // Send rejection notification with feedback
      await supabaseAdmin.from("notifications").insert({
        user_id: app.user_id,
        title: "Application Update",
        message: `Your application for ${app.internship?.title || "the internship"} was not approved: ${note}`,
        link: "/dashboard/applications",
      });

      return NextResponse.json({
        success: true,
        status: "REJECTED",
      });
    }
  } catch (err: any) {
    console.error("Admin review application error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
