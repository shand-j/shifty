import { SessionWorkspace } from "@/components/sessions/session-workspace"

export default async function SessionWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <SessionWorkspace sessionId={id} />
}
