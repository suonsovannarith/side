/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductionTask, TaskStatus, PRODUCTION_STAGES } from '../types';

/**
 * Node for Doubly Linked List (DLL)
 * Mirrors: struct TaskNode { ProductionTask data; TaskNode* prev; TaskNode* next; }
 */
export class DLLNode<T> {
  public data: T;
  public prev: DLLNode<T> | null;
  public next: DLLNode<T> | null;

  constructor(data: T, prev: DLLNode<T> | null = null, next: DLLNode<T> | null = null) {
    this.data = data;
    this.prev = prev;
    this.next = next;
  }
}

/**
 * Doubly Linked List (DLL) for Production Tasks
 * Supports bidirectional traversal, stage progression/regression, and priority reordering
 */
export class TaskDLL {
  private head: DLLNode<ProductionTask> | null = null;
  private tail: DLLNode<ProductionTask> | null = null;
  private length: number = 0;

  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  public getHead(): DLLNode<ProductionTask> | null {
    return this.head;
  }

  public getTail(): DLLNode<ProductionTask> | null {
    return this.tail;
  }

  public size(): number {
    return this.length;
  }

  public isEmpty(): boolean {
    return this.head === null;
  }

  /**
   * Append task to the tail of DLL (O(1))
   */
  public append(task: ProductionTask): void {
    const newNode = new DLLNode<ProductionTask>(task);
    if (!this.head || !this.tail) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.prev = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.length++;
  }

  /**
   * Prepend task to head of DLL (O(1))
   */
  public prepend(task: ProductionTask): void {
    const newNode = new DLLNode<ProductionTask>(task);
    if (!this.head || !this.tail) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    this.length++;
  }

  /**
   * Search for task by ID (O(n))
   */
  public findById(id: string): ProductionTask | null {
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
   * Advance a task to the next stage (Bidirectional DLL operation!)
   */
  public advanceStage(taskId: string): boolean {
    let current = this.head;
    while (current !== null) {
      if (current.data.id === taskId) {
        if (current.data.stageNumber < 7) {
          const nextStageNum = current.data.stageNumber + 1;
          const stageInfo = PRODUCTION_STAGES.find((s) => s.number === nextStageNum);
          current.data.stageNumber = nextStageNum;
          if (stageInfo) {
            current.data.stageName = stageInfo.name;
          }
          if (nextStageNum === 7) {
            current.data.status = 'Completed';
          } else {
            current.data.status = 'In Progress';
          }
          return true;
        } else {
          current.data.status = 'Completed';
          return true;
        }
      }
      current = current.next;
    }
    return false;
  }

  /**
   * Rewind a task to the previous stage (Bidirectional DLL capability!)
   */
  public rewindStage(taskId: string): boolean {
    let current = this.head;
    while (current !== null) {
      if (current.data.id === taskId) {
        if (current.data.stageNumber > 1) {
          const prevStageNum = current.data.stageNumber - 1;
          const stageInfo = PRODUCTION_STAGES.find((s) => s.number === prevStageNum);
          current.data.stageNumber = prevStageNum;
          if (stageInfo) {
            current.data.stageName = stageInfo.name;
          }
          current.data.status = 'In Progress';
          return true;
        }
      }
      current = current.next;
    }
    return false;
  }

  /**
   * Update task status
   */
  public updateStatus(taskId: string, status: TaskStatus): boolean {
    let current = this.head;
    while (current !== null) {
      if (current.data.id === taskId) {
        current.data.status = status;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  /**
   * Delete node by task ID (O(n))
   */
  public deleteById(id: string): boolean {
    let current = this.head;
    while (current !== null) {
      if (current.data.id === id) {
        if (current.prev) {
          current.prev.next = current.next;
        } else {
          this.head = current.next;
        }

        if (current.next) {
          current.next.prev = current.prev;
        } else {
          this.tail = current.prev;
        }

        this.length--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  /**
   * Forward traversal into array
   */
  public toArray(): ProductionTask[] {
    const tasks: ProductionTask[] = [];
    let current = this.head;
    while (current !== null) {
      tasks.push({ ...current.data });
      current = current.next;
    }
    return tasks;
  }

  /**
   * Reverse traversal into array (demonstrating tail-to-head backward navigation)
   */
  public toArrayReverse(): ProductionTask[] {
    const tasks: ProductionTask[] = [];
    let current = this.tail;
    while (current !== null) {
      tasks.push({ ...current.data });
      current = current.prev;
    }
    return tasks;
  }

  /**
   * Filter tasks by content ID
   */
  public filterByContentId(contentId: string): ProductionTask[] {
    const filtered: ProductionTask[] = [];
    let current = this.head;
    while (current !== null) {
      if (current.data.contentId === contentId) {
        filtered.push({ ...current.data });
      }
      current = current.next;
    }
    return filtered;
  }

  public clear(): void {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  public loadFromArray(tasks: ProductionTask[]): void {
    this.clear();
    for (const t of tasks) {
      this.append(t);
    }
  }
}
