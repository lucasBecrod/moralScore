import CandidatoDetallePage from "@/features/candidato-detalle/CandidatoDetallePage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CandidatoDetallePage id={id} />;
}
