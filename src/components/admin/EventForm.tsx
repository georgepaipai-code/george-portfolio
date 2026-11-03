import { useState, type FormEvent, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { pacificWallTimeToUtcIso, utcIsoToPacificParts } from "@/lib/timezone";
import type { EventDraft } from "@/types/event";

function FieldWrapper({
  label,
  fieldKey,
  highlightFields,
  children,
}: {
  label: string;
  fieldKey: string;
  highlightFields: string[];
  children: ReactNode;
}) {
  const needsReview = highlightFields.includes(fieldKey);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={fieldKey}>{label}</Label>
        {needsReview && (
          <Badge variant="outline" className="border-amber-400/60 text-amber-400">
            Check this
          </Badge>
        )}
      </div>
      {children}
    </div>
  );
}

export interface EventFormValues {
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  locationName: string;
  address: string;
  city: string;
  isOnline: boolean;
  imageUrl: string;
  hostName: string;
  description: string;
  registrationUrl: string;
  sourceUrl: string;
  tags: string;
  featured: boolean;
  cohosted: boolean;
  cohostLabel: string;
}

function draftToFormValues(draft: EventDraft): EventFormValues {
  const start = draft.start ? utcIsoToPacificParts(draft.start) : { date: "", time: "" };
  const end = draft.end ? utcIsoToPacificParts(draft.end) : { date: "", time: "" };
  return {
    title: draft.title ?? "",
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
    locationName: draft.locationName ?? "",
    address: draft.address ?? "",
    city: draft.city ?? "",
    isOnline: draft.isOnline ?? false,
    imageUrl: draft.imageUrl ?? "",
    hostName: draft.hostName ?? "",
    description: draft.description ?? "",
    registrationUrl: draft.registrationUrl ?? "",
    sourceUrl: draft.sourceUrl ?? "",
    tags: (draft.tags ?? []).join(", "),
    featured: draft.featured ?? false,
    cohosted: draft.cohosted ?? false,
    cohostLabel: draft.cohostLabel ?? "",
  };
}

export function EventForm({
  initial,
  highlightFields = [],
  onSubmit,
  submitting,
  submitLabel,
}: {
  initial: EventDraft;
  highlightFields?: string[];
  onSubmit: (draft: EventDraft) => void | Promise<void>;
  submitting: boolean;
  submitLabel: string;
}) {
  const [values, setValues] = useState<EventFormValues>(() => draftToFormValues(initial));
  const [formError, setFormError] = useState<string | null>(null);

  function set<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!values.title.trim()) return setFormError("Title is required.");
    if (!values.startDate || !values.startTime) return setFormError("Start date and time are required.");
    if (!values.registrationUrl.trim()) return setFormError("Registration URL is required.");

    const draft: EventDraft = {
      title: values.title.trim(),
      start: pacificWallTimeToUtcIso(values.startDate, values.startTime),
      end: values.endDate && values.endTime ? pacificWallTimeToUtcIso(values.endDate, values.endTime) : undefined,
      timezone: "America/Los_Angeles",
      locationName: values.locationName.trim() || undefined,
      address: values.address.trim() || undefined,
      city: values.city.trim() || undefined,
      isOnline: values.isOnline,
      imageUrl: values.imageUrl.trim() || undefined,
      hostName: values.hostName.trim() || undefined,
      description: values.description.trim() || undefined,
      registrationUrl: values.registrationUrl.trim(),
      sourceUrl: values.sourceUrl.trim() || undefined,
      tags: values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      featured: values.featured,
      cohosted: values.cohosted,
      cohostLabel: values.cohosted ? values.cohostLabel.trim() || undefined : undefined,
    };

    onSubmit(draft);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FieldWrapper label="Title" fieldKey="title" highlightFields={highlightFields}>
        <Input id="title" value={values.title} onChange={(e) => set("title", e.target.value)} />
      </FieldWrapper>

      <div className="grid grid-cols-2 gap-4">
        <FieldWrapper label="Start date (Pacific)" fieldKey="start" highlightFields={highlightFields}>
          <Input
            id="startDate"
            type="date"
            value={values.startDate}
            onChange={(e) => set("startDate", e.target.value)}
          />
        </FieldWrapper>
        <FieldWrapper label="Start time (Pacific)" fieldKey="start" highlightFields={highlightFields}>
          <Input
            id="startTime"
            type="time"
            value={values.startTime}
            onChange={(e) => set("startTime", e.target.value)}
          />
        </FieldWrapper>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldWrapper label="End date (optional)" fieldKey="end" highlightFields={highlightFields}>
          <Input
            id="endDate"
            type="date"
            value={values.endDate}
            onChange={(e) => set("endDate", e.target.value)}
          />
        </FieldWrapper>
        <FieldWrapper label="End time (optional)" fieldKey="end" highlightFields={highlightFields}>
          <Input
            id="endTime"
            type="time"
            value={values.endTime}
            onChange={(e) => set("endTime", e.target.value)}
          />
        </FieldWrapper>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="isOnline"
          checked={values.isOnline}
          onCheckedChange={(checked) => set("isOnline", checked === true)}
        />
        <Label htmlFor="isOnline">This is an online event</Label>
      </div>

      {!values.isOnline && (
        <>
          <FieldWrapper label="Location name" fieldKey="locationName" highlightFields={highlightFields}>
            <Input
              id="locationName"
              value={values.locationName}
              onChange={(e) => set("locationName", e.target.value)}
            />
          </FieldWrapper>
          <div className="grid grid-cols-2 gap-4">
            <FieldWrapper label="Address" fieldKey="address" highlightFields={highlightFields}>
              <Input id="address" value={values.address} onChange={(e) => set("address", e.target.value)} />
            </FieldWrapper>
            <FieldWrapper label="City" fieldKey="city" highlightFields={highlightFields}>
              <Input id="city" value={values.city} onChange={(e) => set("city", e.target.value)} />
            </FieldWrapper>
          </div>
        </>
      )}

      <FieldWrapper label="Host name" fieldKey="hostName" highlightFields={highlightFields}>
        <Input id="hostName" value={values.hostName} onChange={(e) => set("hostName", e.target.value)} />
      </FieldWrapper>

      <FieldWrapper label="Image URL" fieldKey="imageUrl" highlightFields={highlightFields}>
        <Input id="imageUrl" value={values.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} />
        {values.imageUrl && (
          <img
            src={values.imageUrl}
            alt="Preview"
            className="mt-2 h-32 w-full rounded-md object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        )}
      </FieldWrapper>

      <FieldWrapper label="Description" fieldKey="description" highlightFields={highlightFields}>
        <Textarea
          id="description"
          rows={4}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </FieldWrapper>

      <FieldWrapper label="Registration URL" fieldKey="registrationUrl" highlightFields={highlightFields}>
        <Input
          id="registrationUrl"
          value={values.registrationUrl}
          onChange={(e) => set("registrationUrl", e.target.value)}
        />
      </FieldWrapper>

      <FieldWrapper label="Source link (optional)" fieldKey="sourceUrl" highlightFields={highlightFields}>
        <Input id="sourceUrl" value={values.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)} />
      </FieldWrapper>

      <FieldWrapper label="Tags (comma-separated)" fieldKey="tags" highlightFields={highlightFields}>
        <Input id="tags" value={values.tags} onChange={(e) => set("tags", e.target.value)} />
      </FieldWrapper>

      <div className="flex items-center gap-2">
        <Checkbox
          id="featured"
          checked={values.featured}
          onCheckedChange={(checked) => set("featured", checked === true)}
        />
        <Label htmlFor="featured">George&apos;s Pick</Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="cohosted"
          checked={values.cohosted}
          onCheckedChange={(checked) => set("cohosted", checked === true)}
        />
        <Label htmlFor="cohosted">Cohosted</Label>
      </div>

      {values.cohosted && (
        <FieldWrapper label="Cohost label" fieldKey="cohostLabel" highlightFields={highlightFields}>
          <Input
            id="cohostLabel"
            placeholder="Cohosted by Fidelity Private Shares"
            value={values.cohostLabel}
            onChange={(e) => set("cohostLabel", e.target.value)}
          />
        </FieldWrapper>
      )}

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
