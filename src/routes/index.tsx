import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, X } from "lucide-react";

export const Route = createFileRoute("/")({ component: Index });

type QueryParam = { key: string; value: string };
type PathSegment = { id: string; value: string };

function Index() {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState(() => {
    const savedUrl = localStorage.getItem("url");
    return savedUrl || "";
  });
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
      localStorage.setItem("url", url);
      try {
        // Remove hashbang pattern if present
        const cleanUrl = url.replace("/#!", "/");
        const urlObj = new URL(cleanUrl);

        // Only update path segments if they don't exist or if URL was manually changed
        setParsedUrl(prev => {
          // If we have existing path segments and URL wasn't manually changed, keep them
          const shouldKeepExistingSegments = prev.pathSegments.length > 0 && 
            prev.hostname === (urlObj.port ? `${urlObj.hostname}:${urlObj.port}` : urlObj.hostname) && 
            prev.protocol === urlObj.protocol.replace(":", "");

          const newPathSegments = shouldKeepExistingSegments
            ? prev.pathSegments
            : urlObj.pathname
                .split("/")
                .filter(Boolean)
                .map((segment, index) => ({
                  id: `segment-${Date.now()}-${index}`,
                  value: segment
                }));

          // Parse query parameters
          const queryParams: QueryParam[] = [];
          urlObj.searchParams.forEach((value, key) => {
            queryParams.push({ key, value });
          });

          return {
            protocol: urlObj.protocol.replace(":", ""),
            hostname: urlObj.port ? `${urlObj.hostname}:${urlObj.port}` : urlObj.hostname,
            pathSegments: newPathSegments,
            queryParams,
            hash: urlObj.hash.replace("#", "")
          };
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
    }else {
      localStorage.removeItem("url")
      setUrl("")
      setParsedUrl({
        protocol: "",
        hostname: "",
        pathSegments: [],
        queryParams: [],
        hash: "",
      })
    }
  }, [url]);

  useEffect(() => {
    if (parsedUrl.hostname) {
      try {
        const newUrl = new URL(`${parsedUrl.protocol}://${parsedUrl.hostname}`);
        
        // Add path segments
        const pathString = parsedUrl.pathSegments
          .map(segment => segment.value)
          .join('/');
        if (pathString) {
          newUrl.pathname = `/${pathString}`;
        }

        // Add query parameters
        parsedUrl.queryParams.forEach(param => {
          if (param.key) {
            newUrl.searchParams.set(param.key, param.value);
          }
        });

        // Add hash
        if (parsedUrl.hash) {
          newUrl.hash = `#${parsedUrl.hash}`;
        }

        const newUrlString = newUrl.toString();
        // Only update if there's a meaningful change to avoid infinite loops
        if (newUrlString !== url && newUrlString.replace(/\/$/, '') !== url.replace(/\/$/, '')) {
          setUrl(newUrlString);
        }
      } catch (err) {
        console.error('Error reconstructing URL:', err);
      }
    }
  }, [parsedUrl.protocol, parsedUrl.hostname, parsedUrl.pathSegments, parsedUrl.queryParams, parsedUrl.hash]);

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
        <div className="flex gap-2">
          <Input
            type="url"
            id="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={async () => {
              await navigator.clipboard.writeText(url);
              const button = document.querySelector('[data-copy-button]');
              if (button) {
                button.classList.add('scale-90');
                setTimeout(() => button.classList.remove('scale-90'), 100);
              }
              setCopied(true);
              setTimeout(() => setCopied(false), 1000);
            }}
            data-copy-button
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

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
        <Button
          variant="outline"
          className="mt-2 w-full"
          onClick={() => {
            setParsedUrl({
              ...parsedUrl,
              pathSegments: [
                ...parsedUrl.pathSegments,
                { id: `segment-${Date.now()}`, value: "" },
              ],
            });
          }}
        >
          Add Path Segment
        </Button>
      </div>

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
        <Button
          variant="outline"
          className="mt-2 w-full"
          onClick={() => {
            setParsedUrl({
              ...parsedUrl,
              queryParams: [...parsedUrl.queryParams, { key: "", value: "" }],
            });
          }}
        >
          Add Query Parameter
        </Button>
      </div>
    </div>
  );
}
