"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateLiveClassDialog } from "@/components/create-live-class-dialog";
import { CreateWebinarDialog } from "@/components/create-webinar-dialog";
import { EditWebinarDialog } from "@/components/edit-webinar-dialog";
import { CreatePayPerHourDialog } from "@/components/create-pay-per-hour-dialog";
import { EditPayPerHourDialog } from "@/components/edit-pay-per-hour-dialog";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { useToast } from "@/components/toast";
import {
  PayPerHourTab,
  WebinarsTab,
  type PayPerHour,
  type Webinar,
} from "@/components/live-sessions";
import { Plus, Video } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  getEducatorPayPerHourSessions,
  deletePayPerHourSession,
  getEducatorWebinars,
  deleteWebinar,
  updateWebinar,
} from "@/util/server";

export default function LiveClassesPage() {
  const [isCreateSessionDialogOpen, setIsCreateSessionDialogOpen] =
    useState(false);
  const [isCreateWebinarDialogOpen, setIsCreateWebinarDialogOpen] =
    useState(false);
  const [isEditSessionDialogOpen, setIsEditSessionDialogOpen] = useState(false);
  const [isEditWebinarDialogOpen, setIsEditWebinarDialogOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [isDeleteWebinarConfirmationOpen, setIsDeleteWebinarConfirmationOpen] =
    useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [webinarToDelete, setWebinarToDelete] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<PayPerHour | null>(
    null
  );
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [payPerHourSessions, setPayPerHourSessions] = useState<PayPerHour[]>(
    []
  );
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [webinarLoading, setWebinarLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [webinarError, setWebinarError] = useState<string | null>(null);

  const { educator } = useAuth();
  const { showToast, ToastContainer } = useToast();

  // Fetch Pay Per Hour sessions
  useEffect(() => {
    const fetchPayPerHourSessions = async () => {
      if (!educator?._id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getEducatorPayPerHourSessions(educator._id);

        // The API returns { queries: [...] }, so we need to extract the queries array
        const sessions = response.queries || [];
        setPayPerHourSessions(sessions);
        setError(null);
      } catch (error) {
        console.error("Error fetching Pay Per Hour sessions:", error);
        setError("Failed to fetch sessions");
        setPayPerHourSessions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayPerHourSessions();
  }, [educator?._id]);

  // Fetch Webinars
  useEffect(() => {
    const fetchWebinars = async () => {
      if (!educator?._id) {
        setWebinarLoading(false);
        return;
      }

      try {
        setWebinarLoading(true);
        const response = await getEducatorWebinars(educator._id);

        // The API returns { webinars: [...] }, so we need to extract the webinars array
        const webinarList = response.webinars || [];
        setWebinars(webinarList);
        setWebinarError(null);
      } catch (error) {
        console.error("Error fetching webinars:", error);
        setWebinarError("Failed to fetch webinars");
        setWebinars([]);
      } finally {
        setWebinarLoading(false);
      }
    };

    fetchWebinars();
  }, [educator?._id]);

  // Refresh sessions after creating a new one
  const handleSessionCreated = async () => {
    if (educator?._id) {
      try {
        const response = await getEducatorPayPerHourSessions(educator._id);
        const sessions = response.queries || [];
        setPayPerHourSessions(sessions);
      } catch (error) {
        console.error("Error refreshing sessions:", error);
      }
    }
  };

  // Refresh webinars after updating
  const handleWebinarUpdated = async () => {
    if (educator?._id) {
      try {
        setWebinarLoading(true);
        const response = await getEducatorWebinars(educator._id);
        const webinarList = response.webinars || [];
        setWebinars(webinarList);
        setWebinarError(null);
        showToast("Webinar updated successfully!", "success");
      } catch (error) {
        console.error("Error refreshing webinars:", error);
        setWebinarError("Failed to refresh webinars");
      } finally {
        setWebinarLoading(false);
      }
    }
  };

  // Handle edit session
  const handleEditSession = (session: PayPerHour) => {
    setSelectedSession(session);
    setIsEditSessionDialogOpen(true);
  };

  // Handle delete session
  const handleDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setIsDeleteConfirmationOpen(true);
  };

  // Handle edit webinar
  const handleEditWebinar = (webinar: Webinar) => {
    setSelectedWebinar(webinar);
    setIsEditWebinarDialogOpen(true);
  };

  // Handle delete webinar
  const handleDeleteWebinar = (webinarId: string) => {
    setWebinarToDelete(webinarId);
    setIsDeleteWebinarConfirmationOpen(true);
  };

  // Confirm delete session
  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;

    try {
      await deletePayPerHourSession(sessionToDelete);

      // Refresh the sessions list after successful deletion
      if (educator?._id) {
        const response = await getEducatorPayPerHourSessions(educator._id);
        const sessions = response.queries || [];
        setPayPerHourSessions(sessions);
      }

      showToast("Pay Per Hour session deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting session:", error);

      // Handle different types of errors
      let errorMessage = "Failed to delete session. Please try again.";

      if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as any).response;
        const status = response?.status;
        const data = response?.data;

        if (status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (status === 404) {
          errorMessage = "Session not found. It may have already been deleted.";
        } else if (status === 403) {
          errorMessage = "You don't have permission to delete this session.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = data?.message || errorMessage;
        }
      }

      showToast(errorMessage, "error");
      throw error; // Re-throw to prevent dialog from closing
    } finally {
      setSessionToDelete(null);
    }
  };

  // Confirm delete webinar
  const confirmDeleteWebinar = async () => {
    if (!webinarToDelete) return;

    try {
      await deleteWebinar(webinarToDelete);

      // Refresh the webinars list after successful deletion
      if (educator?._id) {
        const response = await getEducatorWebinars(educator._id);
        const webinarList = response.webinars || [];
        setWebinars(webinarList);
      }

      showToast("Webinar deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting webinar:", error);

      // Handle different types of errors
      let errorMessage = "Failed to delete webinar. Please try again.";

      if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as any).response;
        const status = response?.status;
        const data = response?.data;

        if (status === 401) {
          errorMessage = "Authentication failed. Please login again.";
        } else if (status === 404) {
          errorMessage = "Webinar not found. It may have already been deleted.";
        } else if (status === 403) {
          errorMessage = "You don't have permission to delete this webinar.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = data?.message || errorMessage;
        }
      }

      showToast(errorMessage, "error");
      throw error; // Re-throw to prevent dialog from closing
    } finally {
      setWebinarToDelete(null);
    }
  };

  const totalPayPerHourSessions = payPerHourSessions.length;
  const totalWebinars = webinars.length;

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Tutoring Sessions Hub"
        description="Manage your Pay Per Hour sessions and webinars with ease."
      />

      <div className="px-6 space-y-6">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl text-card-foreground">
                Tutoring Sessions Hub
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your one-on-one sessions and webinars, track requests,
                and grow your tutoring business.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setIsCreateSessionDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Session
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreateWebinarDialogOpen(true)}
                className="gap-2"
              >
                <Video className="h-4 w-4" />
                Plan Webinar
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <Tabs defaultValue="pay-per-hour" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 rounded-lg border border-border bg-muted p-1">
                <TabsTrigger
                  value="pay-per-hour"
                  className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Pay Per Hour
                </TabsTrigger>
                <TabsTrigger
                  value="webinars"
                  className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  Webinars
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pay-per-hour" className="space-y-6">
                <PayPerHourTab
                  sessions={payPerHourSessions}
                  isLoading={isLoading}
                  error={error}
                  onEdit={handleEditSession}
                  onDelete={handleDeleteSession}
                />
              </TabsContent>

              <TabsContent value="webinars" className="space-y-6">
                <WebinarsTab
                  webinars={webinars}
                  isLoading={webinarLoading}
                  error={webinarError}
                  onCreateWebinar={() => setIsCreateWebinarDialogOpen(true)}
                  onEdit={handleEditWebinar}
                  onDelete={handleDeleteWebinar}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <CreatePayPerHourDialog
          open={isCreateSessionDialogOpen}
          onOpenChange={setIsCreateSessionDialogOpen}
          onSessionCreated={handleSessionCreated}
        />
        <EditPayPerHourDialog
          open={isEditSessionDialogOpen}
          onOpenChange={setIsEditSessionDialogOpen}
          session={selectedSession}
          onSessionUpdated={handleSessionCreated}
        />
        <DeleteConfirmationDialog
          open={isDeleteConfirmationOpen}
          onOpenChange={setIsDeleteConfirmationOpen}
          onConfirm={confirmDeleteSession}
          isLoading={isLoading}
        />
        <DeleteConfirmationDialog
          open={isDeleteWebinarConfirmationOpen}
          onOpenChange={setIsDeleteWebinarConfirmationOpen}
          onConfirm={confirmDeleteWebinar}
          isLoading={webinarLoading}
        />
        <CreateWebinarDialog
          open={isCreateWebinarDialogOpen}
          onOpenChange={setIsCreateWebinarDialogOpen}
          onWebinarCreated={async () => {
            // Refresh webinars list after creating a new webinar
            if (!educator?._id) return;

            try {
              setWebinarLoading(true);
              const response = await getEducatorWebinars(educator._id);
              const webinarList = response.webinars || [];
              setWebinars(webinarList);
              setWebinarError(null);
              showToast("Webinar created successfully!", "success");
            } catch (error) {
              console.error("Error refreshing webinars:", error);
              setWebinarError("Failed to refresh webinars");
            } finally {
              setWebinarLoading(false);
            }
          }}
        />
        <EditWebinarDialog
          open={isEditWebinarDialogOpen}
          onOpenChange={setIsEditWebinarDialogOpen}
          webinar={selectedWebinar}
          onWebinarUpdated={handleWebinarUpdated}
        />
      </div>
      <ToastContainer />
    </div>
  );
}
