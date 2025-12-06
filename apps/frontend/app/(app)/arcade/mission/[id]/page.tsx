import { MissionWorkflow } from "@/components/arcade/mission-workflow"

export default function MissionPage({ params }: { params: { id: string } }) {
  return <MissionWorkflow missionId={params.id} />
}
