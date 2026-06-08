import { Ticket, MessageCircle, Mail, Phone, ChevronRight } from 'lucide-react';

const DEFAULT_SUPPORT_GROUPS = [
  {
    key: 'applicant',
    emoji: '👤',
    title: 'Applicant Support',
    description: 'For applicants completing checks, identity verification or application forms.',
    primaryCta: {
      label: 'Create Support Ticket',
      href: 'https://2eflyq.share-eu1.hsforms.com/20qtYTv2ZSiepGrjpiQwYtw',
    },
    methods: [
      {
        key: 'chat',
        icon: MessageCircle,
        label: 'Open Live Chat',
        href: 'https://portal.checksdirect.co.uk/app-login.php',
        description: 'Chat directly with our support team through the Applicant Portal.',
        type: 'link',
      },
      {
        key: 'email',
        icon: Mail,
        label: 'Applicant@checksdirect.co.uk',
        href: 'mailto:Applicant@checksdirect.co.uk',
        type: 'link',
      },
      {
        key: 'phone',
        icon: Phone,
        label: '02920 602356',
        description: 'Select the option for Support when prompted.',
        type: 'text',
      },
    ],
  },
  {
    key: 'client',
    emoji: '🏢',
    title: 'Client Support',
    description: 'For employers, organisations and account holders.',
    primaryCta: {
      label: 'Create Support Ticket',
      href: 'https://2eflyq.share-eu1.hsforms.com/20qtYTv2ZSiepGrjpiQwYtw',
    },
    methods: [
      {
        key: 'chat',
        icon: MessageCircle,
        label: 'Open Client Portal',
        href: 'https://portal.checksdirect.co.uk/',
        description: 'Access live chat and account services through the Client Portal.',
        type: 'link',
      },
      {
        key: 'email',
        icon: Mail,
        label: 'contact@checksdirect.co.uk',
        href: 'mailto:contact@checksdirect.co.uk',
        type: 'link',
      },
      {
        key: 'phone',
        icon: Phone,
        label: '02920 602356',
        description: 'Select the option to speak with your Account Manager.',
        type: 'text',
      },
    ],
  },
];

function SupportCard({ group }) {
  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col">
      {/* Card header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{group.emoji}</span>
          <h4 className="text-base font-bold text-slate-800 dark:text-white">{group.title}</h4>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{group.description}</p>
      </div>

      {/* Primary CTA */}
      <div className="px-6 pb-4">
        <a
          href={group.primaryCta.href}
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #ec2ca3)' }}
        >
          <Ticket className="w-4 h-4" />
          {group.primaryCta.label}
        </a>
      </div>

      {/* Support methods */}
      <div className="px-6 pb-6 flex flex-col gap-0 border-t border-slate-100 dark:border-slate-700/50 pt-4 flex-1">
        {group.methods.map((method, idx) => {
          const Icon = method.icon;
          const isLast = idx === group.methods.length - 1;
          return (
            <div key={method.key}>
              <div className="flex items-start gap-3 py-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-purple-50 dark:bg-purple-900/30">
                  <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  {method.type === 'link' ? (
                    <a
                      href={method.href}
                      target={method.href?.startsWith('mailto') ? '_self' : '_blank'}
                      rel="noreferrer"
                      className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition-colors break-all"
                    >
                      {method.label}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{method.label}</p>
                  )}
                  {method.description && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{method.description}</p>
                  )}
                </div>
              </div>
              {!isLast && <div className="border-t border-slate-100 dark:border-slate-700/40 ml-11" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * SupportContactSection — reusable help/contact section.
 * Props:
 *   - supportGroups: array of group objects (defaults to Checks Direct applicant + client)
 *   - title: section heading string
 *   - description: section subheading string
 */
export default function SupportContactSection({
  supportGroups = DEFAULT_SUPPORT_GROUPS,
  title = 'Need Help?',
  description = "Still need assistance? Choose the support option that's right for you.",
}) {
  return (
    <section className="w-full">
      {/* Section header */}
      <div className="mb-5">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {supportGroups.map(group => (
          <SupportCard key={group.key} group={group} />
        ))}
      </div>
    </section>
  );
}