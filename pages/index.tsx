import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const ConsultancyLandingPage = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    challenge: '',
    message: '',
    freeSession: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch {
      // fire-and-forget — proceed to thank-you regardless
    }
    router.push('/thank-you');
  };

  const services = [
    {
      title: 'Business Strategy',
      category: 'Strategy',
      description: 'Growth roadmaps, competitive positioning, and market entry plans built on rigorous analysis.',
      highlight: 'Market & competitive analysis',
    },
    {
      title: 'Operational Excellence',
      category: 'Operations',
      description: 'Identify inefficiencies, streamline workflows, and build systems that scale with your business.',
      highlight: 'Process design & optimisation',
    },
    {
      title: 'Financial Advisory',
      category: 'Finance',
      description: 'Financial modelling, cost structure review, and investment planning for sustainable growth.',
      highlight: 'Modelling & scenario planning',
    },
    {
      title: 'Digital Transformation',
      category: 'Digital',
      description: 'Technology strategy and adoption roadmaps that modernise operations without disrupting the business.',
      highlight: 'Tech stack & change management',
    },
    {
      title: 'Market Entry — SEA',
      category: 'Expansion',
      description: 'Navigate Southeast Asian markets with confidence. Regulatory, cultural, and commercial guidance.',
      highlight: 'Singapore, MY, TH, ID, VN',
    },
  ];

  const coachingOfferings = [
    {
      title: 'Online Classes',
      format: 'Live, cohort-based',
      description:
        'Structured group sessions on strategy, finance, and operations fundamentals — built for professionals and business owners who want practical, applicable skills.',
      points: [
        'Small cohorts, live instruction',
        'Real case studies from SEA markets',
        'Flexible scheduling for working professionals',
      ],
    },
    {
      title: '1-to-1 Coaching',
      format: 'One-on-one, tailored',
      description:
        'Personalised coaching for founders and executives working through a specific challenge — leadership, growth planning, or a pivotal business decision.',
      points: [
        'Matched with a senior consultant',
        'Sessions built around your goals',
        'Ongoing support between sessions',
      ],
    },
  ];

  const whyPoints = [
    {
      num: '01',
      title: 'Southeast Asia specialists',
      description:
        'Fifteen years of in-market experience across Singapore, Malaysia, Thailand, Indonesia, and Vietnam. We know the regulatory environment, the culture, and the contacts.',
    },
    {
      num: '02',
      title: 'Data-driven, not opinion-driven',
      description:
        'Every recommendation is backed by quantitative analysis and industry benchmarks. You get a clear business case, not a deck of slides.',
    },
    {
      num: '03',
      title: 'We stay until it works',
      description:
        "Strategy without implementation is just advice. We work alongside your team through execution and measure outcomes — not just outputs.",
    },
  ];

  const testimonials = [
    {
      quote: 'SWCO helped us enter the Singapore market six months faster than we projected. Their local network alone was worth the engagement.',
      author: 'James R.',
      location: 'CEO, FinTech Scale-up',
      service: 'Market Entry',
    },
    {
      quote: 'The operational review uncovered $1.2M in annualised savings we had no visibility on. Paid back the engagement fee in the first quarter.',
      author: 'Priya N.',
      location: 'COO, Regional Retail Group',
      service: 'Operations',
    },
    {
      quote: 'Clear thinking, direct communication, and they actually showed up on implementation day. Rare in this industry.',
      author: 'Marcus T.',
      location: 'Founder, B2B SaaS',
      service: 'Strategy',
    },
  ];

  const process = [
    {
      day: '01',
      title: 'Discovery',
      items: [
        'Stakeholder interviews and business assessment',
        'Financial and operational data review',
        'Market and competitive landscape mapping',
        'Problem statement alignment',
      ],
    },
    {
      day: '02',
      title: 'Strategy',
      items: [
        'Insight synthesis and opportunity sizing',
        'Strategic options development',
        'Business case modelling',
        'Roadmap and prioritisation workshop',
      ],
    },
    {
      day: '03',
      title: 'Execution',
      items: [
        'Implementation planning and workstream setup',
        'Embedded support with your team',
        'Progress tracking and course correction',
        'Capability building and knowledge transfer',
      ],
    },
  ];

  const categoryStyle: Record<string, string> = {
    Strategy: 'bg-[#1B3A5C] text-[#A6E3E9]',
    Operations: 'bg-[#71C9CE] text-[#0F2647]',
    Finance: 'bg-[#0F2647] text-[#CBF1F5]',
    Digital: 'bg-[#5FB4BA] text-white',
    Expansion: 'bg-[#254d7a] text-[#CBF1F5]',
  };

  const cardAccent: string[] = [
    'from-[#1B3A5C] to-[#254d7a]',
    'from-[#5FB4BA] to-[#71C9CE]',
    'from-[#0F2647] to-[#1B3A5C]',
    'from-[#71C9CE] to-[#A6E3E9]',
    'from-[#254d7a] to-[#5FB4BA]',
  ];

  return (
    <>
      <Head>
        <title>SWCO Consulting — Business Strategy & Advisory, Southeast Asia</title>
        <meta
          name="description"
          content="SWCO is a business consultancy specialising in strategy, operations, and market entry across Southeast Asia. Based in Singapore."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* ── Navigation ── */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm fixed w-full z-30 top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <span className="font-display text-xl md:text-2xl font-bold theme-logo text-[#0F2647]">
              SWCO Consulting
            </span>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-8">
              {[['home', 'Home'], ['services', 'Services'], ['coaching', 'Coaching'], ['about', 'About'], ['contact', 'FAQ']].map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="text-gray-600 hover:text-[#1B3A5C] font-medium transition text-sm"
                >
                  {label}
                </a>
              ))}
              <a
                href="#consultation"
                className="bg-[#1B3A5C] hover:bg-[#0F2647] text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition duration-200 shadow-sm"
              >
                Book a Call
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 p-1"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-4 space-y-1">
              {[['home', 'Home'], ['services', 'Services'], ['coaching', 'Coaching'], ['about', 'About'], ['contact', 'FAQ']].map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-gray-700 font-medium py-2.5 text-sm"
                >
                  {label}
                </a>
              ))}
              <a
                href="#consultation"
                onClick={() => setIsMenuOpen(false)}
                className="block bg-[#1B3A5C] text-white px-4 py-3 rounded-lg font-semibold text-center text-sm mt-3"
              >
                Book a Call
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0F2647]"
      >
        {/* Ghost background text */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
        >
          <span
            className="font-display font-bold text-white leading-none whitespace-nowrap"
            style={{ fontSize: 'clamp(6rem, 22vw, 20rem)', opacity: 0.045, letterSpacing: '0.06em' }}
          >
            SWCO
          </span>
        </div>

        {/* Cyan accent line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#71C9CE] to-transparent opacity-50" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-28 pb-20">
          <div className="inline-block bg-[#71C9CE]/15 border border-[#71C9CE]/30 text-[#A6E3E9] text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8">
            Strategy · Operations · Market Entry · Singapore
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]">
            Sharper strategy.{' '}
            <span className="text-[#71C9CE]">Faster execution.</span>
          </h1>

          <p className="text-base md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            We help ambitious businesses in Southeast Asia grow with purpose — from market entry and operational
            redesign to digital transformation and financial clarity.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#services"
              className="bg-[#71C9CE] hover:bg-[#5FB4BA] text-[#0F2647] px-8 py-4 rounded-lg font-bold text-sm md:text-base transition duration-200 shadow-xl"
            >
              Our Services
            </a>
            <a
              href="#consultation"
              className="border border-white/25 hover:border-white/50 text-white px-8 py-4 rounded-lg font-bold text-sm md:text-base transition duration-200"
            >
              Book a Free Call →
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-5 h-5 text-[#71C9CE] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2.5 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-800">15+</span>
              <span>Years in Southeast Asia</span>
            </div>
            <span className="hidden sm:block text-gray-200">|</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-800">80+</span>
              <span>Engagements Delivered</span>
            </div>
            <span className="hidden sm:block text-gray-200">|</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-800">5</span>
              <span>Markets Covered</span>
            </div>
            <span className="hidden sm:block text-gray-200">|</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-800">$200M+</span>
              <span>Value Created for Clients</span>
            </div>
            <span className="hidden sm:block text-gray-200">|</span>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#71C9CE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Singapore Registered</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Why Section ── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-[#71C9CE] font-semibold text-xs uppercase tracking-widest mb-3">Why SWCO</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-gray-900 max-w-lg leading-tight">
              Built for businesses that mean it
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {whyPoints.map((point, i) => (
              <div key={i} className="group">
                <div className="font-display text-5xl font-bold text-gray-100 group-hover:text-[#A6E3E9] transition-colors duration-300 mb-4 leading-none select-none">
                  {point.num}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{point.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-[#71C9CE] font-semibold text-xs uppercase tracking-widest mb-3">Our Services</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-gray-900 max-w-xl leading-tight">
              Five practice areas, one integrated team
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Thin colour bar */}
                <div className={`bg-gradient-to-r ${cardAccent[i]} h-1.5`} />

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 ${categoryStyle[svc.category]}`}>
                      {svc.category}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-gray-900 mb-2 leading-snug">{svc.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 flex-1 leading-relaxed">{svc.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <p className="text-xs text-gray-400">
                      <span className="text-gray-600 font-medium">{svc.highlight}</span>
                    </p>
                    <a
                      href="#consultation"
                      className="text-xs font-semibold text-[#1B3A5C] hover:text-[#71C9CE] transition-colors"
                    >
                      Enquire →
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {/* Custom CTA card */}
            <div className="bg-[#0F2647] rounded-2xl p-5 flex flex-col justify-between text-white sm:col-span-2 lg:col-span-1">
              <div>
                <p className="text-[#71C9CE] text-xs font-bold uppercase tracking-widest mb-3">Bespoke</p>
                <h3 className="font-display text-xl font-bold mb-3 leading-tight">
                  Have a specific challenge?<br />Let's scope it together.
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Every business is different. Tell us what you're facing — we'll design an engagement around your
                  situation.
                </p>
              </div>
              <a
                href="#consultation"
                className="mt-6 inline-block bg-[#71C9CE] hover:bg-[#5FB4BA] text-[#0F2647] font-bold py-3 px-5 rounded-lg text-sm transition duration-200 text-center"
              >
                Start a conversation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Coaching & Classes ── */}
      <section id="coaching" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-[#71C9CE] font-semibold text-xs uppercase tracking-widest mb-3">
              For Professionals &amp; Business Owners
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-gray-900 max-w-xl leading-tight">
              Coaching &amp; classes to build the skills yourself
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coachingOfferings.map((offer, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100 flex flex-col"
              >
                <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#1B3A5C] text-[#A6E3E9] mb-4 self-start">
                  {offer.format}
                </span>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-3">{offer.title}</h3>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed flex-1">{offer.description}</p>
                <ul className="space-y-2.5 mb-6">
                  {offer.points.map((point, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-gray-600 text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#71C9CE] flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
                <a
                  href="#consultation"
                  className="inline-block bg-[#1B3A5C] hover:bg-[#0F2647] text-white font-bold py-3 px-5 rounded-lg text-sm transition duration-200 text-center"
                >
                  Reserve a Spot →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process — dark navy ── */}
      <section className="py-20 md:py-28 bg-[#0F2647]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-[#71C9CE] font-semibold text-xs uppercase tracking-widest mb-3">How We Work</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white max-w-xl leading-tight">
              From first call to measurable results
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {process.map((d, i) => (
              <div
                key={i}
                className="border border-white/10 rounded-2xl p-6 md:p-7 hover:border-[#71C9CE]/40 transition-colors duration-300"
              >
                <div className="font-display text-6xl font-bold text-white leading-none mb-5 select-none">
                  {d.day}
                </div>
                <h3 className="text-white font-bold text-lg mb-5 font-display">{d.title}</h3>
                <ul className="space-y-3">
                  {d.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-gray-400 text-sm leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#71C9CE] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Client Testimonials ── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-[#71C9CE] font-semibold text-xs uppercase tracking-widest mb-3">Client Outcomes</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-gray-900 max-w-xl leading-tight">
              What our clients say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 md:p-7 flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed flex-1 mb-5">"{t.quote}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.author}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{t.location}</p>
                  </div>
                  <span className="text-xs text-[#5FB4BA] font-medium bg-[#E3FDFD] px-2.5 py-1 rounded-full">
                    {t.service}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Consultation Form ── */}
      <section id="consultation" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-12">
            <div className="mb-8">
              <p className="text-[#71C9CE] font-semibold text-xs uppercase tracking-widest mb-3">Free Consultation</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
                Tell us about your challenge
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Share a bit about your business and what you're working through. We'll come back within one business
                day with a clear perspective — no charge, no obligation.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#71C9CE] focus:border-[#71C9CE] outline-none text-sm transition"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Company (optional)</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#71C9CE] focus:border-[#71C9CE] outline-none text-sm transition"
                    placeholder="Acme Pte. Ltd."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Work Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#71C9CE] focus:border-[#71C9CE] outline-none text-sm transition"
                  placeholder="jane@company.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Primary Challenge</label>
                <select
                  name="challenge"
                  value={formData.challenge}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#71C9CE] focus:border-[#71C9CE] outline-none text-sm transition"
                >
                  <option value="">Select an area...</option>
                  <option>Business Strategy & Growth</option>
                  <option>Operational Efficiency</option>
                  <option>Financial Planning & Advisory</option>
                  <option>Digital Transformation</option>
                  <option>Market Entry — Southeast Asia</option>
                  <option>Online Classes</option>
                  <option>1-to-1 Coaching</option>
                  <option>Other / Not Sure Yet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Tell Us More</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#71C9CE] focus:border-[#71C9CE] outline-none text-sm transition resize-none"
                  placeholder="Describe what you're working on and what a successful outcome looks like..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="freeSession"
                  name="freeSession"
                  checked={formData.freeSession}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 accent-[#71C9CE]"
                />
                <label htmlFor="freeSession" className="text-sm text-gray-600">
                  I'd like to schedule a free 30-minute strategy call
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1B3A5C] hover:bg-[#0F2647] disabled:opacity-60 text-white font-bold py-4 px-8 rounded-lg text-sm transition duration-200 shadow-sm mt-2"
              >
                {isSubmitting ? 'Sending...' : 'Submit Enquiry →'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#71C9CE] font-semibold text-xs uppercase tracking-widest mb-3">About SWCO</p>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Practitioners, not just advisors
              </h2>
              <p className="text-gray-600 mb-5 leading-relaxed text-sm md:text-base">
                SWCO was founded by operators who spent a decade-and-a-half building and scaling businesses across
                Southeast Asia before moving into advisory. We know what it takes to execute — not just what to put
                on a slide.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed text-sm md:text-base">
                Our team combines strategy consulting, corporate finance, and in-market operating experience.
                We work with founders, scale-ups, and corporates expanding into the region — wherever the
                complexity is highest.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { val: '80+', label: 'Engagements' },
                  { val: '$200M+', label: 'Value Created' },
                  { val: '5', label: 'SEA Markets' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="font-display text-2xl md:text-3xl font-bold text-[#1B3A5C]">{s.val}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-5">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#71C9CE]" />
                  Singapore Registered
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#71C9CE]" />
                  In-market across SEA
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-[#0F2647] rounded-2xl h-72 md:h-96 flex items-center justify-center">
                <div className="text-center px-8">
                  <div className="font-display text-xl font-bold mb-2 text-white/50">Our Team</div>
                  <p className="text-sm text-white/30">Photo coming soon</p>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white shadow-xl rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#71C9CE]/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#1B3A5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 leading-none mb-0.5">Since 2010</p>
                  <p className="font-bold text-gray-900 text-sm leading-none">15 Years of SEA Experience</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="contact" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-[#71C9CE] font-semibold text-xs uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Common questions</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'What size companies do you work with?',
                a: 'We work with businesses at different stages — from growth-stage startups raising their Series B to established SMEs and regional subsidiaries of multinationals. The common thread is ambition and a willingness to do the work.',
              },
              {
                q: 'How long does a typical engagement last?',
                a: 'Strategy engagements typically run 6–12 weeks. Implementation support is scoped separately based on complexity. We\'re flexible and structure projects around your timeline and resources.',
              },
              {
                q: 'Do you work across Southeast Asia or just Singapore?',
                a: 'We\'re headquartered in Singapore but have in-market presence and active client relationships across Malaysia, Thailand, Indonesia, and Vietnam. Market entry into any of these markets is a core part of our practice.',
              },
              {
                q: 'What does the free consultation involve?',
                a: 'A 30-minute call with one of our senior consultants. We\'ll understand your challenge, share an initial perspective, and discuss whether — and how — we might be able to help. No pitch, no obligation.',
              },
            ].map((faq, i) => (
              <details key={i} className="bg-white rounded-xl border border-gray-100 group">
                <summary className="px-5 py-4 cursor-pointer font-semibold text-gray-900 text-sm list-none flex items-center justify-between hover:text-[#1B3A5C] transition select-none">
                  {faq.q}
                  <svg
                    className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0A1F38] text-white pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-display text-lg font-bold mb-3 text-[#71C9CE]">SWCO Consulting</h3>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Business strategy and advisory for ambitious companies in Southeast Asia.
              </p>
              <div className="flex space-x-2.5">
                {[
                  <path key="li" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />,
                ].map((svgPath, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#71C9CE]/20 flex items-center justify-center transition"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      {svgPath}
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider mb-4 text-gray-300">Quick Links</h4>
              <ul className="space-y-2.5">
                {[['#home', 'Home'], ['#services', 'Services'], ['#coaching', 'Coaching'], ['#about', 'About'], ['#consultation', 'Book a Call']].map(([href, label]) => (
                  <li key={href}>
                    <a href={href} className="text-gray-400 hover:text-white text-sm transition">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider mb-4 text-gray-300">Services</h4>
              <ul className="space-y-2.5">
                {['Business Strategy', 'Operational Excellence', 'Financial Advisory', 'Digital Transformation', 'Market Entry — SEA'].map(item => (
                  <li key={item}>
                    <a href="#services" className="text-gray-400 hover:text-white text-sm transition">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider mb-4 text-gray-300">Contact</h4>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                hello@swco.sg
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© 2025 SWCO Consulting. All rights reserved.</p>
            <p>Based in Singapore · Operating across SEA</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default ConsultancyLandingPage;
