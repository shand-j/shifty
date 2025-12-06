import { MemberProfile } from "@/components/teams/member-profile"

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string; memberId: string }>
}) {
  const { id, memberId } = await params
  return <MemberProfile teamId={id} memberId={memberId} />
}
