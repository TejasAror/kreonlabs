import { useState } from "react";

const icons = {
  image: (
    <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect width="18" height="14" x="3" y="5" rx="2" ry="2" strokeWidth="2" />
      <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" />
      <path d="M21 15l-5-5L5 21" strokeWidth="2" fill="none" />
    </svg>
  ),
  edit: (
    <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M15 5l4 4L7 21H3v-4L15 5z" strokeWidth="2" />
    </svg>
  ),
  clock: (
    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path d="M12 6v6l4 2" strokeWidth="2" />
    </svg>
  ),
  check: (
    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M9 11l3 3L22 4" strokeWidth="2" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeWidth="2" />
    </svg>
  ),
  arrow: (expanded: boolean) => (
    <svg className={`h-4 w-4 transform transition-transform ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M6 9l6 6 6-6" strokeWidth="2" />
    </svg>
  )
};

function KreonAssertions({ assertions }: { assertions: any[] }) {
  const [expanded, setExpanded] = useState(false);

  if (!assertions || assertions.length === 0) return null;

  const relevant = [
    ...assertions.filter((a) => a.label === "com.kreon-labs.story-registration"),
    ...assertions.filter((a) => a.label === "com.kreon-labs.hash-data"),
    ...assertions.filter(
      (a) =>
        ![
          "com.kreon-labs.story-registration",
          "com.kreon-labs.hash-data",
        ].includes(a.label)
    ),
  ];

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-green-400 hover:underline"
        aria-expanded={expanded}
      >
        <svg
          className={`h-4 w-4 transform transition-transform ${
            expanded ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Kreon Labs Assertions
      </button>

      {expanded && (
        <div className="space-y-4 mt-3">
          {relevant.map((a, idx) => {
            if (a.label === "com.kreon-labs.story-registration") {
              return (
                <div
                  key={idx}
                  className="bg-[#191A1A] border border-gray-700 rounded p-4 text-sm space-y-2"
                >
                  <div className="text-gray-200 font-semibold">
                    Story Protocol Registration
                  </div>
                  <div className="text-gray-300">
                    <div>
                      <span className="text-gray-400">Wallet:</span> {a.data?.wallet}
                    </div>
                    <div>
                      <span className="text-gray-400">Asset ID:</span> {a.data?.assetID}
                    </div>
                    <div>
                      <span className="text-gray-400">Hash:</span> {a.data?.hash}
                    </div>
                    <div>
                      <span className="text-gray-400">p-Hash:</span> {a.data?.pHash}
                    </div>
                  </div>
                </div>
              );
            }
            

            return (
              <div
                key={idx}
                className="bg-[#191A1A] border border-gray-700 rounded p-4 text-sm"
              >
                <div className="text-gray-200 font-semibold">{a.label}</div>
                <pre className="text-xs text-gray-400 whitespace-pre-wrap overflow-auto mt-2">
                  {JSON.stringify(a.data, null, 2)}
                </pre>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IngredientList({ ingredients }: { ingredients: any[] }) {
  return (
    <ul className="text-sm text-gray-300 space-y-6 pl-4 border-l border-gray-700 ml-2 mt-2">
      {ingredients.map((ing: any, idx: number) => {
        const manifest = ing.manifest || {};
        const nestedActions = manifest?.assertions?.find((a: any) => a.label === "c2pa.actions")?.data?.actions || [];
        const nestedIngredients = manifest?.ingredients || [];
        const nestedKreon = manifest?.assertions?.filter((a: any) =>
          a.label?.startsWith("com.kreon-labs")
        ) || [];

        return (
          <li key={idx} className="space-y-2">
            <div className="font-medium text-gray-100">
              {ing.title || "Untitled"} <span className="text-gray-500 text-xs">({ing.format || "Unknown"})</span>
            </div>

            {nestedKreon.length > 0 && <KreonAssertions assertions={nestedKreon} />}

            {nestedActions.length > 0 && (
              <div className="pl-2 pt-2 space-y-1">
                <div className="flex items-center gap-1 text-purple-400 font-medium">
                  {icons.edit}
                  Edits & Actions
                </div>
                <ul className="list-disc pl-5 text-gray-400">
                  {nestedActions.map((action: any, i: number) => (
                    <li key={i}>
                      {action.action.replace("c2pa.", "")}
                      {action.parameters?.name && ` (${action.parameters.name})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {nestedIngredients.length > 0 && (
              <div className="pl-3">
                <p className="text-sm text-gray-400 font-medium">Nested Ingredients:</p>
                <IngredientList ingredients={nestedIngredients} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function C2PAViewer({ manifest }: { manifest: any }) {
  const [expanded, setExpanded] = useState(false);

  const author = manifest?.assertions?.find((a: any) => a.label.includes("CreativeWork"))?.data?.author?.[0]?.name;
  const actions = manifest?.assertions?.find((a: any) => a.label === "c2pa.actions")?.data?.actions || [];
  const ingredients = manifest?.ingredients || [];
  const signatureTime = manifest?.signature_info?.time;
  const signer = manifest?.signature_info?.issuer;
  const claimGenerator = manifest?.claim_generator?.split("/")?.[0];
  const kreonAssertions = manifest?.assertions?.filter((a: any) =>
    a.label?.startsWith("com.kreon-labs")
  ) || [];

  return (
    <div className="max-w-3xl mx-auto bg-[#1C1D1D] text-white rounded-xl px-6 py-6 space-y-6 border border-gray-700 shadow-lg">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {icons.image}
          {manifest.title || "Untitled Image"}
        </h2>
        <p className="text-sm text-gray-400 pt-2">Format: {manifest.format || "Unknown"}</p>
        {claimGenerator && (
          <p className="text-sm text-gray-400">
            Generator: <span className="text-gray-300 font-semibold">{claimGenerator}</span>
          </p>
        )}
      </div>

      {author && (
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">Author</p>
          <p className="text-sm text-gray-200">{author}</p>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1">
          {icons.edit}
          Edits & Actions
        </div>
        {actions.length > 0 ? (
          <ul className="list-disc pl-6 text-sm text-gray-300 space-y-1">
            {actions.map((action: any, idx: number) => (
              <li key={idx}>
                {action.action.replace("c2pa.", "")}
                {action.parameters?.name && ` (${action.parameters.name})`}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 mt-1">No actions recorded.</p>
        )}
      </div>

      {kreonAssertions.length > 0 && <KreonAssertions assertions={kreonAssertions} />}

      {ingredients.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
            {icons.image}
            Source Ingredients
          </div>
          <IngredientList ingredients={ingredients} />
        </div>
      )}

      <div className="flex justify-between text-sm text-gray-400 border-t border-gray-700 pt-4 mt-4">
        <span className="flex items-center gap-1">
          {icons.clock}
          Signed: {signatureTime ? new Date(signatureTime).toLocaleString() : "Unknown"}
        </span>
        <span className="flex items-center gap-1">
          {icons.check}
          {signer || "Unknown signer"}
        </span>
      </div>

      <div className="pt-4 border-t border-gray-700 mt-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-400 font-medium flex items-center gap-1 hover:underline"
        >
          {expanded ? "Hide raw manifest" : "Show raw manifest"}
          {icons.arrow(expanded)}
        </button>
        {expanded && (
          <pre className="mt-3 p-3 rounded bg-[#191A1A] border border-gray-700 text-xs max-h-96 overflow-auto text-gray-200 whitespace-pre-wrap">
            {JSON.stringify(manifest, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
