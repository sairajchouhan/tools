import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/asdf")({
  component: RouteComponent,
});

const html = `<h3>📝 Structural Summary</h3>
<ul>
<li>Key <code>details.dimensions.width</code>: value modified (number)</li>
<li>Key <code>details.dimensions.height</code>: value modified (number)</li>
<li>Key <code>details.dimensions.depth</code>: value modified (number)</li>
<li>Key <code>details.colors</code> added (array)</li>
<li>Key <code>warranty</code> added (string)</li>
<li>Key <code>tags[2]</code>: value modified</li>
<li>Key <code>reviews[1].rating</code>: value modified</li>
<li>Key <code>reviews[1].comment</code>: value modified</li>
<li>Key <code>price</code>: value modified (number)</li>
<li>Key <code>inStock</code>: value modified (boolean)</li>
<li>Key <code>version</code>: value modified (string)</li>
<li>Key <code>description</code>: value modified (string)</li>
<li>Key <code>details.weight</code>: value modified (string)</li>
</ul>
<h3>🔍 Detailed Breakdown</h3>
<h4>🟢 Added Keys</h4>
<ul>
<li><p><code>details.colors</code>: (Array) &quot;[&quot;black&quot;,&quot;silver&quot;,&quot;gold&quot;]&quot;
 <strong>Reason</strong>: New key added to object</p>
</li>
<li><p><code>warranty</code>: (String) &quot;2 years&quot;
 <strong>Reason</strong>: New key added to object</p>
</li>
</ul>
<h4>🔴 Removed Keys</h4>
<p><em>(None)</em></p>
<h4>🟡 Modified Keys</h4>
<ul>
<li><p><code>details.dimensions.width</code>:</p>
</li>
<li><p>Old: (Number) &quot;10&quot;</p>
</li>
<li><p>New: (Number) &quot;9.5&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>details.dimensions.height</code>:</p>
</li>
<li><p>Old: (Number) &quot;5&quot;</p>
</li>
<li><p>New: (Number) &quot;4.8&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>details.dimensions.depth</code>:</p>
</li>
<li><p>Old: (Number) &quot;2&quot;</p>
</li>
<li><p>New: (Number) &quot;1.8&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>tags[2]</code>:</p>
</li>
<li><p>Old: (String) &quot;popular&quot;</p>
</li>
<li><p>New: (String) &quot;premium&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>reviews[1].rating</code>:</p>
</li>
<li><p>Old: (Number) &quot;4&quot;</p>
</li>
<li><p>New: (Number) &quot;3&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>reviews[1].comment</code>:</p>
</li>
<li><p>Old: (String) &quot;Good value for money&quot;</p>
</li>
<li><p>New: (String) &quot;Decent, but overpriced&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>price</code>:</p>
</li>
<li><p>Old: (Number) &quot;99.99&quot;</p>
</li>
<li><p>New: (Number) &quot;89.99&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>inStock</code>:</p>
</li>
<li><p>Old: (Boolean) &quot;true&quot;</p>
</li>
<li><p>New: (Boolean) &quot;false&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>version</code>:</p>
</li>
<li><p>Old: (String) &quot;1.0.0&quot;</p>
</li>
<li><p>New: (String) &quot;2.0.0&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>description</code>:</p>
</li>
<li><p>Old: (String) &quot;A sample product&quot;</p>
</li>
<li><p>New: (String) &quot;An updated sample product&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>details.weight</code>:</p>
</li>
<li><p>Old: (String) &quot;1.2kg&quot;</p>
</li>
<li><p>New: (String) &quot;1.1kg&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
</ul>
<p><strong>Total Changes</strong>: [Added: 2, Removed: 0, Modified: 11]</p>
json-diff.tsx:51:10
summary  <h3>📝 Structural Summary</h3>
<ul>
<li>Key <code>details.dimensions.width</code>: value modified (number)</li>
<li>Key <code>details.dimensions.height</code>: value modified (number)</li>
<li>Key <code>details.dimensions.depth</code>: value modified (number)</li>
<li>Key <code>details.colors</code> added (array)</li>
<li>Key <code>warranty</code> added (string)</li>
<li>Key <code>tags[2]</code>: value modified</li>
<li>Key <code>reviews[1].rating</code>: value modified</li>
<li>Key <code>reviews[1].comment</code>: value modified</li>
<li>Key <code>price</code>: value modified (number)</li>
<li>Key <code>inStock</code>: value modified (boolean)</li>
<li>Key <code>version</code>: value modified (string)</li>
<li>Key <code>description</code>: value modified (string)</li>
<li>Key <code>details.weight</code>: value modified (string)</li>
</ul>
<h3>🔍 Detailed Breakdown</h3>
<h4>🟢 Added Keys</h4>
<ul>
<li><p><code>details.colors</code>: (Array) &quot;[&quot;black&quot;,&quot;silver&quot;,&quot;gold&quot;]&quot;
 <strong>Reason</strong>: New key added to object</p>
</li>
<li><p><code>warranty</code>: (String) &quot;2 years&quot;
 <strong>Reason</strong>: New key added to object</p>
</li>
</ul>
<h4>🔴 Removed Keys</h4>
<p><em>(None)</em></p>
<h4>🟡 Modified Keys</h4>
<ul>
<li><p><code>details.dimensions.width</code>:</p>
</li>
<li><p>Old: (Number) &quot;10&quot;</p>
</li>
<li><p>New: (Number) &quot;9.5&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>details.dimensions.height</code>:</p>
</li>
<li><p>Old: (Number) &quot;5&quot;</p>
</li>
<li><p>New: (Number) &quot;4.8&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>details.dimensions.depth</code>:</p>
</li>
<li><p>Old: (Number) &quot;2&quot;</p>
</li>
<li><p>New: (Number) &quot;1.8&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>tags[2]</code>:</p>
</li>
<li><p>Old: (String) &quot;popular&quot;</p>
</li>
<li><p>New: (String) &quot;premium&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>reviews[1].rating</code>:</p>
</li>
<li><p>Old: (Number) &quot;4&quot;</p>
</li>
<li><p>New: (Number) &quot;3&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>reviews[1].comment</code>:</p>
</li>
<li><p>Old: (String) &quot;Good value for money&quot;</p>
</li>
<li><p>New: (String) &quot;Decent, but overpriced&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>price</code>:</p>
</li>
<li><p>Old: (Number) &quot;99.99&quot;</p>
</li>
<li><p>New: (Number) &quot;89.99&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>inStock</code>:</p>
</li>
<li><p>Old: (Boolean) &quot;true&quot;</p>
</li>
<li><p>New: (Boolean) &quot;false&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>version</code>:</p>
</li>
<li><p>Old: (String) &quot;1.0.0&quot;</p>
</li>
<li><p>New: (String) &quot;2.0.0&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>description</code>:</p>
</li>
<li><p>Old: (String) &quot;A sample product&quot;</p>
</li>
<li><p>New: (String) &quot;An updated sample product&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
<li><p><code>details.weight</code>:</p>
</li>
<li><p>Old: (String) &quot;1.2kg&quot;</p>
</li>
<li><p>New: (String) &quot;1.1kg&quot;
 <strong>Reason</strong>: Value changed</p>
</li>
</ul>
<p><strong>Total Changes</strong>: [Added: 2, Removed: 0, Modified: 11]</p>`;

function RouteComponent() {
  return (
    <div>
      <div className="prose prose-li:m-0 prose-p:m-0" dangerouslySetInnerHTML={{ __html: html }} />

      {/* <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        {messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap">
            {m.role === "user" ? "User: " : "AI: "}
            {m.content}
          </div>
        ))}

        <form onSubmit={handleSubmit}>
          <input
            className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
      </div> */}
    </div>
  );
}
