import { useMemo } from "react";

function parseMarkdown(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mt-10 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-12 mb-5">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm text-gray-600 dark:text-gray-400">$1</code>')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-5 rounded-lg overflow-x-auto my-6 text-sm leading-relaxed"><code>$2</code></pre>')
    .replace(/^\- (.+)$/gm, '<li class="ml-5 list-disc my-1 text-base text-gray-700 dark:text-gray-300">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-5 list-decimal my-1 text-base text-gray-700 dark:text-gray-300">$2</li>')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim()).map(c => `<td class="border border-gray-200 dark:border-gray-700 px-4 py-2 text-base text-gray-700 dark:text-gray-300">${c.trim()}</td>`);
      return `<table class="w-full my-5 border-collapse"><tr>${cells.join('')}</tr></table>`;
    })
    .replace(/\n\n/g, "</p><p class='my-4 leading-relaxed text-base text-gray-700 dark:text-gray-300'>")
    .replace(/\n(?!<)/g, "<br/>");
  html = "<p class='my-4 leading-relaxed text-base text-gray-700 dark:text-gray-300'>" + html + "</p>";
  html = html.replace(/<p class='my-4 leading-relaxed text-base text-gray-700 dark:text-gray-300'><\/p>/g, "");
  return html;
}

export default function MarkdownView({ content }: { content: string }) {
  const html = useMemo(() => parseMarkdown(content), [content]);
  return <div className="text-base leading-relaxed text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: html }} />;
}
