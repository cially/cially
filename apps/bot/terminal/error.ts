import "colors";

export function error({ text }: { text: string }): void {
  console.log(`${"\n[ERROR] ".red}${text}`);
}
