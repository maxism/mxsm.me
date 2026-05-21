declare module "@/signal/main.js" {
  type SignalBootOptions = {
    locale?: "ru" | "en";
  };

  export function boot(options?: SignalBootOptions): void;
  export function dispose(): void;
}
