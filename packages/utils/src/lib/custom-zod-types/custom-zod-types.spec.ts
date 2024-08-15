import { describe, expect, it } from 'vitest';
import { configStringArraySchema } from '.';
// Define a schema with Zod

// Set up the test suite
describe('Custom Zod types', () => {
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
