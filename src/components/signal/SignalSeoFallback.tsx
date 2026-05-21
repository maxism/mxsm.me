type SignalSeoContent = {
  title: string;
  paragraphs: readonly string[];
};

type SignalSeoFallbackProps = {
  content: SignalSeoContent;
};

export function SignalSeoFallback({ content }: SignalSeoFallbackProps) {
  return (
    <article className="signal-seo">
      <h1>{content.title}</h1>
      {content.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </article>
  );
}
