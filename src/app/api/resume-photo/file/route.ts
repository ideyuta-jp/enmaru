import {getAccessibleResumePhotoFile} from '@/server/resume';

// Streams the signed-in seeker's own 証明写真 from R2, for ResumeForm's live
// preview while editing. No :id — there is exactly one résumé photo per
// seeker, and authorization (owner-only; admin reviews the generated PDF
// instead, see getAccessibleResumePhotoFile) resolves it from the session.
// Anything not accessible — not signed in, no profile, or no photo — is a
// 404 so the endpoint discloses nothing.
export async function GET() {
  const file = await getAccessibleResumePhotoFile();
  if (!file) {
    return new Response('Not found', {status: 404});
  }

  return new Response(file.body, {
    headers: {
      'Content-Type': file.contentType,
      'Content-Disposition': 'inline',
      // The content type is the uploader-supplied value and the bytes aren't
      // content-validated, so prevent MIME sniffing of a spoofed file.
      'X-Content-Type-Options': 'nosniff',
      // PII (personal-information boundary, docs/requirements.md) — never a
      // shared cache, and never stale after a replace/delete.
      'Cache-Control': 'private, no-store',
    },
  });
}
