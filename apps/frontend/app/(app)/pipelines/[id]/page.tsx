import { PipelineDetail } from "@/components/pipelines/pipeline-detail"

export default async function PipelineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PipelineDetail pipelineId={id} />
}
