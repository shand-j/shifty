import { DOMSnapshotViewer } from "@/components/healing/dom-snapshot-viewer"

export default async function DOMSnapshotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <DOMSnapshotViewer healingId={id} />
}
