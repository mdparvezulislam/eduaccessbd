import { Connection } from "mongoose";

declare global {
  var mongoose: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}

declare global {
  interface Window {
    dataLayer: Record<string, any>[];
    fbq?: (...args: any[]) => void;
  }
}


export {};