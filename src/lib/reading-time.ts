import readingTime from "reading-time";

// Thin wrapper over the `reading-time` npm package. The wrapper exists
// so callers depend on a single, project-owned shape rather than the
// package's full `ReadTimeResults` (which includes `time` in
// milliseconds and other fields we never use). Centralizing here also
// makes it trivial to bump the upstream package or swap algorithms
// without touching every blog component.
//
// Accuracy note: `reading-time` uses 200 WPM and a word-boundary regex.
// Posts that lean heavily on inline components (where most "characters"
// are JSX, not prose) will register slightly low — acceptable for v1,
// since the reading-time label is a hint, not a contract.

export interface ReadingTimeResult {
  text: string;
  minutes: number;
  words: number;
}

export function computeReadingTime(source: string): ReadingTimeResult {
  const r = readingTime(source);
  return { text: r.text, minutes: r.minutes, words: r.words };
}
