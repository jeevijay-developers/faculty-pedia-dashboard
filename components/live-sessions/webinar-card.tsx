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
  Calendar,
  Clock,
  Edit,
  MoreHorizontal,
  Trash2,
  Users,
  BookOpen,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import { StatusBadge } from "./status-badge";

export interface Webinar {
  _id: string;
  title: string;
  description: {
    short: string;
    long: string;
  };
  image: {
    public_id: string;
    url: string;
  };
  webinarType: "OTO" | "OTA";
  time: string;
  subject: string;
  specialization: string;
  date: string;
  seatLimit: number;
  duration: number;
  fees: number;
  educatorId: {
    image: {
      public_id: string;
      url: string;
    };
    _id: string;
    firstName: string;
    lastName: string;
    rating: number;
    specialization: string;
  };
  webinarLink: string;
  assetsLinks: Array<{
    name: string;
    link: string;
    _id: string;
  }>;
  enrolledStudents: Array<{
    studentId: string;
    _id: string;
  }>;
  createdAt: string;
  updatedAt: string;
  slug?: string;
}

interface WebinarCardProps {
  webinar: Webinar;
  onEdit?: (webinar: Webinar) => void;
  onDelete?: (webinarId: string) => void;
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

export function WebinarCard({ webinar, onEdit, onDelete }: WebinarCardProps) {
  const { date, time } = formatDateTime(webinar.date);
  const capacity = Math.max(1, webinar.seatLimit);
  const enrolledCount = webinar.enrolledStudents.length;
  const fillPercentage = Math.min(100, (enrolledCount / capacity) * 100);

  const getWebinarStatus = () => {
    const webinarDate = new Date(webinar.date);
    const now = new Date();

    if (webinarDate > now) {
      return "scheduled";
    } else if (webinarDate < now) {
      return "completed";
    } else {
      return "ongoing";
    }
  };

  const status = getWebinarStatus();

  return (
    <Card className="border-border bg-card shadow-sm transition hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={status} />
              <Badge variant="outline" className="text-xs">
                {webinar.webinarType}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {webinar.specialization}
              </Badge>
            </div>
            <CardTitle className="text-lg font-semibold text-card-foreground line-clamp-2">
              {webinar.title}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(webinar)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(webinar._id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
          {webinar.description.short}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>{webinar.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>
              {enrolledCount}/{webinar.seatLimit}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="capitalize">{webinar.subject}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>{webinar.duration} min</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span>₹{webinar.fees}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Enrollment Progress</span>
            <span className="font-medium text-card-foreground">
              {Math.round(fillPercentage)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>

        {webinar.description.long && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>Description</span>
            </div>
            <div className="text-sm text-card-foreground bg-muted/30 p-3 rounded-md line-clamp-3">
              {webinar.description.long}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onEdit?.(webinar)}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onDelete?.(webinar._id)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
