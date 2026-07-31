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

// A JIS-style resume built from ruled tables (@react-pdf has no <table>
// element, so each "table" is a bordered View with flex-row cells). Kept
// black-on-white by design — this is an auto-generated document seekers
// submit for nursery audits, not a chat-deliverable, so the org's brand
// palette doesn't apply here. No photo box: not required for audit
// purposes (issue #188) and may be added later once photo upload exists.
const BORDER = '#000000';

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
    width: 55,
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    textAlign: 'center',
  },
  monthCell: {
    width: 40,
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

// 'YYYY-MM-DD' -> '1995年4月1日'. Returns '' for an empty/malformed input.
function formatBirthDate(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return '';
  return `${match[1]}年${Number(match[2])}月${Number(match[3])}日`;
}

// 'YYYY-MM-DD' birth date + 'YYYY-MM-DD' today -> age in full years, JIS
// resumes' conventional "満n歳". Returns null if either date is malformed.
function calcAge(birthDate: string, todayIso: string): number | null {
  const b = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  const t = /^(\d{4})-(\d{2})-(\d{2})$/.exec(todayIso);
  if (!b || !t) return null;
  const [by, bm, bd] = [Number(b[1]), Number(b[2]), Number(b[3])];
  const [ty, tm, td] = [Number(t[1]), Number(t[2]), Number(t[3])];
  let age = ty - by;
  if (tm < bm || (tm === bm && td < bd)) age -= 1;
  return age;
}

// 'YYYY-MM' -> {year: '2010年', month: '4月'}. Both '' for an
// empty/malformed input, so the row's 年/月 cells render blank rather than
// throwing.
function splitYearMonth(yearMonth: string): {year: string; month: string} {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  if (!match) return {year: '', month: ''};
  return {year: `${match[1]}年`, month: `${Number(match[2])}月`};
}

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
        ...splitYearMonth(entry.startYearMonth),
        content: `${entry.schoolName}　入学`,
      });
      if (entry.endYearMonth) {
        rows.push({
          ...splitYearMonth(entry.endYearMonth),
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
        ...splitYearMonth(entry.startYearMonth),
        content: `${entry.companyName}　入社${employmentSuffix}`,
      });
      if (entry.endYearMonth) {
        rows.push({
          ...splitYearMonth(entry.endYearMonth),
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
  const todayMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(todayIso);
  const todayLabel = todayMatch
    ? `${todayMatch[1]}年${Number(todayMatch[2])}月${Number(todayMatch[3])}日現在`
    : '';

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
                {data.birthDate && formatBirthDate(data.birthDate)}
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
                <Text style={[styles.tableHeaderCell, {width: 55}]}>年</Text>
                <Text style={[styles.tableHeaderCell, {width: 40}]}>月</Text>
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
  const todayIso = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
  }).format(new Date());
  return renderToBuffer(<ResumeDocument data={data} todayIso={todayIso} />);
}
