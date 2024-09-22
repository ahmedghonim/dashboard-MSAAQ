export class EventBus {
  private events: Record<string, Function[]> = {};

  public on(eventName: string, callback: Function): this {
    if (typeof callback !== "function") {
      throw new Error("EventBus 'on' method expects a callback function.");
    }

    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(callback);

    return this;
  }

  public emit(eventName: string, ...args: any[]): this {
    const callbacks = this.events[eventName];
    if (callbacks) {
      callbacks.forEach((callback) => callback(...args));
    }

    return this;
  }

  public off(event?: string | string[], callback?: Function): this {
    if (!event || (Array.isArray(event) && !event.length)) {
      this.events = {};
      return this;
    }

    if (Array.isArray(event)) {
      event.forEach((e) => this.off(e, callback));
      return this;
    }

    if (!callback) {
      delete this.events[event];
      return this;
    }

    const callbacks = this.events[event];
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }

    return this;
  }

  public once(eventName: string, callback: Function): this {
    const onceWrapper = (...args: any[]) => {
      this.off(eventName, onceWrapper);
      callback(...args);
    };

    this.on(eventName, onceWrapper);

    return this;
  }
}

export const eventBus = new EventBus();
