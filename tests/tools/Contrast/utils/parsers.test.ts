import { describe, it, expect } from 'vitest';
import { parseColor } from '../../../../src/tools/Contrast/utils/parsers.js';

describe('parseColor', () => {
  describe('hex colors', () => {
    it('should parse 6-digit hex colors', () => {
      expect(parseColor('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseColor('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(parseColor('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
      expect(parseColor('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(parseColor('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should parse 3-digit hex colors', () => {
      expect(parseColor('#f00')).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseColor('#0f0')).toEqual({ r: 0, g: 255, b: 0 });
      expect(parseColor('#00f')).toEqual({ r: 0, g: 0, b: 255 });
      expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(parseColor('#000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should parse 8-digit hex colors (with alpha)', () => {
      expect(parseColor('#ff0000ff')).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseColor('#00ff0080')).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should be case insensitive', () => {
      expect(parseColor('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseColor('#Ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });
  });

  describe('rgb colors', () => {
    it('should parse rgb() format', () => {
      expect(parseColor('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseColor('rgb(0, 255, 0)')).toEqual({ r: 0, g: 255, b: 0 });
      expect(parseColor('rgb(0, 0, 255)')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should parse rgba() format', () => {
      expect(parseColor('rgba(255, 0, 0, 1)')).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseColor('rgba(0, 128, 255, 0.5)')).toEqual({ r: 0, g: 128, b: 255 });
    });

    it('should handle various spacing', () => {
      expect(parseColor('rgb(255,0,0)')).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseColor('rgb( 255 , 0 , 0 )')).toEqual({ r: 255, g: 0, b: 0 });
    });
  });

  describe('hsl colors', () => {
    it('should parse hsl() format', () => {
      const red = parseColor('hsl(0, 100%, 50%)');
      expect(red).toBeDefined();
      expect(red?.r).toBe(255);
      expect(red?.g).toBe(0);
      expect(red?.b).toBe(0);
    });

    it('should parse hsla() format', () => {
      const result = parseColor('hsla(120, 100%, 50%, 0.5)');
      expect(result).toBeDefined();
      expect(result?.g).toBe(255);
    });
  });

  describe('named colors', () => {
    it('should parse common named colors', () => {
      expect(parseColor('black')).toEqual({ r: 0, g: 0, b: 0 });
      expect(parseColor('white')).toEqual({ r: 255, g: 255, b: 255 });
      expect(parseColor('red')).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseColor('blue')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should be case insensitive', () => {
      expect(parseColor('BLACK')).toEqual({ r: 0, g: 0, b: 0 });
      expect(parseColor('White')).toEqual({ r: 255, g: 255, b: 255 });
    });
  });

  describe('invalid colors', () => {
    it('should return null for invalid formats', () => {
      expect(parseColor('')).toBeNull();
      expect(parseColor('invalid')).toBeNull();
      expect(parseColor('#gg0000')).toBeNull();
      expect(parseColor('#12345')).toBeNull();
    });

    it('should return null for null/undefined input', () => {
      expect(parseColor(null as unknown as string)).toBeNull();
      expect(parseColor(undefined as unknown as string)).toBeNull();
    });
  });
});
