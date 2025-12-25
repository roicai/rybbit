import { FastifyReply, FastifyRequest } from "fastify";
import { clickhouse } from "../../db/clickhouse/clickhouse.js";
import { FilterParams } from "@rybbit/shared";
import { getTimeStatement, processResults } from "./utils/utils.js";
import { getFilterStatement } from "./utils/getFilterStatement.js";

interface GetPageviewCountsRequest {
  Params: {
    site: string;
  };
  Querystring: FilterParams<{
    prefix: string;
    depth?: string;
  }>;
}

type PageviewCountResult = {
  pathname: string;
  count: number;
};

/**
 * Build regex pattern for prefix + depth matching
 * prefix=/news, depth=1 → ^/news/[^/]+$
 * prefix=/news, depth=2 → ^/news/[^/]+/[^/]+$
 * prefix=/news, no depth → ^/news
 */
function buildRegex(prefix: string, depth: number | null): string {
  // Escape special regex characters in prefix
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Ensure prefix ends without trailing slash for consistent pattern building
  const normalizedPrefix = escapedPrefix.replace(/\/$/, "");

  if (depth === null) {
    // No depth limit - just match prefix
    return `^${normalizedPrefix}`;
  }

  // Build pattern: prefix + (depth number of /[^/]+) + end
  const segments = Array(depth).fill("/[^/]+").join("");
  return `^${normalizedPrefix}${segments}$`;
}

export async function getPageviewCounts(
  req: FastifyRequest<GetPageviewCountsRequest>,
  res: FastifyReply
) {
  const { site } = req.params;
  const { prefix, depth: depthParam, filters, start_date, end_date } = req.query;

  if (!prefix) {
    return res.status(400).send({ error: "prefix parameter is required" });
  }

  const depth = depthParam ? parseInt(depthParam, 10) : null;
  if (depthParam && (isNaN(depth!) || depth! < 1)) {
    return res.status(400).send({ error: "depth must be a positive integer" });
  }

  const timeStatement = getTimeStatement(req.query);
  const filterStatement = filters
    ? getFilterStatement(filters, Number(site), timeStatement)
    : "";

  const regex = buildRegex(prefix, depth);

  // Auto-enable pathname date filter for /news prefix
  const isNewsPrefix = prefix.startsWith("/news");
  const pathnameDateFilter =
    isNewsPrefix && start_date && end_date
      ? `AND match(pathname, '.*-\\d{2}-\\d{2}-\\d{4}$')
         AND toDate(replaceRegexpOne(pathname, '.*-(\\d{2})-(\\d{2})-(\\d{4})$', '\\3-\\1-\\2'))
         BETWEEN {startDate:Date} AND {endDate:Date}`
      : "";

  try {
    const query = `
      SELECT
        pathname,
        COUNT(*) as count
      FROM events
      WHERE
        site_id = {siteId:Int32}
        AND type = 'pageview'
        AND match(pathname, {regex:String})
        ${pathnameDateFilter}
        ${timeStatement}
        ${filterStatement}
      GROUP BY pathname
      ORDER BY count DESC
    `;

    const queryParams: Record<string, unknown> = {
      siteId: Number(site),
      regex,
    };

    if (isNewsPrefix && start_date && end_date) {
      queryParams.startDate = start_date;
      queryParams.endDate = end_date;
    }

    const result = await clickhouse.query({
      query,
      format: "JSONEachRow",
      query_params: queryParams,
    });

    const rows = await processResults<PageviewCountResult>(result);

    // Transform array to object { pathname: count }
    const data: Record<string, number> = {};
    for (const row of rows) {
      data[row.pathname] = row.count;
    }

    return res.send({ data });
  } catch (error) {
    console.error("Error fetching pageview counts:", error);
    return res.status(500).send({ error: "Failed to fetch pageview counts" });
  }
}
