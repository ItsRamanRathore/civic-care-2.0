import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TrustSignalsSection = () => {
  const governmentBadges = [
    {
      id: 1,
      name: 'Digital India Initiative',
      logo: 'https://images.pexels.com/photos/8849295/pexels-photo-8849295.jpeg?auto=compress&cs=tinysrgb&w=200&h=100',
      description: 'Certified under Digital India program'
    },
    {
      id: 2,
      name: 'Ministry of Electronics & IT',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=200&h=100&q=80',
      description: 'Approved by MeitY guidelines'
    },
    {
      id: 3,
      name: 'Smart Cities Mission',
      logo: 'https://images.pixabay.com/photo/2016/12/27/21/03/buildings-1934772_960_720.jpg',
      description: 'Part of Smart Cities initiative'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      role: 'Resident, Sector 15',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      content: `The pothole near my house was fixed within 3 days of reporting. The real-time updates kept me informed throughout the process. Excellent service!`,
      rating: 5
    },
    {
      id: 2,
      name: 'Priya Sharma',
      role: 'Community Leader, Downtown',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      content: `As a community leader, I've seen how this platform has transformed our neighborhood. Issues are resolved faster and there's complete transparency.`,
      rating: 5
    },
    {
      id: 3,
      name: 'Dr. Amit Patel',
      role: 'Municipal Councillor',
      avatar: 'https://randomuser.me/api/portraits/men/56.jpg',
      content: `This platform has revolutionized how we handle citizen complaints. The data analytics help us prioritize and allocate resources more effectively.`,
      rating: 5
    }
  ];

  const achievements = [
    {
      icon: 'Award',
      title: 'Best Civic App 2024',
      description: 'National Digital Governance Award'
    },
    {
      icon: 'Star',
      title: '4.8/5 Rating',
      description: 'Based on 10,000+ user reviews'
    },
    {
      icon: 'Shield',
      title: 'ISO 27001 Certified',
      description: 'Information security management'
    },
    {
      icon: 'CheckCircle',
      title: '99.9% Uptime',
      description: 'Reliable 24/7 service availability'
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={16}
        className={index < rating ? 'text-warning fill-current' : 'text-muted-foreground'}
      />
    ));
  };

  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Government Compliance Badges */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-text-primary mb-4">
            Trusted & Certified Platform
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
            Officially recognized and certified by government authorities for security, 
            compliance, and digital governance standards.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {governmentBadges?.map((badge) => (
              <div key={badge?.id} className="bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-modal transition-all duration-300">
                <div className="h-16 mb-4 flex items-center justify-center">
                  <Image
                    src={badge?.logo}
                    alt={badge?.name}
                    className="h-full w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">{badge?.name}</h3>
                <p className="text-sm text-muted-foreground">{badge?.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements?.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Icon name={achievement?.icon} size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">{achievement?.title}</h3>
                <p className="text-sm text-muted-foreground">{achievement?.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold font-heading text-text-primary mb-4">
              What Citizens Say
            </h3>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Real feedback from residents and officials who use our platform daily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials?.map((testimonial) => (
              <div key={testimonial?.id} className="bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-modal transition-all duration-300">
                <div className="flex items-center mb-4">
                  <Image
                    src={testimonial?.avatar}
                    alt={testimonial?.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-card-foreground">{testimonial?.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial?.role}</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {renderStars(testimonial?.rating)}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  "{testimonial?.content}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Privacy */}
        <div className="bg-muted/30 rounded-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold font-heading text-text-primary mb-4">
                Your Data is Safe & Secure
              </h3>
              <p className="text-muted-foreground mb-6">
                We follow strict data protection protocols and comply with all Indian 
                data privacy regulations. Your personal information is encrypted and 
                never shared with unauthorized parties.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Icon name="Lock" size={16} className="text-success" />
                  <span className="text-sm text-text-primary">End-to-end encryption for all data</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Shield" size={16} className="text-success" />
                  <span className="text-sm text-text-primary">GDPR and IT Act 2000 compliant</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="Eye" size={16} className="text-success" />
                  <span className="text-sm text-text-primary">Complete transparency in data usage</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="UserCheck" size={16} className="text-success" />
                  <span className="text-sm text-text-primary">User control over personal information</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-success/10 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4">
                <Icon name="ShieldCheck" size={48} className="text-success" />
              </div>
              <h4 className="font-semibold text-text-primary mb-2">Verified Secure</h4>
              <p className="text-sm text-muted-foreground">
                Regular security audits and penetration testing ensure your data remains protected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSignalsSection;