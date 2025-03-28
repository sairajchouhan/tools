import { createFileRoute } from "@tanstack/react-router";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Plus, Trash2, Copy, Check } from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import debounce from "lodash.debounce";
import { Textarea } from "../components/ui/textarea";

// Local storage key
const URL_STORAGE_KEY = "url-parser-url";

// Create debounced save function outside component
const createDebouncedSave = () =>
  debounce((value: string) => {
    localStorage.setItem(URL_STORAGE_KEY, value);
  }, 500);

export const Route = createFileRoute("/url-parser")({
  component: UrlParser,
});

function UrlParser() {
  const [copied, setCopied] = useState(false);
  // Get initial URL from localStorage or use default
  const [url, setUrlState] = useState(() => {
    const savedUrl = localStorage.getItem(URL_STORAGE_KEY);
    return (
      savedUrl ||
      "https://example.com/path/to/resource?param1=value1&param2=value2"
    );
  });

  // Initialize debounced save function
  const [debouncedSave] = useState(createDebouncedSave);

  // Function to update URL with debounced localStorage persistence
  const setUrl = useCallback(
    (newUrl: string) => {
      // remove hash-bang (#!) notation if present
      const cleanedUrl = newUrl.replace(/\/#!/, "");

      // Update state immediately
      setUrlState(cleanedUrl);

      // Debounced save to localStorage
      debouncedSave(cleanedUrl);
    },
    [debouncedSave]
  );

  // Clean up debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Parse URL
  const { pathSegments, queryParams, urlObj } = useMemo(() => {
    try {
      const urlObj = new URL(url);

      // Parse path segments
      const pathSegments = urlObj.pathname
        .split("/")
        .filter((segment) => segment.length > 0);

      // Parse query parameters
      const queryParams = Array.from(urlObj.searchParams.entries()).map(
        ([key, value]) => ({ key, value })
      );

      return { pathSegments, queryParams, urlObj };
    } catch {
      // Return empty values if URL is invalid
      return {
        pathSegments: [],
        queryParams: [],
        urlObj: null,
      };
    }
  }, [url]);

  // Update URL when path segments change
  const handlePathSegmentChange = useCallback(
    (index: number, newValue: string) => {
      if (!urlObj) return;

      const newPathSegments = [...pathSegments];
      newPathSegments[index] = newValue;

      const newPathname = "/" + newPathSegments.join("/");
      const newUrl = new URL(urlObj.toString());
      newUrl.pathname = newPathname;

      setUrl(newUrl.toString());
    },
    [pathSegments, urlObj, setUrl]
  );

  // Update URL when query parameters change
  const handleQueryParamChange = useCallback(
    (index: number, field: "key" | "value", newValue: string) => {
      if (!urlObj) return;

      const newParams = [...queryParams];
      const oldParam = newParams[index];

      // Create a new object to avoid mutation
      newParams[index] = {
        ...oldParam,
        [field]: newValue,
      };

      // Create a new URL object
      const newUrl = new URL(urlObj.toString());

      // Clear all existing params
      newUrl.search = "";

      // Add all params back
      newParams.forEach((param) => {
        if (param.key) {
          newUrl.searchParams.append(param.key, param.value);
        }
      });

      setUrl(newUrl.toString());
    },
    [queryParams, urlObj, setUrl]
  );

  // Add a new path segment
  const handleAddPathSegment = useCallback(() => {
    if (!urlObj) return;

    const newPathSegments = [...pathSegments, ""];
    const newPathname = "/" + newPathSegments.join("/");

    const newUrl = new URL(urlObj.toString());
    newUrl.pathname = newPathname;

    setUrl(newUrl.toString());
  }, [pathSegments, urlObj, setUrl]);

  // Add a new query parameter
  const handleAddQueryParam = useCallback(() => {
    if (!urlObj) return;

    const newUrl = new URL(urlObj.toString());
    newUrl.searchParams.append("", "");

    setUrl(newUrl.toString());
  }, [urlObj, setUrl]);

  // Remove a path segment
  const handleRemovePathSegment = useCallback(
    (index: number) => {
      if (!urlObj) return;

      const newPathSegments = [...pathSegments];
      newPathSegments.splice(index, 1);

      const newPathname = "/" + newPathSegments.join("/");
      const newUrl = new URL(urlObj.toString());
      newUrl.pathname = newPathname;

      setUrl(newUrl.toString());
    },
    [pathSegments, urlObj, setUrl]
  );

  // Remove a query parameter
  const handleRemoveQueryParam = useCallback(
    (index: number) => {
      if (!urlObj) return;

      const newParams = [...queryParams];
      newParams.splice(index, 1);

      const newUrl = new URL(urlObj.toString());
      newUrl.search = "";

      newParams.forEach((param) => {
        if (param.key) {
          newUrl.searchParams.append(param.key, param.value);
        }
      });

      setUrl(newUrl.toString());
    },
    [queryParams, urlObj, setUrl]
  );

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">URL Parser</h1>

      <div className="space-y-8">
        {/* URL Input */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="url-input"
              className="text-base font-medium block mb-2"
            >
              Enter URL
            </Label>
            <Button
              variant="outline"
              size="icon"
              title={copied ? "Copied!" : "Copy URL"}
              onClick={handleCopyUrl}
              className="mb-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex flex-col space-y-2">
            <Textarea
              id="url-input"
              placeholder="https://example.com/path/to/resource?param1=value1&param2=value2"
              className="font-mono resize-none min-h-[100px]"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Path Segments Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Path Segments</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddPathSegment}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Segment
              </Button>
            </div>
            <div className="space-y-3">
              {pathSegments.length > 0 ? (
                pathSegments.map((segment, index) => (
                  <div key={index} className="flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-medium mr-3">
                      {index + 1}
                    </span>
                    <Input
                      className="font-mono"
                      placeholder="path segment"
                      value={segment}
                      onChange={(e) =>
                        handlePathSegmentChange(index, e.target.value)
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={() => handleRemovePathSegment(index)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No path segments found
                </div>
              )}
            </div>
          </div>

          {/* Query Parameters Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Query Parameters</h2>
              <Button variant="outline" size="sm" onClick={handleAddQueryParam}>
                <Plus className="h-4 w-4 mr-1" />
                Add Parameter
              </Button>
            </div>
            <div className="space-y-3">
              {queryParams.length > 0 ? (
                queryParams.map((param, index) => (
                  <div key={index}>
                    <div className="flex items-center">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                          <Input
                            className="font-mono bg-gray-50"
                            placeholder="Key"
                            value={param.key}
                            onChange={(e) =>
                              handleQueryParamChange(
                                index,
                                "key",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            className="font-mono"
                            placeholder="Value"
                            value={param.value}
                            onChange={(e) =>
                              handleQueryParamChange(
                                index,
                                "value",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        onClick={() => handleRemoveQueryParam(index)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No query parameters found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
