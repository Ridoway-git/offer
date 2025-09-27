"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  HeartIcon,
  StarIcon,
  TrophyIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  description: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    email?: string;
  };
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Ebon Ali",
    role: "Founder & CEO",
    image: "/IMG_20250816_160305.jpg",
    description: "A CSE student at Varendra University, passionate about both programming and creative design. Always eager to learn new things and work collaboratively in a team.",
    socialLinks: {
      linkedin: "#",
      twitter: "#",
      email: "ebon@offerbazar.com"
    }
  },
  {
    id: 2,
    name: "Ahnaf Tahmid",
    role: "Lead Developer",
    image: "/IMG_20250816_160342.jpg",
    description: "A dedicated CSE student at Varendra University. Interested in problem-solving, coding, and exploring new technologies. Brings logical thinking and focus to the team.",
    socialLinks: {
      linkedin: "#",
      github: "#",
      email: "ahnaf@offerbazar.com"
    }
  },
  {
    id: 3,
    name: "Shajib Pramanik",
    role: "Marketing Director",
    image: "/IMG_20250816_160645.jpg",
    description: "A CSE student at Varendra University who enjoys working on web development and software solutions. Actively contributes to planning and execution within the team.",
    socialLinks: {
      linkedin: "#",
      twitter: "#",
      email: "shajib@offerbazar.com"
    }
  }
];

export default function AboutPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-8 transition-colors">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
            <SparklesIcon className="h-5 w-5 mr-3" />
            About Our Team
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              Meet the Team Behind
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Offer Bazar
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We&apos;re a passionate team dedicated to bringing you the best deals, discounts, and exclusive offers from top brands across Bangladesh.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl inline-flex mb-4">
                <HeartIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Our Mission</h3>
              <p className="text-gray-600">
                To help people save money by providing access to the best deals and discounts from trusted brands.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-blue-600 p-4 rounded-2xl inline-flex mb-4">
                <StarIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Our Vision</h3>
              <p className="text-gray-600">
                To become Bangladesh&apos;s leading platform for deals, coupons, and exclusive offers.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-2xl inline-flex mb-4">
                <TrophyIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Our Values</h3>
              <p className="text-gray-600">
                Trust, transparency, and customer satisfaction are at the core of everything we do.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The passionate individuals who work tirelessly to bring you the best deals and shopping experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="group relative bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-700 transform hover:scale-105 border border-gray-200/50 overflow-hidden backdrop-blur-sm"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                {/* Member Image */}
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  
                  {/* Floating Name Badge */}
                  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2 shadow-lg border border-white/20">
                    <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                  </div>
                  
                  {/* Bottom Gradient Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>

                {/* Member Info */}
                <div className="relative p-8 bg-white/80 backdrop-blur-sm">
                  {/* Status Badge */}
                  <div className="flex items-center mb-6">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mr-3"></div>
                    <span className="text-sm font-bold text-green-600 uppercase tracking-wider bg-green-50 px-3 py-1 rounded-full">CSE Student</span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-700 text-base leading-relaxed mb-6 font-medium">{member.description}</p>
                  
                  {/* University Section */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4 border border-green-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Image
                          src="https://i.postimg.cc/zGD1QmVt/Untitled-design-3.png"
                          alt="Varendra University"
                          width={20}
                          height={20}
                          className="mr-3"
                        />
                        <span className="text-sm font-semibold text-gray-700">Varendra University</span>
                      </div>
                      <div className="text-xs text-gray-500 bg-white/70 px-2 py-1 rounded-full">
                        Student
                      </div>
                    </div>
                  </div>
                  

                </div>
              </div>
            ))}
          </div>
        </div>

        
      </div>
    </div>
  );
} 