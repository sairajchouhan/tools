import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const Route = createFileRoute("/")({ component: Index });

type QueryParam = { key: string; value: string };
type PathSegment = { id: string; value: string };

function Index() {
  const [url, setUrl] = useState("");
  const [parsedUrl, setParsedUrl] = useState<{
    protocol: string;
    hostname: string;
    pathSegments: PathSegment[];
    queryParams: QueryParam[];
    hash: string;
  }>({
    protocol: "",
    hostname: "",
    pathSegments: [],
    queryParams: [],
    hash: "",
  });
  console.log(parsedUrl)
  

  useEffect(() => {
    if (url) {
      try {
        const urlObj = new URL(url);

        // Parse path segments
        const pathSegments = urlObj.pathname
          .split("/")
          .filter(Boolean)
          .map((segment, index) => ({
            id: `segment-${index}`,
            value: segment,
          }));

        // Parse query parameters
        const queryParams: QueryParam[] = [];
        urlObj.searchParams.forEach((value, key) => {
          queryParams.push({ key, value });
        });

        setParsedUrl({
          protocol: urlObj.protocol.replace(":", ""),
          hostname: urlObj.hostname,
          pathSegments,
          queryParams,
          hash: urlObj.hash.replace("#", ""),
        });
      } catch (err: unknown) {
        console.error(err);
        setParsedUrl({
          protocol: "",
          hostname: "",
          pathSegments: [],
          queryParams: [],
          hash: "",
        });
      }
    }
  }, [url]);

  const handleDeletePathSegment = (segmentId: string) => {
    setParsedUrl({
      ...parsedUrl,
      pathSegments: parsedUrl.pathSegments.filter((s) => s.id !== segmentId),
    });
  };

  const handleDeleteQueryParam = (index: number) => {
    setParsedUrl({
      ...parsedUrl,
      queryParams: parsedUrl.queryParams.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="w-2/5 mx-auto p-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="url">URL</Label>
        <Input
          type="url"
          id="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      {parsedUrl.pathSegments.length > 0 && (
        <div className="mt-4">
          <Label>Path Segments</Label>
          <div className="mt-2 space-y-2">
            {parsedUrl.pathSegments.map((segment) => (
              <div key={segment.id} className="flex items-center gap-2">
                <Input
                  type="text"
                  value={segment.value}
                  className="text-sm font-medium"
                  onChange={(e) => {
                    const newSegments = parsedUrl.pathSegments.map((s) =>
                      s.id === segment.id ? { ...s, value: e.target.value } : s
                    );
                    setParsedUrl({ ...parsedUrl, pathSegments: newSegments });
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeletePathSegment(segment.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {parsedUrl.queryParams.length > 0 && (
        <div className="mt-4">
          <Label>Query Parameters</Label>
          <div className="mt-2 space-y-2">
            {parsedUrl.queryParams.map((param, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                <Input
                  type="text"
                  value={param.key}
                  className="text-sm font-medium"
                  placeholder="Key"
                  onChange={(e) => {
                    const newParams = parsedUrl.queryParams.map((p, i) =>
                      i === index ? { ...p, key: e.target.value } : p
                    );
                    setParsedUrl({ ...parsedUrl, queryParams: newParams });
                  }}
                />
                <Input
                  type="text"
                  value={param.value}
                  className="text-sm font-medium"
                  placeholder="Value"
                  onChange={(e) => {
                    const newParams = parsedUrl.queryParams.map((p, i) =>
                      i === index ? { ...p, value: e.target.value } : p
                    );
                    setParsedUrl({ ...parsedUrl, queryParams: newParams });
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteQueryParam(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
