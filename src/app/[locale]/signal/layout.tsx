import "@/signal/signal.css";

type LayoutProps = {
  children: React.ReactNode;
};

export default function SignalLayout({ children }: LayoutProps) {
  return <div className="signal-route">{children}</div>;
}
