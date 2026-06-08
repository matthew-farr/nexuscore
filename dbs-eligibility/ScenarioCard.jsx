import { AlertCircle, Users, ChevronRight } from 'lucide-react';
import { CHECK_LEVEL_COLOURS, BARRED_LIST_COLOURS } from './dbsEligibilityConfig';

export default function ScenarioCard({ scenario, onClick }) {
  const checkColour = CHECK_LEVEL_COLOURS[scenario.likely_check_level] || "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-400/10 border-gray-300 dark:border-gray-400/30";

  return (
    <button
      onClick={() => onClick(scenario)}
      className="w-full text-left rounded-xl p-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg cursor-pointer group bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] hover:border-pink-300 dark:hover:border-pink-500/40 hover:bg-gray-50 dark:hover:bg-white/[0.07] shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
              {scenario.role_title}
            </h3>
            {scenario.escalation_required && (
              <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-500/15 border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 font-medium">
                <AlertCircle className="w-3 h-3" /> Escalate
              </span>
            )}
          </div>

          {/* Sector */}
          {scenario.sector && (
            <p className="text-xs mb-2.5 text-gray-500 dark:text-white/40 font-medium uppercase tracking-wide">
              {scenario.sector}
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-2">
            {scenario.likely_check_level && (
              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${checkColour}`}>
                {scenario.likely_check_level}
              </span>
            )}
            {scenario.workforce && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/50 bg-gray-50 dark:bg-white/[0.03]">
                <Users className="w-3 h-3" />
                {scenario.workforce}
              </span>
            )}
          </div>

          {/* Barred list indicators */}
          {(scenario.children_barred_list || scenario.adults_barred_list) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {scenario.children_barred_list && scenario.children_barred_list !== 'Not Usually Required' && (
                <span className={`text-xs font-medium ${BARRED_LIST_COLOURS[scenario.children_barred_list]}`}>
                  Children's Barred List: {scenario.children_barred_list}
                </span>
              )}
              {scenario.adults_barred_list && scenario.adults_barred_list !== 'Not Usually Required' && (
                <span className={`text-xs font-medium ${BARRED_LIST_COLOURS[scenario.adults_barred_list]}`}>
                  Adults' Barred List: {scenario.adults_barred_list}
                </span>
              )}
            </div>
          )}
        </div>

        <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1 text-gray-400 dark:text-white/40 group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors" />
      </div>
    </button>
  );
}