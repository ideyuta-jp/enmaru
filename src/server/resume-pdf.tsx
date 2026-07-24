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
import {formatYearMonth} from '@/utils/date';

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

const styles = StyleSheet.create({
  page: {fontFamily: 'Noto Sans JP', padding: 36, fontSize: 10},
  title: {fontSize: 18, fontWeight: 'bold', marginBottom: 16},
  sectionHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 6,
  },
  line: {marginBottom: 2},
  historyRow: {marginBottom: 4},
});

// 'YYYY-MM-DD' -> '1995年4月1日'. Returns '' for an empty/malformed input.
function formatBirthDate(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return '';
  return `${match[1]}年${Number(match[2])}月${Number(match[3])}日`;
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

function ResumeDocument({data}: {data: ResumePdfData}) {
  const address = [data.prefecture, data.city, data.addressLine]
    .filter(Boolean)
    .join('');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>履歴書</Text>

        <Text style={styles.line}>氏名：{data.realName}</Text>
        {data.birthDate && (
          <Text style={styles.line}>
            生年月日：{formatBirthDate(data.birthDate)}
          </Text>
        )}
        {(data.postalCode || address) && (
          <Text style={styles.line}>
            住所：
            {data.postalCode && `〒${data.postalCode} `}
            {address}
          </Text>
        )}
        {data.phone && <Text style={styles.line}>電話番号：{data.phone}</Text>}

        {data.education.length > 0 && (
          <View>
            <Text style={styles.sectionHeading}>学歴</Text>
            {data.education.map((entry) => (
              <View key={entry._key} style={styles.historyRow}>
                <Text>
                  {formatYearMonth(entry.startYearMonth)}　{entry.schoolName}
                  　入学
                </Text>
                {entry.endYearMonth && (
                  <Text>
                    {formatYearMonth(entry.endYearMonth)}　{entry.schoolName}　
                    {entry.graduationStatus || '卒業'}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {data.workHistory.length > 0 && (
          <View>
            <Text style={styles.sectionHeading}>職歴</Text>
            {data.workHistory.map((entry) => (
              <View key={entry._key} style={styles.historyRow}>
                <Text>
                  {formatYearMonth(entry.startYearMonth)}　{entry.companyName}
                  　入社
                  {entry.employmentType && `（${entry.employmentType}）`}
                </Text>
                {entry.endYearMonth ? (
                  <Text>
                    {formatYearMonth(entry.endYearMonth)}　{entry.companyName}
                    　退社
                  </Text>
                ) : (
                  <Text>現在に至る</Text>
                )}
                {entry.description && <Text>{entry.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {data.licenses.length > 0 && (
          <View>
            <Text style={styles.sectionHeading}>免許・資格</Text>
            {data.licenses.map((license) => (
              <Text key={license} style={styles.line}>
                {license}
              </Text>
            ))}
          </View>
        )}

        {data.bio && (
          <View>
            <Text style={styles.sectionHeading}>自己PR</Text>
            <Text>{data.bio}</Text>
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
  return renderToBuffer(<ResumeDocument data={data} />);
}
