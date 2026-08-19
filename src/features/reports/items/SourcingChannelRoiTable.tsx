import React from "react";
import { DollarSign, Award, Star, ArrowUpRight, Check } from "lucide-react";
import type { SourcingChannel } from "../types/reports.types";

interface SourcingChannelRoiTableProps {
  channels: SourcingChannel[];
}

export const SourcingChannelRoiTable: React.FC<SourcingChannelRoiTableProps> = ({ channels }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-600 dark:text-emerald-400" />
            Sourcing Channel Efficiency & ROI Analysis
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare candidate volume, conversion yield rates, and cost per hire across channels.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4 rounded-l-lg">Channel Name</th>
              <th className="py-3 px-4">Applicants</th>
              <th className="py-3 px-4">Hires Made</th>
              <th className="py-3 px-4">Yield Rate</th>
              <th className="py-3 px-4">Avg Cost / Hire</th>
              <th className="py-3 px-4">Time to Hire</th>
              <th className="py-3 px-4 rounded-r-lg">Channel Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {channels.map((channel) => {
              const isTopYield = channel.yieldRate >= 10;

              return (
                <tr
                  key={channel.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {channel.channelName}
                    {isTopYield && (
                      <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-0.5">
                        <Award size={10} /> Top ROI
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {channel.applicantsCount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                    {channel.hiredCount}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <span>{channel.yieldRate}%</span>
                      <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 dark:bg-blue-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, channel.yieldRate * 7)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    ${channel.avgCostPerHire.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    {channel.avgTimeDays} days
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <span>{channel.rating.toFixed(1)}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
