import { join } from "path";

export const base_path = (path: string) => join(import.meta.dir, path);

export const cache_path = (path: string) => join(base_path(".cache"), path);
