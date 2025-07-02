import AppNavbar from "@/components/AppNavbar";
import AppSidebar from "@/components/AppSideBar";

function C2PALanding() {
  return (
    <AppSidebar>
      <AppNavbar title="C2PA" />
      
      <div className="flex justify-center m-5">
        <div className="max-w-4xl p-6 rounded-2xl shadow-md space-y-4 ">
          <h1 className="text-3xl font-bold">What is C2PA?</h1>
          <p className="text-base">
            The <strong>Coalition for Content Provenance and Authenticity (C2PA)</strong> is a standard developed to tackle the spread of misinformation and to establish transparency in digital media. It provides a framework for embedding secure, cryptographically verifiable metadata (called a <em>manifest</em>) into images, videos, and other digital assets. This metadata includes authorship, source, edit history, and tamper-evident claims.
          </p>

          <h2 className="text-2xl font-semibold">How Kreon Labs Uses C2PA</h2>
          <p className="text-base">
            <strong>Kreon Labs</strong> integrates the C2PA standard into its media registration and verification infrastructure. Each media asset processed through the Kreon platform is tagged with a C2PA manifest containing:
          </p>
          <ul className="list-disc list-inside text-base space-y-1">
            <li><strong>Claim Generator:</strong> Specifies the tool or app that generated the manifest.</li>
            <li><strong>Ingredients:</strong> References to prior versions or source assets, enabling parent-child traceability.</li>
            <li><strong>Assertions:</strong> Custom metadata like <code>story-registration</code> or <code>content-hash</code>.</li>
            <li><strong>Signature Info:</strong> Cryptographic signature ensuring authenticity and integrity of the data.</li>
          </ul>

          <p className="text-base">
            These manifests are validated and can be explored through Kreon's <strong>Story Explorer</strong> interface, offering transparency into how a piece of media was created and modified.
          </p>
        </div>
      </div>
    </AppSidebar>
  );
}

export default C2PALanding;
