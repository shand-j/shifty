"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  Loader2,
  TrendingUp,
  Clock
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

export function OrchestrationWidget() {
  const [recentRuns, setRecentRuns] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [runsResponse, queueStats] = await Promise.all([
        apiClient.getTestRuns({ limit: 5 }),
        apiClient.getQueueStats(),
      ]);
      setRecentRuns(runsResponse.runs || []);
      setStats(queueStats);
    } catch (error) {
      console.error("Failed to load orchestration data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "failed":
        return <XCircle className="h-3 w-3 text-red-500" />;
      case "running":
        return <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return "—";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m` : `${seconds}s`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">
          Test Orchestration
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/runs">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Queue Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-accent/50 rounded-md">
                  <div className="text-xs text-muted-foreground">Active</div>
                  <div className="text-lg font-bold text-blue-600">
                    {stats.active || 0}
                  </div>
                </div>
                <div className="text-center p-2 bg-accent/50 rounded-md">
                  <div className="text-xs text-muted-foreground">Waiting</div>
                  <div className="text-lg font-bold text-yellow-600">
                    {stats.waiting || 0}
                  </div>
                </div>
                <div className="text-center p-2 bg-accent/50 rounded-md">
                  <div className="text-xs text-muted-foreground">Completed</div>
                  <div className="text-lg font-bold text-green-600">
                    {stats.completed || 0}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Runs */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Recent Runs
              </div>
              {recentRuns.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No test runs yet
                </div>
              ) : (
                <div className="space-y-2">
                  {recentRuns.map((run) => (
                    <Link key={run.id} href={`/runs/${run.id}`}>
                      <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2 flex-1">
                          {getStatusIcon(run.status)}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {run.project || "Test Run"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {run.branch && (
                                <span className="font-mono">{run.branch}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{run.totalTests} tests</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round((run.passedTests / run.totalTests) * 100)}%
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Start Orchestration Button */}
            <Button className="w-full" asChild>
              <Link href="/runs">
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Orchestration
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
