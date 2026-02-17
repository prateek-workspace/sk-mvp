import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Ban, AlertTriangle, Info } from 'lucide-react';
import SEO from '../components/SEO';

const RefundPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Refund & Cancellation Policy | SkStudentPath Kanpur"
        description="Read our refund and cancellation policy. SkStudentPath has a strict no-refund policy for all bookings and transactions."
        keywords="refund policy, cancellation policy, no refund, SkStudentPath policy"
        canonical="https://skstudentpath.com/refund-policy"
        noindex={false}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Ban className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground-default">Refund & Cancellation Policy</h1>
          </div>
          
          <p className="text-foreground-muted mb-8">Last updated: February 17, 2026</p>
          
          {/* Important Notice Banner */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Strict No-Refund Policy</h2>
                <p className="text-red-600 dark:text-red-300">
                  SkStudentPath maintains a <strong>strict no-refund policy</strong> for all bookings, transactions, and payments made through our platform. All sales are final. Please read this policy carefully before making any booking.
                </p>
              </div>
            </div>
          </div>
          
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground-default mb-4">1. Policy Overview</h2>
              <p className="text-foreground-muted leading-relaxed">
                At SkStudentPath, we connect students in Kanpur with various service providers including coaching centers, PG accommodations, hostels, libraries, and tiffin services. Due to the nature of our platform and the services offered, we maintain a strict no-refund policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground-default mb-4">2. No Refunds</h2>
              <p className="text-foreground-muted leading-relaxed mb-4">
                <strong>All payments made through SkStudentPath are non-refundable.</strong> This includes but is not limited to:
              </p>
              <ul className="list-disc pl-6 text-foreground-muted space-y-2">
                <li>Booking fees for PG accommodations and hostels</li>
                <li>Registration fees for coaching centers</li>
                <li>Subscription fees for library services</li>
                <li>Advance payments for tiffin services</li>
                <li>Any platform fees or service charges</li>
                <li>Security deposits (handled directly with service providers)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground-default mb-4">3. No Cancellations</h2>
              <p className="text-foreground-muted leading-relaxed">
                Once a booking is confirmed and payment is processed, <strong>cancellations are not permitted</strong>. We strongly encourage users to:
              </p>
              <ul className="list-disc pl-6 text-foreground-muted space-y-2 mt-4">
                <li>Visit the service provider's location physically before booking</li>
                <li>Verify all details, amenities, and terms directly with the service provider</li>
                <li>Read all listing descriptions and reviews carefully</li>
                <li>Ask questions through our platform before confirming a booking</li>
                <li>Understand the service provider's own terms and conditions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground-default mb-4">4. Why No Refunds?</h2>
              <p className="text-foreground-muted leading-relaxed mb-4">
                Our no-refund policy exists because:
              </p>
              <ul className="list-disc pl-6 text-foreground-muted space-y-2">
                <li>Service providers reserve capacity based on confirmed bookings</li>
                <li>Cancellations cause financial loss to small business owners in Kanpur</li>
                <li>Platform fees cover operational costs incurred at the time of booking</li>
                <li>It ensures commitment from both students and service providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground-default mb-4">5. Exceptional Circumstances</h2>
              <p className="text-foreground-muted leading-relaxed">
                In extremely rare and exceptional circumstances (such as duplicate payments due to technical errors), we may review cases on an individual basis. Such reviews are at our sole discretion and do not guarantee any refund. To request a review, contact us within 24 hours of the transaction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground-default mb-4">6. Service Provider Disputes</h2>
              <p className="text-foreground-muted leading-relaxed">
                Any disputes regarding the quality of service must be resolved directly with the service provider. SkStudentPath acts as a platform to connect students with service providers and is not responsible for the quality, safety, or legality of the services provided.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground-default mb-4">7. Recommendations</h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-700 dark:text-blue-300">
                    <strong>Before booking:</strong> We highly recommend visiting the coaching center, PG, hostel, or other facility in person, meeting with the service provider, and confirming all details before making any payment through our platform.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground-default mb-4">8. Agreement</h2>
              <p className="text-foreground-muted leading-relaxed">
                By using SkStudentPath and making any booking or payment, you acknowledge that you have read, understood, and agree to this Refund & Cancellation Policy. If you do not agree with this policy, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground-default mb-4">9. Contact Us</h2>
              <p className="text-foreground-muted leading-relaxed">
                For any questions regarding this policy, please contact us:
              </p>
              <div className="mt-4 p-4 bg-surface rounded-lg border border-border">
                <p className="text-foreground-default font-semibold">SkStudentPath</p>
                <p className="text-foreground-muted">Email: info@skstudentpath.com</p>
                <p className="text-foreground-muted">Location: Kanpur, Uttar Pradesh, India</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
