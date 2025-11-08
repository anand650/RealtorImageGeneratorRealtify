import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/Logo'
import { LaunchOfferTimer } from '@/components/ui/countdown-timer'
import { 
  Zap, 
  Image, 
  BarChart3, 
  Shield, 
  Users, 
  Star, 
  Home, 
  Camera, 
  Sparkles, 
  Award, 
  CheckCircle, 
  ArrowRight,
  Play,
  Building2,
  TrendingUp,
  Clock,
  Globe,
  FolderTree,
  ScanLine,
  Gauge,
  LineChart,
  Lock,
  UserCog,
  Gem,
  Layers
} from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import { BeforeAfterComparison } from '@/components/ui/before-after-comparison'

export default async function HomePage() {
  // Check if authentication is disabled for development
  const isAuthDisabled = process.env.DISABLE_AUTH === 'true'
  
  const user = await currentUser()
  const isSignedIn = !isAuthDisabled && !!user
  // In development mode with auth disabled, don't redirect
  return (
    <div className="min-h-screen bg-luxury-gradient">
      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Logo size="lg" />
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="#features" className="text-luxury-600 hover:text-luxury-900 font-medium transition-colors">
                  Features
                </Link>
                <Link href="#pricing" className="text-luxury-600 hover:text-luxury-900 font-medium transition-colors">
                  Pricing
                </Link>
                <Link href="#testimonials" className="text-luxury-600 hover:text-luxury-900 font-medium transition-colors">
                  Testimonials
                </Link>
              </nav>
              <div className="flex items-center space-x-4">
                {isSignedIn ? (
                  <Link href="/dashboard">
                    <Button className="btn-gold">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      className="text-luxury-600 hover:text-luxury-900 font-medium transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link href="/sign-up">
                      <Button className="btn-gold">
                        Start Free Trial
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-luxury-900 via-luxury-800 to-luxury-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-luxury-pattern opacity-20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gold-400/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-burgundy-400/10 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gold-300/10 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Sparkles className="h-5 w-5 text-gold-400 mr-2" />
              <span className="text-white font-semibold">AI-Powered Image Enhancement for Real Estate</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Transform Empty Spaces into
              <span className="block text-gold-400 mt-2">Stunning Interiors</span>
            </h1>
            
            <p className="text-xl text-luxury-200 max-w-4xl mx-auto mb-12 leading-relaxed">
              An AI-powered image enhancement platform designed exclusively for 
              <span className="text-gold-400 font-semibold"> real estate professionals</span>. 
              Turn empty rooms into beautifully furnished, market-ready spaces in under 2 minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <Link href={isSignedIn ? '/dashboard' : '/sign-up'}>
                <Button className="btn-gold text-lg px-12 py-6">
                  {isSignedIn ? 'Go to Dashboard' : 'Start Free Trial'}
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              <button className="flex items-center space-x-3 text-white hover:text-gold-400 transition-colors group">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-gold-400/20 transition-colors">
                  <Play className="h-6 w-6 ml-1" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Watch Demo</p>
                  <p className="text-sm text-luxury-300">See how it works</p>
                </div>
              </button>
            </div>
            
            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-gold-400 mb-2">Fast</div>
                <div className="text-luxury-300">2-minute processing</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gold-400 mb-2">Easy</div>
                <div className="text-luxury-300">Simple upload & enhance</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gold-400 mb-2">Smart</div>
                <div className="text-luxury-300">AI-powered enhancement</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before & After Showcase Section */}
      <section id="showcase" className="py-32 bg-gradient-to-b from-white via-luxury-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gold-100 text-gold-800 font-semibold text-sm mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              See the Transformation
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-luxury-900 mb-6">
              Witness the
              <span className="text-gold-600"> Power of AI Enhancement</span>
            </h2>
            <p className="text-xl text-luxury-600 max-w-3xl mx-auto">
              Real before and after transformations from our platform. Drag the slider to see the incredible difference AI makes to your property images.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 lg:p-10 border border-luxury-200">
              <BeforeAfterComparison
                images={[
                  {
                    before: '/showcase/living_room.jpg',
                    after: '/showcase/living_room_enhanced.png',
                    title: 'Living Room Transformation',
                    description: 'Modern minimalist design with contemporary furniture'
                  },
                  {
                    before: '/showcase/living_room_2.jpg',
                    after: '/showcase/living_room_enhanced_2.png',
                    title: 'Living Room Enhancement',
                    description: 'Elegant styling with warm lighting and premium finishes'
                  },
                  {
                    before: '/showcase/living_room_3.jpg',
                    after: '/showcase/living_room_enhanced3_cozy.png',
                    title: 'Cozy Living Space',
                    description: 'Warm and inviting atmosphere with comfortable furnishings'
                  },
                  {
                    before: '/showcase/property_image.jpg',
                    after: '/showcase/property_image_enhanced_2.png',
                    title: 'Property Enhancement',
                    description: 'Professional staging with enhanced lighting and details'
                  },
                  {
                    before: '/showcase/old_staircase.jpg',
                    after: '/showcase/staircase_enhanced.png',
                    title: 'Staircase Makeover',
                    description: 'Modern design with premium materials and lighting'
                  },
                ]}
              />
            </div>

            {/* Call to Action */}
            <div className="mt-12 text-center">
              <p className="text-lg text-luxury-700 mb-6">
                Transform your property listings with professional AI enhancement
              </p>
              {!isSignedIn ? (
                <Link href="/sign-up">
                  <Button className="btn-gold text-lg px-8 py-6">
                    Start Enhancing Your Images
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/generate">
                  <Button className="btn-gold text-lg px-8 py-6">
                    Create Your First Enhanced Image
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gold-100 text-gold-800 font-semibold text-sm mb-6">
              <Award className="h-4 w-4 mr-2" />
              Industry-Leading Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-luxury-900 mb-6">
              Everything you need to
              <span className="text-gold-600"> enhance your listings</span>
            </h2>
            <p className="text-xl text-luxury-600 max-w-3xl mx-auto">
              Powerful AI technology designed specifically for real estate professionals. 
              Transform your business with cutting-edge image enhancement capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: ScanLine,
                title: 'Smart Room Detection',
                description: 'Advanced AI automatically identifies room types and applies appropriate furniture and styling for maximum appeal.',
                gradient: 'from-blue-500 to-blue-600',
                iconColor: 'text-blue-600',
                bgGradient: 'from-blue-50 to-blue-100',
              },
              {
                icon: Gauge,
                title: 'Lightning Fast Processing',
                description: 'Generate stunning enhanced images in under 2 minutes with our optimized AI pipeline and cloud infrastructure.',
                gradient: 'from-yellow-500 to-orange-500',
                iconColor: 'text-orange-500',
                bgGradient: 'from-yellow-50 to-orange-100',
              },
              {
                icon: LineChart,
                title: 'Advanced Analytics',
                description: 'Track your image generation usage, performance metrics, and optimize your workflow with detailed insights.',
                gradient: 'from-green-500 to-emerald-600',
                iconColor: 'text-emerald-600',
                bgGradient: 'from-green-50 to-emerald-100',
              },
              {
                icon: Lock,
                title: 'Enterprise Security',
                description: 'Bank-level encryption and security. Your images are completely private and never shared with third parties.',
                gradient: 'from-purple-500 to-purple-600',
                iconColor: 'text-purple-600',
                bgGradient: 'from-purple-50 to-purple-100',
              },
              {
                icon: UserCog,
                title: 'Team Collaboration',
                description: 'Share images with your team, collaborate on projects, and manage permissions with role-based access control.',
                gradient: 'from-pink-500 to-rose-600',
                iconColor: 'text-rose-600',
                bgGradient: 'from-pink-50 to-rose-100',
              },
              {
                icon: Gem,
                title: 'Premium Quality',
                description: 'Professional-grade image enhancement that maintains architectural integrity while maximizing visual appeal.',
                gradient: 'from-amber-500 to-gold-600',
                iconColor: 'text-gold-600',
                bgGradient: 'from-amber-50 to-gold-100',
              },
              {
                icon: Layers,
                title: 'Advanced File Organization',
                description: 'Store and organize all your images directly on the platform. Create custom folders for each customer or property, share and download images with ease. Track every photo using our built-in file management system.',
                gradient: 'from-indigo-500 to-indigo-600',
                iconColor: 'text-indigo-600',
                bgGradient: 'from-indigo-50 to-indigo-100',
              },
            ].map((feature, index) => (
              <div key={index} className="group card-luxury-gradient p-8 hover:shadow-2xl transition-all duration-500">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.bgGradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className={`h-8 w-8 ${feature.iconColor} drop-shadow-sm`} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-luxury-900 mb-4 group-hover:text-gold-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-luxury-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-6 flex items-center text-gold-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-gradient-to-br from-luxury-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Limited Time Offer Banner */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative overflow-hidden bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-2xl p-6 shadow-2xl">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-white animate-pulse" />
                    <span className="text-white font-bold text-lg md:text-xl">Limited Time Launch Offer</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    50% OFF for Lifetime
                  </h3>
                  <p className="text-red-100 text-sm md:text-base mb-3">
                    Subscribe within the countdown to lock in your 50% discount for lifetime!
                  </p>
                  <div className="flex items-center justify-center md:justify-start">
                    <LaunchOfferTimer />
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 text-center border-2 border-white/30">
                    <div className="text-white text-sm font-semibold mb-1">Special Launch Price</div>
                    <div className="text-3xl font-bold text-white">50% OFF</div>
                    <div className="text-white text-xs mt-2 opacity-90">Lifetime Discount</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gold-100 text-gold-800 font-semibold text-sm mb-6">
              <Star className="h-4 w-4 mr-2" />
              Flexible Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-luxury-900 mb-6">
              Choose your perfect
              <span className="text-gold-600"> plan</span>
            </h2>
            <p className="text-xl text-luxury-600 max-w-3xl mx-auto">
              Transparent pricing designed for real estate professionals of all sizes. 
              Start with our free trial and scale as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                subtitle: 'Perfect for individual agents',
                price: '$25',
                originalPrice: '$50',
                tokens: '50 images/month',
                features: [
                  '50 AI-enhanced images per month',
                  'Basic room types and styles',
                  'Standard image quality',
                  'Email support',
                  'Image history and downloads',
                ],
                popular: false,
                gradient: 'from-luxury-100 to-luxury-200',
                buttonStyle: 'bg-luxury-800 hover:bg-luxury-900 text-white',
              },
              {
                name: 'Professional',
                subtitle: 'Most popular for teams',
                price: '$50',
                originalPrice: '$100',
                tokens: '125 images/month',
                features: [
                  '125 AI-enhanced images per month',
                  'All room types and styles',
                  'High-quality image generation',
                  'Priority email support',
                  'Advanced image organization',
                  'Bulk image processing',
                ],
                popular: true,
                gradient: 'from-gold-100 to-gold-200',
                buttonStyle: 'btn-gold',
              },
              {
                name: 'Business',
                subtitle: 'For real estate teams and agencies',
                price: '$100',
                originalPrice: '$200',
                tokens: '300 images/month',
                features: [
                  '300 AI-enhanced images per month',
                  'All room types and styles',
                  'Ultra-high quality generation',
                  'Team collaboration tools',
                  'Priority email support',
                  'Advanced analytics dashboard',
                  'Bulk image processing',
                ],
                popular: false,
                gradient: 'from-burgundy-100 to-burgundy-200',
                buttonStyle: 'bg-burgundy-600 hover:bg-burgundy-700 text-white',
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`relative card-luxury-gradient overflow-visible p-8 ${
                  plan.popular
                    ? 'ring-2 ring-gold-400 scale-105 shadow-2xl'
                    : 'hover:scale-105'
                } transition-all duration-300`}
              >
                {/* Badge - 50% OFF for all plans - positioned inside card */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      50% OFF
                    </span>
                  </div>
                </div>

                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-gold-400 to-gold-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-luxury-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-luxury-600 mb-6">{plan.subtitle}</p>
                  
                  <div className="mb-4">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-2xl text-luxury-400 line-through">
                          {plan.originalPrice}
                        </span>
                        <span className="text-5xl font-bold text-luxury-900">
                          {plan.price}
                        </span>
                      </div>
                      <span className="text-xl text-luxury-600">/month</span>
                    </div>
                  </div>
                  
                  <p className="text-luxury-600 font-semibold">{plan.tokens}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-luxury-600">{feature}</p>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <Link href="/sign-up">
                    <Button className={`w-full ${plan.buttonStyle} py-4 text-lg font-semibold`}>
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <p className="text-center text-sm text-luxury-500 mt-4">
                    4 free credits to start • No credit card required
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Enterprise CTA */}
          <div className="mt-16 text-center">
            <div className="card-luxury-gradient p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-luxury-900 mb-4">
                Need a custom solution?
              </h3>
              <p className="text-luxury-600 mb-6">
                Contact our sales team for enterprise pricing and custom features tailored to your agency's needs.
              </p>
              <Button className="btn-luxury">
                Contact Sales
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-luxury-900 to-luxury-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="mb-6">
                <Logo size="lg" />
              </div>
              <p className="text-luxury-300 mb-8 max-w-md leading-relaxed">
                The world's most advanced AI-powered image enhancement platform designed exclusively for real estate professionals. Transform your listings and accelerate your sales.
              </p>
              <div className="flex space-x-4">
                <button className="w-10 h-10 rounded-full bg-luxury-800 hover:bg-gold-500 transition-colors flex items-center justify-center">
                  <Globe className="h-5 w-5 text-luxury-300" />
                </button>
                <button className="w-10 h-10 rounded-full bg-luxury-800 hover:bg-gold-500 transition-colors flex items-center justify-center">
                  <Users className="h-5 w-5 text-luxury-300" />
                </button>
                <button className="w-10 h-10 rounded-full bg-luxury-800 hover:bg-gold-500 transition-colors flex items-center justify-center">
                  <Star className="h-5 w-5 text-luxury-300" />
                </button>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Product</h3>
              <ul className="space-y-4">
                <li><Link href="#features" className="text-luxury-300 hover:text-gold-400 transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="text-luxury-300 hover:text-gold-400 transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="text-luxury-300 hover:text-gold-400 transition-colors">Demo</Link></li>
                <li><Link href="/api" className="text-luxury-300 hover:text-gold-400 transition-colors">API</Link></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Support</h3>
              <ul className="space-y-4">
                <li><Link href="/help" className="text-luxury-300 hover:text-gold-400 transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="text-luxury-300 hover:text-gold-400 transition-colors">Contact Us</Link></li>
                <li><Link href="/status" className="text-luxury-300 hover:text-gold-400 transition-colors">Status</Link></li>
                <li><Link href="/security" className="text-luxury-300 hover:text-gold-400 transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-luxury-700 mt-16 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-luxury-400 text-sm">
                © {new Date().getFullYear()} Realtify. All rights reserved. Built for real estate professionals.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-luxury-400 hover:text-gold-400 text-sm transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-luxury-400 hover:text-gold-400 text-sm transition-colors">Terms of Service</Link>
                <Link href="/refund" className="text-luxury-400 hover:text-gold-400 text-sm transition-colors">Refund Policy</Link>
                <Link href="/cookies" className="text-luxury-400 hover:text-gold-400 text-sm transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}