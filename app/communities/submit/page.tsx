// app/communities/submit/page.tsx — listing a community, the short way.
// Most group leads are on a phone and will not fill a form, so the primary
// route is a WhatsApp message. The full form still lives at ./form, and an
// edit/remove request from a detail page is forwarded straight to it.
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import './submit.css';

export const metadata: Metadata = {
  title: 'List your community — Community of People',
  description:
    'Run a run club, book club, sports group or meetup? Send us one WhatsApp message and we will list it. Free, and it takes about a minute.',
};

const WHATSAPP_NUMBER = '918287773077';
const WHATSAPP_DISPLAY = '+91 82877 73077';
const PREFILL = `Hi! I'd like to list my community on Community of People.

Name:
City:
What it is:
When you meet:
Join link:`;

const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PREFILL)}`;

const NEED = [
  { k: 'Name', v: 'What the group is called' },
  { k: 'City', v: 'And the area you usually meet in' },
  { k: 'What it is', v: 'One line — running, books, founders, board games' },
  { k: 'When', v: 'Sundays 6am, first Saturday, whatever it is' },
  { k: 'Join link', v: 'WhatsApp, Telegram, Instagram, Meetup — wherever people join' },
];

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // "Update · Remove" links from a listing page go straight to the full form
  const sp = await searchParams;
  const edit = typeof sp.edit === 'string' ? sp.edit : undefined;
  const remove = typeof sp.remove === 'string' ? sp.remove : undefined;
  if (edit) redirect(`/communities/submit/form?edit=${encodeURIComponent(edit)}`);
  if (remove) redirect(`/communities/submit/form?remove=${encodeURIComponent(remove)}`);

  return (
    <main className="sub">
      <div className="wrap sub-wrap">
        <p className="sub-kicker">Free · takes about a minute</p>
        <h1>Run a group? <em>Get it listed.</em></h1>
        <p className="sub-lead">
          Send us one message on WhatsApp with the details below. We will add it and send you the
          link. No account, no form, no waiting for approval emails.
        </p>

        <a className="sub-cta" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
          <span className="sub-wa" aria-hidden="true">✆</span>
          WhatsApp us
          <span className="sub-num">{WHATSAPP_DISPLAY}</span>
        </a>
        <p className="sub-alt">
          Not on WhatsApp? <Link href="/communities/submit/form">Fill the form instead</Link> — or
          email <a href="mailto:contact@communityofemployees.com">contact@communityofemployees.com</a>.
        </p>

        <h2 className="sub-h2">What to send</h2>
        <ul className="sub-need">
          {NEED.map((n) => (
            <li key={n.k}>
              <b>{n.k}</b>
              <span>{n.v}</span>
            </li>
          ))}
        </ul>
        <p className="sub-foot">
          That is everything. If something is missing we will just ask. Already listed and need a
          change? Message the same number, or{' '}
          <Link href="/communities/submit/form">use the form</Link>.
        </p>
      </div>
    </main>
  );
}
