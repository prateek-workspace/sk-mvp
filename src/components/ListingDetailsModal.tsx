import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Star, IndianRupee, CheckCircle } from 'lucide-react';
import { Listing } from '../types';

interface ListingDetailsModalProps {
  listing: Listing | null;
  onClose: () => void;
  onBook: (listing: Listing) => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
        }`}
      />
    ))}
    <span className="ml-2 text-foreground-default font-semibold">{rating.toFixed(1)}</span>
  </div>
);

const ListingDetailsModal: React.FC<ListingDetailsModalProps> = ({ listing, onClose, onBook }) => {
  if (!listing) return null;

  return (
    <AnimatePresence>
      {listing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-surface rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-border relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-background/50 rounded-full hover:bg-background transition-colors z-10"
            >
              <X className="w-5 h-5 text-foreground-muted" />
            </button>

            <div className="grid md:grid-cols-2">
              <div className="h-64 md:h-full">
                <img src={listing.image} alt={listing.name} className="w-full h-full object-cover md:rounded-l-xl" />
              </div>
              <div className="p-8">
                <h2 className="text-3xl font-bold mb-2 text-foreground-default">{listing.name}</h2>
                <div className="flex items-center space-x-4 mb-4 text-foreground-muted">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{listing.location}</span>
                  </div>
                  <StarRating rating={listing.rating} />
                </div>

                <p className="text-foreground-muted mb-6">{listing.description}</p>

                <div className="mb-6">
                  <h4 className="font-semibold text-foreground-default mb-3">Features</h4>
                  <ul className="grid grid-cols-2 gap-2">
                    {listing.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-foreground-muted">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-8">
                  <h4 className="font-semibold text-foreground-default mb-3">Reviews</h4>
                  {listing.reviews.length > 0 ? (
                    <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                      {listing.reviews.map(review => (
                        <div key={review.id} className="flex items-start space-x-3">
                          <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-semibold text-sm text-foreground-default">{review.author}</p>
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

                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <div>
                    <p className="text-sm text-foreground-muted">Price</p>
                    <div className="flex items-center">
                      <IndianRupee className="w-6 h-6 text-green-400" />
                      <span className="text-3xl font-bold text-foreground-default">
                        {listing.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-foreground-muted text-sm ml-1">/month</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onBook(listing)}
                    className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    Book Now
                  </button>
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
