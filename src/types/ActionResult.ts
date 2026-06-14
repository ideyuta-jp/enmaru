// Result of a form-submitting Server Action. Validation failures return
// {ok: false} with a user-facing message rather than throwing: Next redacts
// thrown Server Action error messages in production, so a thrown message never
// reaches the client there. Throwing is reserved for unexpected errors, which
// the caller surfaces generically.
export type ActionResult = {ok: true} | {ok: false; message: string};
