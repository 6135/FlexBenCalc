import React from 'react';
import { Link } from 'react-router-dom';
import { GA_MEASUREMENT_ID } from '../utils/analytics';

const LAST_UPDATED = '7 August 2026';
const CONTROLLER_NAME = 'Gui Costa';
const CONTROLLER_EMAIL = 'guiboscosta@gmail.com';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-xl font-semibold text-gray-800 mb-3">{title}</h2>
    <div className="text-gray-700 space-y-3">{children}</div>
  </section>
);

export const PrivacyPolicy: React.FC = () => (
  <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
        <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          &larr; Back to the calculator
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {LAST_UPDATED}</p>

        <Section title="Who is responsible for your data">
          <p>
            The FlexBen Calculator is a personal, non-commercial project. The data controller is{' '}
            <strong>{CONTROLLER_NAME}</strong>, who can be contacted at{' '}
            <a className="text-blue-600 hover:text-blue-800" href={`mailto:${CONTROLLER_EMAIL}`}>
              {CONTROLLER_EMAIL}
            </a>
            .
          </p>
        </Section>

        <Section title="The short version">
          <p>
            The figures you enter — your budget, bonus, car allowance, health plan, dependents and
            priorities — <strong>never leave your browser</strong>. They are not sent to any server,
            and no account is required to use this tool.
          </p>
          <p>
            The only data that goes anywhere is optional, anonymous analytics about which features
            are used, and only if you accept it.
          </p>
        </Section>

        <Section title="Data stored in your browser">
          <p>
            The calculator saves your configuration locally using your browser's{' '}
            <code className="bg-gray-100 px-1 rounded text-sm">localStorage</code>, so your figures
            are still there when you come back. This stays on your device, is never transmitted, and
            you can remove it at any time with the <strong>Reset</strong> button or by clearing your
            browser data.
          </p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>
              <code className="bg-gray-100 px-1 rounded text-sm">benefitsAllocatorState</code> — your
              saved configuration. Necessary for the tool to work as intended, so it is not subject
              to consent.
            </li>
            <li>
              <code className="bg-gray-100 px-1 rounded text-sm">gaConsent</code> — your analytics
              choice, with the date it was made, so we can honour it and demonstrate it.
            </li>
          </ul>
        </Section>

        <Section title="Analytics and cookies">
          <p>
            If — and only if — you accept analytics cookies, this site loads Google Analytics 4
            (property <code className="bg-gray-100 px-1 rounded text-sm">{GA_MEASUREMENT_ID}</code>)
            to understand which features people actually use, so effort goes to the parts that
            matter. If you reject, the Google Analytics script is never loaded, no analytics cookies
            are set, and nothing is transmitted.
          </p>
          <p className="font-medium">What is recorded when you accept:</p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>Pages viewed within the app, and approximate location, device and browser type.</li>
            <li>
              That an action happened — sharing, exporting, importing, printing, resetting or
              auto-balancing — but never the values involved.
            </li>
          </ul>
          <p className="font-medium">What is never recorded:</p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>
              Any figure you enter: budget, bonus, car allowance, health plan, dependents or
              priorities.
            </li>
            <li>
              The contents of a shared link. Share links carry an encoded copy of a configuration,
              so that part of the address is replaced with{' '}
              <code className="bg-gray-100 px-1 rounded text-sm">/shared/[redacted]</code> before
              anything is reported.
            </li>
          </ul>
          <p>
            Google Analytics sets cookies named <code className="bg-gray-100 px-1 rounded text-sm">_ga</code>{' '}
            and <code className="bg-gray-100 px-1 rounded text-sm">_ga_*</code> to distinguish
            visitors. Advertising, ad personalisation and remarketing signals are switched off.
          </p>
        </Section>

        <Section title="Legal basis">
          <p>
            Analytics is processed on the basis of your <strong>consent</strong> (Article 6(1)(a)
            GDPR), asked for before anything is loaded. Storing your configuration locally is
            strictly necessary to provide the tool you asked for, and involves no transmission.
          </p>
        </Section>

        <Section title="Who receives the data, and where it goes">
          <p>
            Analytics data is processed by <strong>Google Ireland Limited</strong> and{' '}
            <strong>Google LLC</strong> acting as processors on our behalf, and may be transferred
            to the United States. Google LLC is certified under the{' '}
            <a
              className="text-blue-600 hover:text-blue-800"
              href="https://www.dataprivacyframework.gov/"
              target="_blank"
              rel="noopener noreferrer"
            >
              EU–US Data Privacy Framework
            </a>
            , which the European Commission has recognised as providing an adequate level of
            protection. Data is not sold, and is not shared with anyone else.
          </p>
        </Section>

        <Section title="How long it is kept">
          <p>
            Analytics data is retained by Google for <strong>2 months</strong>, the shortest period
            available, after which it is deleted automatically. Data stored in your browser stays
            until you clear it.
          </p>
        </Section>

        <Section title="Your rights">
          <p>Under the GDPR you have the right to:</p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li>
              <strong>Withdraw consent at any time</strong> — use the “Cookie settings” link at the
              bottom of the calculator. Withdrawing is as easy as giving consent, and does not
              affect processing that already took place.
            </li>
            <li>Request access to, correction of, or erasure of your personal data.</li>
            <li>Object to or request restriction of processing, and request data portability.</li>
          </ul>
          <p>
            To exercise any of these, email{' '}
            <a className="text-blue-600 hover:text-blue-800" href={`mailto:${CONTROLLER_EMAIL}`}>
              {CONTROLLER_EMAIL}
            </a>
            . Because analytics data is collected without any account or identifier we hold, we may
            be unable to link it to you individually.
          </p>
          <p>
            If you believe your data has been handled improperly, you can lodge a complaint with the
            Portuguese supervisory authority, the{' '}
            <a
              className="text-blue-600 hover:text-blue-800"
              href="https://www.cnpd.pt/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Comissão Nacional de Proteção de Dados (CNPD)
            </a>
            , or with the authority in your country of residence.
          </p>
        </Section>

        <Section title="A note on shared links">
          <p>
            The <strong>Share</strong> feature builds a link containing an encoded copy of your
            configuration. Anyone holding that link can read those figures, and links can spread
            further than intended through browser history, chat previews and server logs. Only share
            one with people you would be comfortable showing the numbers to.
          </p>
        </Section>

        <Section title="Automated decision-making">
          <p>
            No automated decision-making or profiling in the sense of Article 22 GDPR takes place.
            The calculator's results are arithmetic performed in your browser, for information only.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If what we collect changes, this page is updated and you will be asked for your
            analytics choice again.
          </p>
        </Section>

        <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          &larr; Back to the calculator
        </Link>
      </div>
    </div>
  </div>
);
