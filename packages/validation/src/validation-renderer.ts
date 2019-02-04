import { ValidateResult } from './validate-result';

/**
 * A result to render (or unrender) and the associated elements (if any)
 */
export interface ResultInstruction {
  /**
   * The validation result.
   */
  result: ValidateResult;

  /**
   * The associated elements (if any).
   */
  elements: Element[];
}

/**
 * Defines which validation results to render and which validation results to unrender.
 */
export interface RenderInstruction {
  /**
   * The "kind" of render instruction. Either 'validate' or 'reset'.
   */
  kind: 'validate' | 'reset';

  /**
   * The results to render.
   */
  render: ResultInstruction[];

  /**
   * The results to unrender.
   */
  unrender: ResultInstruction[];
}

/**
 * Renders validation results.
 */
export interface ValidationRenderer {
  /**
   * Render the validation results.
   * @param instruction The render instruction. Defines which results to render and which
   * results to unrender.
   */
  render(instruction: RenderInstruction): void;
}
