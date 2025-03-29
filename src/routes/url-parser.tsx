import { createFileRoute } from "@tanstack/react-router";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Plus, Trash2, Copy, Check, GripVertical } from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import debounce from "lodash.debounce";
import { Textarea } from "../components/ui/textarea";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  MeasuringStrategy
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Local storage key
const URL_STORAGE_KEY = "url-parser-url";

// Create debounced save function outside component
const createDebouncedSave = () =>
  debounce((value: string) => {
    localStorage.setItem(URL_STORAGE_KEY, value);
  }, 500);

// Sortable Path Segment Item Component
function SortablePathSegment({ 
  segment, 
  index, 
  onChange, 
  onRemove 
}: { 
  segment: string; 
  index: number; 
  onChange: (index: number, value: string) => void; 
  onRemove: (index: number) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: `path-${index}`,
    animateLayoutChanges: () => false // Disable automatic animations for better control
  });

  const style = {
    transform: CSS.Translate.toString(transform), // Just use translate, not full transform
    transition: isDragging ? undefined : transition, // No transition while dragging for 1:1 mouse movement
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center bg-white py-1 px-2 rounded-md mb-1">
      <button 
        className="touch-manipulation p-1 cursor-grab opacity-50 hover:opacity-100" 
        {...attributes} 
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-medium ml-1 mr-1.5 text-xs">
        {index + 1}
      </span>
      <Input 
        className="font-mono text-sm h-8" 
        placeholder="path segment" 
        value={segment}
        onChange={(e) => onChange(index, e.target.value)}
      />
      <Button 
        variant="ghost" 
        size="icon" 
        className="ml-1 h-6 w-6"
        onClick={() => onRemove(index)}
      >
        <Trash2 className="h-3 w-3 text-muted-foreground" />
      </Button>
    </div>
  );
}

