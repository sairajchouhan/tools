import { createFileRoute } from "@tanstack/react-router";
import { useState, ReactNode, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import "../components/JsonDiffStyles.css";
import { X, Copy, Edit, ArrowLeftRight, RefreshCw, Check, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/json-diff")({
  component: JsonDiff,
});

// Define types for our JSON values
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

interface JsonObject {
  [key: string]: JsonValue;
}

type JsonArray = JsonValue[];

interface DiffOutput {
  left: JsonValue;
  right: JsonValue;
}

function JsonDiff() {
  const [leftJson, setLeftJson] = useState<string>("");
  const [rightJson, setRightJson] = useState<string>("");
  const [diffOutput, setDiffOutput] = useState<DiffOutput | null>(null);
  const [error, setError] = useState<string>("");
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const [isLeftScrolling, setIsLeftScrolling] = useState(false);
  const [isRightScrolling, setIsRightScrolling] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "diff">("edit");
  const [leftCopied, setLeftCopied] = useState(false);
  const [rightCopied, setRightCopied] = useState(false);

  // Load sample data for demonstration
  const loadSampleData = () => {
    const sampleLeft = {
      name: "Product",
      version: "1.0.0",
      description: "A sample product",
      price: 99.99,
      inStock: true,
      tags: ["electronics", "gadget", "popular"],
      details: {
        manufacturer: "Sample Corp",
        weight: "1.2kg",
        dimensions: {
          width: 10,
          height: 5,
          depth: 2,
        },
      },
      reviews: [
        { user: "user1", rating: 5, comment: "Great product!" },
        { user: "user2", rating: 4, comment: "Good value for money" },
      ],
    };

    const sampleRight = {
      name: "Product",
      version: "2.0.0",
      description: "An updated sample product",
      price: 89.99,
      inStock: false,
      tags: ["electronics", "gadget", "premium"],
      details: {
        manufacturer: "Sample Corp",
        weight: "1.1kg",
        dimensions: {
          width: 9.5,
          height: 4.8,
          depth: 1.8,
        },
        colors: ["black", "silver", "gold"],
      },
      reviews: [
        { user: "user1", rating: 5, comment: "Great product!" },
        { user: "user3", rating: 3, comment: "Decent, but overpriced" },
      ],
      warranty: "2 years",
    };

    setLeftJson(JSON.stringify(sampleLeft, null, 2));
    setRightJson(JSON.stringify(sampleRight, null, 2));
  };

  // Handle synchronized scrolling
  useEffect(() => {
    const leftPanel = leftPanelRef.current;
    const rightPanel = rightPanelRef.current;

    if (!leftPanel || !rightPanel) return;

    const handleLeftScroll = () => {
      if (isRightScrolling) return;
      setIsLeftScrolling(true);
      rightPanel.scrollTop = leftPanel.scrollTop;
      setTimeout(() => setIsLeftScrolling(false), 50);
    };

    const handleRightScroll = () => {
      if (isLeftScrolling) return;
      setIsRightScrolling(true);
      leftPanel.scrollTop = rightPanel.scrollTop;
      setTimeout(() => setIsRightScrolling(false), 50);
    };

    leftPanel.addEventListener("scroll", handleLeftScroll);
    rightPanel.addEventListener("scroll", handleRightScroll);

    return () => {
      leftPanel.removeEventListener("scroll", handleLeftScroll);
      rightPanel.removeEventListener("scroll", handleRightScroll);
    };
  }, [isLeftScrolling, isRightScrolling]);

  const compareJson = () => {
    try {
      setError("");
      const leftObj = JSON.parse(leftJson || "{}") as JsonValue;
      const rightObj = JSON.parse(rightJson || "{}") as JsonValue;

      setDiffOutput({ left: leftObj, right: rightObj });
      setViewMode("diff");
    } catch (err) {
      setError(
        `Error parsing JSON: ${err instanceof Error ? err.message : String(err)}`
      );
      setDiffOutput(null);
    }
  };

  // Function to determine if a path has differences
  const hasDifference = (
    left: JsonValue,
    right: JsonValue,
    path: string[]
  ): boolean => {
    const leftValue = getValueByPath(left, path);
    const rightValue = getValueByPath(right, path);

    if (typeof leftValue !== typeof rightValue) return true;
    if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
      if (leftValue.length !== rightValue.length) return true;
      for (let i = 0; i < leftValue.length; i++) {
        if (hasDifference(left, right, [...path, i.toString()])) return true;
      }
      return false;
    }
    if (
      typeof leftValue === "object" &&
      leftValue !== null &&
      typeof rightValue === "object" &&
      rightValue !== null
    ) {
      const allKeys = new Set([
        ...Object.keys(leftValue as JsonObject),
        ...Object.keys(rightValue as JsonObject),
      ]);
      for (const key of allKeys) {
        if (hasDifference(left, right, [...path, key])) return true;
      }
      return false;
    }
    return leftValue !== rightValue;
  };

  // Function to get a nested value by path
  const getValueByPath = (obj: JsonValue, path: string[]): JsonValue => {
    if (path.length === 0) return obj;

    let current = obj;
    for (const key of path) {
      if (current === undefined || current === null) return null;
      if (typeof current === "object") {
        if (Array.isArray(current)) {
          current = current[parseInt(key, 10)];
        } else {
          current = (current as JsonObject)[key];
        }
      } else {
        return null;
      }
    }
    return current;
  };

  // Render a single side (left or right) of the JSON diff
  const renderSingleSideJson = (
    value: JsonValue,
    otherSideValue: JsonValue,
    path: string[] = [],
    isRoot: boolean = true,
    side: "left" | "right"
  ): ReactNode => {
    // Handle null or undefined
    if (value === undefined) {
      return <span className="text-gray-500 italic">undefined</span>;
    }

    if (value === null) {
      return <span className="text-gray-500 italic">null</span>;
    }

    // Different types between sides
    const otherSideValueAtPath = getValueByPath(otherSideValue, path);

    // Handle primitive values
    if (typeof value !== "object") {
      const valueIsDifferent = value !== otherSideValueAtPath;
      const bgClass = valueIsDifferent
        ? side === "left"
          ? "bg-red-50 text-red-700 px-1 rounded border-l-2 border-red-300"
          : "bg-green-50 text-green-700 px-1 rounded border-l-2 border-green-300"
        : "";

      return (
        <span className={bgClass}>
          {typeof value === "string" ? `"${value}"` : JSON.stringify(value)}
        </span>
      );
    }

    // Handle arrays
    if (Array.isArray(value)) {
      const otherSideArray = Array.isArray(otherSideValueAtPath)
        ? otherSideValueAtPath
        : [];

      return (
        <div className="inline">
          <span>[</span>
          {value.length > 0 && (
            <div className="ml-4">
              {value.map((item, i) => {
                const itemPath = [...path, i.toString()];
                const itemIsMissing = i >= otherSideArray.length;
                const bgClass = itemIsMissing
                  ? side === "left"
                    ? "bg-red-50 rounded px-1 border-l-2 border-red-300"
                    : "bg-green-50 rounded px-1 border-l-2 border-green-300"
                  : "";

                return (
                  <div key={i} className={bgClass}>
                    {renderSingleSideJson(
                      item,
                      otherSideValue,
                      itemPath,
                      false,
                      side
                    )}
                    {i < value.length - 1 && (
                      <span className="text-gray-400">,</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <span>]</span>
        </div>
      );
    }

    // Handle objects
    const valueObj = value as JsonObject;
    const otherSideObj =
      typeof otherSideValueAtPath === "object" &&
      otherSideValueAtPath !== null &&
      !Array.isArray(otherSideValueAtPath)
        ? (otherSideValueAtPath as JsonObject)
        : {};

    return (
      <div className="inline">
        <span>{isRoot ? "" : "{"}</span>
        {Object.keys(valueObj).length > 0 && (
          <div className={isRoot ? "" : "ml-4"}>
            {Object.keys(valueObj).map((key, i) => {
              const keyPath = [...path, key];
              const isKeyMissing = !(key in otherSideObj);
              const bgClass = isKeyMissing
                ? side === "left"
                  ? "bg-red-50 rounded px-1 my-0.5 border-l-2 border-red-300"
                  : "bg-green-50 rounded px-1 my-0.5 border-l-2 border-green-300"
                : "";

              return (
                <div key={key} className={bgClass}>
                  <span
                    className={`font-medium ${hasDifference(diffOutput!.left, diffOutput!.right, keyPath) ? "text-yellow-700" : "text-blue-600"}`}
                  >
                    "{key}"
                  </span>
                  <span className="text-gray-800">: </span>
                  {renderSingleSideJson(
                    valueObj[key],
                    otherSideValue,
                    keyPath,
                    false,
                    side
                  )}
                  {i < Object.keys(valueObj).length - 1 && (
                    <span className="text-gray-400">,</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <span>{isRoot ? "" : "}"}</span>
      </div>
    );
  };

  // Reset all inputs
  const resetFields = () => {
    setLeftJson("");
    setRightJson("");
    setDiffOutput(null);
    setError("");
    setViewMode("edit");
  };

  // Function to handle clipboard copy with visual feedback
  const handleCopy = async (text: string, side: "left" | "right") => {
    try {
      await navigator.clipboard.writeText(text);
      if (side === "left") {
        setLeftCopied(true);
        setTimeout(() => setLeftCopied(false), 2000);
      } else {
        setRightCopied(true);
        setTimeout(() => setRightCopied(false), 2000);
      }
    } catch (err) {
      setError(`Failed to copy to clipboard: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className={`container mx-auto ${viewMode === "diff" ? "p-3" : "p-6"} max-w-6xl`}>
      {viewMode === "edit" && (
        <div className="transition-all duration-300 ease-in-out">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="relative">
              <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-medium text-gray-500 z-10">
                Source JSON
              </div>
              <textarea
                id="leftJson"
                className="w-full h-64 p-4 border border-gray-200 rounded-md font-mono shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 pt-6"
                value={leftJson}
                onChange={(e) => setLeftJson(e.target.value)}
                placeholder='{"name": "John", "age": 30, "hobbies": ["Reading", "Hiking"]}'
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    compareJson();
                  }
                }}
              />
              {leftJson && (
                <Button
                  onClick={() => setLeftJson("")}
                  className="absolute top-2 right-2 p-1 h-7 w-7"
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="relative">
              <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-medium text-gray-500 z-10">
                Target JSON
              </div>
              <textarea
                id="rightJson"
                className="w-full h-64 p-4 border border-gray-200 rounded-md font-mono shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 pt-6"
                value={rightJson}
                onChange={(e) => setRightJson(e.target.value)}
                placeholder='{"name": "John", "age": 31, "hobbies": ["Reading", "Coding"]}'
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    compareJson();
                  }
                }}
              />
              {rightJson && (
                <Button
                  onClick={() => setRightJson("")}
                  className="absolute top-2 right-2 p-1 h-7 w-7"
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="mb-8 flex justify-center items-center space-x-4">
            <Button
              onClick={compareJson}
              variant="default"
              disabled={!leftJson || !rightJson}
            >
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Compare <span className="ml-2 text-xs opacity-70">(Ctrl+Enter)</span>
            </Button>
            {!leftJson && !rightJson && (
              <Button
                onClick={loadSampleData}
                variant="outline"
              >
                Load Example
              </Button>
            )}
          </div>
        </div>
      )}

      {viewMode === "diff" && diffOutput && (
        <div className="transition-all duration-300 ease-in-out">
          <div className="mb-2 flex justify-between items-center">
            <div className="text-xs text-gray-400 flex items-center space-x-3">
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-red-50 mr-1 border border-red-300"></span>
                Removed
              </span>
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-50 mr-1 border border-green-300"></span>
                Added
              </span>
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-50 mr-1 border border-yellow-300"></span>
                Changed
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={resetFields}
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Diff
              </Button>
              <Button
                onClick={() => setViewMode("edit")}
                variant="outline"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit JSON
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md border border-red-100 text-sm">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
            {error}
          </div>
        </div>
      )}

      {diffOutput && (
        <div className={viewMode === "diff" ? "mt-0" : "mt-6"}>
          {viewMode !== "diff" && (
            <div className="text-xs text-gray-400 mb-2 flex items-center space-x-4">
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-red-50 mr-1 border border-red-300"></span>
                Removed
              </span>
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-green-50 mr-1 border border-green-300"></span>
                Added
              </span>
              <span className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-50 mr-1 border border-yellow-300"></span>
                Changed
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`border border-gray-200 rounded-md bg-white overflow-auto font-mono relative ${viewMode === "diff" ? "h-[calc(100vh-150px)]" : "h-[500px]"} shadow-sm`}
              ref={leftPanelRef}
            >
              <div className="sticky top-0 z-20 bg-white ">
                <div className="px-3 pt-3 pb-2 border-b flex items-center justify-between text-gray-700 text-sm font-medium">
                  <div className="flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-2"></span>
                    Source
                  </div>
                  <Button
                    onClick={() => handleCopy(leftJson, "left")}
                    variant={leftCopied ? "outline" : "ghost"}
                    size="sm"
                    className={leftCopied ? "text-green-600 border-green-200" : ""}
                  >
                    {leftCopied ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    {leftCopied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-[auto_1fr] text-sm">
                <div className="pr-1 text-right text-gray-400 select-none border-r border-gray-200 mr-2 sticky left-0 bg-white z-10 shadow-sm">
                  {diffOutput.left &&
                    typeof diffOutput.left === "object" &&
                    Array(
                      JSON.stringify(diffOutput.left, null, 2).split("\n")
                        .length
                    )
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="leading-6 px-2">
                          {i + 1}
                        </div>
                      ))}
                </div>
                <div className="font-mono pl-1">
                  {renderSingleSideJson(
                    diffOutput.left,
                    diffOutput.right,
                    [],
                    true,
                    "left"
                  )}
                </div>
              </div>
            </div>
            <div
              className={`border border-gray-200 rounded-md bg-white overflow-auto font-mono relative ${viewMode === "diff" ? "h-[calc(100vh-150px)]" : "h-[500px]"} shadow-sm`}
              ref={rightPanelRef}
            >
              <div className="sticky top-0 z-20 bg-white">
                <div className="px-3 pt-3 pb-2 border-b flex items-center justify-between text-gray-700 text-sm font-medium">
                  <div className="flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                    Target
                  </div>
                  <Button
                    onClick={() => handleCopy(rightJson, "right")}
                    variant={rightCopied ? "outline" : "ghost"}
                    size="sm"
                    className={rightCopied ? "text-green-600 border-green-200" : ""}
                  >
                    {rightCopied ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    {rightCopied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-[auto_1fr] text-sm mt-2">
                <div className="pr-1 text-right text-gray-400 select-none border-r border-gray-200 mr-2 sticky left-0 bg-white z-10 shadow-sm">
                  {diffOutput.right &&
                    typeof diffOutput.right === "object" &&
                    Array(
                      JSON.stringify(diffOutput.right, null, 2).split("\n")
                        .length
                    )
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="leading-6 px-2">
                          {i + 1}
                        </div>
                      ))}
                </div>
                <div className="font-mono pl-1">
                  {renderSingleSideJson(
                    diffOutput.right,
                    diffOutput.left,
                    [],
                    true,
                    "right"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
