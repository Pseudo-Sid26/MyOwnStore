import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      image: '/api/placeholder/200/200',
      bio: 'Passionate about creating exceptional shopping experiences with over 10 years in e-commerce.'
    },
    {
      name: 'Michael Chen',
      role: 'Head of Technology',
      image: '/api/placeholder/200/200',
      bio: 'Tech innovator focused on building scalable and user-friendly platforms.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Customer Experience',
      image: '/api/placeholder/200/200',
      bio: 'Dedicated to ensuring every customer has an amazing journey with our brand.'
    },
    {
      name: 'David Kim',
      role: 'Head of Operations',
      image: '/api/placeholder/200/200',
      bio: 'Expert in logistics and supply chain management, ensuring smooth operations.'
    }
  ];

  const values = [
    {
      icon: '🛡️',
      title: 'Quality First',
      description: 'We carefully curate every product to ensure it meets our high standards for quality and durability.'
    },
    {
      icon: '💚',
      title: 'Sustainability',
      description: 'Committed to environmentally responsible practices and supporting sustainable brands.'
    },
    {
      icon: '🤝',
      title: 'Customer Focused',
      description: 'Your satisfaction is our priority. We go above and beyond to exceed your expectations.'
    },
    {
      icon: '🚀',
      title: 'Innovation',
      description: 'Constantly evolving and improving our platform to provide the best shopping experience.'
    },
    {
      icon: '🌍',
      title: 'Global Reach',
      description: 'Serving customers worldwide with fast, reliable shipping and localized support.'
    },
    {
      icon: '💎',
      title: 'Value',
      description: 'Offering competitive prices without compromising on quality or service.'
    }
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'Started with a vision to revolutionize online shopping'
    },
    {
      year: '2021',
      title: '10K Customers',
      description: 'Reached our first major milestone of satisfied customers'
    },
    {
      year: '2022',
      title: 'Global Expansion',
      description: 'Expanded shipping to 50+ countries worldwide'
    },
    {
      year: '2023',
      title: '1M Products',
      description: 'Reached over 1 million products across all categories'
    },
    {
      year: '2024',
      title: 'Award Winner',
      description: 'Recognized as "Best E-commerce Platform" by Industry Awards'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About MyOwnStore
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            We're more than just an online store. We're a community of passionate 
            people dedicated to bringing you the best products at the best prices, 
            with an unmatched shopping experience.
          </p>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg">
              To make quality products accessible to everyone, everywhere, 
              while building a sustainable and customer-centric business that 
              creates value for all stakeholders.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  MyOwnStore was born from a simple frustration: why was it so hard 
                  to find quality products at fair prices online? In 2020, our founder 
                  Sarah Johnson decided to change that.
                </p>
                <p>
                  Starting from a small warehouse in New York, we began with a curated 
                  selection of 100 products. Our commitment to quality, customer service, 
                  and fair pricing quickly gained attention.
                </p>
                <p>
                  Today, we serve over 100,000 customers worldwide, offering more than 
                  1 million products across multiple categories. But our core values 
                  remain the same: quality, integrity, and customer satisfaction above all.
                </p>
                <p>
                  We're not just building a business; we're building a community of 
                  conscious consumers who value quality, sustainability, and exceptional service.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="/api/placeholder/600/400"
                alt="Our warehouse and team"
                className="rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-blue-200"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <Card className="p-6">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </Card>
                  </div>
                  <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-blue-600 border-4 border-white rounded-full shadow-lg">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <Card className="p-8 bg-gradient-to-r from-gray-50 to-blue-50">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">By the Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">1M+</div>
                <div className="text-gray-600">Products</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">100K+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
                <div className="text-gray-600">Countries Served</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">99.9%</div>
                <div className="text-gray-600">Uptime</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sustainability Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="/api/placeholder/600/400"
                alt="Sustainability efforts"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Sustainability Commitment</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We believe business should be a force for good. That's why we're 
                  committed to sustainable practices throughout our operations.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Carbon-neutral shipping options
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Eco-friendly packaging materials
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Partnership with sustainable brands
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Waste reduction initiatives
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Renewable energy in our facilities
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-lg mb-6">
              Be part of something bigger. Shop with purpose, support quality, 
              and help us build a better future together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg">
                Start Shopping
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
                Contact Us
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
