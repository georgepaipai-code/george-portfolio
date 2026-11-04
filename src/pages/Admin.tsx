import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LoginForm } from "@/components/admin/LoginForm";
import { ParseLinkPanel } from "@/components/admin/ParseLinkPanel";
import { EventForm } from "@/components/admin/EventForm";
import { AdminEventList } from "@/components/admin/AdminEventList";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { CopyNewsletterPanel } from "@/components/admin/CopyNewsletterPanel";
import {
  adminMe,
  adminLogout,
  adminCreateEvent,
  adminUpdateEvent,
  adminDeleteEvent,
  getUpcomingEvents,
  getPastEvents,
  ApiError,
} from "@/lib/events-api";
import type { EventDraft, EventRecord } from "@/types/event";

function useNoindex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
}

type FormPanelState =
  | { mode: "closed" }
  | { mode: "add"; draft: EventDraft; highlightFields: string[] }
  | { mode: "edit"; event: EventRecord };

export default function Admin() {
  useNoindex();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [panel, setPanel] = useState<FormPanelState>({ mode: "closed" });
  const [deleteTarget, setDeleteTarget] = useState<EventRecord | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminMe()
      .then((r) => setLoggedIn(r.loggedIn))
      .catch(() => setLoggedIn(false));
  }, []);

  const upcomingQuery = useQuery({
    queryKey: ["admin-events", "upcoming"],
    queryFn: getUpcomingEvents,
    enabled: loggedIn === true,
  });
  const pastQuery = useQuery({
    queryKey: ["admin-events", "past"],
    queryFn: getPastEvents,
    enabled: loggedIn === true,
  });

  function refreshLists() {
    queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    queryClient.invalidateQueries({ queryKey: ["events"] });
  }

  async function handleLogout() {
    await adminLogout();
    setLoggedIn(false);
  }

  async function handleSave(draft: EventDraft) {
    setSaving(true);
    try {
      if (panel.mode === "edit") {
        await adminUpdateEvent(panel.event.id, draft);
        toast({ title: "Event updated" });
      } else {
        await adminCreateEvent(draft);
        toast({ title: "Event added" });
      }
      setPanel({ mode: "closed" });
      refreshLists();
    } catch (err) {
      toast({
        title: "Couldn't save event",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await adminDeleteEvent(deleteTarget.id);
      toast({ title: "Event deleted" });
      refreshLists();
    } catch (err) {
      toast({
        title: "Couldn't delete event",
        description: err instanceof ApiError ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setDeleteTarget(null);
    }
  }

  if (loggedIn === null) {
    return (
      <div className="min-h-screen bg-background text-white">
        <Navbar />
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-background text-white">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 pt-28 md:px-8">
          <LoginForm onSuccess={() => setLoggedIn(true)} />
        </div>
      </div>
    );
  }

  const isFormOpen = panel.mode !== "closed";

  return (
    <div className="min-h-screen bg-background text-white">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-28 md:px-8">
        <h1 className="font-display text-2xl font-bold text-white md:text-3xl">Admin</h1>

        <div className="mt-6">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => setPanel({ mode: "add", draft: {}, highlightFields: [] })}
          >
            <Plus className="mr-1 h-4 w-4" /> Add event
          </Button>
        </div>

        <div className="mt-8">
          <AdminEventList
            upcoming={upcomingQuery.data ?? []}
            past={pastQuery.data ?? []}
            onEdit={(event) => setPanel({ mode: "edit", event })}
            onDeleteRequest={(event) => setDeleteTarget(event)}
          />
        </div>

        <div className="mt-14 border-t border-card-border pt-8">
          <h2 className="mb-3 font-display text-lg font-semibold">Newsletter</h2>
          <CopyNewsletterPanel upcomingEvents={upcomingQuery.data ?? []} />
        </div>

        <div className="mt-10 border-t border-card-border pt-6">
          <Button variant="outline" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(open) => !open && setPanel({ mode: "closed" })}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{panel.mode === "edit" ? "Edit event" : "Add event"}</DialogTitle>
          </DialogHeader>

          {panel.mode === "add" && (
            <Tabs defaultValue="link">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="link">From link</TabsTrigger>
                <TabsTrigger value="manual">Type it in</TabsTrigger>
              </TabsList>
              <TabsContent value="link" className="space-y-4">
                <ParseLinkPanel
                  onParsed={(draft, missingFields) => setPanel({ mode: "add", draft, highlightFields: missingFields })}
                />
                <EventForm
                  key={JSON.stringify(panel.draft)}
                  initial={panel.draft}
                  highlightFields={panel.highlightFields}
                  onSubmit={handleSave}
                  submitting={saving}
                  submitLabel="Add event"
                />
              </TabsContent>
              <TabsContent value="manual">
                <EventForm initial={{}} onSubmit={handleSave} submitting={saving} submitLabel="Add event" />
              </TabsContent>
            </Tabs>
          )}

          {panel.mode === "edit" && (
            <EventForm
              initial={panel.event}
              onSubmit={handleSave}
              submitting={saving}
              submitLabel="Save changes"
            />
          )}
        </DialogContent>
      </Dialog>

      {deleteTarget && (
        <ConfirmDeleteDialog
          title={deleteTarget.title}
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
