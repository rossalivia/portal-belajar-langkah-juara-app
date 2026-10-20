import React from "react";
import Link from "next/link";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  trend,
  href,
  onClick,
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border border-amber-100",
    purple: "bg-purple-50 text-purple-600 border border-purple-100",
    rose: "bg-rose-50 text-rose-600 border border-rose-100",
    sky: "bg-sky-50 text-sky-600 border border-sky-100",
  };

  const badgeStyle = colorMap[color] || colorMap.blue;

  const content = (
    <div
      onClick={onClick}
      className={`group bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${
        href || onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors">
          {title}
        </span>
        {Icon && (
          <div className={`p-3 rounded-2xl ${badgeStyle} group-hover:scale-105 transition-transform duration-300 shadow-xs`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2.5">
        <span className="text-3xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
          {value ?? 0}
        </span>
        {trend && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-500 font-normal leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