// Sortable Query Parameter Item Component
function SortableQueryParam({ 
  param, 
  index, 
  onChange, 
  onRemove 
}: { 
  param: { key: string; value: string }; 
  index: number; 
  onChange: (index: number, field: 'key' | 'value', value: string) => void; 
  onRemove: (index: number) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: `param-${index}`,
    animateLayoutChanges: () => false // Disable automatic animations for better control
  });

  const style = {
    transform: CSS.Translate.toString(transform), // Just use translate, not full transform
    transition: isDragging ? undefined : transition, // No transition while dragging for 1:1 mouse movement
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white py-1 px-2 rounded-md mb-1">
      <div className="flex items-center">
        <button 
          className="touch-manipulation p-1 cursor-grab opacity-50 hover:opacity-100" 
          {...attributes} 
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 grid grid-cols-3 gap-2 mx-2">
          <div className="col-span-1">
            <Input 
              className="font-mono bg-gray-50 text-sm h-8" 
              placeholder="Key" 
              value={param.key}
              onChange={(e) => onChange(index, 'key', e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <Input 
              className="font-mono text-sm h-8" 
              placeholder="Value" 
              value={param.value}
              onChange={(e) => onChange(index, 'value', e.target.value)}
            />
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-1 h-6 w-6"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="h-3 w-3 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/url-parser")({
  component: UrlParser,
});

function UrlParser() {
  const [copied, setCopied] = useState(false);
  // State for custom path segments if URL is invalid
  const [customPathSegments, setCustomPathSegments] = useState<string[]>([]);
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

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require a more intentional drag to start, but make movement responsive
      activationConstraint: {
        distance: 4, // Reduced distance for quicker activation
        delay: 0,    // No delay for immediate response
        tolerance: 0 // No tolerance for precise movement
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

      // Reset custom segments when we have a valid URL
      setCustomPathSegments([]);

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
      if (!urlObj) {
        // For invalid URL, update custom segments
        const newCustomSegments = [...customPathSegments];
        newCustomSegments[index] = newValue;
        setCustomPathSegments(newCustomSegments);
        return;
      }

      const newPathSegments = [...pathSegments];
      newPathSegments[index] = newValue;

      const newPathname = "/" + newPathSegments.join("/");
      const newUrl = new URL(urlObj.toString());
      newUrl.pathname = newPathname;

      setUrl(newUrl.toString());
    },
    [pathSegments, urlObj, setUrl, customPathSegments]
  );

  // Handle when path segments are reordered
  const handlePathSegmentDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      if (!urlObj) {
        // For invalid URL, reorder custom segments
        setCustomPathSegments(currentSegments => {
          const oldIndex = parseInt(active.id.toString().split('-')[1]);
          const newIndex = parseInt(over.id.toString().split('-')[1]);
          
          return arrayMove(currentSegments, oldIndex, newIndex);
        });
        return;
      }
      
      // For valid URL, reorder path segments
      const oldIndex = parseInt(active.id.toString().split('-')[1]);
      const newIndex = parseInt(over.id.toString().split('-')[1]);
      
      const newPathSegments = arrayMove([...pathSegments], oldIndex, newIndex);
      const newPathname = "/" + newPathSegments.join("/");
      
      const newUrl = new URL(urlObj.toString());
      newUrl.pathname = newPathname;
      
      setUrl(newUrl.toString());
    }
  }, [urlObj, pathSegments, setUrl]);

  // Handle when query parameters are reordered
  const handleQueryParamDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!urlObj) return;
    
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().split('-')[1]);
      const newIndex = parseInt(over.id.toString().split('-')[1]);
      
      const newParams = arrayMove([...queryParams], oldIndex, newIndex);
      
      const newUrl = new URL(urlObj.toString());
      newUrl.search = "";
      
      newParams.forEach(param => {
        if (param.key) {
          newUrl.searchParams.append(param.key, param.value);
        }
      });
      
      setUrl(newUrl.toString());
    }
  }, [urlObj, queryParams, setUrl]);

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
    // If URL is invalid, add to custom segments
    if (!urlObj) {
      setCustomPathSegments([...customPathSegments, ""]);
      return;
    }
    
    const newPathSegments = [...pathSegments, ""];
    const newPathname = "/" + newPathSegments.join("/");
    
    const newUrl = new URL(urlObj.toString());
    newUrl.pathname = newPathname;
    
    setUrl(newUrl.toString());
  }, [pathSegments, urlObj, setUrl, customPathSegments]);

  // Add a new query parameter
  const handleAddQueryParam = useCallback(() => {
    // If URL is invalid, create a basic valid URL first
    if (!urlObj) {
      setUrl("https://example.com");
      return;
    }
    
    const newUrl = new URL(urlObj.toString());
    newUrl.searchParams.append("", "");
    
    setUrl(newUrl.toString());
  }, [urlObj, setUrl]);

  // Remove a path segment
  const handleRemovePathSegment = useCallback(
    (index: number) => {
      if (!urlObj) {
        // For invalid URL, remove from custom segments
        const newCustomSegments = [...customPathSegments];
        newCustomSegments.splice(index, 1);
        setCustomPathSegments(newCustomSegments);
        return;
      }
      
      const newPathSegments = [...pathSegments];
      newPathSegments.splice(index, 1);
      
      const newPathname = "/" + newPathSegments.join("/");
      const newUrl = new URL(urlObj.toString());
      newUrl.pathname = newPathname;
      
      setUrl(newUrl.toString());
    },
    [pathSegments, urlObj, setUrl, customPathSegments]
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

  // Display path segments from URL or custom segments if URL is invalid
  const displayPathSegments = urlObj ? pathSegments : customPathSegments;
  
  // Create sortable item IDs for path segments
  const pathSegmentsIds = displayPathSegments.map((_, index) => `path-${index}`);
  
  // Create sortable item IDs for query params
  const queryParamsIds = queryParams.map((_, index) => `param-${index}`);

  return (
    <div className="container mx-auto py-4 px-4 max-w-3xl">
      <div className="space-y-3">
        {/* URL Input */}
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <Label htmlFor="url-input" className="text-sm font-medium block mb-1">Enter URL</Label>
          <div className="flex flex-col space-y-1">
            <Textarea 
              id="url-input"
              placeholder="https://example.com/path/to/resource?param1=value1&param2=value2"
              className="font-mono resize-none min-h-[70px] text-sm"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <div className="self-end mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyUrl}
                className="flex items-center gap-1 h-7 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy URL
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Results Section */}
        <div className="space-y-3">
          {/* Path Segments Section */}
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold">Path Segments</h2>
              <div className="flex items-center">
                <Button variant="outline" size="sm" onClick={handleAddPathSegment} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Segment
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              {displayPathSegments.length > 0 ? (
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handlePathSegmentDragEnd}
                  measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
                >
                  <SortableContext 
                    items={pathSegmentsIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {displayPathSegments.map((segment, index) => (
                      <SortablePathSegment
                        key={pathSegmentsIds[index]}
                        segment={segment}
                        index={index}
                        onChange={handlePathSegmentChange}
                        onRemove={handleRemovePathSegment}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-center py-3 text-muted-foreground">
                  No path segments found. Click "Add Segment" to add one.
                </div>
              )}
            </div>
          </div>
          
          {/* Query Parameters Section */}
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold">Query Parameters</h2>
              <Button variant="outline" size="sm" onClick={handleAddQueryParam} className="h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Add Parameter
              </Button>
            </div>
            <div className="space-y-1">
              {queryParams.length > 0 ? (
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleQueryParamDragEnd}
                  measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
                >
                  <SortableContext 
                    items={queryParamsIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {queryParams.map((param, index) => (
                      <SortableQueryParam
                        key={queryParamsIds[index]}
                        param={param}
                        index={index}
                        onChange={handleQueryParamChange}
                        onRemove={handleRemoveQueryParam}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-center py-3 text-muted-foreground">
                  No query parameters found. Click "Add Parameter" to add one.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
