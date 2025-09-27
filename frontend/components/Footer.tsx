"use client";

import Link from 'next/link';
import { 
  MagnifyingGlassIcon,
  TagIcon,
  UserIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowUpIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-indigo-600/15 via-cyan-600/15 to-blue-600/15 animate-pulse" style={{animationDelay: '1s', animationDuration: '3s'}}></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.3%22%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2240%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>
      
      {/* Glowing Orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1.5s'}}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center group mb-6">
              <div className="relative">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl mr-4 shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <MagnifyingGlassIcon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Offer Bazar
                </span>
                <span className="text-sm text-gray-300 font-medium">Find the best offers</span>
              </div>
            </div>
            <p className="text-gray-300 text-base mb-6 leading-relaxed">
              Your ultimate destination for the best deals, discounts, and exclusive offers from top brands across Bangladesh.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-purple-500/25">
                <GlobeAltIcon className="h-5 w-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-pink-500/25">
                <EnvelopeIcon className="h-5 w-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-gradient-to-r from-pink-600 to-red-600 rounded-xl flex items-center justify-center hover:from-pink-700 hover:to-red-700 transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-red-500/25">
                <PhoneIcon className="h-5 w-5 text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                <TagIcon className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white">Quick Links</h4>
            </div>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-blue-400 transition-all duration-300 text-base font-medium hover:translate-x-2 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/stores" className="text-gray-300 hover:text-blue-400 transition-all duration-300 text-base font-medium hover:translate-x-2 inline-block">
                  All Stores
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-blue-400 transition-all duration-300 text-base font-medium hover:translate-x-2 inline-block">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/offers" className="text-gray-300 hover:text-blue-400 transition-all duration-300 text-base font-medium hover:translate-x-2 inline-block">
                  All Offers
                </Link>
              </li>

            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                <ShieldCheckIcon className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white">Support</h4>
            </div>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-purple-400 transition-all duration-300 text-base font-medium hover:translate-x-2 inline-block">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-purple-400 transition-all duration-300 text-base font-medium hover:translate-x-2 inline-block">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-purple-400 transition-all duration-300 text-base font-medium hover:translate-x-2 inline-block">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-purple-400 transition-all duration-300 text-base font-medium hover:translate-x-2 inline-block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-purple-400 transition-all duration-300 text-base font-medium hover:translate-x-2 inline-block">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                <EnvelopeIcon className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white">Contact Info</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center text-gray-300 text-base group">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                  <EnvelopeIcon className="h-5 w-5 text-white" />
                </div>
                <span className="group-hover:text-blue-400 transition-colors duration-300">contact@offerbazar.com</span>
              </div>
              <div className="flex items-center text-gray-300 text-base group">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                  <PhoneIcon className="h-5 w-5 text-white" />
                </div>
                <span className="group-hover:text-green-400 transition-colors duration-300">+8801752882610</span>
              </div>
              <div className="flex items-center text-gray-300 text-base group">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                  <MapPinIcon className="h-5 w-5 text-white" />
                </div>
                <span className="group-hover:text-purple-400 transition-colors duration-300">Rajshahi, Bangladesh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl p-8 mb-12 border border-blue-500/20">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-6">Get the latest offers and deals delivered to your inbox</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center text-gray-400 text-sm mb-4 md:mb-0">
              <span>© {currentYear} Offer Bazar. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-gray-400 text-sm">
                <span>Made with</span>
                <HeartIcon className="h-4 w-4 text-red-400 mx-1 animate-pulse" />
                <span>in Bangladesh</span>
              </div>
              <button
                onClick={scrollToTop}
                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-purple-500/25"
              >
                <ArrowUpIcon className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 