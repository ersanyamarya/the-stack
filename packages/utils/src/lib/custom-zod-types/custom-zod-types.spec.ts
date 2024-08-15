import { describe, expect, it } from 'vitest';
import { configBooleanSchema, configNumberSchema, configStringArraySchema } from '.';
// Define a schema with Zod

// Set up the test suite
describe('Custom Zod types', () => {
  describe('configNumberSchema', () => {
    it('should parse valid numeric strings', () => {
      const result = configNumberSchema.safeParse('123');
      expect(result.success).toBe(true);
      expect(result.data).toBe(123);
    });

    it('should fail on non-numeric strings', () => {
      const result = configNumberSchema.safeParse('abc');
      expect(result.success).toBe(false);
    });

    it('should fail on negative numbers', () => {
      const result = configNumberSchema.safeParse('-123');
      expect(result.success).toBe(false);
    });
  });
  describe('configBooleanSchema', () => {
    it('should parse "true" and "True" as true', () => {
      expect(configBooleanSchema.safeParse('true').data).toBe(true);
      expect(configBooleanSchema.safeParse('True').data).toBe(true);
    });

    it('should parse "false" and "False" as false', () => {
      expect(configBooleanSchema.safeParse('false').data).toBe(false);
      expect(configBooleanSchema.safeParse('False').data).toBe(false);
    });

    it('should fail on non-boolean strings', () => {
      const result = configBooleanSchema.safeParse('yes');
      expect(result.success).toBe(false);
    });
  });
  describe('configStringArraySchema', () => {
    it('should parse a comma-separated string into an array', () => {
      const result = configStringArraySchema.safeParse('item1,item2,item3');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(['item1', 'item2', 'item3']);
    });

    it('should handle leading and trailing spaces', () => {
      const result = configStringArraySchema.safeParse(' item1 , item2 , item3 ');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(['item1', 'item2', 'item3']);
    });

    it('should return an empty array for an empty string', () => {
      const result = configStringArraySchema.safeParse('');
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle single item without commas', () => {
      const result = configStringArraySchema.safeParse('singleItem');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(['singleItem']);
    });

    it('should throw an error for malformed input', () => {
      const result = configStringArraySchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});
