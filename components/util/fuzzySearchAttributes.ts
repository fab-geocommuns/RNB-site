import Fuse from 'fuse.js';
import { DiffusionDatabase } from '../diffusionDatabase.type';

type Attribute = {
  name: string;
  description: string;
};

export type HighlightToken = {
  token: string;
  isHighlighted: boolean;
};

export type FuzzySearchAttributeResult = Attribute & {
  descriptionTokens?: HighlightToken[];
  nameTokens?: HighlightToken[];
};

type FuzzySearchDiffusionDatabaseResult = DiffusionDatabase & {
  attributes: FuzzySearchAttributeResult[];
};

/*
 * Merges overlapping or contiguous intervals.
 */
function mergeIntervals(intervals: [number, number][]): [number, number][] {
  if (!intervals.length) return intervals;
  intervals.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    const current = intervals[i];
    if (current[0] <= last[1] + 1) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }
  return merged;
}

/*
 * Splits the given text into tokens based on the provided indices.
 * Each token is marked as highlighted if it comes from a match.
 * Translates the output from Fuse.js to our more straightforward HighlightToken type.
 */
function getHighlightedTokens(
  text: string,
  indices: [number, number][],
): HighlightToken[] {
  const merged = mergeIntervals(indices);
  const tokens: HighlightToken[] = [];
  let lastIndex = 0;
  for (const [start, end] of merged) {
    // Add non-highlighted token before the match (if any)
    if (start > lastIndex) {
      tokens.push({
        token: text.slice(lastIndex, start),
        isHighlighted: false,
      });
    }
    // Add highlighted token (note: fuse indices are inclusive)
    tokens.push({
      token: text.slice(start, end + 1),
      isHighlighted: true,
    });
    lastIndex = end + 1;
  }
  // Add any remaining non-highlighted text
  if (lastIndex < text.length) {
    tokens.push({
      token: text.slice(lastIndex),
      isHighlighted: false,
    });
  }
  return tokens;
}

export function fuzzySearchAttributes(
  collection: DiffusionDatabase[],
  query: string,
  options: { max: number },
): FuzzySearchDiffusionDatabaseResult[] {
  // If the query is empty, simply return the original collection with tokens that are not highlighted.
  if (!query.trim()) {
    return collection.map((db) => ({
      ...db,
      attributes: db.attributes.map((attr) => ({
        ...attr,
        descriptionTokens: [{ token: attr.description, isHighlighted: false }],
        nameTokens: [{ token: attr.name, isHighlighted: false }],
      })),
    }));
  }

  const result: FuzzySearchDiffusionDatabaseResult[] = [];

  for (const dbItem of collection) {
    const fuse = new Fuse(dbItem.attributes, {
      keys: [
        { name: 'name', weight: 0.7 }, // Have name precedence over description
        { name: 'description', weight: 0.3 },
      ],
      includeMatches: true,
      threshold: 0.3, // Default is 0.6, lower is stricter
      minMatchCharLength: 3, // Avoids displaying weird 1-2 character matches
    });
    const fuseResults = fuse.search(query);

    const filteredAttributes: FuzzySearchAttributeResult[] = [];

    for (const fuseResult of fuseResults) {
      const attr = fuseResult.item;

      let descriptionTokens = [
        { token: attr.description, isHighlighted: false },
      ];

      let nameTokens = [{ token: attr.name, isHighlighted: false }];

      if (fuseResult.matches) {
        const descMatch = fuseResult.matches.find(
          (m) => m.key === 'description',
        );
        if (descMatch && descMatch.indices) {
          descriptionTokens = getHighlightedTokens(
            attr.description,
            descMatch.indices as [number, number][],
          );
        }

        const nameMatch = fuseResult.matches.find((m) => m.key === 'name');
        if (nameMatch && nameMatch.indices) {
          nameTokens = getHighlightedTokens(
            attr.name,
            nameMatch.indices as [number, number][],
          );
        }
      }
      filteredAttributes.push({
        ...attr,
        descriptionTokens,
        nameTokens,
      });
    }

    if (filteredAttributes.length > 0) {
      result.push({
        ...dbItem,
        attributes: filteredAttributes.slice(0, options.max),
      });
    }
  }
  return result;
}
