import React, { useState } from "react";
import {
  Calendar,
  Users,
  Save,
  Edit2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  FaYoutube,
  FaInstagram,
  FaLinkedin,
  FaFacebook,
  FaPen,
} from "react-icons/fa";
import { getStatusColor, getStatusLabel } from "@/utils/statusUtils.js";
import { formatDate, formatTime12Hour } from "@/utils/dateUtils.js";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Select from "@/components/common/Select.jsx";
import TimePicker from "@/components/common/TimePicker.jsx";
import { Input } from "@/components/ui/input";

const ALLOWED_DROPDOWN_STATUSES = [
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
];

const ContentCard = ({
  content,
  onEdit,
  onDelete,
  onStatusChange,
  onViewDetails,
}) => {
  const {
    title,
    contentType,
    status,
    contributors,
    completionDate,
    dueDate,
    notes,
  } = content;

  const hasLinks = !!(
    content.publishedLinks?.youtube ||
    content.publishedLinks?.instagram ||
    content.publishedLinks?.linkedin ||
    content.publishedLinks?.facebook
  );
  const hasScheduledDate = !!content.scheduledDate;

  const [scheduledDate, setScheduledDate] = useState(
    content.scheduledDate
      ? new Date(content.scheduledDate).toISOString().split("T")[0]
      : "",
  );
  const [scheduledTime, setScheduledTime] = useState(
    content.scheduledTime || "",
  );
  const [publishedLinks, setPublishedLinks] = useState(
    content.publishedLinks || {
      youtube: "",
      instagram: "",
      linkedin: "",
      facebook: "",
    },
  );
  const [publishedDate, setPublishedDate] = useState(
    content.publishedDate
      ? new Date(content.publishedDate).toISOString().split("T")[0]
      : "",
  );
  const [isSaving, setIsSaving] = useState(false);

  const [forceUnlockStatus, setForceUnlockStatus] = useState(false);
  const [forceEditLinks, setForceEditLinks] = useState(false);
  const [forceEditDate, setForceEditDate] = useState(false);

  // Strict logic for showing forms vs read-only modes
  const isStatusLocked =
    (status === "PUBLISHED" && hasLinks && !forceUnlockStatus) ||
    (status === "SCHEDULED" && hasScheduledDate && !forceUnlockStatus);
  const showLinksForm = status === "PUBLISHED" && (!hasLinks || forceEditLinks);
  const showDateForm =
    status === "SCHEDULED" && (!hasScheduledDate || forceEditDate);

  const handleSaveExpanded = async (e) => {
    e?.stopPropagation();
    setIsSaving(true);
    if (onStatusChange) {
      const cleanLinks = {};
      Object.keys(publishedLinks).forEach((k) => {
        cleanLinks[k] = publishedLinks[k] === "" ? null : publishedLinks[k];
      });
      await onStatusChange(content._id, status, {
        scheduledDate: scheduledDate === "" ? null : scheduledDate,
        scheduledTime: scheduledTime === "" ? null : scheduledTime,
        publishedLinks: cleanLinks,
        publishedDate: publishedDate === "" ? null : publishedDate,
      });
    }
    setIsSaving(false);
    setForceEditLinks(false);
    setForceEditDate(false);
    setForceUnlockStatus(false);
  };

  const contentTypes = Array.isArray(contentType)
    ? contentType
    : contentType
      ? [contentType]
      : [];

  let displayText = "Unassigned";
  const hasContributors =
    Array.isArray(contributors) && contributors.length > 0;

  if (
    hasContributors &&
    content.createdBy &&
    content.isOwnerContent !== false
  ) {
    const ownerName = content.createdBy.name
      ? content.createdBy.name.split(" ")[0]
      : "Owner";
    const contribNames = contributors.map((c) => c.name).join(", ");
    displayText = `${ownerName} x ${contribNames}`;
  } else if (hasContributors) {
    displayText = contributors.map((c) => c.name).join(", ");
  } else if (content.instructor) {
    displayText = content.instructor.name;
  } else if (content.createdBy) {
    displayText = content.createdBy.name;
  }

  const isOverdue =
    content.isOverdue ||
    (dueDate &&
      status === "ASSIGNED" &&
      new Date(dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0));

  return (
    <Card className="mb-4 hover:border-slate-300 transition-colors shadow-sm">
      <CardHeader className="pb-3 pt-5">
        <div className="flex justify-between items-start gap-2 w-full">
          <div className="flex flex-wrap items-center gap-2 md:gap-3 flex-1 min-w-0">
            <CardTitle
              className="text-lg hover:text-primary cursor-pointer transition-colors"
              onClick={onViewDetails}
            >
              {title}
            </CardTitle>
            {isOverdue && (
              <Badge
                variant="destructive"
                className="bg-red-500 hover:bg-red-600 font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1"
              >
                Overdue
              </Badge>
            )}
            <Badge
              variant="secondary"
              className={`${getStatusColor(status)} border-transparent font-semibold`}
            >
              {getStatusLabel(status)}
            </Badge>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="h-8 w-8 text-blue-400 hover:text-blue-600 hover:bg-blue-50"
            >
              <FaPen className="h-3.5 w-3.5" />
              <span className="sr-only">Edit Details</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-muted-foreground mb-4">
          {contentTypes.length > 0 && (
            <div className="flex items-center gap-1.5">
              {contentTypes.map((type, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-600"
                >
                  {type === "Others" && content.otherContentType
                    ? `Others (${content.otherContentType})`
                    : type}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 opacity-70" />
            <span className="font-medium">{displayText}</span>
          </div>

          {content.referenceLink && (
            <div className="flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4 opacity-70 text-blue-500" />
              <a
                href={content.referenceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Reference Link
              </a>
            </div>
          )}

          {dueDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 opacity-70 text-indigo-500" />
              <span>
                Shoot Date:{" "}
                <span className="font-medium text-foreground">
                  {formatDate(dueDate)}
                </span>
              </span>
            </div>
          )}

          {completionDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 opacity-70 text-emerald-500" />
              <span>
                Shoot Completion:{" "}
                <span className="font-medium text-foreground">
                  {formatDate(completionDate)}
                </span>
              </span>
            </div>
          )}
        </div>

        {notes && (
          <div className="mb-4 text-sm bg-amber-50/50 p-3 rounded-lg border border-amber-100/50 text-slate-600">
            <span className="font-semibold text-slate-700 block mb-1">
              Notes:
            </span>
            {notes}
          </div>
        )}

        {/* State-Specific Read-Only Views */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4 min-h-[32px]">
            {/* If Scheduled: Show ONLY the date */}
            {status === "SCHEDULED" && hasScheduledDate && !showDateForm && (
              <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-1.5 rounded-md border border-blue-100">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">
                  Scheduled for {formatDate(content.scheduledDate)}
                  {content.scheduledTime &&
                    ` at ${formatTime12Hour(content.scheduledTime)}`}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setForceEditDate(true)}
                  className="h-6 w-6 ml-1 text-blue-400 hover:text-blue-600"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* If Published: Show links & date */}
            {status === "PUBLISHED" && hasLinks && !showLinksForm && (
              <div className="flex items-center gap-4 bg-emerald-50/50 px-3 py-1.5 rounded-md border border-emerald-100">
                {content.publishedDate && (
                  <div className="flex items-center gap-1.5 border-r border-emerald-200/50 pr-4">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-700">
                      {formatDate(content.publishedDate)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  {content.publishedLinks?.youtube && (
                    <a
                      href={content.publishedLinks.youtube}
                      target="_blank"
                      rel="noreferrer"
                      className="text-red-500 hover:text-red-600"
                    >
                      <FaYoutube className="w-4 h-4" />
                    </a>
                  )}
                  {content.publishedLinks?.instagram && (
                    <a
                      href={content.publishedLinks.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="text-pink-600 hover:text-pink-700"
                    >
                      <FaInstagram className="w-4 h-4" />
                    </a>
                  )}
                  {content.publishedLinks?.linkedin && (
                    <a
                      href={content.publishedLinks.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <FaLinkedin className="w-4 h-4" />
                    </a>
                  )}
                  {content.publishedLinks?.facebook && (
                    <a
                      href={content.publishedLinks.facebook}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-800 hover:text-blue-900"
                    >
                      <FaFacebook className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setForceEditLinks(true)}
                  className="h-6 w-6 ml-1 text-emerald-400 hover:text-emerald-600"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}

            {status !== "SCHEDULED" && status !== "PUBLISHED" && (
              <span className="text-xs text-muted-foreground font-medium">
                Standard Content
              </span>
            )}
          </div>

          {/* Status Dropdown logic */}
          <div className="flex items-center gap-2">
            {isStatusLocked ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setForceUnlockStatus(true)}
                className="text-xs h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Edit Status
              </Button>
            ) : (
              <Select
                value={status}
                onChange={(e) =>
                  onStatusChange && onStatusChange(content._id, e.target.value)
                }
                options={ALLOWED_DROPDOWN_STATUSES.map((s) => ({
                  label: getStatusLabel(s),
                  value: s,
                }))}
                placeholder="Status"
                className="w-[160px]"
              />
            )}
          </div>
        </div>
      </CardContent>

      {/* EXPANDING FORMS (Minimal UI) */}

      {showDateForm && (
        <CardFooter className="bg-slate-50/80 border-t border-border pt-4 rounded-b-xl flex flex-col sm:flex-row gap-4 sm:items-end animate-in slide-in-from-top-4 duration-500 fade-in">
          <div className="w-full sm:max-w-[200px] flex flex-col justify-end">
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Set Scheduled Date
            </label>
            <Input
              type="date"
              className="h-9 py-1 px-3 text-sm bg-white"
              style={{ minHeight: "36px", height: "36px" }}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-auto shrink-0 flex flex-col justify-end">
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Time (Optional)
            </label>
            <div className="h-9 flex items-center">
              <TimePicker value={scheduledTime} onChange={setScheduledTime} />
            </div>
          </div>
          <Button
            onClick={handleSaveExpanded}
            disabled={isSaving}
            className="h-9 w-full sm:w-auto"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Date"}
          </Button>
        </CardFooter>
      )}

      {showLinksForm && (
        <CardFooter className="bg-slate-50/80 border-t border-border pt-4 rounded-b-xl flex flex-col gap-5 animate-in slide-in-from-top-4 duration-500 fade-in">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end justify-between w-full">
            <div className="w-full sm:max-w-[200px]">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Published Date (Optional)
              </label>
              <Input
                type="date"
                className="h-9 bg-white"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <FaYoutube className="w-3.5 h-3.5 text-slate-400" /> YouTube
              </span>
              <Input
                type="url"
                placeholder="URL"
                className="h-9 bg-white"
                value={publishedLinks?.youtube || ""}
                onChange={(e) =>
                  setPublishedLinks({
                    ...publishedLinks,
                    youtube: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <FaInstagram className="w-3.5 h-3.5 text-slate-400" /> Instagram
              </span>
              <Input
                type="url"
                placeholder="URL"
                className="h-9 bg-white"
                value={publishedLinks?.instagram || ""}
                onChange={(e) =>
                  setPublishedLinks({
                    ...publishedLinks,
                    instagram: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <FaLinkedin className="w-3.5 h-3.5 text-slate-400" /> LinkedIn
              </span>
              <Input
                type="url"
                placeholder="URL"
                className="h-9 bg-white"
                value={publishedLinks?.linkedin || ""}
                onChange={(e) =>
                  setPublishedLinks({
                    ...publishedLinks,
                    linkedin: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <FaFacebook className="w-3.5 h-3.5 text-slate-400" /> Facebook
              </span>
              <Input
                type="url"
                placeholder="URL"
                className="h-9 bg-white"
                value={publishedLinks?.facebook || ""}
                onChange={(e) =>
                  setPublishedLinks({
                    ...publishedLinks,
                    facebook: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end w-full pt-2">
            <Button
              onClick={handleSaveExpanded}
              disabled={isSaving}
              className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Links"}
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ContentCard;
