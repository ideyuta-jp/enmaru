import path from 'node:path';
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from '@react-pdf/renderer';
import type {
  EducationEntryInput,
  ResumeInput,
  WorkHistoryEntryInput,
} from '@/types/Resume';
import {
  calcAge,
  formatYearMonthCells,
  formatYearMonthDay,
  todayInJst,
} from '@/utils/date';

// @react-pdf's built-in fonts have no Japanese glyphs, so a Japanese font
// must be registered for Japanese text to render at all. The files are
// read via a runtime-built path that output file tracing cannot follow;
// next.config.ts's outputFileTracingIncludes keeps them in the deploy
// bundle — update it if these files move.
Font.register({
  family: 'Noto Sans JP',
  fonts: [
    {
      src: path.join(process.cwd(), 'src/assets/fonts/NotoSansJP-Regular.ttf'),
      fontWeight: 'normal',
    },
    {
      src: path.join(process.cwd(), 'src/assets/fonts/NotoSansJP-Bold.ttf'),
      fontWeight: 'bold',
    },
  ],
});

// @react-pdf's default hyphenation is English-oriented: a long Japanese
// run is treated as one word and gets a "-" inserted at every line break.
// Allow a break between any two characters with no hyphen instead — the
// Japanese line-breaking convention. The interleaved '' fragments matter:
// a break between plain fragments of one word renders a hyphen, while ''
// becomes a zero-width glue (a hyphen-free break opportunity) in textkit.
Font.registerHyphenationCallback((word) =>
  Array.from(word).flatMap((char) => [char, '']),
);

// A JIS-style resume built from ruled tables (@react-pdf has no <table>
// element, so each "table" is a bordered View with flex-row cells). Kept
// black-on-white by design — this is an auto-generated document seekers
// submit for nursery audits, not a chat-deliverable, so the org's brand
// palette doesn't apply here. No photo box yet: a photo was confirmed as
// required after all (issue #167), but the box needs the photo-upload
// feature #167 itself adds, so both land together in that issue.
const BORDER = '#000000';

// Column widths of the 学歴・職歴 table, shared by the header row (inline
// style) and the body rows (yearCell/monthCell) so the columns stay aligned.
const YEAR_COL_WIDTH = 55;
const MONTH_COL_WIDTH = 40;

const styles = StyleSheet.create({
  page: {fontFamily: 'Noto Sans JP', padding: 28, fontSize: 9},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  title: {fontSize: 20, fontWeight: 'bold', letterSpacing: 4},
  dateText: {fontSize: 9},

  box: {borderWidth: 1, borderColor: BORDER},
  row: {flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BORDER},
  rowLast: {flexDirection: 'row'},

  labelCell: {
    width: 90,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
  },
  valueCell: {flex: 1, padding: 5, justifyContent: 'center'},
  nameValue: {fontSize: 13},

  section: {marginTop: 14},
  sectionTitle: {fontSize: 10, fontWeight: 'bold', marginBottom: 4},

  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableHeaderCell: {padding: 4, fontWeight: 'bold', textAlign: 'center'},
  yearCell: {
    width: YEAR_COL_WIDTH,
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    textAlign: 'center',
  },
  monthCell: {
    width: MONTH_COL_WIDTH,
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    textAlign: 'center',
  },
  contentCell: {flex: 1, padding: 4},
  centerText: {textAlign: 'center'},
  rightText: {textAlign: 'right', paddingRight: 8},

  selfPrBox: {
    borderWidth: 1,
    borderColor: BORDER,
    padding: 8,
    minHeight: 80,
  },
});

interface HistoryRow {
  year: string;
  month: string;
  content: string;
  align?: 'center' | 'right';
}

