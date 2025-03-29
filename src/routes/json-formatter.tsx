import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Copy, Trash, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Code } from "@/components/ui/code";

export const Route = createFileRoute("/json-formatter")({
  component: JsonFormatter,
});

function JsonFormatter() {
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  
  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setIsValid(null);
      setError(null);
      return;
    }
    
    try {
      // Parse and then stringify with formatting
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setIsValid(true);
      setError(null);
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [input]);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const clearAll = () => {
    setInput("");
    setOutput("");
    setIsValid(null);
    setError(null);
  };
  
  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Input JSON</h2>
            <Button variant="outline" size="sm" onClick={clearAll}>
              <Trash className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
          <Textarea
            placeholder="Paste your JSON here..."
            className="h-[700px] font-mono resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <h2 className="text-lg font-medium mr-2">Formatted JSON</h2>
              {isValid === true && (
                <span className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Valid
                </span>
              )}
              {isValid === false && (
                <span className="flex items-center text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Invalid
                </span>
              )}
            </div>
            {output && (
              <Button variant="outline" size="sm" onClick={copyToClipboard} className={copied ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:text-green-800" : ""}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            )}
          </div>
          
          {isValid === true && (
            <Code className="h-[700px] overflow-auto">
              <pre>{output}</pre>
            </Code>
          )}
          
          {isValid === false && (
            <div className="border rounded-md p-4 bg-red-50 h-[700px] overflow-auto">
              <p className="text-red-600 font-medium mb-2">Error</p>
              <p className="text-red-500">{error}</p>
            </div>
          )}
          
          {isValid === null && (
            <div className="border rounded-md p-4 bg-gray-50 h-[700px] flex items-center justify-center">
              <p className="text-gray-500">Enter JSON in the input field to see the formatted result</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 