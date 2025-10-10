import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  DollarSign,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
  User,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { StatusBadge } from "./status-badge";

export interface PayPerHour {
  _id: string;
  educator: string;
  subject: string;
  specialization: "IIT-JEE" | "NEET" | "CBSE";
  fees: number;
  preferredDate: string;
  duration: number; // in hours
  message?: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: string;
  updatedAt: string;
}

interface PayPerHourCardProps {
  payPerHour: PayPerHour;
  onEdit?: (session: PayPerHour) => void;
  onDelete?: (sessionId: string) => void;
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getSpecializationColor = (specialization: string) => {
  switch (specialization) {
    case "IIT-JEE":
      return "border-blue-400/40 text-blue-400";
    case "NEET":
      return "border-green-400/40 text-green-400";
    case "CBSE":
      return "border-purple-400/40 text-purple-400";
    default:
      return "border-border/60 text-muted-foreground";
  }
};

export function PayPerHourCard({
  payPerHour,
  onEdit,
  onDelete,
}: PayPerHourCardProps) {
  const { date } = formatDateTime(payPerHour.createdAt);
  const preferredDate = formatDate(payPerHour.preferredDate);

  return (
    <Card className="border-border bg-card shadow-sm transition hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={payPerHour.status} />
              <Badge
                variant="outline"
                className={`text-xs ${getSpecializationColor(
                  payPerHour.specialization
                )}`}
              >
                {payPerHour.specialization}
              </Badge>
            </div>
            <CardTitle className="text-lg font-semibold text-card-foreground line-clamp-2">
              {payPerHour.subject} Session
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Created on {date}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Session
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Cancel Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {payPerHour.message && (
          <CardDescription className="text-sm text-muted-foreground line-clamp-3">
            {payPerHour.message}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-5 pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>{preferredDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>{payPerHour.duration}h duration</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span>₹{payPerHour.fees}/hour</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="capitalize">{payPerHour.subject}</span>
          </div>
        </div>

        {payPerHour.message && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>Session Description</span>
            </div>
            <div className="text-sm text-card-foreground bg-muted/30 p-3 rounded-md">
              {payPerHour.message}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onEdit?.(payPerHour)}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onDelete?.(payPerHour._id)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
