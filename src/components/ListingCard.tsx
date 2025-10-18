import React from 'react';
import { MapPin, Star, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  onViewDetails: (listing: Listing) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onViewDetails }) => {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(88, 166, 255, 0.1), 0 4px 6px -2px rgba(88, 166, 255, 0.05)' }}
      onClick={() => onViewDetails(listing)}
      className="bg-surface rounded-xl overflow-hidden border border-border h-full flex flex-col cursor-pointer transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={listing.image}
          alt={listing.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 bg-background/70 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1 border border-border">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium text-foreground-default">{listing.rating}</span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-2 text-foreground-default">{listing.name}</h3>
        <p className="text-foreground-muted text-sm mb-4 line-clamp-2 flex-grow">
          {listing.description}
        </p>

        <div className="flex items-center text-foreground-muted text-sm mb-4">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{listing.location}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center">
            <IndianRupee className="w-5 h-5 text-green-400" />
            <span className="text-xl font-bold text-foreground-default">
              {listing.price.toLocaleString('en-IN')}
            </span>
            <span className="text-foreground-muted text-sm ml-1">/month</span>
          </div>
          <span className="text-sm font-medium text-primary">View Details</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ListingCard;
