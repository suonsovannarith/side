/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContentItem } from '../types';

/**
 * Node for Singly Linked List (SLL)
 * Mirrors: struct ContentNode { ContentItem data; ContentNode* next; }
 */
export class SLLNode<T> {
  public data: T;
  public next: SLLNode<T> | null;

  constructor(data: T, next: SLLNode<T> | null = null) {
    this.data = data;
    this.next = next;
  }
}

/**
 * Singly Linked List (SLL) for Content Ideas
 * Implements manual pointer manipulation, traversal, insertion, search, and deletion
 */
export class ContentSLL {
  private head: SLLNode<ContentItem> | null = null;
  private length: number = 0;

  constructor() {
    this.head = null;
    this.length = 0;
  }

  public getHead(): SLLNode<ContentItem> | null {
    return this.head;
  }

  public size(): number {
    return this.length;
  }

  public isEmpty(): boolean {
    return this.head === null;
  }

  /**
   * Insert at the beginning of the SLL (O(1))
   */
  public prepend(item: ContentItem): void {
    const newNode = new SLLNode<ContentItem>(item, this.head);
    this.head = newNode;
    this.length++;
  }

  /**
   * Insert at the end of the SLL (O(n))
   */
  public append(item: ContentItem): void {
    const newNode = new SLLNode<ContentItem>(item);
    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next !== null) {
        current = current.next;
      }
      current.next = newNode;
    }
    this.length++;
  }

  /**
   * Insert sorted by planned publishing date (O(n))
   */
  public insertSorted(item: ContentItem): void {
    const newNode = new SLLNode<ContentItem>(item);
    if (!this.head || item.plannedPublishDate < this.head.data.plannedPublishDate) {
      newNode.next = this.head;
      this.head = newNode;
      this.length++;
      return;
    }

    let current = this.head;
    while (current.next && current.next.data.plannedPublishDate <= item.plannedPublishDate) {
      current = current.next;
    }
    newNode.next = current.next;
    current.next = newNode;
    this.length++;
  }

  /**
   * Search for a content item by ID (O(n))
   */
  public findById(id: string): ContentItem | null {
    let current = this.head;
    while (current !== null) {
      if (current.data.id === id) {
        return current.data;
      }
      current = current.next;
    }
    return null;
  }

  /**
   * Update content item data by ID (O(n))
   */
  public update(id: string, updatedData: Partial<ContentItem>): boolean {
    let current = this.head;
    while (current !== null) {
      if (current.data.id === id) {
        current.data = { ...current.data, ...updatedData };
        return true;
      }
      current = current.next;
    }
    return false;
  }

  /**
   * Delete a node by Content ID (O(n))
   */
  public deleteById(id: string): boolean {
    if (!this.head) return false;

    // Head deletion
    if (this.head.data.id === id) {
      this.head = this.head.next;
      this.length--;
      return true;
    }

    let current = this.head;
    while (current.next !== null && current.next.data.id !== id) {
      current = current.next;
    }

    if (current.next !== null) {
      current.next = current.next.next;
      this.length--;
      return true;
    }

    return false;
  }

  /**
   * Linear traversal converting linked list to array for visualization
   */
  public toArray(): ContentItem[] {
    const items: ContentItem[] = [];
    let current = this.head;
    while (current !== null) {
      items.push({ ...current.data });
      current = current.next;
    }
    return items;
  }

  /**
   * Clear all nodes
   */
  public clear(): void {
    this.head = null;
    this.length = 0;
  }

  /**
   * Load from array
   */
  public loadFromArray(items: ContentItem[]): void {
    this.clear();
    for (const item of items) {
      this.append(item);
    }
  }
}
