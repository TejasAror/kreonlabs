import AppNavbar from "@/components/AppNavbar";
import AppSidebar from "@/components/AppSideBar";

function WatermarkingLanding() {
  return (
    <AppSidebar>
      <AppNavbar title="C2PA & Watermarking" />

      <div className="flex justify-center m-5">
        <div className="max-w-4xl p-6 rounded-2xl shadow-md space-y-6">
          


          <section>
            <h2 className="text-3xl font-semibold">What is Watermarking?</h2>
            <p className="text-base mt-2">
              <strong>Watermarking</strong> is the process of embedding invisible or visible signals within digital media that can help identify ownership, detect tampering, or track distribution. It can be robust (surviving compression or transformations) or fragile (breaking if altered), depending on the application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">How Kreon Labs Uses Watermarking</h2>
            <p className="text-base mt-2">
              Kreon Labs uses advanced <strong>invisible watermarking</strong> techniques to embed copyright claims and traceability data directly into images. This watermarking:
            </p>
            <ul className="list-disc list-inside text-base space-y-1">
              <li>Acts as a digital fingerprint that links the media to its registered manifest.</li>
              <li>Enables <strong>copyright infringement scanning</strong> by matching suspected infringing media against known watermarked originals.</li>
              <li>Supports automated reporting workflows by surfacing violations in the dashboard, alongside metadata like <code>similarityScore</code> and <code>walletID</code>.</li>
            </ul>
            <p className="text-base">
              Combined with C2PA metadata, watermarking provides a multi-layered approach to authenticity, provenance, and copyright enforcement.
            </p>
          </section>
          
        </div>
      </div>
    </AppSidebar>
  );
}

export default WatermarkingLanding;
