import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Copy as CopyIcon, Check as CheckIcon, GripVertical, ArrowUpDown as SwapIcon } from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import debounce from "lodash.debounce";
import { Textarea } from "../components/ui/textarea";
import { 
  DndContext, 
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  MeasuringStrategy
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
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
  
  // Second URL for comparison
  const [compareUrl, setCompareUrl] = useState("https://example.com/different/path?param1=value1&param3=value3");
  
  // Comparison mode toggle
  const [compareMode, setCompareMode] = useState(false);
  
  // Copy comparison results
  const [comparisonCopied, setComparisonCopied] = useState(false);
  
  // Initialize local path segments from the initial URL if possible
  const [localPathSegments, setLocalPathSegments] = useState<string[]>(() => {
    try {
      const savedUrl = localStorage.getItem(URL_STORAGE_KEY) || "https://example.com/path/to/resource";
      const urlObj = new URL(savedUrl);
      // Keep all segments including empty ones, but skip the first part (before first slash)
      return urlObj.pathname.split("/").slice(1);
    } catch {
      return [];
    }
  });

  // Initialize debounced save function
  const [debouncedSave] = useState(createDebouncedSave);

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require a more intentional drag to start, but make movement responsive
      activationConstraint: {
        distance: 4, // Reduced distance for quicker activation
        delay: 0,    // No delay for immediate response
        tolerance: 0 // No tolerance for precise movement
      },
    }),
    useSensor(TouchSensor, {
      // Require a more intentional drag to start, but make movement responsive
      activationConstraint: {
        distance: 4, // Reduced distance for quicker activation
        delay: 0,    // No delay for immediate response
        tolerance: 0 // No tolerance for precise movement
      },
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
      // Handle empty or very short URLs by providing a default
      if (!url || url.trim().length < 3) {
        console.log("URL is empty or too short, using default");
        return {
          pathSegments: [],
          queryParams: [],
          urlObj: null
        };
      }
      
      // If URL doesn't start with http:// or https://, add https://
      let urlToUse = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        urlToUse = 'https://' + url;
      }

      const urlObj = new URL(urlToUse);

      // Parse path segments - keep all segments including empty ones
      const pathParts = urlObj.pathname.split("/");
      // Skip first empty segment (before first slash)
      const pathSegments = pathParts.slice(1);
      
      // Update local path segments when URL changes, preserving empty segments
      setLocalPathSegments(pathSegments);

      // Parse query parameters
      const queryParams = Array.from(urlObj.searchParams.entries()).map(
        ([key, value]) => ({ key, value })
      );

      // Reset custom segments when we have a valid URL
      if (customPathSegments.length > 0) {
        setCustomPathSegments([]);
      }

      return { pathSegments, queryParams, urlObj };
    } catch (error) {
      console.error("Error parsing URL:", error, url);
      // Return empty values if URL is invalid
      return {
        pathSegments: [],
        queryParams: [],
        urlObj: null,
      };
    }
  }, [url, customPathSegments]);

  // Display path segments from URL or custom segments if URL is invalid
  const displayPathSegments = useMemo(() => {
    // Log for debugging
    console.log("URL object:", urlObj);
    console.log("Path segments:", pathSegments);
    console.log("Custom path segments:", customPathSegments);
    console.log("Local path segments:", localPathSegments);
    
    // Prioritize local segments first for immediate feedback
    if (localPathSegments.length > 0) {
      return localPathSegments;
    }
    
    // Use custom segments if URL is invalid, otherwise use parsed segments
    return urlObj ? pathSegments : customPathSegments;
  }, [urlObj, pathSegments, customPathSegments, localPathSegments]);

  // Helper function to keep local path segments synchronized with the URL
  const updatePathSegments = useCallback((segments: string[]) => {
    setLocalPathSegments(segments);
    
    // If we have a valid URL, update the URL with the new segments
    if (urlObj) {
      const newUrl = new URL(urlObj.toString());
      newUrl.pathname = "/" + segments.join("/");
      setUrl(newUrl.toString());
    } else {
      // Otherwise just update the custom segments
      setCustomPathSegments(segments);
    }
  }, [urlObj, setUrl]);

  // Update URL when path segments change
  const handlePathSegmentChange = useCallback(
    (index: number, newValue: string) => {
      // Create new segments array with the updated value
      const newSegments = [...localPathSegments];
      newSegments[index] = newValue;
      
      // Update path segments and URL
      updatePathSegments(newSegments);
    },
    [localPathSegments, updatePathSegments]
  );

  // Handle when path segments are reordered
  const handlePathSegmentDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().split('-')[1]);
      const newIndex = parseInt(over.id.toString().split('-')[1]);
      
      // Reorder segments and update URL
      const newSegments = arrayMove([...localPathSegments], oldIndex, newIndex);
      updatePathSegments(newSegments);
    }
  }, [localPathSegments, updatePathSegments]);

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
      
      // Add all params back, including empty ones
      newParams.forEach(param => {
        newUrl.searchParams.append(param.key || '', param.value || '');
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

      // Add all params back, including empty ones
      newParams.forEach((param) => {
        // Always append parameters even if key is empty
        newUrl.searchParams.append(param.key || '', param.value || '');
      });

      setUrl(newUrl.toString());
    },
    [queryParams, urlObj, setUrl]
  );

  // Add a new path segment
  const handleAddPathSegment = useCallback(() => {
    // Add an empty segment to local path segments
    const newSegments = [...localPathSegments, ""];
    updatePathSegments(newSegments);
    
    console.log("Added new path segment, new segments:", newSegments);
  }, [localPathSegments, updatePathSegments]);

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
      // Create new segments array without the removed segment
      const newSegments = [...localPathSegments];
      newSegments.splice(index, 1);
      
      // Update path segments and URL
      updatePathSegments(newSegments);
    },
    [localPathSegments, updatePathSegments]
  );

  // Remove a query parameter
  const handleRemoveQueryParam = useCallback(
    (index: number) => {
      if (!urlObj) return;

      const newParams = [...queryParams];
      newParams.splice(index, 1);

      const newUrl = new URL(urlObj.toString());
      newUrl.search = "";

      // Add all params back, including empty ones
      newParams.forEach((param) => {
        newUrl.searchParams.append(param.key || '', param.value || '');
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

  // Create sortable item IDs for path segments
  const pathSegmentsIds = localPathSegments.map((_, index) => `path-${index}`);
  
  // Create sortable item IDs for query params
  const queryParamsIds = queryParams.map((_, index) => `param-${index}`);

  // Parse comparison URL
  const { pathSegments: comparePathSegments, queryParams: compareQueryParams, urlObj: compareUrlObj } = useMemo(() => {
    if (!compareMode) return { pathSegments: [], queryParams: [], urlObj: null };
    
    try {
      // If URL doesn't start with http:// or https://, add https://
      let urlToUse = compareUrl;
      if (!compareUrl.startsWith('http://') && !compareUrl.startsWith('https://')) {
        urlToUse = 'https://' + compareUrl;
      }

      const urlObj = new URL(urlToUse);

      // Parse path segments - keep all segments including empty ones
      const pathParts = urlObj.pathname.split("/");
      // Skip first empty segment (before first slash)
      const pathSegments = pathParts.slice(1);

      // Parse query parameters
      const queryParams = Array.from(urlObj.searchParams.entries()).map(
        ([key, value]) => ({ key, value })
      );

      return { pathSegments, queryParams, urlObj };
    } catch (error) {
      console.error("Error parsing comparison URL:", error, compareUrl);
      // Return empty values if URL is invalid
      return {
        pathSegments: [],
        queryParams: [],
        urlObj: null,
      };
    }
  }, [compareUrl, compareMode]);

  // Swap URLs function
  const handleSwapUrls = useCallback(() => {
    if (urlObj && compareUrlObj) {
      setUrl(compareUrlObj.toString());
      setCompareUrl(urlObj.toString());
    }
  }, [urlObj, compareUrlObj, setUrl]);

  // Generate and copy comparison summary text
  const handleCopyComparisonSummary = useCallback(() => {
    if (!urlObj || !compareUrlObj) return;

    let summary = `URL Comparison Summary\n`;
    summary += `====================\n\n`;
    
    summary += `URL 1: ${url}\n`;
    summary += `URL 2: ${compareUrl}\n\n`;
    
    // Domain comparison
    summary += `Domain: ${urlObj.host === compareUrlObj.host ? 'MATCH' : 'DIFFERENT'}\n`;
    if (urlObj.host !== compareUrlObj.host) {
      summary += `  URL 1: ${urlObj.host}\n`;
      summary += `  URL 2: ${compareUrlObj.host}\n`;
    } else {
      summary += `  ${urlObj.host}\n`;
    }
    summary += `\n`;
    
    // Protocol comparison
    summary += `Protocol: ${urlObj.protocol === compareUrlObj.protocol ? 'MATCH' : 'DIFFERENT'}\n`;
    if (urlObj.protocol !== compareUrlObj.protocol) {
      summary += `  URL 1: ${urlObj.protocol.replace(':', '')}\n`;
      summary += `  URL 2: ${compareUrlObj.protocol.replace(':', '')}\n`;
    } else {
      summary += `  ${urlObj.protocol.replace(':', '')}\n`;
    }
    summary += `\n`;
    
    // Path comparison
    const pathsMatch = JSON.stringify(localPathSegments) === JSON.stringify(comparePathSegments);
    const pathLengthDiff = Math.abs(localPathSegments.length - comparePathSegments.length);
    const differentSegments = localPathSegments.filter((seg, i) => seg !== comparePathSegments[i]).length;
    
    summary += `Path: ${pathsMatch ? 'MATCH' : 'DIFFERENT'}\n`;
    if (!pathsMatch) {
      summary += `  Length difference: ${pathLengthDiff} segment${pathLengthDiff !== 1 ? 's' : ''}\n`;
      summary += `  Different segments: ${differentSegments}\n`;
      summary += `  URL 1: /${localPathSegments.join('/')}\n`;
      summary += `  URL 2: /${comparePathSegments.join('/')}\n`;
    } else {
      summary += `  /${localPathSegments.join('/')}\n`;
    }
    summary += `\n`;
    
    // Parameters comparison
    const paramsMatch = JSON.stringify(queryParams) === JSON.stringify(compareQueryParams);
    
    // Get all unique parameter keys
    const allKeys = new Set([
      ...queryParams.map(param => param.key),
      ...compareQueryParams.map(param => param.key)
    ]);
    
    const uniqueToFirst = queryParams
      .filter(p => !compareQueryParams.some(cp => cp.key === p.key))
      .map(p => p.key);
      
    const uniqueToSecond = compareQueryParams
      .filter(p => !queryParams.some(cp => cp.key === p.key))
      .map(p => p.key);
      
    const commonKeys = queryParams
      .filter(p => compareQueryParams.some(cp => cp.key === p.key))
      .map(p => p.key);
      
    const differentValues = commonKeys.filter(key => {
      const firstParam = queryParams.find(p => p.key === key);
      const secondParam = compareQueryParams.find(p => p.key === key);
      return firstParam?.value !== secondParam?.value;
    });
    
    summary += `Query Parameters: ${paramsMatch ? 'MATCH' : 'DIFFERENT'}\n`;
    if (!paramsMatch) {
      summary += `  Total parameters: ${allKeys.size}\n`;
      if (uniqueToFirst.length > 0) {
        summary += `  Only in URL 1: ${uniqueToFirst.join(', ')}\n`;
      }
      if (uniqueToSecond.length > 0) {
        summary += `  Only in URL 2: ${uniqueToSecond.join(', ')}\n`;
      }
      if (differentValues.length > 0) {
        summary += `  Same key, different value: ${differentValues.join(', ')}\n`;
        
        // Show the differing values
        differentValues.forEach(key => {
          const firstParam = queryParams.find(p => p.key === key);
          const secondParam = compareQueryParams.find(p => p.key === key);
          summary += `    ${key}: "${firstParam?.value}" vs "${secondParam?.value}"\n`;
        });
      }
    } else {
      summary += `  All parameters match\n`;
    }
    
    // Copy summary to clipboard
    navigator.clipboard.writeText(summary).then(() => {
      setComparisonCopied(true);
      setTimeout(() => setComparisonCopied(false), 2000);
    });
    
  }, [url, compareUrl, urlObj, compareUrlObj, localPathSegments, comparePathSegments, queryParams, compareQueryParams, setComparisonCopied]);

  // Calculate match score for comparison
  const matchScore = useMemo(() => {
    if (!compareMode || !urlObj || !compareUrlObj) return null;
    
    let totalPoints = 0;
    let earnedPoints = 0;
    
    // Domain comparison (worth 25%)
    totalPoints += 25;
    if (urlObj.host === compareUrlObj.host) earnedPoints += 25;
    
    // Protocol comparison (worth 10%)
    totalPoints += 10;
    if (urlObj.protocol === compareUrlObj.protocol) earnedPoints += 10;
    
    // Path comparison (worth 35%) 
    totalPoints += 35;
    // Calculate path similarity
    const maxPathLength = Math.max(localPathSegments.length, comparePathSegments.length);
    if (maxPathLength > 0) {
      let pathMatches = 0;
      for (let i = 0; i < maxPathLength; i++) {
        if (localPathSegments[i] === comparePathSegments[i]) pathMatches++;
      }
      const pathSimilarityPercentage = (pathMatches / maxPathLength) * 35;
      earnedPoints += pathSimilarityPercentage;
    } else {
      // Both paths are empty, so they match
      earnedPoints += 35;
    }
    
    // Query params comparison (worth 30%)
    totalPoints += 30;
    
    // Get all unique parameter keys
    const allKeys = new Set([
      ...queryParams.map(param => param.key),
      ...compareQueryParams.map(param => param.key)
    ]);
    
    if (allKeys.size > 0) {
      // Calculate param matches (key match = 50%, value match = 50%)
      let matchCount = 0;
      allKeys.forEach(key => {
        const firstParam = queryParams.find(p => p.key === key);
        const secondParam = compareQueryParams.find(p => p.key === key);
        
        if (firstParam && secondParam) {
          // Key exists in both URLs (50% match)
          matchCount += 0.5;
          
          // If values also match, add another 50%
          if (firstParam.value === secondParam.value) {
            matchCount += 0.5;
          }
        }
      });
      
      const paramSimilarityPercentage = (matchCount / allKeys.size) * 30;
      earnedPoints += paramSimilarityPercentage;
    } else {
      // Both URLs have no params, so they match
      earnedPoints += 30;
    }
    
    // Return percentage match (rounded to nearest integer)
    return Math.round((earnedPoints / totalPoints) * 100);
  }, [compareMode, urlObj, compareUrlObj, localPathSegments, comparePathSegments, queryParams, compareQueryParams]);

  // Apply path from second URL to first URL
  const applySecondUrlPath = useCallback(() => {
    if (!urlObj || !compareUrlObj) return;
    
    const newUrl = new URL(urlObj.toString());
    newUrl.pathname = compareUrlObj.pathname;
    setUrl(newUrl.toString());
  }, [urlObj, compareUrlObj, setUrl]);
  
  // Apply query params from second URL to first URL
  const applySecondUrlParams = useCallback(() => {
    if (urlObj && compareUrlObj) {
      const newUrl = new URL(urlObj.toString());
      newUrl.search = compareUrlObj.search;
      setUrl(newUrl.toString());
    }
  }, [urlObj, compareUrlObj, setUrl]);

  const copyDomainComparison = () => {
    if (urlObj && compareUrlObj) {
      const summary = `Domain Comparison:\n` +
        `URL 1: ${urlObj.hostname}\n` +
        `URL 2: ${compareUrlObj.hostname}\n` +
        `Match: ${urlObj.hostname === compareUrlObj.hostname ? 'Yes ✓' : 'No ✗'}`;
      
      navigator.clipboard.writeText(summary);
      setComparisonCopied(true);
      setTimeout(() => setComparisonCopied(false), 2000);
    }
  };

  const copyPathComparison = () => {
    if (urlObj && compareUrlObj) {
      const summary = `Path Comparison:\n` +
        `URL 1: ${urlObj.pathname}\n` +
        `URL 2: ${compareUrlObj.pathname}\n`;
      
      // Path segments comparison
      const pathsMatch = JSON.stringify(localPathSegments) === JSON.stringify(comparePathSegments);
      const pathLengthDiff = Math.abs(localPathSegments.length - comparePathSegments.length);
      const differentSegments = localPathSegments.filter((seg, i) => seg !== comparePathSegments[i]).length;
      
      let pathDetails = `Match: ${pathsMatch ? 'Yes ✓' : 'No ✗'}\n`;
      
      if (!pathsMatch) {
        pathDetails += `Length difference: ${pathLengthDiff} segment${pathLengthDiff !== 1 ? 's' : ''}\n`;
        pathDetails += `Different segments: ${differentSegments}\n\n`;
        
        pathDetails += `Segment by segment:\n`;
        const maxLength = Math.max(localPathSegments.length, comparePathSegments.length);
        
        for (let i = 0; i < maxLength; i++) {
          const segment1 = i < localPathSegments.length ? localPathSegments[i] : '(none)';
          const segment2 = i < comparePathSegments.length ? comparePathSegments[i] : '(none)';
          const match = segment1 === segment2 ? '✓' : '✗';
          
          pathDetails += `${i + 1}. "${segment1}" vs "${segment2}" ${match}\n`;
        }
      }
      
      navigator.clipboard.writeText(summary + '\n' + pathDetails);
      setComparisonCopied(true);
      setTimeout(() => setComparisonCopied(false), 2000);
    }
  };

  const copyParamsComparison = () => {
    if (urlObj && compareUrlObj) {
      const summary = `Query Parameters Comparison:\n` +
        `URL 1: ${urlObj.search}\n` +
        `URL 2: ${compareUrlObj.search}\n`;
      
      // Get all unique parameter keys
      const allKeys = new Set([
        ...queryParams.map(param => param.key),
        ...compareQueryParams.map(param => param.key)
      ]);
      
      const uniqueToFirst = queryParams
        .filter(p => !compareQueryParams.some(cp => cp.key === p.key))
        .map(p => p.key);
        
      const uniqueToSecond = compareQueryParams
        .filter(p => !queryParams.some(cp => cp.key === p.key))
        .map(p => p.key);
        
      const commonKeys = queryParams
        .filter(p => compareQueryParams.some(cp => cp.key === p.key))
        .map(p => p.key);
        
      const differentValues = commonKeys.filter(key => {
        const firstParam = queryParams.find(p => p.key === key);
        const secondParam = compareQueryParams.find(p => p.key === key);
        return firstParam?.value !== secondParam?.value;
      });
      
      const paramsMatch = JSON.stringify(queryParams) === JSON.stringify(compareQueryParams);
      
      let paramsDetails = `Match: ${paramsMatch ? 'Yes ✓' : 'No ✗'}\n`;
      
      if (!paramsMatch) {
        paramsDetails += `Total params: ${allKeys.size}\n`;
        
        if (uniqueToFirst.length > 0) {
          paramsDetails += `Unique to URL 1: ${uniqueToFirst.join(', ')}\n`;
        }
        
        if (uniqueToSecond.length > 0) {
          paramsDetails += `Unique to URL 2: ${uniqueToSecond.join(', ')}\n`;
        }
        
        if (differentValues.length > 0) {
          paramsDetails += `Same param, different value: ${differentValues.join(', ')}\n\n`;
          
          paramsDetails += `Parameter by parameter:\n`;
          for (const key of commonKeys) {
            const param1 = queryParams.find(p => p.key === key);
            const param2 = compareQueryParams.find(p => p.key === key);
            const match = param1?.value === param2?.value ? '✓' : '✗';
            
            paramsDetails += `${key}: "${param1?.value}" vs "${param2?.value}" ${match}\n`;
          }
        }
      }
      
      navigator.clipboard.writeText(summary + '\n' + paramsDetails);
      setComparisonCopied(true);
      setTimeout(() => setComparisonCopied(false), 2000);
    }
  };

  return (
    <div className="container mx-auto py-4 px-4 max-w-3xl">
      <div className="space-y-3">
        {/* Mode Toggle */}
        <div className="flex justify-end">
          <Button 
            variant={compareMode ? "default" : "outline"} 
            size="sm" 
            onClick={() => setCompareMode(!compareMode)}
            className="text-xs h-7"
          >
            {compareMode ? "Comparison Mode ✓" : "Enable Comparison Mode"}
          </Button>
        </div>
      
        {/* URL Input */}
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <Label htmlFor="url-input" className="text-sm font-medium block mb-1">
            {compareMode ? "First URL" : "Enter URL"}
          </Label>
          <div className="flex flex-col space-y-1">
            <Textarea 
              id="url-input"
              placeholder="https://example.com/path/to/resource?param1=value1&param2=value2"
              className={`font-mono resize-none min-h-[70px] text-sm ${urlObj ? '' : 'border-yellow-500 focus-visible:ring-yellow-500'}`}
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
                    <CheckIcon className="h-3 w-3 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-3 w-3" />
                    Copy URL
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Compare URL input */}
        {compareMode && (
          <div className="mb-2 mt-4">
            <div className="flex items-center gap-2 mb-1">
              <Label htmlFor="compareUrl" className="text-sm font-medium">URL 2 to Compare</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSwapUrls}
                className="h-6 px-2 text-xs flex items-center gap-1"
                title="Swap URLs"
              >
                <SwapIcon className="h-3 w-3" />
                Swap URLs
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                id="compareUrl"
                placeholder="Enter URL to compare..."
                value={compareUrl}
                onChange={(e) => setCompareUrl(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>
        )}
        
        {/* Results Section */}
        <div className="space-y-3">
          {/* Path Segments Section */}
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold">Path Segments</h2>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    console.log("Add Segment button clicked");
                    handleAddPathSegment();
                  }} 
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Segment
                </Button>
              </div>
            </div>
            
            {/* Regular Path Segments View */}
            {!compareMode && (
              <div className="space-y-1">
                {(() => {
                  console.log("Rendering path segments section. Count:", displayPathSegments.length);
                  return localPathSegments.length > 0 ? (
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
                        {localPathSegments.map((segment, index) => {
                          console.log("Rendering segment at index:", index, segment);
                          return (
                            <SortablePathSegment
                              key={`path-${index}`}
                              segment={segment}
                              index={index}
                              onChange={handlePathSegmentChange}
                              onRemove={handleRemovePathSegment}
                            />
                          );
                        })}
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="text-center py-3 text-muted-foreground">
                      No path segments found. Click "Add Segment" to add one.
                    </div>
                  );
                })()}
              </div>
            )}
            
            {/* Comparison Path Segments View */}
            {compareMode && (
              <div className="space-y-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse table-fixed">
                    <colgroup>
                      <col className="w-[5%]" />
                      <col className="w-[35%]" />
                      <col className="w-[35%]" />
                      <col className="w-[25%]" />
                    </colgroup>
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-3 text-left font-medium">#</th>
                        <th className="py-2 px-3 text-left font-medium">First URL Segment</th>
                        <th className="py-2 px-3 text-left font-medium">Second URL Segment</th>
                        <th className="py-2 px-3 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ 
                        length: Math.max(localPathSegments.length, comparePathSegments.length) 
                      }).map((_, index) => {
                        const firstSegment = localPathSegments[index] || '';
                        const secondSegment = comparePathSegments[index] || '';
                        const isMatching = firstSegment === secondSegment;
                        const isMissing = !firstSegment || !secondSegment;
                        const isLastRow = index === Math.max(localPathSegments.length, comparePathSegments.length) - 1;
                        
                        return (
                          <tr key={index} className={isLastRow ? "" : "border-b"}>
                            <td className="py-2 px-3 text-center">{index + 1}</td>
                            <td className={`py-3 px-3 font-mono max-w-[200px] break-words whitespace-pre-wrap ${!isMatching && !isMissing ? 'bg-yellow-50' : ''} ${!secondSegment ? 'bg-green-50' : ''}`}>
                              {firstSegment || <span className="text-gray-400">--empty--</span>}
                            </td>
                            <td className={`py-3 px-3 font-mono max-w-[200px] break-words whitespace-pre-wrap ${!isMatching && !isMissing ? 'bg-yellow-50' : ''} ${!firstSegment ? 'bg-green-50' : ''}`}>
                              {secondSegment || <span className="text-gray-400">--empty--</span>}
                            </td>
                            <td className="py-2 px-3">
                              {isMatching ? (
                                <span className="text-green-600 font-medium">Matching</span>
                              ) : !firstSegment ? (
                                <span className="text-blue-600 font-medium">Only in URL 2</span>
                              ) : !secondSegment ? (
                                <span className="text-blue-600 font-medium">Only in URL 1</span>
                              ) : (
                                <span className="text-yellow-600 font-medium">Different</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          
          {/* Query Parameters Section */}
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold">Query Parameters</h2>
              {!compareMode && (
                <Button variant="outline" size="sm" onClick={handleAddQueryParam} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Parameter
                </Button>
              )}
            </div>
            
            {/* Regular Query Parameters View */}
            {!compareMode && (
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
            )}
            
            {/* Comparison Query Parameters View */}
            {compareMode && (
              <div className="space-y-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse table-fixed">
                    <colgroup>
                      <col className="w-[20%]" />
                      <col className="w-[30%]" />
                      <col className="w-[30%]" />
                      <col className="w-[20%]" />
                    </colgroup>
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-3 text-left font-medium">Parameter</th>
                        <th className="py-2 px-3 text-left font-medium">First URL Value</th>
                        <th className="py-2 px-3 text-left font-medium">Second URL Value</th>
                        <th className="py-2 px-3 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Get all unique parameter keys
                        const allKeys = new Set([
                          ...queryParams.map(param => param.key),
                          ...compareQueryParams.map(param => param.key)
                        ]);
                        
                        return Array.from(allKeys).map((key, index, array) => {
                          const firstParam = queryParams.find(p => p.key === key);
                          const secondParam = compareQueryParams.find(p => p.key === key);
                          
                          const firstValue = firstParam ? firstParam.value : null;
                          const secondValue = secondParam ? secondParam.value : null;
                          
                          const isMatching = firstValue === secondValue;
                          const isMissing = !firstValue || !secondValue;
                          const isLastRow = index === array.length - 1;
                          
                          return (
                            <tr key={key} className={isLastRow ? "" : "border-b"}>
                              <td className="py-3 px-3 font-mono font-medium max-w-[150px] break-words whitespace-pre-wrap">{key || <em className="text-gray-400">empty key</em>}</td>
                              <td className={`py-3 px-3 font-mono max-w-[200px] break-words whitespace-pre-wrap ${!isMatching && !isMissing ? 'bg-yellow-50' : ''} ${!secondValue ? 'bg-green-50' : ''}`}>
                                {firstValue || <span className="text-gray-400">--empty--</span>}
                              </td>
                              <td className={`py-3 px-3 font-mono max-w-[200px] break-words whitespace-pre-wrap ${!isMatching && !isMissing ? 'bg-yellow-50' : ''} ${!firstValue ? 'bg-green-50' : ''}`}>
                                {secondValue || <span className="text-gray-400">--empty--</span>}
                              </td>
                              <td className="py-2 px-3">
                                {isMatching ? (
                                  <span className="text-green-600 font-medium">Matching</span>
                                ) : !firstValue ? (
                                  <span className="text-blue-600 font-medium">Only in URL 2</span>
                                ) : !secondValue ? (
                                  <span className="text-blue-600 font-medium">Only in URL 1</span>
                                ) : (
                                  <span className="text-yellow-600 font-medium">Different</span>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Comparison Summary - only show in compare mode */}
        {compareMode && (
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold">Comparison Summary</h2>
                {matchScore !== null && (
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">Match:</div>
                    <div 
                      className={`h-7 rounded-md px-2 flex items-center text-white text-xs font-medium ${
                        matchScore >= 90 ? 'bg-green-500' : 
                        matchScore >= 70 ? 'bg-green-400' : 
                        matchScore >= 50 ? 'bg-yellow-500' : 
                        matchScore >= 30 ? 'bg-orange-500' : 
                        'bg-red-500'
                      }`}
                    >
                      {matchScore}%
                    </div>
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyComparisonSummary}
                className="flex items-center gap-1 h-7 text-xs"
                disabled={!urlObj || !compareUrlObj}
              >
                {comparisonCopied ? (
                  <>
                    <CheckIcon className="h-3 w-3 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-3 w-3" />
                    Copy Summary
                  </>
                )}
              </Button>
            </div>
            <div className="space-y-2">
              {/* Domain comparison */}
              <div className="flex items-start space-x-4">
                <div className="w-24 text-sm font-medium">Domain:</div>
                <div className="flex-1">
                  {(() => {
                    const domainsMatch = urlObj?.hostname === compareUrlObj?.hostname;
                    
                    return (
                      <div className={`font-medium flex items-center justify-between ${domainsMatch ? 'text-green-600' : 'text-yellow-600'}`}>
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 ${domainsMatch ? 'bg-green-500' : 'bg-yellow-500'} rounded-full mr-2`}></span>
                          {domainsMatch ? 'Identical domains' : 'Different domains'}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={copyDomainComparison}
                          className="h-6 text-xs"
                          title="Copy domain comparison details"
                        >
                          <CopyIcon className="mr-1 h-3 w-3" />
                          Copy
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              {/* Protocol comparison */}
              <div className="flex items-start space-x-4">
                <div className="w-24 text-sm font-medium">Protocol:</div>
                <div className="flex-1">
                  {(() => {
                    const protocolsMatch = urlObj?.protocol === compareUrlObj?.protocol;
                    
                    return (
                      <div className={`font-medium flex items-center justify-between ${protocolsMatch ? 'text-green-600' : 'text-yellow-600'}`}>
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 ${protocolsMatch ? 'bg-green-500' : 'bg-yellow-500'} rounded-full mr-2`}></span>
                          {protocolsMatch ? 'Identical protocols' : 'Different protocols'}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (urlObj && compareUrlObj) {
                              const summary = `Protocol Comparison:\n` +
                                `URL 1: ${urlObj.protocol.replace(':', '')}\n` +
                                `URL 2: ${compareUrlObj.protocol.replace(':', '')}\n` +
                                `Match: ${urlObj.protocol === compareUrlObj.protocol ? 'Yes ✓' : 'No ✗'}`;
                              
                              navigator.clipboard.writeText(summary);
                              setComparisonCopied(true);
                              setTimeout(() => setComparisonCopied(false), 2000);
                            }
                          }}
                          className="h-6 text-xs"
                          title="Copy protocol comparison details"
                        >
                          <CopyIcon className="mr-1 h-3 w-3" />
                          Copy
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              {/* Path comparison */}
              <div className="flex items-start space-x-4">
                <div className="w-24 text-sm font-medium">Path:</div>
                <div className="flex-1">
                  {(() => {
                    const pathsMatch = JSON.stringify(localPathSegments) === JSON.stringify(comparePathSegments);
                    const pathLengthDiff = Math.abs(localPathSegments.length - comparePathSegments.length);
                    const differentSegments = localPathSegments.filter((seg, i) => seg !== comparePathSegments[i]).length;
                    
                    if (pathsMatch) {
                      return (
                        <div className="text-green-600 font-medium flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Identical paths
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={copyPathComparison}
                            className="h-6 text-xs"
                            title="Copy path comparison details"
                          >
                            <CopyIcon className="mr-1 h-3 w-3" />
                            Copy
                          </Button>
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-yellow-600 font-medium">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                              Different paths
                            </div>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={copyPathComparison}
                                className="h-6 text-xs"
                                title="Copy path comparison details"
                              >
                                <CopyIcon className="mr-1 h-3 w-3" />
                                Copy
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={applySecondUrlPath}
                                className="h-6 text-xs"
                                title="Apply path from URL 2 to URL 1"
                              >
                                Apply to URL 1
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm mt-1 ml-4 text-gray-700">
                            <div>Length difference: {pathLengthDiff} segment{pathLengthDiff !== 1 ? 's' : ''}</div>
                            <div>Different segments: {differentSegments}</div>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
              
              {/* Query parameters comparison */}
              <div className="flex items-start space-x-4">
                <div className="w-24 text-sm font-medium">Parameters:</div>
                <div className="flex-1">
                  {(() => {
                    // Get all unique parameter keys
                    const allKeys = new Set([
                      ...queryParams.map(param => param.key),
                      ...compareQueryParams.map(param => param.key)
                    ]);
                    
                    const uniqueToFirst = queryParams
                      .filter(p => !compareQueryParams.some(cp => cp.key === p.key))
                      .map(p => p.key);
                      
                    const uniqueToSecond = compareQueryParams
                      .filter(p => !queryParams.some(cp => cp.key === p.key))
                      .map(p => p.key);
                      
                    const commonKeys = queryParams
                      .filter(p => compareQueryParams.some(cp => cp.key === p.key))
                      .map(p => p.key);
                      
                    const differentValues = commonKeys.filter(key => {
                      const firstParam = queryParams.find(p => p.key === key);
                      const secondParam = compareQueryParams.find(p => p.key === key);
                      return firstParam?.value !== secondParam?.value;
                    });
                    
                    if (JSON.stringify(queryParams) === JSON.stringify(compareQueryParams)) {
                      return (
                        <div className="text-green-600 font-medium flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Identical parameters
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={copyParamsComparison}
                            className="h-6 text-xs"
                            title="Copy parameters comparison details"
                          >
                            <CopyIcon className="mr-1 h-3 w-3" />
                            Copy
                          </Button>
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-yellow-600 font-medium">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                              Different parameters
                            </div>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={copyParamsComparison}
                                className="h-6 text-xs"
                                title="Copy parameters comparison details"
                              >
                                <CopyIcon className="mr-1 h-3 w-3" />
                                Copy
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={applySecondUrlParams}
                                className="h-6 text-xs"
                                title="Apply query parameters from URL 2 to URL 1"
                              >
                                Apply to URL 1
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm mt-1 ml-4 text-gray-700">
                            <div>Total params: {allKeys.size}</div>
                            {uniqueToFirst.length > 0 && <div>Unique to URL 1: {uniqueToFirst.join(', ')}</div>}
                            {uniqueToSecond.length > 0 && <div>Unique to URL 2: {uniqueToSecond.join(', ')}</div>}
                            {differentValues.length > 0 && <div>Same param, different value: {differentValues.join(', ')}</div>}
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
