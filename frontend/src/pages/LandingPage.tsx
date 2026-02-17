import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Home,
  Coffee,
  Library,
  Search,
  Send,
  Star,
  Mail,
  MapPin,
  Quote
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import ListingDetailsModal from '../components/ListingDetailsModal';
import BookingModal from '../components/BookingModal';
import FloatingElements from '../components/FloatingElements';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ListingsService } from '../services/listings.service';

import SEO from '../components/SEO';


const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [, setLoading] = useState(true);
  const [listingToBook, setListingToBook] = useState<Listing | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await ListingsService.getListings();
      setListings(data || []);
    } catch (error: any) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (listing: Listing) => {
    setSelectedListing(listing);
  };

  const handleBookNow = (listing: Listing) => {
    if (!user) {
      toast.error('Please log in to make a booking.');
      navigate('/login');
      return;
    }
    if (user.role !== 'user') {
      toast.error('Only students can make bookings.');
      return;
    }

    setSelectedListing(null);
    setListingToBook(listing);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setListingToBook(null);
    fetchListings();
    navigate(`/dashboard/${user?.role || 'user'}/bookings`);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you for your message! We'll get back to you soon.");
    (e.target as HTMLFormElement).reset();
  };

  const categories = [
    { id: 'coaching' as const, icon: BookOpen, title: 'Coaching Centers' },
    { id: 'pg' as const, icon: Home, title: 'Hostels & PG' },
    { id: 'library' as const, icon: Library, title: 'Libraries' },
    { id: 'tiffin' as const, icon: Coffee, title: 'Tiffin Services' },
  ];

  const metrics = [
    { value: `${listings.length}+`, label: 'Services in Kanpur' },
    { value: '2000+', label: 'Active Students' },
    { value: '#1', label: 'Platform in Kanpur' },
  ];

  const landingPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Student Prep Hub Kanpur",
    "url": "https://skstudentpath.com/",
    "description": "Kanpur's #1 platform for student services - find and book coaching centers, PG accommodations, hostels, tiffin services, and libraries near IIT Kanpur, CSJM University, HBTU.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://skstudentpath.com/listings?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "areaServed": {
      "@type": "City",
      "name": "Kanpur",
      "containedInPlace": {
        "@type": "State",
        "name": "Uttar Pradesh"
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Student Prep Hub Kanpur | #1 Platform for Coaching, PG, Hostels, Libraries & Tiffin in Kanpur"
        description="Kanpur's most trusted student platform. Find verified coaching centers near Kidwai Nagar, PG in Kakadeo, hostels near IIT Kanpur, libraries in Civil Lines & tiffin services. List your services or discover the best student facilities in Kanpur, UP."
        keywords="coaching centers Kanpur, PG in Kanpur, hostels near IIT Kanpur, tiffin services Kanpur, libraries Kanpur, student accommodation Kanpur, PG near CSJM University, coaching Kidwai Nagar, PG Kakadeo, hostels Kalyanpur, best coaching Kanpur, affordable PG Kanpur, list PG Kanpur, register coaching center Kanpur"
        canonical="https://skstudentpath.com/"
        ogImage="https://skstudentpath.com/og-image-kanpur.jpg"
        schemaMarkup={landingPageSchema}
      />
      <Navbar />
      <ListingDetailsModal listing={selectedListing} onClose={() => setSelectedListing(null)} onBook={handleBookNow} />
      {showBookingModal && listingToBook && (
        <BookingModal
          listing={listingToBook}
          onClose={() => {
            setShowBookingModal(false);
            setListingToBook(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen bg-cover bg-center hero-bg-light dark:hero-bg-dark">
          <FloatingElements />
          <div className="relative z-10 flex flex-col items-center justify-end text-center text-foreground-default px-4 min-h-screen pb-24">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight"
            >
              Kanpur's <span className="text-primary">#1</span> Student Hub
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-foreground-muted mb-8 max-w-2xl"
            >
              Find & book verified coaching centers, PGs, hostels, libraries & tiffin services in Kanpur.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-2xl bg-background p-4 rounded-xl shadow-lg border border-border"
            >
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                  <input type="text" placeholder="Search for coachings, PGs, tiffins..." className="w-full h-14 pl-12 pr-4 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full md:w-auto h-14 px-8 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                >
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </motion.button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 w-full max-w-3xl grid grid-cols-3 gap-8 text-center"
            >
              {metrics.map((metric, idx) => (
                <div key={idx}>
                  <p className="text-3xl md:text-4xl font-bold text-primary">{metric.value}</p>
                  <p className="text-sm md:text-base text-foreground-muted mt-1">{metric.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Dynamic Category Sections */}
        {categories.map((category, index) => {
          const listingsForCategory = listings.filter(l => l.type === category.id).slice(0, 3);
          if (listingsForCategory.length === 0) return null;

          return (
            <section key={category.id} id={index === 0 ? 'categories' : undefined} className={`py-24 ${index % 2 !== 0 ? 'bg-surface' : 'bg-background'}`}>
              <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-4 text-foreground-default">Explore Top {category.title}</h2>
                <p className="text-center text-foreground-muted mb-12">Handpicked selections for you.</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {listingsForCategory.map((listing, idx) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05, duration: 0.5 }}
                    >
                      <ListingCard listing={listing} onViewDetails={handleViewDetails} />
                    </motion.div>
                  ))}
                </div>
                <div className="text-center mt-16">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                    <Link
                      to={`/listings?category=${category.id}`}
                      className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors shadow-lg shadow-primary/30"
                    >
                      View More {category.title}
                    </Link>
                  </motion.div>
                </div>
              </div>
            </section>
          );
        })}

        {/* About Us Section */}
        <section id="about" className="py-24 bg-surface">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-foreground-default mb-4">About SkStudentPath Kanpur</h2>
              <p className="text-foreground-muted mb-4">
                SkStudentPath is Kanpur's premier platform for students. Whether you're preparing for IIT-JEE, NEET, UPSC, or studying at CSJM University, HBTU, or IIT Kanpur — we help you find the best coaching, accommodation, and services.
              </p>
              <p className="text-foreground-muted">
                We connect students in Kanpur, Uttar Pradesh with verified service providers. From coaching centers in Kidwai Nagar to PGs in Kakadeo and libraries in Civil Lines — we make student life easier. Service providers can also list their facilities to reach thousands of students.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="aspect-video rounded-xl overflow-hidden shadow-lg"
            >
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" alt="Team working" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 bg-background">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-4 text-foreground-default">What Students Say About Us</h2>
            <p className="text-center text-foreground-muted mb-12 max-w-2xl mx-auto">Real experiences from students who found their perfect services through SkStudentPath in Kanpur.</p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Rahul Sharma",
                  role: "IIT-JEE Aspirant",
                  location: "Kidwai Nagar, Kanpur",
                  image: "https://i.pravatar.cc/150?img=11",
                  rating: 5,
                  text: "Found an amazing coaching center through SkStudentPath. The platform made it so easy to compare different options in Kanpur. Highly recommended for serious JEE aspirants!"
                },
                {
                  name: "Priya Verma",
                  role: "CSJM University Student",
                  location: "Kakadeo, Kanpur",
                  image: "https://i.pravatar.cc/150?img=5",
                  rating: 5,
                  text: "I was new to Kanpur and needed a safe PG near my college. SkStudentPath helped me find a verified PG with all amenities. The booking process was smooth and transparent."
                },
                {
                  name: "Amit Kumar",
                  role: "NEET Aspirant",
                  location: "Govind Nagar, Kanpur",
                  image: "https://i.pravatar.cc/150?img=12",
                  rating: 5,
                  text: "The tiffin service I found here is excellent! Homely food at affordable prices. Also using their library listing feature - found a great study space near my coaching."
                }
              ].map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="bg-surface p-6 rounded-xl border border-border shadow-subtle hover:shadow-md-deep transition-shadow"
                >
                  <Quote className="w-8 h-8 text-primary/30 mb-4" />
                  <p className="text-foreground-muted mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-foreground-default">{testimonial.name}</p>
                      <p className="text-sm text-foreground-muted">{testimonial.role}</p>
                      <p className="text-xs text-foreground-muted flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {testimonial.location}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-surface">
          <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground-default mb-4">Get In Touch</h2>
            <p className="text-foreground-muted mb-12">Have questions or feedback? We'd love to hear from you.</p>
            <motion.form
              onSubmit={handleContactSubmit}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-background p-8 rounded-xl border border-border shadow-lg space-y-6 text-left"
            >
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground-muted">Full Name</label>
                  <input type="text" placeholder="John Doe" required className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground-muted">Email Address</label>
                  <input type="email" placeholder="you@example.com" required className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground-muted">Message</label>
                <textarea placeholder="Your message..." rows={5} required className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
              </div>
              <div className="text-right">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors flex items-center gap-2 shadow-lg shadow-primary/30 inline-flex"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </motion.button>
              </div>
            </motion.form>
          </div>
        </section>


        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8"
          >
            <div className="grid md:grid-cols-12 gap-8">
              <div className="md:col-span-3">
                <h3 className="text-xl font-bold text-white mb-4">SkStudentPath</h3>
                <p className="text-sm mb-4">Kanpur's #1 student services platform. Find coaching, PG, hostels, libraries & tiffin near IIT Kanpur, CSJM University, HBTU. Also list your services to reach 2000+ students.</p>
                <div className="space-y-2 mt-4">
                  <a href="mailto:info@skstudentpath.com" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                    <Mail className="w-4 h-4" />
                    info@skstudentpath.com
                  </a>
                  <p className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    Kanpur, Uttar Pradesh, India
                  </p>
                </div>
              </div>
              <div className="md:col-span-2">
                <h4 className="font-semibold text-white mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li>
                  <li><a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a></li>
                  <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
                  <li><a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Sitemap</a></li>
                </ul>
              </div>
              <div className="md:col-span-2">
                <h4 className="font-semibold text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link></li>
                </ul>
              </div>
              <div className="md:col-span-2">
                <h4 className="font-semibold text-white mb-4">Popular Areas</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/listings?location=kakadeo" className="hover:text-primary transition-colors">Kakadeo</Link></li>
                  <li><Link to="/listings?location=kidwai-nagar" className="hover:text-primary transition-colors">Kidwai Nagar</Link></li>
                  <li><Link to="/listings?location=kalyanpur" className="hover:text-primary transition-colors">Kalyanpur</Link></li>
                  <li><Link to="/listings?location=govind-nagar" className="hover:text-primary transition-colors">Govind Nagar</Link></li>
                  <li><Link to="/listings?location=civil-lines" className="hover:text-primary transition-colors">Civil Lines</Link></li>
                </ul>
              </div>
              <div className="md:col-span-3">
                <h4 className="font-semibold text-white mb-4">Categories</h4>
                <ul className="grid grid-cols-1 gap-2 text-sm mb-4">
                  <li><Link to="/listings?category=coaching" className="hover:text-primary transition-colors">Coaching Centers in Kanpur</Link></li>
                  <li><Link to="/listings?category=pg" className="hover:text-primary transition-colors">PG & Hostels in Kanpur</Link></li>
                  <li><Link to="/listings?category=library" className="hover:text-primary transition-colors">Libraries in Kanpur</Link></li>
                  <li><Link to="/listings?category=tiffin" className="hover:text-primary transition-colors">Tiffin Services in Kanpur</Link></li>
                </ul>
                <h4 className="font-semibold text-white mb-3">Newsletter</h4>
                <div className="flex gap-2">
                  <input type="email" placeholder="Your email" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                  <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 text-sm">Subscribe</button>
                </div>
              </div>
            </div>
            <div className="mt-12 border-t border-gray-700 pt-8 text-center text-sm">
              <p>© 2026 SkStudentPath. All rights reserved. Designed with ❤️ in Kanpur by <strong>Prateek Srivastava</strong>.</p>
            </div>
          </motion.div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
