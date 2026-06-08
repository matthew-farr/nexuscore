import { AlertTriangle, ExternalLink } from 'lucide-react';
import { DISCLAIMER, GUIDANCE_LINKS } from './dbsEligibilityConfig';

export default function DisclaimerBanner({ compact = false }) {
  return (
    <div className="rounded-xl border border-amber-400/40 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-500/30 p-4">
      <div className="flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Compliance Guidance Notice</p>
          <p className="text-xs text-amber-700 dark:text-amber-200/80 leading-relaxed">{DISCLAIMER}</p>
          {!compact && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
              {GUIDANCE_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 underline underline-offset-2"
                >
                  {link.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}