import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ModernTestimonialsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const autoSlideRef = useRef(null);

  const testimonials = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      role: 'Resident, Sector 15',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      content: 'The pothole near my house was fixed within 3 days of reporting. The real-time updates kept me informed throughout the process. Excellent service!',
      rating: 5,
      location: 'New Delhi'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      role: 'Community Leader, Downtown',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      content: 'As a community leader, I\'ve seen how this platform has transformed our neighborhood. Issues are resolved faster and there\'s complete transparency.',
      rating: 5,
      location: 'Mumbai'
    },
    {
      id: 3,
      name: 'Dr. Amit Patel',
      role: 'Municipal Councillor',
      avatar: 'https://randomuser.me/api/portraits/men/56.jpg',
      content: 'This platform has revolutionized how we handle citizen complaints. The data analytics help us prioritize and allocate resources more effectively.',
      rating: 5,
      location: 'Bangalore'
    },
    {
      id: 4,
      name: 'Sunita Devi',
      role: 'Senior Citizen, Park View',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      content: 'Even at my age, I found the platform very easy to use. The voice feature helps me report issues without typing. Great accessibility!',
      rating: 5,
      location: 'Chennai'
    },
    {
      id: 5,
      name: 'Arjun Singh',
      role: 'Student, University Area',
      avatar: 'https://randomuser.me/api/portraits/men/25.jpg',
      content: 'The mobile app works perfectly. I can quickly report issues on my way to college and track their progress. Very convenient for busy students.',
      rating: 5,
      location: 'Pune'
    }
  ];

  // Intersection Observer for scroll-based animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (isVisible) {
      autoSlideRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % testimonials.length);
      }, 5000); // Change slide every 5 seconds
    }

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [isVisible, testimonials.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    // Reset auto-slide timer
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % testimonials.length);
      }, 5000);
    }
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    // Reset auto-slide timer
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % testimonials.length);
      }, 5000);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    // Reset auto-slide timer
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % testimonials.length);
      }, 5000);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={16}
        className={index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-red-200/20 rounded-full blur-2xl"></div>

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            What Citizens Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real feedback from residents and officials who use our platform daily to make their communities better.
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className={`relative max-w-4xl mx-auto transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-full"></div>
            
            <div className="relative z-10">
              {/* Current Testimonial */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  {renderStars(testimonials[currentSlide].rating)}
                </div>
                
                <blockquote className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 italic">
                  "{testimonials[currentSlide].content}"
                </blockquote>
                
                <div className="flex items-center justify-center space-x-4">
                  <img
                    src={testimonials[currentSlide].avatar}
                    alt={testimonials[currentSlide].name}
                    className="w-16 h-16 rounded-full object-cover shadow-lg"
                  />
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900 text-lg">
                      {testimonials[currentSlide].name}
                    </h4>
                    <p className="text-gray-600 font-medium">
                      {testimonials[currentSlide].role}
                    </p>
                    <p className="text-gray-500 text-sm flex items-center">
                      <Icon name="MapPin" size={12} className="mr-1" />
                      {testimonials[currentSlide].location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevSlide}
                  className="rounded-full w-12 h-12 p-0 hover:scale-110 transition-all duration-300"
                >
                  <Icon name="ChevronLeft" size={20} />
                </Button>

                {/* Dots Indicator */}
                <div className="flex space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? 'bg-blue-600 scale-125'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextSlide}
                  className="rounded-full w-12 h-12 p-0 hover:scale-110 transition-all duration-300"
                >
                  <Icon name="ChevronRight" size={20} />
                </Button>
              </div>
            </div>
          </div>

          {/* Side Testimonials Preview */}
          <div className="hidden lg:block">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg w-64 opacity-60 hover:opacity-100 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={testimonials[(currentSlide - 1 + testimonials.length) % testimonials.length].avatar}
                    alt="Previous testimonial"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {testimonials[(currentSlide - 1 + testimonials.length) % testimonials.length].name}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {testimonials[(currentSlide - 1 + testimonials.length) % testimonials.length].role}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm line-clamp-3">
                  "{testimonials[(currentSlide - 1 + testimonials.length) % testimonials.length].content}"
                </p>
              </div>
            </div>

            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg w-64 opacity-60 hover:opacity-100 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={testimonials[(currentSlide + 1) % testimonials.length].avatar}
                    alt="Next testimonial"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {testimonials[(currentSlide + 1) % testimonials.length].name}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {testimonials[(currentSlide + 1) % testimonials.length].role}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm line-clamp-3">
                  "{testimonials[(currentSlide + 1) % testimonials.length].content}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Metrics */}
        <div className={`mt-16 text-center transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="group">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-gray-600 font-medium">Happy Users</div>
              </div>
            </div>
            <div className="group">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-3xl font-bold text-green-600 mb-2">4.8/5</div>
                <div className="text-gray-600 font-medium">Average Rating</div>
              </div>
            </div>
            <div className="group">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
                <div className="text-gray-600 font-medium">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernTestimonialsSection;