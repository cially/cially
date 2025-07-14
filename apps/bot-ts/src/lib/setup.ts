// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= "development";

import {
  ApplicationCommandRegistries,
  RegisterBehavior,
} from "@sapphire/framework";
import "@sapphire/plugin-api/register";
import "@sapphire/plugin-editable-commands/register";
import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-subcommands/register";
import { join } from "node:path";
import { inspect } from "node:util";
import { type ArrayString, setup } from "@skyra/env-utilities";
import * as colorette from "colorette";
import { srcDir } from "./constants";

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite,
);

// Read env var
setup({ path: join(srcDir, ".env") });

// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Enable colorette
colorette.createColors({ useColor: true });

declare module "@skyra/env-utilities" {
  interface Env {
    OWNERS: ArrayString;
  }
}
