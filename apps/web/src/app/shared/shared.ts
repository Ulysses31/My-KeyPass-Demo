/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';

/**
 * Shared utility class providing common methods.
 * Used across various components and services.
 * @author Iordanidis Chris
 * @version 1.0.0
 * @since 2025-10-15
 */
@Injectable({ providedIn: 'root' })
export default class Shared {
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();

  /**
   * Gets headers from the service based on provided header names.
   * @param headerNames string[]
   * @param service any
   * @returns string[]
   */
  getHeaders(headerNames: string[], service: any) {
    if (headerNames.length === 0) {
      return Object.getOwnPropertyNames(service.browserItems()![0]).map((dt) => {
        return dt;
      });
    } else {
      return headerNames;
    }
  }

  /**
   * Gets the keys of a given record.
   * @param value Record<string, any>
   * @returns string[]
   */
  getKeys(value: Record<string, any>) {
    return Object.getOwnPropertyNames(value).map((dt) => {
      return dt;
    });
  }

  /**
   * Converts a value to a Record<string, any>.
   * @param value any
   * @returns object as Record<string, any>
   */
  asRecord(value: any): Record<string, any> {
    return value && typeof value === 'object' ? (value as Record<string, any>) : {};
  }

  /**
   * Gets a cookie by name.
   * @param name string
   * @returns string
   */
  getCookie(name: string): string | null {
    const cookieArr = document.cookie.split(';');
    for (const cookie of cookieArr) {
      let c = cookie;
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length).slice(1, c.length);
      }
    }
    return null;
  }
}
