type JsonLdProps = {
  data: Record<string, unknown> | readonly Record<string, unknown>[];
};

function jsonLdKey(item: Record<string, unknown>, index: number): string {
  const record = item as {
    "@type"?: string;
    "@id"?: string;
    url?: string;
    name?: string;
    datePublished?: string;
  };
  const type = record["@type"] ?? "item";
  const unique =
    record["@id"] ??
    record.url ??
    (record.name && record.datePublished ? `${record.name}-${record.datePublished}` : record.name);

  return unique ? `${type}-${unique}` : `${type}-${index}`;
}

export function JsonLd({ data }: JsonLdProps) {
  const items = Array.isArray(data) ? data : [data];

  return (
    <>
      {items.map((item, index) => (
        <script
          key={jsonLdKey(item, index)}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
