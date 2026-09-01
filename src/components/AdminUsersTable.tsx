import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import {
  PROFILE_STATE_LABEL,
  ProfileState,
  ROLE_LABEL,
  type AdminUser,
} from '@/types/User';

// Read-only console, so this stays a Server Component: filtering and sorting are
// plain links handled by the page, and nothing here needs the client bundle.

const PROFILE_STATE_STYLE: Record<ProfileState, {bg: string; color: string}> = {
  NONE: {bg: '#F5F5F5', color: '#757575'},
  DRAFT: {bg: '#FFF8E1', color: '#F9A825'},
  PUBLISHED: {bg: '#E8F5E9', color: '#2E7D32'},
};

// Dates carry the year: unlike a chat timestamp, "last signed in" is only
// meaningful when a stale account is visibly stale.
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('ja-JP');

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

function ProfileStateChip({state}: {state: ProfileState}) {
  return (
    <Chip
      label={PROFILE_STATE_LABEL[state]}
      size="small"
      sx={{
        bgcolor: PROFILE_STATE_STYLE[state].bg,
        color: PROFILE_STATE_STYLE[state].color,
        fontSize: '0.7rem',
      }}
    />
  );
}

// A table cell always needs something in it, but a card must not carry a row of
// dashes — so the two summaries below take `dense` for the card, which drops
// them entirely when there is nothing to report.
const hasDocuments = (user: AdminUser) => {
  const {approved, pending, rejected} = user.documentCounts;
  return approved + pending + rejected > 0;
};

// Documents are a seeker-only concept, and the count that matters to an operator
// is what is waiting on them — so pending leads and is the only part colored.
function DocumentSummary({user}: {user: AdminUser}) {
  const {approved, pending, rejected} = user.documentCounts;
  if (!hasDocuments(user)) {
    return (
      <Typography variant="caption" color="text.secondary">
        —
      </Typography>
    );
  }
  return (
    <Box sx={{display: 'flex', gap: 0.75, flexWrap: 'wrap'}}>
      {pending > 0 && (
        <Typography variant="caption" sx={{color: '#F9A825', fontWeight: 700}}>
          確認待ち{pending}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary">
        認証済{approved}
      </Typography>
      {rejected > 0 && (
        <Typography variant="caption" sx={{color: '#C62828'}}>
          差し戻し{rejected}
        </Typography>
      )}
    </Box>
  );
}

function EngagementSummary({user}: {user: AdminUser}) {
  if (user.engagementCount === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        —
      </Typography>
    );
  }
  return (
    <>
      <Typography variant="caption" sx={{display: 'block'}}>
        マッチ{user.engagementCount} / 完了{user.completedCount}
      </Typography>
      {user.lastWorkDate && (
        <Typography variant="caption" color="text.secondary">
          最終勤務 {formatDate(user.lastWorkDate)}
        </Typography>
      )}
    </>
  );
}

function LastSignIn({value}: {value: string | null}) {
  if (!value) {
    // Distinguishable from "signed in long ago": the field only started
    // recording recently, so a blank is missing data, not inactivity.
    return (
      <Typography variant="caption" color="text.secondary">
        記録なし
      </Typography>
    );
  }
  return <Typography variant="caption">{formatDateTime(value)}</Typography>;
}

function AccountCell({user}: {user: AdminUser}) {
  return (
    <>
      <Typography variant="body2" sx={{fontWeight: 600}}>
        {user.name ?? '（プロフィール未作成）'}
      </Typography>
      {user.realName && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{display: 'block'}}
        >
          {user.realName}
        </Typography>
      )}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{display: 'block', wordBreak: 'break-all'}}
      >
        {user.email}
      </Typography>
    </>
  );
}

export default function AdminUsersTable({users}: {users: AdminUser[]}) {
  return (
    <>
      {/* Mobile: cards */}
      <Box
        sx={{
          display: {xs: 'flex', md: 'none'},
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {users.map((user) => (
          <Box
            key={user.id}
            sx={{
              p: 2,
              bgcolor: '#FAFAFA',
              borderRadius: 2,
              border: '1px solid #E0E0E0',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 1,
                mb: 1,
              }}
            >
              <Box sx={{minWidth: 0}}>
                <AccountCell user={user} />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 0.5,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {ROLE_LABEL[user.role]}
                </Typography>
                <ProfileStateChip state={user.profileState} />
              </Box>
            </Box>
            {hasDocuments(user) && (
              <Box sx={{mb: 0.5}}>
                <DocumentSummary user={user} />
              </Box>
            )}
            {user.engagementCount > 0 && (
              <Box sx={{mb: 0.5}}>
                <EngagementSummary user={user} />
              </Box>
            )}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{display: 'block'}}
            >
              登録 {formatDate(user.createdAt)} / LINE
              {user.lineLinked ? '連携済' : '未連携'} /{' '}
              {user.agreedAt ? '規約同意済' : '規約未同意'}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{display: 'block'}}
            >
              最終サインイン <LastSignIn value={user.lastSignInAt} />
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Desktop: table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          display: {xs: 'none', md: 'block'},
          border: '1px solid #E0E0E0',
          borderRadius: 2,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{bgcolor: '#F9F9F9'}}>
              <TableCell>アカウント</TableCell>
              <TableCell>ロール</TableCell>
              <TableCell>プロフィール</TableCell>
              <TableCell>書類</TableCell>
              <TableCell>実績</TableCell>
              <TableCell>LINE</TableCell>
              <TableCell>登録日</TableCell>
              <TableCell>最終サインイン</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell sx={{minWidth: 200}}>
                  <AccountCell user={user} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {ROLE_LABEL[user.role]}
                  </Typography>
                </TableCell>
                <TableCell>
                  <ProfileStateChip state={user.profileState} />
                </TableCell>
                <TableCell sx={{minWidth: 140}}>
                  <DocumentSummary user={user} />
                </TableCell>
                <TableCell sx={{minWidth: 140}}>
                  <EngagementSummary user={user} />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {user.lineLinked ? '連携済' : '未連携'}
                  </Typography>
                </TableCell>
                <TableCell sx={{minWidth: 110}}>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(user.createdAt)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{display: 'block'}}
                  >
                    {user.agreedAt
                      ? `規約同意 ${formatDate(user.agreedAt)}`
                      : '規約未同意'}
                  </Typography>
                </TableCell>
                <TableCell sx={{minWidth: 150}}>
                  <LastSignIn value={user.lastSignInAt} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
