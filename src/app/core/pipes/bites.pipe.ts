import {Pipe, PipeTransform} from '@angular/core';
import {isInteger, isNumberFinite, isPositive, toDecimal} from "../utils/utils";

export type ByteUnit = 'B' | 'kB' | 'KB' | 'MB' | 'GB' | 'TB';

@Pipe({
  name: 'bytes'
})
export class BytesPipe implements PipeTransform {

  /**
   * Input format options
   * @type {{ [key: string]: { max: number; prev?: ByteUnit } }}
   */
  static formats: { [key: string]: { max: number; prev?: ByteUnit } } = {
    B: { max: 1024 },
    kB: { max: Math.pow(1024, 2), prev: 'B' },
    KB: { max: Math.pow(1024, 2), prev: 'B' }, // Backward compatible
    MB: { max: Math.pow(1024, 3), prev: 'kB' },
    GB: { max: Math.pow(1024, 4), prev: 'MB' },
    TB: { max: Number.MAX_SAFE_INTEGER, prev: 'GB' },
  };

  /**
   * Transforms incoming data to display the final result on the screen
   * @param {number} input 
   * @param {number} decimal 
   * @param {ByteUnit} from 
   * @param {ByteUnit} to 
   * @param {boolean} useUtilsTitle 
   * @return {any}
   */
  transform(input: number, decimal: number = 0, from: ByteUnit = 'B', to?: ByteUnit, useUtilsTitle: boolean = true): any {
    if (!(isNumberFinite(input) && isNumberFinite(decimal) && isInteger(decimal) && isPositive(decimal))) {
      return input;
    }

    let bytes = input;
    let unit = from;
    while (unit !== 'B') {
      bytes *= 1024;
      unit = BytesPipe.formats[unit].prev!;
    }

    if (to) {
      const format = BytesPipe.formats[to];

      const result = toDecimal(BytesPipe.calculateResult(format, bytes), decimal);

      return BytesPipe.formatResult(result, to, useUtilsTitle);
    }

    for (const key in BytesPipe.formats) {
      if (BytesPipe.formats.hasOwnProperty(key)) {
        const format = BytesPipe.formats[key];
        if (bytes < format.max) {
          const result = toDecimal(BytesPipe.calculateResult(format, bytes), decimal);

          return BytesPipe.formatResult(result, key, useUtilsTitle);
        }
      }
    }
  }

  /**
   * Returns the final result of the format
   * @param {number} result 
   * @param {string} unit 
   * @param {boolean} useUtilsTitle 
   * @return {string}
   */
  static formatResult(result: number, unit: string, useUtilsTitle: boolean): string {
    return useUtilsTitle ? `${result}${unit}` : `${result}`;
  }

  /**
   * Returns the end result of the calculations
   * @param {{ max: number; prev?: ByteUnit }} format 
   * @param {number} bytes 
   * @return {number}
   */
  static calculateResult(format: { max: number; prev?: ByteUnit }, bytes: number): number {
    const prev = format.prev ? BytesPipe.formats[format.prev] : undefined;
    return prev ? bytes / prev.max : bytes;
  }

}
