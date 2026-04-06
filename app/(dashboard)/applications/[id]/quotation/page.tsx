import { notFound } from "next/navigation";
import { fetchApplication } from "@/lib/api";
import { QuotationBuilder } from "@/components/quotation-builder";

export default async function CreateQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await fetchApplication(id);

  if (!application) {
    notFound();
  }

  return (
    <div className="p-6 md:p-8">
      <QuotationBuilder application={application} />
    </div>
  );
}
