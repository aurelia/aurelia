/**
 * Options for the overlay emitter.
 * - eol: line ending to use in the output (default: '\n')
 * - banner: optional banner comment at the top of the file
 * - filename: for convenience if the caller wants to attach a name in their FS layer
 */
export interface EmitOptions {
  eol?: '\n' | '\r\n';
  banner?: string;
  filename?: string;
}

export interface EmitResult {
  /** Suggested file name; purely informational for the caller's FS layer. */
  filename: string;
  /** Full overlay text. */
  text: string;
}
