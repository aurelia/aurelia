import { Requirements, DesigntimeRequirement, RuntimeRequirement } from "../../../ioc/requirements";

describe('Requirements', () => {
  describe('create()', () => {
    it('should return a DesigntimeRequirement when called with an AST node', () => {
      const actual = Requirements.create({isAnalysisASTNode: true});

      expect (actual instanceof DesigntimeRequirement).toBe(true);
    });

    it('should return a RuntimeRequirement when called with undefined', () => {
      const value = undefined;
      const actual = Requirements.create(value);

      expect (actual instanceof RuntimeRequirement).toBe(true);
    });

    it('should return a RuntimeRequirement when called with null', () => {
      const value = null;
      const actual = Requirements.create(value);

      expect (actual instanceof RuntimeRequirement).toBe(true);
    });

    it('should return a RuntimeRequirement when called with a string', () => {
      const value = "";
      const actual = Requirements.create(value);

      expect (actual instanceof RuntimeRequirement).toBe(true);
    });

    it('should return a RuntimeRequirement when called with a String', () => {
      const value = new Object("");
      const actual = Requirements.create(value);

      expect (actual instanceof RuntimeRequirement).toBe(true);
    });

    it('should return a RuntimeRequirement when called with a number', () => {
      const value = 0;
      const actual = Requirements.create(value);

      expect (actual instanceof RuntimeRequirement).toBe(true);
    });

    it('should return a RuntimeRequirement when called with a Number', () => {
      const value = new Object(0);
      const actual = Requirements.create(value);

      expect (actual instanceof RuntimeRequirement).toBe(true);
    });

    it('should return a RuntimeRequirement when called with an object', () => {
      const value = {};
      const actual = Requirements.create(value);

      expect (actual instanceof RuntimeRequirement).toBe(true);
    });

    it('should return a RuntimeRequirement when called with an Object', () => {
      const value = new Object({});
      const actual = Requirements.create(value);

      expect (actual instanceof RuntimeRequirement).toBe(true);
    });

    it('should return a RuntimeRequirement when called with a symbol', () => {
      const value = Symbol();
      const actual = Requirements.create(value);

      expect (actual instanceof RuntimeRequirement).toBe(true);
    });

    it('should return a RuntimeRequirement when called with a Symbol', () => {
      const value = new Object(Symbol());
      const actual = Requirements.create(value);

      expect (actual instanceof RuntimeRequirement).toBe(true);
    });

    it('should return a RuntimeRequirement when called with a Function', () => {
      const value = new Function();
      const actual = Requirements.create(value);

      expect (actual instanceof RuntimeRequirement).toBe(true);
    });
  });
})