// Builds the combined 学歴・職歴 table rows: a "学歴" divider, one row per
// education entry expanded into 入学/卒業 (matching the traditional resume
// convention, from the single start/end record the form collects), a
// "職歴" divider, one row per work-history entry expanded into 入社/退社
// (or 現在に至る), and a trailing "以上".
function buildHistoryRows(
  education: EducationEntryInput[],
  workHistory: WorkHistoryEntryInput[],
): HistoryRow[] {
  const rows: HistoryRow[] = [];

  if (education.length > 0) {
    rows.push({year: '', month: '', content: '学歴', align: 'center'});
    for (const entry of education) {
      rows.push({
        ...formatYearMonthCells(entry.startYearMonth),
        content: `${entry.schoolName}　入学`,
      });
      if (entry.endYearMonth) {
        rows.push({
          ...formatYearMonthCells(entry.endYearMonth),
          content: `${entry.schoolName}　${entry.graduationStatus || '卒業'}`,
        });
      }
    }
  }

  if (workHistory.length > 0) {
    if (rows.length > 0) rows.push({year: '', month: '', content: ''});
    rows.push({year: '', month: '', content: '職歴', align: 'center'});
    for (const entry of workHistory) {
      const employmentSuffix = entry.employmentType
        ? `（${entry.employmentType}）`
        : '';
      rows.push({
        ...formatYearMonthCells(entry.startYearMonth),
        content: `${entry.companyName}　入社${employmentSuffix}`,
      });
      if (entry.endYearMonth) {
        rows.push({
          ...formatYearMonthCells(entry.endYearMonth),
          content: `${entry.companyName}　退社`,
        });
      } else {
        rows.push({year: '', month: '', content: '現在に至る'});
      }
      if (entry.description) {
        rows.push({year: '', month: '', content: `　${entry.description}`});
      }
    }
  }

  if (rows.length > 0) {
    rows.push({year: '', month: '', content: '以上', align: 'right'});
  }

  return rows;
}

// The résumé's own fields are exactly ResumeInput, so they are inherited
// rather than restated — a field added to the form then reaches the PDF
// without a matching line here and at the renderResumePdf call site.
export interface ResumePdfData extends ResumeInput {
  realName: string;
  furigana: string; // katakana only, from SeekerProfile — '' = unregistered
  bio: string; // from SeekerProfile, read-only on the résumé
}

interface InfoRowProps {
  label: string;
  /** Omits the bottom border, for the last row of a box. */
  last?: boolean;
  children: React.ReactNode;
}

/**
 * One label/value line of the résumé's top information box.
 *
 * @param label - Text for the fixed-width label cell.
 * @param last - Pass true on the final row so the box's own border is not doubled.
 * @param children - Rendered into the value cell; a `<Text>` in every current caller.
 */
function InfoRow({label, last, children}: InfoRowProps) {
  return (
    <View style={last ? styles.rowLast : styles.row}>
      <View style={styles.labelCell}>
        <Text>{label}</Text>
      </View>
      <View style={styles.valueCell}>{children}</View>
    </View>
  );
}

