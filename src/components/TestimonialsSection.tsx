// src/components/TestimonialsSection.tsx
import React from 'react';
import { FaQuoteLeft } from 'react-icons/fa';

interface Testimonial { quote: string; author: string; role: string; avatarUrl?: string; }
const testimonials: Testimonial[] = [
  // seus depoimentos originais
  { 
    quote: '“Depois que comecei a usar o VOXStrategies, minhas apostas se tornaram muito mais estratégicas.”',
    author: 'João Silva',
    role: 'Apostador',
    avatarUrl: 'https://i.pravatar.cc/64?img=33',
  },
  // ...
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="w-full bg-gray-50 py-16 md:py-24 lg:py-32">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            O que nossos usuários estão dizendo
          </h2>
          <p className="mt-4 max-w-2xl text-gray-600 text-base sm:text-lg md:text-xl">
            Depoimentos reais de apostadores que usam nossa plataforma.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <div key={idx} className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-4 left-4 text-gray-200 text-4xl">
                <FaQuoteLeft />
              </div>
              <div className="mt-6">
                <p className="text-gray-800 italic leading-relaxed">{item.quote}</p>
              </div>
              <div className="mt-6 flex items-center">
                {item.avatarUrl && (
                  <img src={item.avatarUrl} alt={`Avatar de ${item.author}`} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                )}
                <div className="ml-4">
                  <p className="text-gray-900 font-semibold">{item.author}</p>
                  <p className="text-gray-500 text-sm">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
