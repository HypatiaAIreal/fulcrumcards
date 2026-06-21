import type { Card } from "@/lib/cards";
import {
  FULCRUM_ORDER,
  SEVERITY_META,
  STATUS_META,
  countVerified,
  severityBadgeText,
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
 * Componente de presentación puro (sin estado ni navegación).
 */
export default function FulcrumCard({ card }: { card: Card }) {
  const severity = SEVERITY_META[card.severity];
  const verified = countVerified(card);

  return (
    <>
      <article className={styles.card}>
      {/* Header */}
      <header className={styles.cardHeader}>
        <div className={styles.cardNumber}>
          Card #{card.id} · {card.sector}
        </div>
        <div
          className={styles.cardSector}
          style={{ color: severity.color, backgroundColor: severity.bg }}
        >
          {severityBadgeText(card)}
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
        <div className={styles.diagnosticLabel}>Diagnóstico de fulcros</div>

        <div className={styles.diagnosticSummary}>
          {/* Puntos decorativos: el estado de cada fulcro ya se anuncia como
              texto en la rejilla inferior, así que se ocultan a lectores de
              pantalla para no duplicar la información. */}
          {FULCRUM_ORDER.map(({ key }) => (
            <div
              key={key}
              aria-hidden="true"
              className={`${styles.summaryDot} ${styles[card.fulcrums[key].status]}`}
            />
          ))}
          <span className={styles.summaryLabel} style={{ color: severity.color }}>
            {verified} / 4 verificados
          </span>
        </div>

        <div className={styles.fulcrumGrid}>
          {FULCRUM_ORDER.map(({ key, name }) => {
            const f = card.fulcrums[key];
            const status = STATUS_META[f.status];
            return (
              <div
                key={key}
                className={`${styles.fulcrumItem} ${styles[f.status]}`}
              >
                <div className={styles.fulcrumName}>{name}</div>
                <div className={styles.fulcrumStatus}>
                  {status.glyph} {status.label}
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
            <h2>Palanca visible</h2>
            <p>{card.lever}</p>
          </div>
          <div className={styles.analysisSection}>
            <h2>Fulcro invisible</h2>
            <p>{card.fulcrum}</p>
          </div>
        </div>
      </section>

      {/* Contrast */}
      {card.contrast?.text ? (
        <section className={styles.contrast}>
          <div className={styles.contrastLabel}>Contraste</div>
          <p className={styles.contrastText}>{card.contrast.text}</p>
        </section>
      ) : null}

      {/* Escape — ¿Hay salida? */}
      {card.escape ? (
        <section className={styles.escape}>
          <div className={styles.escapeLabel}>¿Hay salida?</div>
          <p className={styles.escapeText}>{card.escape}</p>
        </section>
      ) : null}

      {/* Lesson */}
      <section className={styles.lesson}>
        <div className={styles.lessonLabel}>Lección</div>
        <p className={styles.lessonText}>{card.lesson}</p>
      </section>

      {/* Footer */}
      <footer className={styles.cardFooter}>
        <div className={styles.references}>
          {card.references.map((ref, i) => (
            <div key={i}>
              <span className={styles.refTag}>Ref.</span> {ref}
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

      <div className={styles.brandMark}>
        El Fulcro Invisible · García Bach &amp; Hypatia · 2026
      </div>
    </>
  );
}
