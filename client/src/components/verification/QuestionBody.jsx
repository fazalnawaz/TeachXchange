/**
 * Renders question text with optional code blocks (``` fences or indented code lines).
 */
export default function QuestionBody({ text, hasCode }) {
  if (!text) return null;

  const parts = [];
  const fenceRegex = /```[\w]*\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = fenceRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "code", content: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  if (parts.length === 0) {
    const lines = text.split("\n");
    const codeStart = lines.findIndex((line, i) =>
      i > 0 && /^\s*(#include|def |function |class |public |import |const |let |var |for\s*\(|if\s*\(|cout|printf|System\.)/.test(line)
    );

    if (hasCode && codeStart > 0) {
      parts.push({ type: "text", content: lines.slice(0, codeStart).join("\n") });
      parts.push({ type: "code", content: lines.slice(codeStart).join("\n") });
    } else {
      parts.push({ type: "text", content: text });
    }
  }

  return (
    <div className="space-y-2">
      {parts.map((part, i) =>
        part.type === "code" ? (
          <pre key={i} className="quiz-code-block">
            <code>{part.content}</code>
          </pre>
        ) : (
          <span key={i} className="whitespace-pre-wrap break-words">
            {part.content.trim()}
          </span>
        )
      )}
    </div>
  );
}
