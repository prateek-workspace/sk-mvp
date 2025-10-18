import React from 'react';
import { MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  onViewDetails: (listing: Listing) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onViewDetails }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onViewDetails(listing)}
      className="cursor-pointer group h-full flex flex-col"
    >
      <div className="relative w-full aspect-square overflow-hidden rounded-xl mb-3">
        <img
          src={listing.image}
          alt={listing.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-foreground-default pr-2">{listing.name}</h3>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-foreground-default">{listing.rating}</span>
          </div>
        </div>
        <p className="text-foreground-muted text-sm mt-1">{listing.location}</p>
        <p className="text-foreground-muted text-sm mt-1 flex-grow">{listing.description.substring(0, 50)}...</p>
        <div className="mt-2">
          <span className="font-semibold text-foreground-default">
            ₹{listing.price.toLocaleString('en-IN')}
          </span>
          <span className="text-foreground-muted text-sm"> / month</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ListingCard;
