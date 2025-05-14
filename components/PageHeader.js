"use client";

export default function PageHeader({ title, subtitle }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-800">{title}</h1>
        {subtitle && <p className="text-dark-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
