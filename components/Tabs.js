"use client";

import { useState } from "react";

export default function Tabs({ tabs, defaultTab, onChange }) {
  const [activeTab, setActiveTab] = useState(
    defaultTab || (tabs[0] && tabs[0].id)
  );

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (onChange) onChange(tabId);
  };

  return (
    <div className="mb-6">
      <div className="border-b border-dark-100">
        <div className="flex flex-wrap -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`inline-block py-3 px-4 text-sm font-medium ${
                activeTab === tab.id
                  ? "border-b-2 border-primary-500 text-primary-600"
                  : "border-b-2 border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300"
              }`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
