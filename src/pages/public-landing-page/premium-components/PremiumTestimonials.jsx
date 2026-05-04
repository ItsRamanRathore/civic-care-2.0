import React from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, MapPin } from 'lucide-react';

const testimonials = [
  {
    author: 'Sarah Jenkins',
    role: 'Neighborhood Watch Lead',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    quote: "The AI categorization feature meant my request was routed to the exact department immediately. What used to take weeks of phone calls was resolved in just 3 days.",
    location: 'Ward 12'
  },
  {
    author: 'Marcus Chen',
    role: 'Local Business Owner',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    quote: "Transparency is incredible. I can see exactly when city workers acknowledge an issue outside my storefront, and the predictive ETA is shockingly accurate.",
    location: 'Downtown District',
    highlight: true
  },
  {
    author: 'Elena Rodriguez',
    role: 'Daily Commuter',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
    quote: "Snapping a photo of a pothole and hitting submit knowing it goes straight into their backend system gives me a massive sense of civic relief.",
    location: 'Westside'
  }
];

const PremiumTestimonials = () => {
  return (
    <section className="py-32 bg-stone-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-[0.03] pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-10 relative z-10">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full text-orange-600 text-[10px] font-black tracking-widest uppercase mb-6">
            <MessageCircle size={14} />
            Citizen Voices
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">
            Trusted by the <span className="text-primary">Community</span>
          </h2>
          <p className="text-xl text-neutral-500 font-medium">
            See how real people are making an impact and improving their neighborhoods every single day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`rounded-[32px] p-10 border transition-all hover:-translate-y-2 shadow-xl relative overflow-hidden group ${
                t.highlight ? 'bg-primary text-primary-foreground border-primary/50' : 'bg-white text-neutral-900 border-neutral-100'
              }`}
            >
              {t.highlight && (
                <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl group-hover:blur-none transition-all duration-500">
                  <Star size={120} className="text-white" />
                </div>
              )}
              
              <div className="flex gap-1 mb-8 relative z-10">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} fill="currentColor" className={t.highlight ? 'text-yellow-400' : 'text-yellow-400'} />
                ))}
              </div>

              <p className={`text-lg font-bold leading-relaxed mb-10 relative z-10 ${t.highlight ? 'text-primary-foreground/90' : 'text-neutral-600'}`}>
                "{t.quote}"
              </p>

              <div className="flex items-center gap-4 mt-auto relative z-10">
                <img 
                  src={t.image} 
                  alt={t.author} 
                  className={`w-14 h-14 rounded-full object-cover border-2 ${t.highlight ? 'border-white/20' : 'border-neutral-100'}`} 
                />
                <div>
                  <h5 className="font-black tracking-tight">{t.author}</h5>
                  <div className={`text-xs font-bold flex items-center gap-1 ${t.highlight ? 'text-primary-foreground/70' : 'text-neutral-400'}`}>
                    <MapPin size={12} /> {t.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumTestimonials;
