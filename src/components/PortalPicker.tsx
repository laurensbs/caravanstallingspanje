'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Refrigerator, Wrench } from 'lucide-react';

const REPAIR_URL =
  process.env.NEXT_PUBLIC_REPAIR_URL || 'https://caravanreparatiespanje.vercel.app';

const NAVY_GRAD =
  'radial-gradient(120% 90% at 50% 0%, #142F4D 0%, #0A1929 60%, #050D18 100%)';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function PortalPicker() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: NAVY_GRAD, color: '#F1F5F9' }}
    >
      {/* zachte halo bovenin */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[400px] blur-3xl"
        style={{
          background:
            'radial-gradient(40% 60% at 50% 30%, rgba(126,168,255,0.18) 0%, rgba(126,168,255,0.06) 40%, transparent 75%)',
        }}
      />
      <div className="relative w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg mb-6">
            <Image
              src="/images/logo.png"
              alt="Caravanstalling"
              width={56}
              height={56}
              priority
              className="object-contain"
            />
          </div>
          <p
            className="text-[10px] font-medium tracking-[0.25em] uppercase"
            style={{ color: 'rgba(241,245,249,0.55)' }}
          >
            Admin portal
          </p>
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight mt-3"
            style={{ color: '#FFFFFF' }}
          >
            Which portal would you like to open?
          </h1>
          <p
            className="mt-3 text-[14px] leading-relaxed max-w-md mx-auto"
            style={{ color: 'rgba(241,245,249,0.65)' }}
          >
            Two systems, one team. Pick where you want to work.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PortalCard
            href="/admin/dashboard"
            icon={Refrigerator}
            title="Storage"
            description="Fridges, air-con, transport, waitlist and storage requests."
            delay={0.1}
          />
          <PortalCard
            href={REPAIR_URL}
            icon={Wrench}
            title="Repair & work orders"
            description="Work orders, services, parts and scheduling."
            delay={0.18}
          />
        </div>
      </div>
    </main>
  );
}

interface PortalCardProps {
  href: string;
  icon: typeof Refrigerator;
  title: string;
  description: string;
  delay: number;
}

function PortalCard({ href, icon: Icon, title, description, delay }: PortalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: EASE }}
    >
      <a
        href={href}
        className="group block p-6 rounded-2xl transition-all relative overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.10)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
          style={{
            background:
              'radial-gradient(60% 60% at 30% 20%, rgba(126,168,255,0.14) 0%, transparent 70%)',
          }}
        />
        <div className="relative flex items-start justify-between mb-8">
          <div
            className="w-11 h-11 rounded-[12px] flex items-center justify-center transition-transform group-hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            <Icon size={20} style={{ color: '#F1F5F9' }} />
          </div>
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
            style={{ color: 'rgba(241,245,249,0.45)' }}
          />
        </div>
        <h2 className="relative text-lg font-semibold" style={{ color: '#FFFFFF' }}>
          {title}
        </h2>
        <p
          className="relative text-[13px] mt-1.5 leading-relaxed"
          style={{ color: 'rgba(241,245,249,0.62)' }}
        >
          {description}
        </p>
      </a>
    </motion.div>
  );
}
