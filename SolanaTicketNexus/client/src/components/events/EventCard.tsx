import { Link } from 'wouter';
import { Event, formatEventDate } from '../../lib/mock-data';

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <div className="ticket-card bg-dark-light rounded-xl overflow-hidden border border-dark-lighter hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="h-48 overflow-hidden relative">
        <img 
          src={event.imageSrc} 
          className="w-full h-full object-cover" 
          alt={event.title} 
        />
        {event.verified && (
          <div className="absolute top-3 right-3 bg-dark-light px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <span className="material-icons text-secondary text-sm mr-1">verified</span>
            Verified Event
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{event.title}</h3>
          <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
            {event.category}
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-400 mb-3">
          <span className="material-icons text-xs mr-1">calendar_today</span>
          <span>{formatEventDate(event.date)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-400 mb-4">
          <span className="material-icons text-xs mr-1">location_on</span>
          <span>{event.location}</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-400">Starting at</div>
            <div className="font-mono font-bold">{event.ticketPrice} SOL</div>
          </div>
          <Link href={`/events/${event.id}`}>
            <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Buy Tickets
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
