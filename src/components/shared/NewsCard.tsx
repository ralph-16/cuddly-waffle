import { Card } from "@/components/ui/card";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { Eye } from "lucide-react";

type NewsItem = {
  headline: string;
  shortDetail: string;
  fullDetail: string;
  date: string;
  views: number;
  image?: string;
};

interface NewsCardProps {
  news: NewsItem;
  onClick?: () => void;
}

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function NewsCard({ news, onClick }: NewsCardProps) {
  return (
    <Card onClick={onClick} className="cursor-pointer overflow-hidden p-0">
      {news.image && (
        <AspectRatio ratio={16 / 9}>
          <img
            src={news.image}
            alt={news.headline}
            className="h-full w-full object-cover"
          />
        </AspectRatio>
      )}
      <div className="p-4">
        <h2 className="text-[15px] font-semibold leading-snug">
          {news.headline}
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {news.shortDetail}
        </p>
        <div className="mt-3 flex items-center justify-between text-[12px] text-muted-foreground">
          <span>{getRelativeTime(news.date)}</span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {news.views.toLocaleString()}
          </span>
        </div>
      </div>
    </Card>
  );
}
