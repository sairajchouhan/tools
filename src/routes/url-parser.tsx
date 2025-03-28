import { createFileRoute } from "@tanstack/react-router";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Plus, Trash2, Copy, Check } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/url-parser")({
  component: UrlParser,
});

function UrlParser() {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

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
          <Label htmlFor="url-input" className="text-base font-medium block mb-2">Enter URL</Label>
          <div className="flex space-x-2">
            <Input 
              id="url-input"
              placeholder="https://example.com/path/to/resource?param1=value1&param2=value2"
              className="w-full"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button 
              variant="outline" 
              size="icon" 
              title={copied ? "Copied!" : "Copy URL"}
              onClick={handleCopyUrl}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Results Section */}
        <div className="space-y-6">
          {/* Path Segments Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Path Segments</h2>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Segment
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-medium mr-3">1</span>
                <Input 
                  className="font-mono" 
                  placeholder="path segment" 
                  defaultValue="path"
                />
                <Button variant="ghost" size="icon" className="ml-2">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <div className="flex items-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-medium mr-3">2</span>
                <Input 
                  className="font-mono" 
                  placeholder="path segment" 
                  defaultValue="to"
                />
                <Button variant="ghost" size="icon" className="ml-2">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <div className="flex items-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-medium mr-3">3</span>
                <Input 
                  className="font-mono" 
                  placeholder="path segment" 
                  defaultValue="resource"
                />
                <Button variant="ghost" size="icon" className="ml-2">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Query Parameters Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Query Parameters</h2>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Parameter
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <Input 
                        className="font-mono bg-gray-50" 
                        placeholder="Key" 
                        defaultValue="param1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input 
                        className="font-mono" 
                        placeholder="Value" 
                        defaultValue="value1"
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-2">
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <Input 
                        className="font-mono bg-gray-50" 
                        placeholder="Key" 
                        defaultValue="param2"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input 
                        className="font-mono" 
                        placeholder="Value" 
                        defaultValue="value2"
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-2">
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 