import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Application } from "@/types/database";
import { StudentEnrollmentDetails } from "@/lib/enrollments";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  ArrowRight,
  BookOpen,
  Clock,
  Hourglass,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
} from "lucide-react";

interface ApplicationCardProps {
  application: Application;
  enrollment?: StudentEnrollmentDetails | null;
  onCancel?: (id: string) => void;
}

export function ApplicationCard({ application, enrollment }: ApplicationCardProps) {
  const isPending = application.status === "PENDING";
  const isRejected = application.status === "REJECTED";
  const isCancelled = application.status === "CANCELLED";
  const isApproved = application.status === "APPROVED";

  const enrollmentStatus = enrollment?.status || (isApproved ? "ACTIVE" : null);
  const isEnrollmentActive = enrollmentStatus === "ACTIVE";
  const isEnrollmentCompleted = enrollmentStatus === "COMPLETED";
  const isEnrollmentExpiredOrSuspended =
    enrollmentStatus === "EXPIRED" || enrollmentStatus === "SUSPENDED";

  const course = application.internship || application.course;
  const iconSrc = course?.icon_url || course?.icon || "/icons/open-book.png";
  const categoryName = course?.category || course?.domain || "Internship";
  const appliedDate =
    application.created_at || (application as any).applied_at || new Date().toISOString();

  const certificateId = enrollment?.certificate?.id;

  return (
    <Card className="rounded-3xl border-slate-200/80 bg-white transition-all hover:border-blue-200 hover:shadow-md overflow-hidden">
      <CardHeader className="p-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 p-2.5 border border-blue-100 shadow-sm">
              <Image
                src={iconSrc}
                alt={course?.title || "Course"}
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-slate-50 text-slate-600 font-semibold text-[10px]">
                  {categoryName}
                </Badge>
                <Badge variant="outline" className="text-[10px] text-slate-500">
                  {application.mode || "Remote"}
                </Badge>
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mt-1">
                {course?.title || "Internship Program"}
              </h3>
            </div>
          </div>

          {/* Status Badge */}
          <div>
            {isPending && (
              <Badge className="bg-amber-50 text-amber-800 border-amber-200/80 gap-1.5 py-1 px-3 font-bold text-xs">
                <Hourglass className="h-3.5 w-3.5 text-amber-600 animate-spin" />
                <span>Under Review</span>
              </Badge>
            )}
            {isApproved && isEnrollmentCompleted && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 gap-1.5 py-1 px-3 font-bold text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Completed</span>
              </Badge>
            )}
            {isApproved && isEnrollmentActive && (
              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 gap-1.5 py-1 px-3 font-bold text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Approved</span>
              </Badge>
            )}
            {isApproved && isEnrollmentExpiredOrSuspended && (
              <Badge className="bg-slate-100 text-slate-700 border-slate-300 gap-1.5 py-1 px-3 font-bold text-xs">
                <AlertTriangle className="h-3.5 w-3.5 text-slate-500" />
                <span>{enrollmentStatus === "EXPIRED" ? "Expired" : "Suspended"}</span>
              </Badge>
            )}
            {isRejected && (
              <Badge className="bg-red-50 text-red-800 border-red-200 gap-1.5 py-1 px-3 font-bold text-xs">
                <XCircle className="h-3.5 w-3.5 text-red-600" />
                <span>Rejected</span>
              </Badge>
            )}
            {isCancelled && (
              <Badge variant="secondary" className="gap-1.5 py-1 px-3 font-bold text-xs text-slate-600">
                <span>Cancelled</span>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0 pb-4 space-y-3.5">
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Applied on: {formatDate(appliedDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Schedule: {application.start_date} to {application.end_date}</span>
          </div>
        </div>

        {isPending && (
          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
            <Hourglass className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Application is Under Review</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Our academic team is reviewing your background and profile. You will be automatically enrolled and granted full learning access once approved.
              </p>
            </div>
          </div>
        )}

        {isApproved && isEnrollmentCompleted && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-900 leading-relaxed flex items-start gap-2.5">
            <Award className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Internship Track Completed & Certified</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Congratulations! You have completed all practical requirements for this program and your verified digital credential has been issued.
              </p>
            </div>
          </div>
        )}

        {isApproved && isEnrollmentActive && (
          <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4 text-xs text-emerald-900 leading-relaxed flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Application Approved!</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Your active batch is ready. Start by opening the curriculum to view weekly modules and your first milestone task.
              </p>
            </div>
          </div>
        )}

        {isApproved && isEnrollmentExpiredOrSuspended && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                Batch {enrollmentStatus === "EXPIRED" ? "Expired" : "Suspended"}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                The timeline for this enrolled batch has ended. Submissions are no longer accepted for this track. Contact support if you need an extension.
              </p>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="rounded-2xl border border-red-200/80 bg-red-50/70 p-4 text-xs text-red-900 leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Application Declined</p>
              <p className="text-[11px] text-red-800 mt-0.5">
                {application.admin_note ||
                  "Your application could not be accepted for this batch. You may apply for other tracks."}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-2 flex items-center justify-between border-t border-slate-50">
        <Link
          href={`/internships/${course?.slug || ""}`}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          View Track Details
        </Link>
        <div>
          {isApproved && isEnrollmentCompleted ? (
            <Link
              href={
                certificateId
                  ? `/dashboard/certificates?highlight=${certificateId}`
                  : `/dashboard/certificates`
              }
            >
              <Button
                size="sm"
                className="h-9 px-4 rounded-xl text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
              >
                <Award className="w-3.5 h-3.5" />
                <span>View Certificate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : isApproved && isEnrollmentActive && enrollment ? (
            <Link href={`/dashboard/learning?enrollment=${enrollment.id}`}>
              <Button
                size="sm"
                className="h-9 px-4 rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isEnrollmentCompleted ? "View Certificate" : "Go to My Learning"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : isApproved && isEnrollmentExpiredOrSuspended ? (
            <Link href={`/internships/${course?.slug || ""}`}>
              <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl text-xs font-semibold text-slate-700">
                <span>View Curriculum</span>
              </Button>
            </Link>
          ) : isPending ? (
            <Link href={`/internships/${course?.slug || ""}`}>
              <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl text-xs font-semibold text-slate-700">
                <span>View Curriculum</span>
              </Button>
            </Link>
          ) : isRejected ? (
            <Link href={`/internships/${course?.slug || ""}`}>
              <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl text-xs font-semibold text-slate-700">
                <span>View Curriculum</span>
              </Button>
            </Link>
          ) : (
            <Link href={`/internships/${course?.slug || ""}`}>
              <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl text-xs font-semibold text-slate-700">
                <span>View Curriculum</span>
              </Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

