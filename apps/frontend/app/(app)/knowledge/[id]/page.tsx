import { KnowledgeEntryDetail } from "@/components/knowledge/knowledge-entry-detail"

export default function KnowledgeEntryPage({ params }: { params: { id: string } }) {
  return <KnowledgeEntryDetail entryId={params.id} />
}
