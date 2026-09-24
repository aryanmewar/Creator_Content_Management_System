import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import MultiSelect from "../common/MultiSelect.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CONTENT_TYPES_OPTIONS = ["Reel", "Post", "Lecture video"].map((t) => ({
  label: t,
  value: t,
}));

const getSchema = (isOwnerView) =>
  z.object({
    title: z.string().min(2, "Title must be at least 2 characters").max(200),
    referenceLink: isOwnerView
      ? z.string().url("Must be a valid URL").optional().or(z.literal(""))
      : z
          .string()
          .url("Must be a valid URL")
          .min(1, "Reference link is required"),
    contentType: z
      .array(z.string())
      .min(1, "Please select at least one content type"),
    contributors: isOwnerView
      ? z.array(z.string()).optional()
      : z.array(z.string()).min(1, "Please select at least one contributor"),
    dueDate: isOwnerView
      ? z
          .string()
          .optional()
          .refine((val) => !val || !isNaN(new Date(val).getTime()), {
            message: "Invalid due date",
          })
      : z
          .string()
          .min(1, "Due date is required")
          .refine((val) => !isNaN(new Date(val).getTime()), {
            message: "Invalid due date",
          }),
    completionDate: z
      .string()
      .refine((val) => !isNaN(new Date(val).getTime()), {
        message: "Invalid date",
      }),
    notes: z.string().max(2000).optional(),
  });

const ContentForm = ({
  isOpen,
  onClose,
  onSubmit,
  content = null,
  isLoading = false,
  instructors = [],
  hideDueDate = false,
  isOwnerView = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(getSchema(isOwnerView)),
  });

  useEffect(() => {
    if (content) {
      const dateStr = content.completionDate
        ? new Date(content.completionDate).toISOString().split("T")[0]
        : "";
      const dueStr = content.dueDate
        ? new Date(content.dueDate).toISOString().split("T")[0]
        : "";

      let initialContributors = [];
      if (content.contributors && Array.isArray(content.contributors)) {
        initialContributors = content.contributors.map((c) => c._id || c);
      } else if (content.instructor) {
        initialContributors = [content.instructor._id || content.instructor];
      }

      reset({
        title: content.title || "",
        referenceLink: content.referenceLink || "",
        contentType: Array.isArray(content.contentType)
          ? content.contentType
          : content.contentType
            ? [content.contentType]
            : [],
        contributors: initialContributors,
        dueDate: dueStr,
        completionDate: dateStr,
        notes: content.notes || "",
      });
    } else {
      reset({
        title: "",
        referenceLink: "",
        contentType: [],
        contributors: [],
        dueDate: "",
        completionDate: "",
        notes: "",
      });
    }
  }, [content, reset, instructors]);

  const handleFormSubmit = (data) => {
    const clean = {
      title: data.title,
      referenceLink: data.referenceLink === "" ? null : data.referenceLink,
      contentType: data.contentType,
      contributors: data.contributors,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      completionDate: new Date(data.completionDate).toISOString(),
      notes: data.notes === "" ? null : data.notes,
      isOwnerContent: isOwnerView,
    };
    onSubmit(clean);
  };

  const contributorOptions = instructors.map((i) => ({
    label: i.name,
    value: i._id,
  }));

  const inputClasses =
    "w-full min-h-[44px] px-4 py-2 outline-none text-slate-800 font-normal bg-slate-50 border border-slate-200 shadow-sm rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/50 transition-colors placeholder:text-slate-400";
  const labelClasses =
    "text-sm font-semibold text-slate-700 px-1 mb-1 inline-block";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl p-8 bg-white shadow-2xl rounded-[32px] border border-slate-100">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold text-slate-800 tracking-tight">
            {content ? "Edit Content" : "Add New Content"}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500 mt-1">
            {content
              ? "Update the details of your content below."
              : "Fill out the form below to create a new piece of content."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="glass-content-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Left Column */}
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className={labelClasses}>
                  Content Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. React Hooks Explained"
                  {...register("title")}
                  className={`${inputClasses} ${errors.title ? "border-rose-400 ring-2 ring-rose-200" : ""}`}
                />
                {errors.title && (
                  <p className="text-xs font-medium text-rose-500 px-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className={labelClasses}>
                  Reference Link{" "}
                  {!isOwnerView && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  {...register("referenceLink")}
                  className={`${inputClasses} ${errors.referenceLink ? "border-rose-400 ring-2 ring-rose-200" : ""}`}
                />
                {errors.referenceLink && (
                  <p className="text-xs font-medium text-rose-500 px-1">
                    {errors.referenceLink.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className={labelClasses}>
                  Content Type <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="contentType"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      options={CONTENT_TYPES_OPTIONS}
                      placeholder="Select formats..."
                      value={field.value}
                      onChange={field.onChange}
                      className="[&>div.form-input]:min-h-[44px] [&>div.form-input]:bg-slate-50 [&>div.form-input]:border-slate-200 [&>div.form-input]:shadow-sm [&>div.form-input]:rounded-xl [&>div.form-input.focus]:bg-white [&>div.form-input]:text-slate-800"
                      error={errors.contentType?.message}
                    />
                  )}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className={labelClasses}>
                  {isOwnerView ? "Other Contributors" : "Contributors"}{" "}
                  {!isOwnerView && <span className="text-rose-500">*</span>}
                </label>
                <Controller
                  name="contributors"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      options={contributorOptions}
                      placeholder="Select team members..."
                      value={field.value}
                      onChange={field.onChange}
                      className="[&>div.form-input]:min-h-[44px] [&>div.form-input]:bg-slate-50 [&>div.form-input]:border-slate-200 [&>div.form-input]:shadow-sm [&>div.form-input]:rounded-xl [&>div.form-input.focus]:bg-white [&>div.form-input]:text-slate-800"
                      error={errors.contributors?.message}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {!hideDueDate && (
                  <div className="space-y-1.5">
                    <label className={labelClasses}>
                      Due Date{" "}
                      {!isOwnerView && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type="date"
                      {...register("dueDate")}
                      className={`${inputClasses} ${errors.dueDate ? "border-rose-400 ring-2 ring-rose-200" : ""}`}
                    />
                    {errors.dueDate && (
                      <p className="text-xs font-medium text-rose-500 px-1">
                        {errors.dueDate.message}
                      </p>
                    )}
                  </div>
                )}

                <div
                  className={`space-y-1.5 ${hideDueDate ? "col-span-2" : ""}`}
                >
                  <label className={labelClasses}>
                    Completion Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("completionDate")}
                    className={`${inputClasses} ${errors.completionDate ? "border-rose-400 ring-2 ring-rose-200" : ""}`}
                  />
                  {errors.completionDate && (
                    <p className="text-xs font-medium text-rose-500 px-1">
                      {errors.completionDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClasses}>Notes</label>
                <textarea
                  className={`${inputClasses} min-h-[96px] resize-none`}
                  placeholder="Additional instructions..."
                  {...register("notes")}
                />
                {errors.notes && (
                  <p className="text-xs font-medium text-rose-500 px-1">
                    {errors.notes.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>

        <div className="mt-8 pt-4 flex sm:justify-end gap-3 items-center border-t border-slate-100">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-600 font-medium hover:text-slate-800 hover:bg-slate-100/50 rounded-full h-11 px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="glass-content-form"
            disabled={isLoading}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-full h-11 px-8 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {isLoading
              ? "Processing..."
              : content
                ? "Save Changes"
                : "Create Content"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentForm;
