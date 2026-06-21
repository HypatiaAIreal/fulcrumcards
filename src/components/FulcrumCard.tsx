import type { Card } from "@/lib/cards";
import type { Dictionary } from "@/lib/i18n";
import {
  FULCRUM_KEYS,
  SEVERITY_STYLE,
  STATUS_GLYPH,
  countVerified,
  isAllVerified,
} from "@/lib/fulcrum";
import styles from "./FulcrumCard.module.css";

/** Mapea cada valor de la barra (1 / 0.5 / 0) a su clase de color. */
const BAR_CLASS: Record<string, string> = {
  "1": styles.barV,
  "0.5": styles.barA,
  "0": styles.barX,
};

/**
 * Resalta los fragmentos envueltos en **dobles asteriscos** (como el
 * <span class="highlight"> del template). El texto sin marcas se renderiza
 * tal cual, así que las cards actuales no cambian.
 */
function renderOpening(text: string) {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className={styles.highlight}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

/**
 * Renderiza cualquier card JSON con el diseño exacto del template HNV.
 * Componente de presentación puro; los textos de UI vienen del diccionario.
 */
export default function FulcrumCard({
  card,
  dict,
}: {
  card: Card;
  dict: Dictionary;
}) {
  const severity = SEVERITY_STYLE[card.severity];
  const verified = countVerified(card);
  const badge = isAllVerified(card)
    ? dict.severity.allVerified
    : dict.severity[card.severity];

  return (
    <>
      <article className={styles.card}>
        {/* Header */}
        <header className={styles.cardHeader}>
          <div className={styles.cardNumber}>
            {dict.nav.card} #{card.id} · {card.sector}
          </div>
          <div
            className={styles.cardSector}
            style={{ color: severity.color, backgroundColor: severity.bg }}
          >
            {badge}
          </div>
          <h1 className={styles.cardTitle}>{card.title}</h1>
          <p className={styles.cardSubtitle}>{card.subtitle}</p>
        </header>

        {/* Opening case */}
        <section className={styles.opening}>
          <p className={styles.openingText}>{renderOpening(card.opening)}</p>
        </section>

        {/* Diagnostic */}
        <section className={styles.diagnostic}>
          <div className={styles.diagnosticLabel}>{dict.card.diagnosis}</div>

          <div className={styles.diagnosticSummary}>
            {/* Puntos decorativos: el estado de cada fulcro ya se anuncia como
                texto en la rejilla inferior, así que se ocultan a lectores de
                pantalla para no duplicar la información. */}
            {FULCRUM_KEYS.map((key) => (
              <div
                key={key}
                aria-hidden="true"
                className={`${styles.summaryDot} ${styles[card.fulcrums[key].status]}`}
              />
            ))}
            <span
              className={styles.summaryLabel}
              style={{ color: severity.color }}
            >
              {dict.card.verifiedCount(verified)}
            </span>
          </div>

          <div className={styles.fulcrumGrid}>
            {FULCRUM_KEYS.map((key) => {
              const f = card.fulcrums[key];
              return (
                <div
                  key={key}
                  className={`${styles.fulcrumItem} ${styles[f.status]}`}
                >
                  <div className={styles.fulcrumName}>{dict.fulcrums[key]}</div>
                  <div className={styles.fulcrumStatus}>
                    {STATUS_GLYPH[f.status]} {dict.status[f.status]}
                  </div>
                  <div className={styles.fulcrumDetail}>{f.detail}</div>
                  {f.crack ? (
                    <div className={styles.fulcrumCrack}>{f.crack}</div>
                  ) : null}
                  <div className={styles.fulcrumBar}>
                    {f.bar.map((value, i) => (
                      <div
                        key={i}
                        className={`${styles.barSegment} ${BAR_CLASS[String(value)] ?? styles.barX}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Lever & Fulcrum */}
        <section className={styles.analysis}>
          <div className={styles.analysisRow}>
            <div className={styles.analysisSection}>
              <h2>{dict.card.visibleLever}</h2>
              <p>{card.lever}</p>
            </div>
            <div className={styles.analysisSection}>
              <h2>{dict.card.invisibleFulcrum}</h2>
              <p>{card.fulcrum}</p>
            </div>
          </div>
        </section>

        {/* Contrast */}
        {card.contrast?.text ? (
          <section className={styles.contrast}>
            <div className={styles.contrastLabel}>{dict.card.contrast}</div>
            <p className={styles.contrastText}>{card.contrast.text}</p>
          </section>
        ) : null}

        {/* Escape */}
        {card.escape ? (
          <section className={styles.escape}>
            <div className={styles.escapeLabel}>{dict.card.escape}</div>
            <p className={styles.escapeText}>{card.escape}</p>
          </section>
        ) : null}

        {/* Lesson */}
        <section className={styles.lesson}>
          <div className={styles.lessonLabel}>{dict.card.lesson}</div>
          <p className={styles.lessonText}>{card.lesson}</p>
        </section>

        {/* Footer */}
        <footer className={styles.cardFooter}>
          <div className={styles.references}>
            {card.references.map((ref, i) => (
              <div key={i}>
                <span className={styles.refTag}>{dict.card.ref}</span> {ref}
              </div>
            ))}
          </div>
          <a
            className={styles.cardUrl}
            href={card.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {card.url.replace(/^https?:\/\//, "")}
          </a>
        </footer>
      </article>

      <div className={styles.brandMark}>{dict.brand.mark}</div>
    </>
  );
}
