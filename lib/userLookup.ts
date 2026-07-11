/** Resolve a user document by Mongo _id or Supabase auth id. */
export function userLookupQuery(id: string): { _id: string } | { supabaseId: string } {
  if (/^[0-9a-fA-F]{24}$/.test(id)) return { _id: id };
  return { supabaseId: id };
}
