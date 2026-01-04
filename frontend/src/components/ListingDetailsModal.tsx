import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Star, CheckCircle } from 'lucide-react';
import { Listing } from '../types';

interface ListingDetailsModalProps {
  listing: Listing | null;
  onClose: () => void;
  onBook: (listing: Listing) => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center">
    <Star className="w-4 h-4 text-yellow-500 fill-yellow-400 mr-1" />
    <span className="text-foreground-default font-semibold">{rating.toFixed(1)}</span>
  </div>
);

const ListingDetailsModal: React.FC<ListingDetailsModalProps> = ({ listing, onClose, onBook }) => {
  if (!listing) return null;

  return (
    <AnimatePresence>
      {listing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-background rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          >
            <div className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-semibold">{listing.name}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface transition-colors"
              >
                <X className="w-5 h-5 text-foreground-muted" />
              </button>
            </div>

            <div className="overflow-y-auto flex-grow">
              <div className="h-72 w-full">
                <img src={listing.image_url || listing.image || 'https://via.placeholder.com/800x400'} alt={listing.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="p-8 grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-4 mb-4 text-foreground-muted">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{listing.location}</span>
                    </div>
                    <StarRating rating={listing.rating} />
                  </div>
                  <p className="text-foreground-muted mb-8">{listing.description}</p>

                  <div className="mb-8">
                    <h4 className="font-semibold text-lg text-foreground-default mb-4 pb-2 border-b border-border">Features</h4>
                    <ul className="grid grid-cols-2 gap-3">
                      {(listing.features || []).map((feature, i) => (
                        <li key={i} className="flex items-center text-sm text-foreground-default">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {listing.type === 'coaching' && listing.faculty && listing.faculty.length > 0 && (
                    <div className="mb-8">
                      <h4 className="font-semibold text-lg text-foreground-default mb-6 pb-2 border-b border-border">Meet The Faculty</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listing.faculty.map((teacher, i) => (
                          <div key={i} className="text-center flex flex-col items-center">
                            <img src={teacher.image} alt={teacher.name} className="w-24 h-24 rounded-full mx-auto mb-3 object-cover shadow-md border-2 border-surface" />
                            <p className="font-semibold text-foreground-default">{teacher.name}</p>
                            <p className="text-sm text-primary font-medium">{teacher.subject}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-lg text-foreground-default mb-4 pb-2 border-b border-border">Reviews ({(listing.reviews || []).length})</h4>
                    {(listing.reviews || []).length > 0 ? (
                      <div className="space-y-6">
                        {(listing.reviews || []).map(review => (
                          <div key={review.id} className="flex items-start space-x-4">
                            <img src={review.avatar} alt={review.author} className="w-11 h-11 rounded-full" />
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-semibold text-foreground-default">{review.author}</p>
                                <span className="text-foreground-muted">·</span>
                                <StarRating rating={review.rating} />
                              </div>
                              <p className="text-sm text-foreground-muted">{review.comment}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-foreground-muted">No reviews yet.</p>
                    )}
                  </div>
                </div>

                <div className="md:col-span-1">
                  <div className="sticky top-8 border border-border rounded-xl p-6 shadow-lg bg-surface">
                    <div className="flex items-baseline mb-6">
                      <span className="text-3xl font-bold text-foreground-default">
                        ₹{listing.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-foreground-muted ml-1">/ month</span>
                    </div>
                    <button
                      onClick={() => onBook(listing)}
                      className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                    >
                      Book Slot
                    </button>
                    <p className="text-xs text-foreground-muted text-center mt-3">Complete payment after booking</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ListingDetailsModal;
