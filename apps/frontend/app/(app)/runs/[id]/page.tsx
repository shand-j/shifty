"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRunsStore } from "@/lib/runs-store";
import { LiveRunViewer } from "@/components/runs/live-run-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  Download,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function RunDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.id as string;
  const { currentRun, isLoading, loadRunDetails } = useRunsStore();
  
  // Get auth token from localStorage (client-side only)
  const [apiKey, setApiKey] = useState<string>("");
  const [tenantId, setTenantId] = useState<string>("");

  useEffect(() => {
    if (runId) {
      loadRunDetails(runId);
    }
  }, [runId, loadRunDetails]);

  useEffect(() => {
    if (typeof globalThis.window !== "undefined") {
      setApiKey(localStorage.getItem("shifty_token") || "");
      // Get tenant ID from user data in localStorage
      const userData = localStorage.getItem("shifty_user");
      if (userData) {
        const user = JSON.parse(userData);
        setTenantId(user.tenantId || "");
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!currentRun) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Run not found</h3>
          <Button onClick={() => router.push("/runs")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Runs
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "skipped":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "flaky":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      passed: "default",
      failed: "destructive",
      skipped: "outline",
      flaky: "secondary",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 
      ? `${minutes}m ${remainingSeconds}s` 
      : `${seconds}s`;
  };

  const passedTests = currentRun.results.filter(r => r.status === "passed");
  const failedTests = currentRun.results.filter(r => r.status === "failed");
  const flakyTests = currentRun.results.filter(r => r.status === "flaky");
  const healedTests = currentRun.results.filter(r => r.healingSucceeded);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/runs")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {currentRun.project || "Test Run"}
            </h1>
            <p className="text-muted-foreground">
              {currentRun.branch && (
                <span className="font-mono mr-3">{currentRun.branch}</span>
              )}
              {currentRun.commitSha && (
                <span className="font-mono text-xs mr-3">
                  {currentRun.commitSha.substring(0, 7)}
                </span>
              )}
              <span>
                {formatDistanceToNow(new Date(currentRun.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Live Viewer for Running Tests */}
      {currentRun.status === "running" && apiKey && tenantId && (
        <LiveRunViewer
          runId={runId}
          tenantId={tenantId}
          apiKey={apiKey}
          wsUrl={process.env.NEXT_PUBLIC_RESULTS_WS_URL || "ws://localhost:3023/ws"}
        />
      )}

      {/* Stats Cards - Only show for completed runs */}
      {currentRun.status !== "running" && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentRun.totalTests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Passed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-green-600">
                {currentRun.passedTests}
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-red-600">
                {currentRun.failedTests}
              </div>
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(currentRun.durationMs || 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {currentRun.workerCount} workers
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Auto-Healed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {healedTests.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              selectors fixed
            </div>
          </CardContent>
        </Card>
      </div>

      )}

      {/* Test Results Tabs - Only show for completed runs */}
      {currentRun.status !== "running" && (
      <Card>
        <Tabs defaultValue="all" className="w-full">
          <CardHeader>
            <TabsList>
              <TabsTrigger value="all">
                All ({currentRun.results.length})
              </TabsTrigger>
              <TabsTrigger value="passed">
                Passed ({passedTests.length})
              </TabsTrigger>
              <TabsTrigger value="failed">
                Failed ({failedTests.length})
              </TabsTrigger>
              {flakyTests.length > 0 && (
                <TabsTrigger value="flaky">
                  Flaky ({flakyTests.length})
                </TabsTrigger>
              )}
              {healedTests.length > 0 && (
                <TabsTrigger value="healed">
                  Healed ({healedTests.length})
                </TabsTrigger>
              )}
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="all">
              <TestResultsList results={currentRun.results} />
            </TabsContent>
            <TabsContent value="passed">
              <TestResultsList results={passedTests} />
            </TabsContent>
            <TabsContent value="failed">
              <TestResultsList results={failedTests} />
            </TabsContent>
            <TabsContent value="flaky">
              <TestResultsList results={flakyTests} />
            </TabsContent>
            <TabsContent value="healed">
              <TestResultsList results={healedTests} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
      )}
    </div>
  );
}

function TestResultsList({ results }: { results: any[] }) {
  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tests in this category
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "skipped":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "flaky":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-2">
      {results.map((result) => (
        <div
          key={result.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            {getStatusIcon(result.status)}
            <div className="flex-1">
              <div className="font-medium">{result.testTitle}</div>
              <div className="text-sm text-muted-foreground font-mono">
                {result.testFile}
              </div>
              {result.errorMessage && (
                <div className="text-sm text-red-600 mt-1">
                  {result.errorMessage}
                </div>
              )}
              {result.healingSucceeded && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    Auto-healed
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {Math.round(result.durationMs)}ms
            </div>
            {result.retryCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {result.retryCount} retries
              </Badge>
            )}
            <div className="flex gap-1">
              {result.traceUrl && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={result.traceUrl} target="_blank" rel="noopener">
                    <FileText className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {result.screenshotUrl && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={result.screenshotUrl} target="_blank" rel="noopener">
                    <Image className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {result.videoUrl && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={result.videoUrl} target="_blank" rel="noopener">
                    <Video className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
