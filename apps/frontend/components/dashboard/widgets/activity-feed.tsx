import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Activity {
  id: string
  user: { name: string; avatar?: string }
  action: string
  target: string
  timestamp: string
  type: "test" | "healing" | "session" | "pipeline"
}

const activities: Activity[] = [
  {
    id: "1",
    user: { name: "Alex Kim" },
    action: "approved healing for",
    target: "#login-button selector",
    timestamp: "2 min ago",
    type: "healing",
  },
  {
    id: "2",
    user: { name: "Jordan Lee" },
    action: "generated tests for",
    target: "checkout-flow.feature",
    timestamp: "15 min ago",
    type: "test",
  },
  {
    id: "3",
    user: { name: "Casey Patel" },
    action: "completed session",
    target: "Payment Integration",
    timestamp: "1 hour ago",
    type: "session",
  },
  {
    id: "4",
    user: { name: "Morgan Davis" },
    action: "triggered pipeline",
    target: "main branch",
    timestamp: "2 hours ago",
    type: "pipeline",
  },
]

const typeColors = {
  test: "bg-chart-2/20 text-chart-2",
  healing: "bg-chart-1/20 text-chart-1",
  session: "bg-chart-3/20 text-chart-3",
  pipeline: "bg-chart-4/20 text-chart-4",
}

export function ActivityFeed() {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">{activity.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm text-card-foreground">
                <span className="font-medium">{activity.user.name}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>{" "}
                <span className="font-medium">{activity.target}</span>
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={typeColors[activity.type]}>
                  {activity.type}
                </Badge>
                <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
