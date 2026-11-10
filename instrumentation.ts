export async function onRequestError(
  error: unknown,
  request: Readonly<{ path: string; method: string; headers: NodeJS.Dict<string | string[]> }>,
) {
  const { logError } = await import("@/lib/errors");
  await logError(error, request.path);
}
