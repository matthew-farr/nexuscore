import { X, AlertCircle, Users, Shield, HelpCircle, BookOpen, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import DisclaimerBanner from './DisclaimerBanner';
import {
  CHECK_LEVEL_COLOURS, BARRED_LIST_COLOURS,
  FREQUENCY_TEST_TEXT, ADULT_BARRED_LIST_CRITERIA, DEFAULT_KEY_QUESTIONS
} from './dbsEligibilityConfig';

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-xl p-4 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07]">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-4 h-4 text-pink-500 dark:text-pink-400" />}
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white/90">{title}</h4>
      </div>
      {children}
    </div>
  );
}

export default function ScenarioDrawer({ scenario, onClose }) {
  if (!scenario) return null;

  const checkColour = CHECK_LEVEL_COLOURS[scenario.likely_check_level] || "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-400/10 border-gray-300 dark:border-gray-400/30";
  const involvesChildren = scenario.workforce === 'Child Workforce' || scenario.workforce === 'Child and Adult Workforce';
  const involvesAdults = scenario.workforce === 'Adult Workforce' || scenario.workforce === 'Child and Adult Workforce';

  const keyQuestions = scenario.key_questions
    ? scenario.key_questions.split('\n').filter(Boolean)
    : DEFAULT_KEY_QUESTIONS;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-full md:w-[580px] z-50 flex flex-col shadow-2xl overflow-hidden bg-white dark:bg-[rgba(8,10,28,0.98)] border-l border-gray-200 dark:border-white/10"
      style={{ backdropFilter: 'blur(40px)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-5 gap-3 flex-shrink-0 border-b border-gray-200 dark:border-white/[0.08]">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold mb-1 text-gray-400 dark:text-white/35 uppercase tracking-wide">{scenario.sector}</p>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{scenario.role_title}</h2>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex-shrink-0 text-gray-500 dark:text-white/50">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <DisclaimerBanner compact />

        {/* Likely Outcome */}
        <Section title="Likely Outcome" icon={Shield}>
          <div className="space-y-3">
            <div>
              <span className="text-xs block mb-1 text-gray-500 dark:text-white/55">Check Level</span>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full border inline-block ${checkColour}`}>
                {scenario.likely_check_level || 'Not specified'}
              </span>
            </div>
            {scenario.workforce && (
              <div>
                <span className="text-xs block mb-1 text-gray-500 dark:text-white/55">Workforce</span>
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-800 dark:text-white">
                  <Users className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                  {scenario.workforce}
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {scenario.children_barred_list && (
                <div>
                  <span className="text-xs block mb-1 text-gray-500 dark:text-white/55">Children's Barred List</span>
                  <span className={`text-sm font-medium ${BARRED_LIST_COLOURS[scenario.children_barred_list] || ''}`}>
                    {scenario.children_barred_list}
                  </span>
                </div>
              )}
              {scenario.adults_barred_list && (
                <div>
                  <span className="text-xs block mb-1 text-gray-500 dark:text-white/55">Adults' Barred List</span>
                  <span className={`text-sm font-medium ${BARRED_LIST_COLOURS[scenario.adults_barred_list] || ''}`}>
                    {scenario.adults_barred_list}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Section>

        {scenario.summary && (
          <Section title="Why This May Apply" icon={BookOpen}>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-white/65">{scenario.summary}</p>
          </Section>
        )}

        {(scenario.frequency_test_required || involvesChildren) && (
          <Section title="Frequency Test" icon={AlertTriangle}>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-white/65">
              {scenario.frequency_test_text || FREQUENCY_TEST_TEXT}
            </p>
          </Section>
        )}

        {(involvesAdults || scenario.adults_barred_list === 'Likely Required' || scenario.adults_barred_list === 'May Be Required') && (
          <Section title="Adult Barred List Criteria" icon={Shield}>
            <div className="text-sm leading-relaxed whitespace-pre-line text-gray-600 dark:text-white/65">
              {scenario.adult_barred_list_criteria || ADULT_BARRED_LIST_CRITERIA}
            </div>
          </Section>
        )}

        <Section title="Key Questions to Ask" icon={HelpCircle}>
          <ul className="space-y-1.5">
            {keyQuestions.map((q, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-white/65">
                <span className="text-cyan-500 dark:text-cyan-400 flex-shrink-0 mt-0.5">•</span>
                {q}
              </li>
            ))}
          </ul>
        </Section>

        {scenario.guidance_notes && (
          <Section title="Guidance Notes" icon={BookOpen}>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-white/65">{scenario.guidance_notes}</p>
          </Section>
        )}

        {scenario.escalation_required && (
          <div className="rounded-xl border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">Escalation Required</p>
                <p className="text-xs text-red-600 dark:text-red-200/70 leading-relaxed">
                  Escalate to Compliance before submitting this DBS application. Do not proceed based on job title or this guide alone.
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-center pb-2 text-gray-400 dark:text-white/25">
          This is a guide only. Based on the scenario provided — always verify actual duties before proceeding.
        </p>
      </div>
    </motion.div>
  );
}