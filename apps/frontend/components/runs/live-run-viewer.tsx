"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Activity,
} from "lucide-react";

interface TestResult {
  testFile: string;
  testName: string;
  testTitle: string;
  status: "passed" | "failed" | "skipped";
  durationMs: number;
  workerId: string;
  timestamp: string;
}

interface LiveRunStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  inProgress: number;
}

interface LiveRunViewerProps {
  runId: string;
  tenantId: string;
  apiKey: string;
  wsUrl?: string;
}

export function LiveRunViewer({
  runId,
  tenantId,
  apiKey,
  wsUrl = "ws://localhost:3023/ws",
}: Readonly<LiveRunViewerProps>) {
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState<LiveRunStats>({
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    inProgress: 0,
  });
  const [recentResults, setRecentResults] = useState<TestResult[]>([]);
  const [runStatus, setRunStatus] = useState<"running" | "completed" | "failed">("running");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Establish WebSocket connection
    const ws = new WebSocket(wsUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-Tenant-ID": tenantId,
        "X-Run-ID": runId,
      },
    } as any);

    ws.onopen = () => {
      console.log("[LiveRunViewer] Connected to results service");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleMessage(message);
      } catch (error) {
        console.error("[LiveRunViewer] Error parsing message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("[LiveRunViewer] WebSocket error:", error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("[LiveRunViewer] Disconnected from results service");
      setIsConnected(false);
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [runId, tenantId, apiKey, wsUrl]);

  const handleMessage = (message: any) => {
    const { type, payload } = message;

    switch (type) {
      case "run:start":
        setStats((prev) => ({
          ...prev,
          total: payload.totalTests,
        }));
        break;

      case "test:start":
        setStats((prev) => ({
          ...prev,
          inProgress: prev.inProgress + 1,
        }));
        break;

      case "test:batch":
        handleTestBatch(payload.results);
        break;

      case "run:complete":
        setRunStatus(payload.status === "completed" ? "completed" : "failed");
        break;

      default:
        break;
    }
  };

  const handleTestBatch = (results: TestResult[]) => {
    setStats((prev) => {
      const newStats = { ...prev };

      results.forEach((result) => {
        newStats.inProgress = Math.max(0, newStats.inProgress - 1);
        
        if (result.status === "passed") {
          newStats.passed += 1;
        } else if (result.status === "failed") {
          newStats.failed += 1;
        } else if (result.status === "skipped") {
          newStats.skipped += 1;
        }
      });

      return newStats;
    });

    // Update recent results (keep last 20)
    setRecentResults((prev) => {
      const updated = [...results, ...prev];
      return updated.slice(0, 20);
    });
  };

  const completedTests = stats.passed + stats.failed + stats.skipped;
  const progressPercentage = stats.total > 0 
    ? Math.round((completedTests / stats.total) * 100) 
    : 0;

  const passRate = completedTests > 0 
    ? Math.round((stats.passed / completedTests) * 100) 
    : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "skipped":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(() => {
                if (runStatus === "running") {
                  return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
                } else if (runStatus === "completed") {
                  return <CheckCircle className="h-5 w-5 text-green-500" />;
                } else {
                  return <XCircle className="h-5 w-5 text-red-500" />;
                }
              })()}
              <span className="font-semibold">
                {(() => {
                  if (runStatus === "running") {
                    return "Test run in progress...";
                  } else if (runStatus === "completed") {
                    return "Test run completed";
                  } else {
                    return "Test run failed";
                  }
                })()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              <span className="text-sm text-muted-foreground">
                {isConnected ? "Live" : "Disconnected"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
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
                {stats.passed}
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
                {stats.failed}
              </div>
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              {stats.inProgress > 0 && (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pass Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <span className="text-sm font-semibold">
              {completedTests} / {stats.total}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-2" />
          <div className="mt-2 text-xs text-muted-foreground">
            {progressPercentage}% complete
          </div>
        </CardContent>
      </Card>

      {/* Recent Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Test Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Waiting for test results...
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentResults.map((result, index) => (
                <div
                  key={`${result.testFile}-${result.testName}-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {result.testTitle || result.testName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {result.testFile}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {Math.round(result.durationMs / 1000)}s
                    </span>
                    <Badge
                      variant={(() => {
                        if (result.status === "passed") return "default";
                        if (result.status === "failed") return "destructive";
                        return "outline";
                      })()}
                      className="text-xs"
                    >
                      {result.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
