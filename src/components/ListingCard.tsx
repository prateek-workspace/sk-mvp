import React from 'react';
import { MapPin, Star, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  onViewDetails: (listing: Listing) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onViewDetails }) => {
  const owner = {
    name: "Owner Name",
    avatar: `https://i.pravatar.cc/150?u=${listing.ownerId}`
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={() => onViewDetails(listing)}
      className="cursor-pointer group h-full flex flex-col bg-background border border-border rounded-xl overflow-hidden shadow-subtle hover:shadow-md-deep transition-shadow duration-300"
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <img
          src={listing.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={listing.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 bg-black/40 p-2 rounded-full text-white hover:text-primary transition-colors">
            <Heart className="w-5 h-5" />
        </div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent w-full p-4">
            <p className="text-white font-bold text-lg">
                ₹{listing.price.toLocaleString('en-IN')} <span className="font-normal text-sm">/month</span>
            </p>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-foreground-default pr-2 mb-1">{listing.name}</h3>
        <div className="flex items-center space-x-1 text-sm text-foreground-muted mb-3">
            <MapPin className="w-4 h-4" />
            <span>{listing.location}</span>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-foreground-muted border-t border-border pt-3 mt-auto">
            {listing.features.slice(0, 2).map((feature, i) => (
                <span key={i}>{feature}</span>
            ))}
        </div>
      </div>
      <div className="px-4 py-3 bg-surface border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
            <img src={owner.avatar} alt={owner.name} className="w-8 h-8 rounded-full" />
            <div>
                <p className="text-sm font-semibold text-foreground-default">{owner.name}</p>
                <p className="text-xs text-foreground-muted">Property Seller</p>
            </div>
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-bold text-foreground-default">{listing.rating}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ListingCard;
