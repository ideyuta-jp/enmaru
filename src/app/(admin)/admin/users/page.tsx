import type {Metadata} from 'next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import AdminUsersTable from '@/components/AdminUsersTable';
import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import SessionHeader from '@/components/SessionHeader';
import {ADMIN_USER_LIST_LIMIT, listAllUsers} from '@/server/user';
import {
  ADMIN_USER_FILTER_LABEL,
  ADMIN_USER_SORT_LABEL,
  AdminUserFilter,
  AdminUserSort,
} from '@/types/User';

export const metadata: Metadata = {
  title: 'ユーザー管理',
};

const FILTERS: {label: string; filter?: AdminUserFilter}[] = [
  {label: 'すべて', filter: undefined},
  {
    label: ADMIN_USER_FILTER_LABEL.SEEKER,
    filter: AdminUserFilter.SEEKER,
  },
  {
    label: ADMIN_USER_FILTER_LABEL.NURSERY,
    filter: AdminUserFilter.NURSERY,
  },
  {label: ADMIN_USER_FILTER_LABEL.ADMIN, filter: AdminUserFilter.ADMIN},
  {
    label: ADMIN_USER_FILTER_LABEL.DOCUMENT_PENDING,
    filter: AdminUserFilter.DOCUMENT_PENDING,
  },
  {
    label: ADMIN_USER_FILTER_LABEL.DORMANT,
    filter: AdminUserFilter.DORMANT,
  },
];

const SORTS: AdminUserSort[] = [
  AdminUserSort.REGISTERED,
  AdminUserSort.LAST_SIGN_IN,
];

// The query string is user input: anything that is not a known value falls back
// to the default rather than reaching the query. Validated against the type's
// own value set, not the display list above, so the two cannot drift.
function isAdminUserFilter(value: string): value is AdminUserFilter {
  return (Object.values(AdminUserFilter) as string[]).includes(value);
}

function parseFilter(value: string | undefined): AdminUserFilter | undefined {
  return value !== undefined && isAdminUserFilter(value) ? value : undefined;
}

function parseSort(value: string | undefined): AdminUserSort {
  return value === AdminUserSort.LAST_SIGN_IN
    ? AdminUserSort.LAST_SIGN_IN
    : AdminUserSort.REGISTERED;
}

// Preserve the other knob when one of them changes.
function hrefFor(filter: AdminUserFilter | undefined, sort: AdminUserSort) {
  const params = new URLSearchParams();
  if (filter) params.set('filter', filter);
  if (sort !== AdminUserSort.REGISTERED) params.set('sort', sort);
  const query = params.toString();
  return query ? `/admin/users?${query}` : '/admin/users';
}

interface Props {
  searchParams: Promise<{filter?: string; sort?: string}>;
}

export default async function AdminUsersPage({searchParams}: Props) {
  const params = await searchParams;
  const filter = parseFilter(params.filter);
  const sort = parseSort(params.sort);
  const users = await listAllUsers({filter, sort});

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="lg">
        <SectionHeading subtitle={`${users.length}件`}>
          ユーザー管理
        </SectionHeading>

        <Box sx={{display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap'}}>
          {FILTERS.map((f) => (
            <Button
              key={f.label}
              href={hrefFor(f.filter, sort)}
              size="small"
              variant={filter === f.filter ? 'contained' : 'outlined'}
              sx={{fontSize: '0.75rem'}}
            >
              {f.label}
            </Button>
          ))}
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            並び順
          </Typography>
          {SORTS.map((s) => (
            <Button
              key={s}
              href={hrefFor(filter, s)}
              size="small"
              variant={sort === s ? 'contained' : 'outlined'}
              sx={{fontSize: '0.75rem'}}
            >
              {ADMIN_USER_SORT_LABEL[s]}
            </Button>
          ))}
        </Box>

        {users.length === 0 ? (
          <Box sx={{textAlign: 'center', py: 6}}>
            <Typography color="text.secondary">
              該当するユーザーはいません
            </Typography>
          </Box>
        ) : (
          <AdminUsersTable users={users} />
        )}

        {users.length === ADMIN_USER_LIST_LIMIT && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{display: 'block', mt: 2}}
          >
            最新{ADMIN_USER_LIST_LIMIT}件のみ表示しています。
          </Typography>
        )}
      </PageContainer>
      <Footer />
    </>
  );
}
