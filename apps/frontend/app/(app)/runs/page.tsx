"use client";

import { useEffect } from "react";
import { useRunsStore } from "@/lib/runs-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, XCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function RunsPage() {
  const { runs, isLoading, loadRuns } = useRunsStore();

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      failed: "destructive",
      running: "secondary",
      pending: "outline",
      cancelled: "outline",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return "—";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 
      ? `${minutes}m ${remainingSeconds}s` 
      : `${seconds}s`;
  };

  const getPassRate = (run: any) => {
    if (run.totalTests === 0) return 0;
    return Math.round((run.passedTests / run.totalTests) * 100);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Runs</h1>
          <p className="text-muted-foreground">
            View and manage orchestrated test executions
          </p>
        </div>
        <Button>
          <PlayCircle className="mr-2 h-4 w-4" />
          New Orchestration
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : runs.length === 0 ? (
        <Card className="p-12 text-center">
          <PlayCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No test runs yet</h3>
          <p className="text-muted-foreground mb-4">
            Start your first orchestrated test run to see results here
          </p>
          <Button>
            <PlayCircle className="mr-2 h-4 w-4" />
            Start Orchestration
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {runs.map((run) => (
            <Link key={run.id} href={`/runs/${run.id}`}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(run.status)}
                      <h3 className="font-semibold text-lg">
                        {run.project || "Test Run"}
                      </h3>
                      {getStatusBadge(run.status)}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      {run.branch && (
                        <span className="flex items-center gap-1">
                          <span className="font-mono">{run.branch}</span>
                        </span>
                      )}
                      {run.commitSha && (
                        <span className="font-mono text-xs">
                          {run.commitSha.substring(0, 7)}
                        </span>
                      )}
                      <span>
                        {formatDistanceToNow(new Date(run.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {run.totalTests} tests
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">
                          {run.passedTests} passed
                        </span>
                      </div>
                      {run.failedTests > 0 && (
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600 font-medium">
                            {run.failedTests} failed
                          </span>
                        </div>
                      )}
                      {run.flakyTests > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-yellow-600 font-medium">
                            {run.flakyTests} flaky
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div className="text-2xl font-bold">
                      {getPassRate(run)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDuration(run.durationMs)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {run.workerCount} workers
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
