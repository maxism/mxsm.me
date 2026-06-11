type MaskSeoContent = {
  title: string;
  paragraphs: readonly string[];
};

type MaskSeoFallbackProps = {
  content: MaskSeoContent;
};

export function MaskSeoFallback({ content }: MaskSeoFallbackProps) {
  return (
    <article className="mask-seo">
      <h1>{content.title}</h1>
      {content.paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </article>
  );
}
