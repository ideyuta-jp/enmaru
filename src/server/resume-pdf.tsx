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
import type {EducationEntryInput, WorkHistoryEntryInput} from '@/types/Resume';
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
  contentCellSingle: {flex: 1, padding: 4, borderLeftWidth: 0},
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

export interface ResumePdfData {
  realName: string;
  birthDate: string; // 'YYYY-MM-DD'
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine: string;
  phone: string;
  licenses: string[]; // from SeekerProfile, read-only on the résumé
  bio: string; // from SeekerProfile, read-only on the résumé
  education: EducationEntryInput[];
  workHistory: WorkHistoryEntryInput[];
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
          <View style={styles.row}>
            <View style={styles.labelCell}>
              <Text>氏名</Text>
            </View>
            <View style={styles.valueCell}>
              <Text style={styles.nameValue}>{data.realName}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.labelCell}>
              <Text>生年月日</Text>
            </View>
            <View style={styles.valueCell}>
              <Text>
                {data.birthDate && formatYearMonthDay(data.birthDate)}
                {ageAtToday !== null && `　（満${ageAtToday}歳）`}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.labelCell}>
              <Text>現住所</Text>
            </View>
            <View style={styles.valueCell}>
              <Text>
                {data.postalCode && `〒${data.postalCode}　`}
                {address}
              </Text>
            </View>
          </View>
          <View style={styles.rowLast}>
            <View style={styles.labelCell}>
              <Text>電話番号</Text>
            </View>
            <View style={styles.valueCell}>
              <Text>{data.phone}</Text>
            </View>
          </View>
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

        {data.licenses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.box}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, {flex: 1}]}>
                  免許・資格
                </Text>
              </View>
              {data.licenses.map((license, i) => (
                <View
                  key={license}
                  style={
                    i === data.licenses.length - 1 ? styles.rowLast : styles.row
                  }
                >
                  <Text style={styles.contentCellSingle}>{license}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {data.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>自己PR</Text>
            <View style={styles.selfPrBox}>
              <Text>{data.bio}</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}

// Renders the seeker's résumé data to a PDF buffer, entirely in Node (no
// browser). Used by resume-actions.ts's saveResume to produce the file stored
// as SeekerDocument(RESUME).
export async function renderResumePdf(data: ResumePdfData): Promise<Buffer> {
  return renderToBuffer(<ResumeDocument data={data} todayIso={todayInJst()} />);
}
