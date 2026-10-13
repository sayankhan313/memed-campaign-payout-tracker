
import Link from 'next/link';
import { ArrowUpRight, ChartColumnIncreasing } from 'lucide-react';
import { formatINR, type BrandCampaign } from '@/lib/brand';

type Props = {
  campaigns: BrandCampaign[];
  showAnalyticsLink?: boolean;
  title?: string;
  subtitle?: string;
};

function getAxisStep(maximum: number): number {
  if (maximum <= 0) return 1;
  const approximate = maximum / 4;
  const magnitude = 10 ** Math.floor(Math.log10(approximate));
  const normalized = approximate / magnitude;
  const multiplier = [1, 2, 2.5, 5, 10].find(value => value >= normalized) ?? 10;
  return multiplier * magnitude;
}

function formatAxisValue(value: number): string {
  if (value === 0) return '₹0';
  if (value >= 10000000) return `₹${Number((value / 10000000).toFixed(1))}Cr`;
  if (value >= 100000) return `₹${Number((value / 100000).toFixed(1))}L`;
  if (value >= 1000) return `₹${Number((value / 1000).toFixed(1))}K`;
  return `₹${value}`;
}

function truncateLabel(value: string): string {
  return value.length > 19 ? `${value.slice(0, 17)}…` : value;
}

export default function CampaignPerformanceChart({ campaigns, showAnalyticsLink = true, title = 'Campaign Performance', subtitle = 'Compare allocated budgets and creator rewards across campaigns.' }: Props) {
  const visible = [...campaigns]
    .sort((a, b) => b.totalBudget - a.totalBudget)
    .slice(0, 6);

  const maxBudget = Math.max(0, ...visible.map(campaign => Math.max(campaign.totalBudget, campaign.budgetSpent)));
  const axisStep = getAxisStep(maxBudget);
  const axisMaximum = axisStep * 4;

  const width = Math.max(720, visible.length * 170 + 110);
  const height = 360;
  const left = 75;
  const right = 24;
  const top = 38;
  const bottom = 81;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const groupWidth = plotWidth / Math.max(visible.length, 1);
  const barWidth = Math.min(38, groupWidth * 0.27);
  const barGap = 7;
  const baseline = top + plotHeight;

  return (
    <article className="min-w-0 overflow-hidden rounded-[24px] border border-[#EAE5E0] bg-white shadow-[0_8px_35px_rgba(35,26,50,0.025)]">
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 pb-5 pt-7 sm:px-7">
        <div>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F1EBFE] text-[#8257D2]">
            <ChartColumnIncreasing size={22} />
          </div>
          <h2 className="text-xl font-black tracking-tight text-[#252133]">{title}</h2>
          <p className="mt-2 text-xs text-[#938B9C]">
            {subtitle}
          </p>
        </div>

        {showAnalyticsLink && (
          <Link href="/brand/analytics" className="inline-flex items-center gap-2 rounded-xl border border-[#E9E3F0] bg-[#FAF7FF] px-4 py-2.5 text-xs font-bold text-[#8157D6] hover:border-[#C3ADEC]">
            Full Analytics <ArrowUpRight size={15} />
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 px-6 pb-2 pt-4 sm:px-7">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-[4px] bg-[#A88BFA]" />
            <span className="text-xs font-medium text-[#807789]">Budget Allocated</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-[4px] bg-[#292239]" />
            <span className="text-xs font-medium text-[#807789]">Paid Out</span>
          </div>
        </div>
        <span className="rounded-lg bg-[#F7F5F9] px-3 py-1.5 text-[11px] font-bold text-[#92899B]">INR</span>
      </div>

      {visible.length === 0 ? (
        <div className="flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
          <ChartColumnIncreasing size={34} className="text-[#B8A2EB]" />
          <h3 className="mt-4 text-sm font-black">No campaign performance yet</h3>
          <p className="mt-2 text-xs text-[#918A99]">Create your first campaign to see the chart.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto px-3 pb-3 pt-3 sm:px-5">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height={height}
            style={{ minWidth: `${width}px` }}
            role="img"
            aria-label="Vertical grouped bar chart comparing allocated budgets and paid-out rewards for each campaign"
          >
            {Array.from({ length: 5 }, (_, index) => {
              const value = index * axisStep;
              const y = baseline - (value / axisMaximum) * plotHeight;

              return (
                <g key={`axis-${index}`}>
                  <line
                    x1={left}
                    x2={width - right}
                    y1={y}
                    y2={y}
                    stroke="#E9E4ED"
                    strokeWidth="1"
                    strokeDasharray={index === 0 ? '0' : '4 5'}
                  />
                  <text
                    x={left - 17}
                    y={y + 4}
                    fontSize="12"
                    fill="#938B9D"
                    textAnchor="end"
                  >
                    {formatAxisValue(value)}
                  </text>
                </g>
              );
            })}

            {visible.map((campaign, index) => {
              const center = left + groupWidth * (index + 0.5);
              const allocatedHeight = campaign.totalBudget / axisMaximum * plotHeight;
              const paidHeight = campaign.budgetSpent / axisMaximum * plotHeight;

              const allocatedX = center - barWidth - barGap / 2;
              const paidX = center + barGap / 2;

              return (
                <g key={campaign.id}>
                  <rect
                    x={allocatedX}
                    y={baseline - allocatedHeight}
                    width={barWidth}
                    height={allocatedHeight}
                    rx={5}
                    fill="#A88BFA"
                  >
                    <title>{`${campaign.name} — Allocated: ${formatINR(campaign.totalBudget)}`}</title>
                  </rect>

                  {paidHeight > 0 && (
                    <rect
                      x={paidX}
                      y={baseline - paidHeight}
                      width={barWidth}
                      height={paidHeight}
                      rx={5}
                      fill="#292239"
                    >
                      <title>{`${campaign.name} — Paid Out: ${formatINR(campaign.budgetSpent)}`}</title>
                    </rect>
                  )}

                  <text
                    x={center}
                    y={baseline + 24}
                    fontSize="12"
                    fontWeight="600"
                    fill="#6C6378"
                    textAnchor="middle"
                  >
                    <title>{campaign.name}</title>
                    {truncateLabel(campaign.name)}
                  </text>

                  <text
                    x={center}
                    y={baseline + 44}
                    fontSize="10.5"
                    fill="#A29AA9"
                    textAnchor="middle"
                  >
                    {campaign.platform === 'instagram' ? 'Instagram' : 'YouTube'}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F0ECF0] bg-[#FCFBFD] px-7 py-4">
        <span className="text-[11px] text-[#9B94A3]">
          Showing {visible.length} of {campaigns.length} campaigns
        </span>
        <span className="text-[11px] font-semibold text-[#8C8299]">
          Actual budget and payout amounts
        </span>
      </div>
    </article>
  );
}
