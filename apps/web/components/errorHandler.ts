export function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
}