function ResumeDocument({
  data,
  todayIso,
}: {
  data: ResumePdfData;
  todayIso: string;
}) {
  const address = [data.prefecture, data.city, data.addressLine]
    .filter(Boolean)
    .join('');
  const ageAtToday = data.birthDate ? calcAge(data.birthDate, todayIso) : null;
  const historyRows = buildHistoryRows(data.education, data.workHistory);
  const todayText = formatYearMonthDay(todayIso);
  const todayLabel = todayText ? `${todayText}現在` : '';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>履歴書</Text>
          <Text style={styles.dateText}>{todayLabel}</Text>
        </View>

        <View style={styles.box}>
          <InfoRow label="氏名フリガナ">
            <Text>{data.furigana}</Text>
          </InfoRow>
          <InfoRow label="氏名">
            <Text style={styles.nameValue}>{data.realName}</Text>
          </InfoRow>
          <InfoRow label="生年月日">
            <Text>
              {data.birthDate && formatYearMonthDay(data.birthDate)}
              {ageAtToday !== null && `　（満${ageAtToday}歳）`}
            </Text>
          </InfoRow>
          <InfoRow label="住所フリガナ">
            <Text>{data.addressFurigana}</Text>
          </InfoRow>
          <InfoRow label="現住所">
            <Text>
              {data.postalCode && `〒${data.postalCode}　`}
              {address}
            </Text>
          </InfoRow>
          <InfoRow label="電話番号">
            <Text>{data.phone}</Text>
          </InfoRow>
          <InfoRow label="メールアドレス" last>
            <Text>{data.email}</Text>
          </InfoRow>
        </View>

        {historyRows.length > 0 && (
          <View style={styles.section}>
            <View style={styles.box}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, {width: YEAR_COL_WIDTH}]}>
                  年
                </Text>
                <Text
                  style={[styles.tableHeaderCell, {width: MONTH_COL_WIDTH}]}
                >
                  月
                </Text>
                <Text style={[styles.tableHeaderCell, {flex: 1}]}>
                  学歴・職歴
                </Text>
              </View>
              {historyRows.map((row, i) => (
                <View
                  key={i}
                  // 免許・資格テーブルと同じ理由で行を分割させない。
                  wrap={false}
                  style={
                    i === historyRows.length - 1 ? styles.rowLast : styles.row
                  }
                >
                  <Text style={styles.yearCell}>{row.year}</Text>
                  <Text style={styles.monthCell}>{row.month}</Text>
                  <Text
                    style={[
                      styles.contentCell,
                      ...(row.align === 'center' ? [styles.centerText] : []),
                      ...(row.align === 'right' ? [styles.rightText] : []),
                    ]}
                  >
                    {row.content}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {data.licenseHistory.length > 0 && (
          <View style={styles.section}>
            <View style={styles.box}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, {width: YEAR_COL_WIDTH}]}>
                  年
                </Text>
                <Text
                  style={[styles.tableHeaderCell, {width: MONTH_COL_WIDTH}]}
                >
                  月
                </Text>
                <Text style={[styles.tableHeaderCell, {flex: 1}]}>
                  免許・資格
                </Text>
              </View>
              {data.licenseHistory.map((entry, i) => {
                const {year, month} = formatYearMonthCells(
                  entry.acquiredYearMonth,
                );
                return (
                  <View
                    key={entry._key}
                    // 行の途中でページが変わると文字が上下に切れ、罫線も
                    // 片方のページにしか出ない。行ごと次ページへ送る。
                    wrap={false}
                    style={
                      i === data.licenseHistory.length - 1
                        ? styles.rowLast
                        : styles.row
                    }
                  >
                    <Text style={styles.yearCell}>{year}</Text>
                    <Text style={styles.monthCell}>{month}</Text>
                    <Text style={styles.contentCell}>{entry.licenseName}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* The heading and the box are page-level siblings, not wrapped in a
            section View: when the pair starts too close to the page bottom,
            @react-pdf would split the wrapper right after the heading and
            draw the box's top border over the heading text. minPresenceAhead
            keeps the heading on one page with the box's minHeight worth of
            content after it — and it only takes effect on an element with
            preceding siblings, which a section wrapper's first child is not.
            A bio longer than a full page can still split mid-box; only the
            squeezed-at-page-bottom case is avoided. */}
        {data.bio && (
          <>
            <Text
              style={[styles.section, styles.sectionTitle]}
              minPresenceAhead={100}
            >
              自己PR
            </Text>
            <View style={styles.selfPrBox}>
              <Text>{data.bio}</Text>
            </View>
          </>
        )}
      </Page>
    </Document>
  );
}

// Renders the seeker's résumé data to a PDF buffer, entirely in Node (no
// browser). Used by resume-actions.ts's publishResume (#208 — the "発行する"
// action; saveResumeDraft does not call this) to produce the file stored as
// SeekerDocument(RESUME).
export async function renderResumePdf(data: ResumePdfData): Promise<Buffer> {
  return renderToBuffer(<ResumeDocument data={data} todayIso={todayInJst()} />);
}
