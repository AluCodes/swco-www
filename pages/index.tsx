import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { BOOKING_WEBHOOK_URL } from '../lib/constants';

const DaNangLandingPage = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    travelDate: '',
    guests: '1 Guest',
    tourInterest: '',
    message: '',
    personalized: false,
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
      await fetch(BOOKING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch {
      // fire-and-forget — proceed to thank-you regardless
    }
    router.push('/thank-you');
  };

  const tours = [
    {
      title: 'Ba Na Hills & Golden Bridge',
      category: 'Mountain',
      description: 'Walk above the clouds on the iconic Golden Bridge, hands emerging from stone.',
      price: 45,
      duration: 'Full day',
      highlight: 'UNESCO-listed cable car',
    },
    {
      title: 'Hoi An Lantern Night',
      category: 'Culture',
      description: 'Ancient town ablaze with silk lanterns — best experienced after dark.',
      price: 35,
      duration: 'Evening',
      highlight: 'Ancient Town walk included',
    },
    {
      title: 'Marble Mountain + Monkey Mountain',
      category: 'Adventure',
      description: 'Cave pagodas, Buddhist shrines, and 360° coastal panoramas.',
      price: 40,
      duration: 'Half day',
      highlight: 'Sunrise option available',
    },
    {
      title: 'Da Nang Street Food Tour',
      category: 'Food',
      description: 'Mì Quảng, Bánh Mì, Bún Bò Huế — the dishes locals actually eat.',
      price: 30,
      duration: '3 hours',
      highlight: '7+ local stops',
    },
    {
      title: 'My Son Sanctuary',
      category: 'Heritage',
      description: '1,500-year-old Cham temples hidden in a jungle valley.',
      price: 50,
      duration: 'Full day',
      highlight: 'Expert historian guide',
    },
  ];

  const whyPoints = [
    {
      num: '01',
      title: 'Three worlds, thirty minutes apart',
      description:
        'My Khe Beach at breakfast. Ba Na Hills by noon. Hoi An by evening. No other city in Vietnam packs this much in.',
    },
    {
      num: '02',
      title: 'Guides who live here',
      description:
        "Every tour is led by a Da Nang local. They know the shortcut to the viewpoint before the crowds arrive.",
    },
    {
      num: '03',
      title: 'No hidden costs, no pressure',
      description:
        "Prices are per person, all-inclusive. We'll pick you up, drop you off, and handle every detail in between.",
    },
  ];

  const testimonials = [
    {
      quote: 'The food tour alone was worth the trip. Our guide took us places no guidebook mentions.',
      author: 'Amy L.',
      location: 'Sydney, Australia',
      rating: 5,
      tour: 'Street Food',
    },
    {
      quote: 'Organised, punctual, and genuinely fun. Our guide made Ba Na Hills magical, not just a tick-off.',
      author: 'Kenji M.',
      location: 'Tokyo, Japan',
      rating: 5,
      tour: 'Ba Na Hills',
    },
    {
      quote: "We landed with no plan. 24 hours later we'd seen everything we came to Vietnam for.",
      author: 'Sarah K.',
      location: 'Auckland, New Zealand',
      rating: 5,
      tour: 'Custom Package',
    },
  ];

  const itinerary = [
    {
      day: '01',
      title: 'Arrival & the Sea',
      items: [
        'Airport pickup',
        'Hotel check-in',
        'My Khe Beach — longest stretch of sand in the city',
        'Dragon Bridge at sunset',
        'Welcome dinner on Han River',
      ],
    },
    {
      day: '02',
      title: 'Highlands & Ancient Town',
      items: [
        'Golden Bridge at Ba Na Hills',
        'French Village & cable car',
        'Down to Hoi An by afternoon',
        'Ancient Town walk',
        'Lantern release on the river',
      ],
    },
    {
      day: '03',
      title: 'Local Life & Departure',
      items: [
        'Han Market — local breakfast',
        'Vietnamese coffee tasting',
        'Marble Mountains caves',
        'Street food farewell lunch',
        'Airport transfer',
      ],
    },
  ];

  const categoryStyle: Record<string, string> = {
    Mountain: 'bg-[#1B3A5C] text-[#A6E3E9]',
    Culture: 'bg-[#71C9CE] text-[#0F2647]',
    Adventure: 'bg-[#0F2647] text-[#CBF1F5]',
    Food: 'bg-[#5FB4BA] text-white',
    Heritage: 'bg-[#254d7a] text-[#CBF1F5]',
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
        <title>Da Nang Tours — Golden Bridge, Hoi An & Street Food Experiences</title>
        <meta
          name="description"
          content="Local-led tours in Da Nang, Vietnam. Golden Bridge, Hoi An lanterns, street food, and My Son Sanctuary — from $30 per person."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* ── Navigation ── */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm fixed w-full z-30 top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <span className="font-display text-xl md:text-2xl font-bold theme-logo">
              Da Nang Tours
            </span>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-8">
              {['home', 'tours', 'about', 'contact'].map(link => (
                <a
                  key={link}
                  href={`#${link}`}
                  className="text-gray-600 theme-nav-link font-medium transition text-sm capitalize"
                >
                  {link}
                </a>
              ))}
              <a
                href="#booking"
                className="bg-[#1B3A5C] hover:bg-[#0F2647] text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition duration-200 shadow-sm"
              >
                Book Now
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
              {['home', 'tours', 'about', 'contact'].map(link => (
                <a
                  key={link}
                  href={`#${link}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-gray-700 font-medium py-2.5 capitalize text-sm"
                >
                  {link}
                </a>
              ))}
              <a
                href="#booking"
                onClick={() => setIsMenuOpen(false)}
                className="block bg-[#1B3A5C] text-white px-4 py-3 rounded-lg font-semibold text-center text-sm mt-3"
              >
                Book Now
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
            DA NANG
          </span>
        </div>

        {/* Cyan accent line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#71C9CE] to-transparent opacity-50" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-28 pb-20">
          <div className="inline-block bg-[#71C9CE]/15 border border-[#71C9CE]/30 text-[#A6E3E9] text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8">
            Local-led · All-inclusive · Since 2022
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]">
            Golden Bridge at sunrise.{' '}
            <span className="text-[#71C9CE]">Hoi An lanterns</span> at dusk.
          </h1>

          <p className="text-base md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Beach, mountains, and a 15th-century ancient town — all within 30 minutes of each other.
            We'll show you all three.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#tours"
              className="bg-[#71C9CE] hover:bg-[#5FB4BA] text-[#0F2647] px-8 py-4 rounded-lg font-bold text-sm md:text-base transition duration-200 shadow-xl"
            >
              Explore Tours
            </a>
            <a
              href="#booking"
              className="border border-white/25 hover:border-white/50 text-white px-8 py-4 rounded-lg font-bold text-sm md:text-base transition duration-200"
            >
              Plan My Trip →
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
              <span className="text-yellow-400 text-sm tracking-tight">★★★★★</span>
              <span className="font-semibold text-gray-800">4.9</span>
              <span>Google Reviews</span>
            </div>
            <span className="hidden sm:block text-gray-200">|</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-800">5,000+</span>
              <span>Happy Travelers</span>
            </div>
            <span className="hidden sm:block text-gray-200">|</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-800">5</span>
              <span>Signature Tours</span>
            </div>
            <span className="hidden sm:block text-gray-200">|</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-800">4+</span>
              <span>Years Experience</span>
            </div>
            <span className="hidden sm:block text-gray-200">|</span>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#71C9CE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>VNAT Licensed</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Why Section ── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-[#71C9CE] font-semibold text-xs uppercase tracking-widest mb-3">Why Da Nang</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-gray-900 max-w-lg leading-tight">
              Three worlds, thirty minutes apart
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

      {/* ── Tours ── */}
      <section id="tours" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-[#71C9CE] font-semibold text-xs uppercase tracking-widest mb-3">Our Tours</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-gray-900 max-w-xl leading-tight">
              Five experiences worth flying here for
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tours.map((tour, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Thin colour bar */}
                <div className={`bg-gradient-to-r ${cardAccent[i]} h-1.5`} />

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 ${categoryStyle[tour.category]}`}>
                      {tour.category}
                    </span>
                    <span className="text-xl font-bold text-gray-900 font-display leading-none whitespace-nowrap">
                      ${tour.price}
                      <span className="text-xs font-normal text-gray-400">/pp</span>
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-gray-900 mb-2 leading-snug">{tour.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 flex-1 leading-relaxed">{tour.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <p className="text-xs text-gray-400">
                      <span className="text-gray-600 font-medium">{tour.duration}</span>
                      {' · '}{tour.highlight}
                    </p>
                    <a
                      href="#booking"
                      className="text-xs font-semibold text-[#1B3A5C] hover:text-[#71C9CE] transition-colors"
                    >
                      Book →
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {/* Custom CTA card */}
            <div className="bg-[#0F2647] rounded-2xl p-5 flex flex-col justify-between text-white sm:col-span-2 lg:col-span-1">
              <div>
                <p className="text-[#71C9CE] text-xs font-bold uppercase tracking-widest mb-3">Custom</p>
                <h3 className="font-display text-xl font-bold mb-3 leading-tight">
                  Can't decide?<br />We'll build your itinerary.
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Tell us your dates and interests — we'll send a free plan within 24 hours.
                </p>
              </div>
              <a
                href="#booking"
                className="mt-6 inline-block bg-[#71C9CE] hover:bg-[#5FB4BA] text-[#0F2647] font-bold py-3 px-5 rounded-lg text-sm transition duration-200 text-center"
              >
                Get a free plan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-Day Itinerary — dark navy ── */}
      <section className="py-20 md:py-28 bg-[#0F2647]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-[#71C9CE] font-semibold text-xs uppercase tracking-widest mb-3">Sample Itinerary</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white max-w-xl leading-tight">
              3 perfect days in Da Nang
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {itinerary.map((d, i) => (
              <div
                key={i}
                className="border border-white/10 rounded-2xl p-6 md:p-7 hover:border-[#71C9CE]/40 transition-colors duration-300"
              >
                <div className="font-display text-6xl font-bold text-white  leading-none mb-5 select-none">
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

      {/* ── Reviews ── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-[#71C9CE] font-semibold text-xs uppercase tracking-widest mb-3">Reviews</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-gray-900 max-w-xl leading-tight">
              From the people who've been there
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 md:p-7 flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
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
                    {t.tour}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Booking Form ── */}
      <section id="booking" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-12">
            <div className="mb-8">
              <p className="text-[#71C9CE] font-semibold text-xs uppercase tracking-widest mb-3">Free Quote</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3">
                Plan your trip — we'll handle the rest
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Tell us when you're arriving and what you'd like to do. We'll send a personalised itinerary within 24 hours, no charge.
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
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#71C9CE] focus:border-[#71C9CE] outline-none text-sm transition"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Travel Dates</label>
                  <input
                    type="date"
                    name="travelDate"
                    value={formData.travelDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#71C9CE] focus:border-[#71C9CE] outline-none text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Guests</label>
                  <select
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#71C9CE] focus:border-[#71C9CE] outline-none text-sm transition"
                  >
                    <option>1 Guest</option>
                    <option>2 Guests</option>
                    <option>3-5 Guests</option>
                    <option>6+ Guests</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Tour Interest</label>
                <select
                  name="tourInterest"
                  value={formData.tourInterest}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#71C9CE] focus:border-[#71C9CE] outline-none text-sm transition"
                >
                  <option value="">Select a tour...</option>
                  <option>Ba Na Hills & Golden Bridge</option>
                  <option>Hoi An Lantern Night</option>
                  <option>Marble Mountain Adventure</option>
                  <option>Street Food Tour</option>
                  <option>My Son Sanctuary</option>
                  <option>Custom Package</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#71C9CE] focus:border-[#71C9CE] outline-none text-sm transition resize-none"
                  placeholder="Tell us about your travel preferences..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="personalized"
                  name="personalized"
                  checked={formData.personalized}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 accent-[#71C9CE]"
                />
                <label htmlFor="personalized" className="text-sm text-gray-600">
                  I'd like a fully personalised itinerary
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1B3A5C] hover:bg-[#0F2647] disabled:opacity-60 text-white font-bold py-4 px-8 rounded-lg text-sm transition duration-200 shadow-sm mt-2"
              >
                {isSubmitting ? 'Sending...' : 'Get My Free Quote →'}
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
              <p className="text-[#71C9CE] font-semibold text-xs uppercase tracking-widest mb-3">About Us</p>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Da Nang locals, not tour operators
              </h2>
              <p className="text-gray-600 mb-5 leading-relaxed text-sm md:text-base">
                We grew up here. We eat at the spots we take you to. We know which viewpoint is empty at 6am and which
                market stall has been making Bánh Mì since 1985.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed text-sm md:text-base">
                Every guide on our team is a certified Da Nang local — fluent in English, passionate about their city,
                and genuinely invested in making your trip memorable.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { val: '5,000+', label: 'Happy Travelers' },
                  { val: '4.9★', label: 'Average Rating' },
                  { val: '10+', label: 'Years Experience' },
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
                  VNAT Tourism License
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#71C9CE]" />
                  Certified Local Guides
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
                <span className="text-2xl">🌟</span>
                <div>
                  <p className="text-xs text-gray-400 leading-none mb-0.5">TripAdvisor</p>
                  <p className="font-bold text-gray-900 text-sm leading-none">Travelers' Choice</p>
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
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Before you book</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Do I need a visa to visit Vietnam?',
                a: 'Most travelers from Asia, Australia, and New Zealand can get a visa on arrival or e-visa. Check with your local Vietnamese embassy for specific requirements.',
              },
              {
                q: "What's the best time to visit Da Nang?",
                a: 'February to May offers the best weather with warm temperatures and minimal rain. However, Da Nang is beautiful year-round.',
              },
              {
                q: 'Is English widely spoken?',
                a: 'In tourist areas and with our guides, yes. All our tours are led by fluent English-speaking locals.',
              },
              {
                q: 'What currency should I bring?',
                a: 'Vietnamese Dong (VND) is the local currency, but USD is widely accepted. ATMs are readily available throughout the city.',
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
              <h3 className="font-display text-lg font-bold mb-3 text-[#71C9CE]">Da Nang Tours</h3>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Local-led tours and authentic Vietnamese experiences since 2014.
              </p>
              <div className="flex space-x-2.5">
                {[
                  /* Instagram */
                  <path key="ig" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />,
                  /* TikTok */
                  <path key="tt" d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />,
                  /* YouTube */
                  <path key="yt" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />,
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
                {[['#home', 'Home'], ['#tours', 'Tours'], ['#about', 'About'], ['#booking', 'Book a Tour']].map(([href, label]) => (
                  <li key={href}>
                    <a href={href} className="text-gray-400 hover:text-white text-sm transition">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-xs uppercase tracking-wider mb-4 text-gray-300">Support</h4>
              <ul className="space-y-2.5">
                {['FAQ', 'Privacy Policy', 'Terms of Service', 'Cancellation Policy'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white text-sm transition">{item}</a>
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
            <p>© 2025 Da Nang Tours. All rights reserved.</p>
            <p>Made with ♥ in Vietnam</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default DaNangLandingPage;
