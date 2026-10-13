import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Application } from "@/types/database";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Calendar, ArrowRight, BookOpen, Clock, Hourglass, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface ApplicationCardProps {
  application: Application;
  onCancel?: (id: string) => void;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const isApproved = application.status === "APPROVED";
  const isPending = application.status === "PENDING";
  const isRejected = application.status === "REJECTED";
  const isCancelled = application.status === "CANCELLED";

  const course = application.internship || application.course;
  const iconSrc = course?.icon_url || course?.icon || "/icons/open-book.png";
  const categoryName = course?.category || course?.domain || "Internship";
  const appliedDate = application.created_at || (application as any).applied_at || new Date().toISOString();

  // Resolve the correct deep-link for "Go to My Learning"
  const enrollmentStatus = (application as any).enrollment_status;
  const isEnrollmentCompleted = enrollmentStatus === "COMPLETED";
  const learningHref = isEnrollmentCompleted
    ? "/dashboard/certificates"
    : course?.slug
    ? `/dashboard/learning?track=${course.slug}`
    : "/dashboard/learning";

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
            {isApproved && (
              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 gap-1.5 py-1 px-3 font-bold text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Approved</span>
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
              <p className="font-bold">Application is being evaluated</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Our academic team is reviewing your background and profile. You will be automatically enrolled and granted full learning access once approved.
              </p>
            </div>
          </div>
        )}

        {isApproved && (
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
        <Link href={`/internships/${course?.slug || ""}`} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
          View Track Details
        </Link>
        <div>
          {isApproved ? (
            <Link href={learningHref}>
              <Button
                size="sm"
                className={`h-9 px-4 rounded-xl text-xs font-bold gap-1.5 shadow-md ${
                  isEnrollmentCompleted
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                    : "shadow-blue-500/20"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isEnrollmentCompleted ? "View Certificate" : "Go to My Learning"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
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
