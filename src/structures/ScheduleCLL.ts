/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Channel } from '../types';

/**
 * Node for Circular Linked List (CLL)
 * Mirrors: struct ScheduleNode { Channel data; ScheduleNode* next; }
 * where tail->next == head
 */
export class CLLNode<T> {
  public data: T;
  public next: CLLNode<T>;

  constructor(data: T, next?: CLLNode<T>) {
    this.data = data;
    // Self-loop by default when initialized alone
    this.next = next || this;
  }
}

/**
 * Circular Linked List (CLL) for Channel Publishing Rotation
 * Maintains a continuous ring (tail->next === head) and a live `current` pointer
 */
export class ScheduleCLL {
  private head: CLLNode<Channel> | null = null;
  private tail: CLLNode<Channel> | null = null;
  private current: CLLNode<Channel> | null = null;
  private length: number = 0;

  constructor() {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.length = 0;
  }

  public getHead(): CLLNode<Channel> | null {
    return this.head;
  }

  public getTail(): CLLNode<Channel> | null {
    return this.tail;
  }

  public getCurrent(): CLLNode<Channel> | null {
    return this.current;
  }

  public size(): number {
    return this.length;
  }

  public isEmpty(): boolean {
    return this.head === null;
  }

  /**
   * Append a channel into the Circular Linked List
   * Ensures tail.next always points back to head
   */
  public append(channel: Channel): void {
    const newNode = new CLLNode<Channel>(channel);
    if (!this.head || !this.tail) {
      this.head = newNode;
      this.tail = newNode;
      newNode.next = newNode; // Circular self-reference
      this.current = newNode;
    } else {
      newNode.next = this.head;
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.length++;
  }

  /**
   * Advance the rotation pointer: current = current->next (O(1))
   * Because it's a Circular Linked List, after the last channel it automatically wraps to head!
   */
  public rotateNext(): Channel | null {
    if (!this.current) return null;
    this.current = this.current.next;
    return this.current.data;
  }

  /**
   * Set the current rotation pointer to a specific channel ID
   */
  public setCurrentById(channelId: string): boolean {
    if (!this.head) return false;
    let temp: CLLNode<Channel> = this.head;
    for (let i = 0; i < this.length; i++) {
      if (temp.data.id === channelId) {
        this.current = temp;
        return true;
      }
      temp = temp.next;
    }
    return false;
  }

  /**
   * Remove a channel from the Circular Linked List by ID
   */
  public removeById(channelId: string): boolean {
    if (!this.head || !this.tail) return false;

    let curr: CLLNode<Channel> = this.head;
    let prev: CLLNode<Channel> = this.tail;

    for (let i = 0; i < this.length; i++) {
      if (curr.data.id === channelId) {
        if (this.length === 1) {
          this.head = null;
          this.tail = null;
          this.current = null;
        } else {
          prev.next = curr.next;
          if (curr === this.head) {
            this.head = curr.next;
          }
          if (curr === this.tail) {
            this.tail = prev;
          }
          if (this.current === curr) {
            this.current = curr.next;
          }
        }
        this.length--;
        return true;
      }
      prev = curr;
      curr = curr.next;
    }
    return false;
  }

  /**
   * Generate the upcoming N publishing slots by traversing around the circular ring
   */
  public peekUpcomingRotation(steps: number): Channel[] {
    if (!this.current || this.length === 0) return [];
    const sequence: Channel[] = [];
    let pointer: CLLNode<Channel> = this.current;
    for (let i = 0; i < steps; i++) {
      sequence.push({ ...pointer.data });
      pointer = pointer.next;
    }
    return sequence;
  }

  /**
   * Convert Circular Linked List (1 full revolution from head to tail) into an array
   */
  public toArray(): Channel[] {
    if (!this.head || this.length === 0) return [];
    const result: Channel[] = [];
    let temp: CLLNode<Channel> = this.head;
    for (let i = 0; i < this.length; i++) {
      result.push({ ...temp.data });
      temp = temp.next;
    }
    return result;
  }

  public clear(): void {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.length = 0;
  }

  public loadFromArray(channels: Channel[], currentChannelId?: string): void {
    this.clear();
    const activeChannels = channels.filter((c) => c.activeInRotation);
    for (const ch of activeChannels) {
      this.append(ch);
    }
    if (currentChannelId) {
      this.setCurrentById(currentChannelId);
    }
  }
}
