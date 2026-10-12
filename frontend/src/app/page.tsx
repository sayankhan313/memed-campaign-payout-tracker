import type { Metadata } from 'next';
import LandingPage from '../components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'Meme’d — Where Content Meets Rewards',
  description: 'Launch creator campaigns, set view-based rewards, and track milestone payouts with clear budget visibility.',
};

export default function HomePage() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
      />
      <LandingPage />
    </>
  );
}
