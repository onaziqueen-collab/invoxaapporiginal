import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Download, Share2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { InvoicePreview, printInvoice } from "@/lib/invoice-preview";

export const Route = createFileRoute("/_app/receipts/$id")({ component: ReceiptDetail });

function ReceiptDetail() {
  const { id } = useParams({ from: "/_app/receipts/$id" });
  const { state } = useStore();
  const nav = useNavigate();
  const receipt = state.receipts.find((r) => r.id === id);
  const invoice = receipt ? state.invoices.find((i) => i.id === receipt.invoiceId) : undefined;

  if (!receipt || !invoice) {
    return (
      <div className="card-elev p-10 text-center">
        <p className="text-sm text-mocha">Receipt not found.</p>
        <Link to="/receipts" className="btn-primary mt-4 inline-flex">Back to receipts</Link>
      </div>
    );
  }

  function share() {
    navigator.clipboard?.writeText(`${window.location.origin}/receipts/${receipt!.id}`);
    toast.success("Share link copied");
  }

  return (
    <div className="fade-up space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <button onClick={() => nav({ to: "/receipts" })} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Back</button>
        <div className="flex items-center gap-2 flex-wrap">
          <Link to={`/invoices/${invoice.id}`} className="btn-ghost"><FileText className="w-4 h-4" /> Open invoice</Link>
          <button onClick={share} className="btn-ghost"><Share2 className="w-4 h-4" /> Share</button>
          <button onClick={printInvoice} className="btn-primary"><Download className="w-4 h-4" /> Download receipt</button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto">
        <InvoicePreview invoice={invoice} mode="receipt" receiptNumber={receipt.number} />
      </div>
    </div>
  );
}