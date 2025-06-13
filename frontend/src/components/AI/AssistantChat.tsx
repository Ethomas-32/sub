"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AssistantChat() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("https://your-backend-url.com/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    setResponse(data.answer);
  }

  return (
    <div className="space-y-4 p-6 max-w-2xl mx-auto bg-white rounded-lg shadow">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <Input
          placeholder="Ask the assistant..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit">Ask</Button>
      </form>
      {response && (
        <div className="p-4 bg-gray-100 rounded text-gray-800 border">
          {response}
        </div>
      )}
    </div>
  );
}
