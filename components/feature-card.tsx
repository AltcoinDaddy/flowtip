
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  index: number;
}

const FeatureCard = ({ icon: Icon, title, description, color, index }: FeatureCardProps) => {
  return (
    <div 
      className="group relative p-10 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-white/[0.02] to-white/[0.05] border border-white/10 hover:border-emerald-400/30 transition-all duration-700 hover:scale-105 animate-fade-in overflow-hidden"
      style={{ animationDelay: `${index * 0.3}s` }}
    >
      {/* Unique Background Pattern */}
      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full blur-3xl transform -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500 to-lime-500 rounded-full blur-2xl transform translate-x-12 translate-y-12"></div>
      </div>
      
      {/* Animated Border */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-lime-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Icon with unique design */}
        <div className="relative mb-8">
          <div className={`w-20 h-20 bg-gradient-to-br ${color} rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg transform rotate-6 group-hover:rotate-12`}>
            <Icon className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-lime-400 to-emerald-400 rounded-full animate-pulse opacity-80"></div>
        </div>

        {/* Title with unique typography */}
        <h3 className="text-2xl font-black mb-6 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:via-green-400 group-hover:to-lime-400 group-hover:bg-clip-text transition-all duration-500 leading-tight">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-400 leading-relaxed mb-10 group-hover:text-gray-300 transition-colors duration-500 text-lg font-medium">
          {description}
        </p>

        {/* Learn More Button with unique design */}
        <Button 
          variant="ghost" 
          className="text-emerald-400 hover:bg-inherit p-0 h-auto font-bold text-lg relative"
        >
          <span className="relative z-10">Discover More</span>
          <ArrowRight className="ml-3 h-5 w-5  transition-transform duration-300 relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl opacity-0 transition-opacity duration-300 -m-3"></div>
        </Button>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-br from-emerald-400 to-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"></div>
      <div className="absolute bottom-6 left-6 w-2 h-2 bg-gradient-to-br from-lime-400 to-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
    </div>
  );
};

export default FeatureCard;