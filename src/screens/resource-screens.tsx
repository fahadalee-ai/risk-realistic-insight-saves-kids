import { useMemo, useState, type ReactNode } from "react";
import { Bookmark, Phone, Share2 } from "lucide-react";
import { content } from "../data/content.js";
import { images } from "../data/images";
import { readMinutes, resourceById, shareText } from "../lib/format";
import { useApp } from "../lib/store";
import { useGo } from "../lib/nav";
import { Button, Chip, EmptyState, ScreenContainer, Sheet } from "../components/ios";

const ui = content.ui;

export function ResourcesScreen() {
  const { go } = useGo();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sheetId, setSheetId] = useState<string | null>(null);
  const filtered = content.resources.filter((item) => {
    const text = `${item.title} ${item.summary} ${item.category}`.toLowerCase();
    const matches = text.includes(query.trim().toLowerCase());
    const cat = category === "All" || item.category === category;
    return matches && cat;
  });
  const browsing = !query && category === "All";
  const guide = content.resources.find((item) => item.id === sheetId);

  const Row = ({ id }: { id: string }) => {
    const item = resourceById(id);
    if (!item) return null;
    return (
      <button type="button" className="rk-row rk-press" onClick={() => go(`/resource/${item.id}`)}>
        <img className="rk-thumb" src={images[item.image as keyof typeof images]} alt="" />
        <span className="rk-row-text">
          <span className="rk-row-title">{item.title}</span>
          <span className="rk-row-sub">{item.summary}</span>
          <span className="rk-row-sub">{readMinutes(item.body)} · {item.type}</span>
        </span>
      </button>
    );
  };

  return (
    <ScreenContainer mode="large" title={ui.tabs.resources} tabBar>
      <div className="rk-stack" style={{ paddingTop: 8 }}>
        <div className="rk-talk">
          <h2>{content.helpNow.title}</h2>
          <p className="rk-body">{content.helpNow.emergency}</p>
          <p className="rk-secondary">{content.helpNow.site}</p>
          <Button onClick={() => { window.location.href = "tel:988"; }}>
            <Phone size={18} /> {content.helpNow.lifeline}
          </Button>
          <p className="rk-help">{content.helpNow.lifelineDetail}</p>
          <a className="rk-link" href={`tel:${content.contact.phoneTel}`}>{ui.callUs} {content.contact.phone}</a>
        </div>
        <label className="rk-search">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ui.searchResources} aria-label={ui.searchResources} />
          {query && (
            <button type="button" className="rk-link" onClick={() => setQuery("")}>
              Cancel
            </button>
          )}
        </label>
        <div className="rk-chiprow rk-pad">
          {content.resourceCategories.map((item) => (
            <Chip key={item} selected={category === item} onClick={() => setCategory(item)}>
              {item}
            </Chip>
          ))}
        </div>
        {!browsing && filtered.length === 0 && (
          <EmptyState image="emptyResults" title={ui.emptySearch} text={content.resources.length ? ui.emptySearchText : ui.emptySearchText} />
        )}
        {!browsing && (
          <div className="rk-group" style={{ margin: "0 16px" }}>
            {filtered.map((item) => (
              <Row key={item.id} id={item.id} />
            ))}
          </div>
        )}
        {browsing && (
          <>
            <SectionBlock title={content.sections.safety} ids={content.resources.filter((item) => item.section === "safety").map((item) => item.id)} Row={Row} />
            <SectionBlock title={content.sections.parents} ids={content.resources.filter((item) => item.section === "parents").map((item) => item.id)} Row={Row} />
            <SectionBlock title={content.sections.youth} ids={content.resources.filter((item) => item.section === "youth").map((item) => item.id)} Row={Row} />
            <div className="rk-pad">
              <h2 className="rk-h2">{content.sections.downloads}</h2>
              <div className="rk-group" style={{ marginTop: 8 }}>
                {content.resources.filter((item) => item.type === "PDF Guide").map((item) => (
                  <button key={item.id} type="button" className="rk-row rk-press" onClick={() => setSheetId(item.id)}>
                    <span className="rk-row-text">
                      <span className="rk-row-title">{item.title}</span>
                      <span className="rk-row-sub">{item.type} · {item.date}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <Sheet open={!!guide} onClose={() => setSheetId(null)} title={guide?.title}>
        {guide && (
          <div className="rk-stack">
            <p className="rk-secondary">{guide.type} · {guide.date}</p>
            <p className="rk-body rk-copy">{guide.summary}</p>
            <Button onClick={() => { setSheetId(null); go(`/resource/${guide.id}`); }}>Read</Button>
          </div>
        )}
      </Sheet>
    </ScreenContainer>
  );
}

function SectionBlock({ title, ids, Row }: { title: string; ids: string[]; Row: ({ id }: { id: string }) => ReactNode }) {
  return (
    <div className="rk-pad">
      <h2 className="rk-h2">{title}</h2>
      <div className="rk-group" style={{ marginTop: 8 }}>
        {ids.map((id) => (
          <Row key={id} id={id} />
        ))}
      </div>
    </div>
  );
}

export function ResourceDetailScreen({ resourceId }: { resourceId: string }) {
  const item = resourceById(resourceId);
  const { isSaved, toggleSave, toast } = useApp();
  const { go } = useGo();
  const related = useMemo(
    () => content.resources.filter((resource) => resource.id !== resourceId && resource.category === item?.category).slice(0, 3),
    [resourceId, item?.category],
  );
  if (!item) {
    return (
      <ScreenContainer mode="inline" title={ui.tabs.resources}>
        <EmptyState image="emptyResults" title={ui.emptySearch} text={ui.emptySearchText} />
      </ScreenContainer>
    );
  }
  const saved = isSaved(item.id);
  return (
    <ScreenContainer
      mode="inline"
      title={item.title}
      right={
        <>
          <button
            type="button"
            className="rk-icon"
            aria-label={ui.save}
            onClick={() => {
              const now = toggleSave(item.id);
              toast(now ? ui.savedToast : ui.removedToast);
            }}
          >
            <Bookmark size={22} fill={saved ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            className="rk-icon"
            aria-label={ui.share}
            onClick={async () => {
              const result = await shareText(item.title, item.summary);
              if (result === "copied") toast(ui.copied);
            }}
          >
            <Share2 size={20} />
          </button>
        </>
      }
    >
      <img src={images[item.image as keyof typeof images]} alt="" style={{ width: "100%", height: 220, objectFit: "cover" }} />
      <div className="rk-pad rk-stack" style={{ paddingTop: 16 }}>
        <div>
          <span className="rk-chip on">{item.category}</span>
          <h1 className="rk-h1" style={{ marginTop: 8 }}>{item.title}</h1>
          <p className="rk-secondary">RISK · {item.date} · {readMinutes(item.body)}</p>
        </div>
        <article className="rk-copy rk-stack">
          {item.body.map((block, index) => {
            if (block.type === "h") return <h2 key={index} className="rk-h3">{block.text}</h2>;
            if (block.type === "quote") return <blockquote key={index} className="rk-quote">{block.text}</blockquote>;
            if (block.type === "ul") {
              return (
                <ul key={index} style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                  {block.items?.map((line) => (
                    <li key={line} className="rk-body">{line}</li>
                  ))}
                </ul>
              );
            }
            return <p key={index} className="rk-body">{block.text}</p>;
          })}
        </article>
        {related.length > 0 && (
          <div>
            <h2 className="rk-h2">Related resources</h2>
            <div className="rk-group" style={{ marginTop: 8 }}>
              {related.map((resource) => (
                <button key={resource.id} type="button" className="rk-row rk-press" onClick={() => go(`/resource/${resource.id}`)}>
                  <span className="rk-row-title">{resource.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}
