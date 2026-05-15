import { useMemo } from "react";

function parseMarkdown(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-pink-600">$1</code>')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm"><code>$2</code></pre>')
    .replace(/^\- (.+)$/gm, '<li class="ml-4 list-disc my-1">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal my-1">$2</li>')
    .replace(/\n\n/g, "</p><p class='my-3 leading-relaxed'>")
    .replace(/\n(?!<)/g, "<br/>");
  html = "<p class='my-3 leading-relaxed'>" + html + "</p>";
  html = html.replace(/<p class='my-3 leading-relaxed'><\/p>/g, "");
  return html;
}

export default function MarkdownView({ content }: { content: string }) {
  const html = useMemo(() => parseMarkdown(content), [content]);
  return (
    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
