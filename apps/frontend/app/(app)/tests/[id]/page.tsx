import { TestCaseDetail } from "@/components/tests/test-case-detail"

export default async function TestCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TestCaseDetail testId={id} />
}
