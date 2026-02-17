import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import SEO from '../components/SEO';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy | SkStudentPath Kanpur"
        description="Read our privacy policy to understand how SkStudentPath collects, uses, and protects your personal information."
        keywords="privacy policy, data protection, SkStudentPath privacy, student data security"
        canonical="https://skstudentpath.com/privacy-policy"
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
            <Shield className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground-default">Privacy Policy</h1>
          </div>
          
          <p className="text-foreground-muted mb-8">Last updated: February 17, 2026</p>
          
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground-default mb-4">1. Introduction</h2>
              <p className="text-foreground-muted leading-relaxed">
                Welcome to SkStudentPath ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website skstudentpath.com and use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground-default mb-4">2. Information We Collect</h2>
              <p className="text-foreground-muted leading-relaxed mb-4">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 text-foreground-muted space-y-2">
                <li>Personal identification information (name, email address, phone number)</li>
                <li>Account credentials (username, password)</li>
                <li>Profile information (profile picture, bio)</li>
                <li>Booking and transaction details</li>
                <li>Communication data (messages, feedback, support requests)</li>
                <li>Location data (Kanpur and nearby areas)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground-default mb-4">3. How We Use Your Information</h2>
              <p className="text-foreground-muted leading-relaxed mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-foreground-muted space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process bookings and transactions</li>
                <li>Send you service-related notifications</li>
                <li>Respond to your comments and questions</li>
                <li>Connect students with service providers in Kanpur</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground-default mb-4">4. Information Sharing</h2>
              <p className="text-foreground-muted leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-foreground-muted space-y-2 mt-4">
                <li>With service providers to facilitate bookings (e.g., sharing your contact with a PG owner after booking)</li>
                <li>To comply with legal requirements or respond to lawful requests</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>With your consent or at your direction</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground-default mb-4">5. Data Security</h2>
              <p className="text-foreground-muted leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground-default mb-4">6. Your Rights</h2>
              <p className="text-foreground-muted leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-foreground-muted space-y-2">
                <li>Access, update, or delete your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your data</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground-default mb-4">7. Cookies</h2>
              <p className="text-foreground-muted leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground-default mb-4">8. Changes to This Policy</h2>
              <p className="text-foreground-muted leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground-default mb-4">9. Contact Us</h2>
              <p className="text-foreground-muted leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
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

export default PrivacyPolicyPage;
