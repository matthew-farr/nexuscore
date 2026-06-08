import { useState } from 'react';
import { ChevronRight, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DisclaimerBanner from './DisclaimerBanner';

const QUESTIONS = [
  {
    id: 'workforce',
    question: 'Who will the person work with?',
    options: ['Children', 'Adults', 'Children and Adults', 'Neither', 'Not Sure']
  },
  {
    id: 'activity',
    question: 'What type of activity will they carry out?',
    optionsFn: (answers) => {
      const w = answers.workforce;
      if (w === 'Children') return ['Teaching, training, instruction or supervision', 'Care or personal care', 'Healthcare', 'Driving children', 'Working in a school or specified establishment', 'Other'];
      if (w === 'Adults') return ['Healthcare', 'Personal care', 'Social work', 'Assistance with cash, bills or shopping because of age, illness or disability', "Assistance with a person's own affairs", 'Conveying adults because of age, illness or disability', 'Other'];
      if (w === 'Children and Adults') return ['Healthcare', 'Personal care / Care', 'Teaching or instruction', 'Social work', 'Other regulated activity'];
      return ['Administrative / office work', 'Facilities / maintenance', 'Other'];
    }
  },
  {
    id: 'frequency',
    question: 'How often will the activity happen?',
    options: ['Once a week or more', '4 or more days in a 30-day period', 'Overnight', 'Occasionally', 'One-off', 'Not Sure']
  },
  {
    id: 'supervision',
    question: 'Is the activity supervised?',
    options: ['Supervised', 'Unsupervised', 'Not Sure', 'Not Applicable']
  },
  {
    id: 'paid',
    question: 'Is the person paid or voluntary?',
    options: ['Paid', 'Volunteer', 'Not Sure']
  },
  {
    id: 'setting',
    question: 'Is the role in a specified setting?',
    options: ['School', 'Nursery', 'Care home', 'Hospital', 'Dental practice', 'Home care setting', 'Charity / community setting', 'Customer premises', 'Other', 'Not Sure']
  }
];

function computeResult(answers) {
  const { workforce, activity, frequency, supervision } = answers;
  const isChild = workforce === 'Children' || workforce === 'Children and Adults';
  const isAdult = workforce === 'Adults' || workforce === 'Children and Adults';
  const isNeither = workforce === 'Neither';
  const isNotSure = workforce === 'Not Sure';

  const regulatedChildActivities = ['Teaching, training, instruction or supervision', 'Care or personal care', 'Healthcare', 'Driving children', 'Working in a school or specified establishment', 'Teaching or instruction'];
  const regulatedAdultActivities = ['Healthcare', 'Personal care', 'Social work', "Assistance with cash, bills or shopping because of age, illness or disability", "Assistance with a person's own affairs", 'Conveying adults because of age, illness or disability', 'Personal care / Care'];

  const isRegulatedChildActivity = regulatedChildActivities.includes(activity);
  const isRegulatedAdultActivity = regulatedAdultActivities.includes(activity);
  const isFrequent = ['Once a week or more', '4 or more days in a 30-day period', 'Overnight'].includes(frequency);
  const isUnsupervised = supervision === 'Unsupervised';

  if (isNotSure) return { level: 'Not enough information', colour: 'yellow', escalate: false, notes: ['Not enough information to make a determination. Escalate to Compliance if unsure.'] };
  if (isNeither) return { level: 'Basic DBS may be appropriate', colour: 'blue', escalate: false, notes: ['No workforce involvement identified. Basic DBS may be sufficient, but always verify actual duties.'] };

  if (isChild && isAdult) {
    if (isRegulatedChildActivity && isRegulatedAdultActivity) {
      return { level: "Enhanced DBS with Children's and Adults' Barred Lists may be appropriate", colour: 'red', escalate: true, notes: ['Regulated activity with both children and adults identified.', 'Escalate to Compliance to confirm eligibility before submitting.'] };
    }
    return { level: "Enhanced DBS may be appropriate", colour: 'purple', escalate: true, notes: ['Both child and adult workforce — escalate to Compliance to confirm correct level.'] };
  }

  if (isChild) {
    if (isRegulatedChildActivity && isFrequent && isUnsupervised) {
      return { level: "Enhanced DBS with Children's Barred List may be appropriate", colour: 'pink', escalate: false, notes: ['Regular, unsupervised regulated activity with children identified.', 'Frequency test appears met.'] };
    }
    if (isRegulatedChildActivity) {
      return { level: "Enhanced DBS with Children's Barred List may be appropriate", colour: 'pink', escalate: true, notes: ['Regulated activity with children identified — frequency and supervision must be verified.', 'Escalate to Compliance if unsure about barred list eligibility.'] };
    }
    return { level: 'Enhanced DBS may be appropriate', colour: 'purple', escalate: true, notes: ['Child workforce but activity may not meet regulated activity threshold.', 'Verify duties and escalate to Compliance.'] };
  }

  if (isAdult) {
    if (isRegulatedAdultActivity) {
      return { level: "Enhanced DBS with Adults' Barred List may be appropriate", colour: 'orange', escalate: false, notes: ["Regulated activity with adults identified.", "Adult barred list criteria may apply — verify the specific activity being carried out."] };
    }
    return { level: 'Enhanced DBS may be appropriate', colour: 'purple', escalate: true, notes: ['Adult workforce but activity may not meet regulated activity threshold.', 'Verify duties and escalate to Compliance if barred list eligibility is uncertain.'] };
  }

  return { level: 'Escalate to Compliance', colour: 'red', escalate: true, notes: ['Unable to determine from answers provided. Escalate to Compliance before proceeding.'] };
}

const COLOUR_STYLES = {
  blue: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-400/10 border-blue-300 dark:border-blue-400/30',
  cyan: 'text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-400/10 border-cyan-300 dark:border-cyan-400/30',
  purple: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-400/10 border-purple-300 dark:border-purple-400/30',
  pink: 'text-pink-700 dark:text-pink-400 bg-pink-50 dark:bg-pink-400/10 border-pink-300 dark:border-pink-400/30',
  orange: 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-400/10 border-orange-300 dark:border-orange-400/30',
  red: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-400/10 border-red-300 dark:border-red-400/30',
  yellow: 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-400/10 border-yellow-300 dark:border-yellow-400/30',
};

export default function DecisionGuideTab() {
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [complete, setComplete] = useState(false);

  const currentQuestion = QUESTIONS[step];
  const options = currentQuestion?.optionsFn ? currentQuestion.optionsFn(answers) : currentQuestion?.options || [];

  const handleAnswer = (option) => {
    const newAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setComplete(true);
    }
  };

  const handleReset = () => { setAnswers({}); setStep(0); setComplete(false); };

  const result = complete ? computeResult(answers) : null;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <DisclaimerBanner compact />

      {!complete ? (
        <div className="rounded-xl p-6 bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] shadow-sm">
          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-6">
            {QUESTIONS.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i >= step ? 'bg-gray-200 dark:bg-white/10' : ''}`} style={{
                background: i < step ? 'linear-gradient(90deg, #ec2ca3, #7c3aed)' : i === step ? 'rgba(236,44,163,0.4)' : undefined
              }}
              />
            ))}
          </div>

          <p className="text-xs mb-2 text-gray-500 dark:text-white/50">Question {step + 1} of {QUESTIONS.length}</p>
          <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">{currentQuestion.question}</h3>

          <div className="space-y-2">
            {options.map(option => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.005] flex items-center justify-between group bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08] hover:border-pink-300 dark:hover:border-pink-500/40"
              >
                {option}
                <ChevronRight className="w-4 h-4 text-gray-400 dark:opacity-40 group-hover:text-pink-500 dark:group-hover:opacity-80 transition-all" />
              </button>
            ))}
          </div>

          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="mt-4 text-xs text-gray-500 dark:text-white/40 hover:opacity-70">
              ← Back
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Result */}
          <div className="rounded-xl p-6 bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] shadow-sm">
            <p className="text-xs mb-3 text-gray-500 dark:text-white/50">Based on your answers</p>
            <div className={`inline-block text-sm font-bold px-4 py-2 rounded-xl border mb-4 ${COLOUR_STYLES[result.colour]}`}>
              {result.level}
            </div>
            <ul className="space-y-2">
              {result.notes.map((note, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-white/55">
                  <span className="text-cyan-500 dark:text-cyan-400 flex-shrink-0 mt-0.5">•</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>

          {/* Answers summary */}
          <div className="rounded-xl p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06]">
            <p className="text-xs font-semibold mb-3 text-gray-500 dark:text-white/50">Your Answers</p>
            <div className="grid grid-cols-2 gap-2">
              {QUESTIONS.map(q => answers[q.id] ? (
                <div key={q.id}>
                  <span className="text-xs block text-gray-400 dark:text-white/35">{q.question.replace('?', '')}</span>
                  <span className="text-xs font-medium text-gray-800 dark:text-white">{answers[q.id]}</span>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Escalation notice */}
          {result.escalate && (
            <div className="rounded-xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-200/80">
                  <strong className="text-amber-900 dark:text-amber-300">Escalate to Compliance</strong> before submitting. This result requires further review of actual duties, setting and eligibility criteria.
                </p>
              </div>
            </div>
          )}

          {/* Guide-only footer */}
          <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 p-3">
            <p className="text-xs text-amber-700 dark:text-amber-200/60 leading-relaxed">
              <strong>This is a guide only.</strong> Results are based on the answers provided and do not constitute legal advice or a final eligibility determination. Always verify actual duties before proceeding.
            </p>
          </div>

          <Button onClick={handleReset} variant="outline" className="w-full gap-2">
            <RotateCcw className="w-4 h-4" />
            Start Again
          </Button>
        </div>
      )}
    </div>
  );
}