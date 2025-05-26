
import React from 'react';
import Link from 'next/link';

interface FeatureCardProps {
  title: string;
  description: string;
  tag?: string;
  link?: string;
  linkText?: string;
  icon?: React.ReactNode;
  type?: 'primary' | 'secondary';
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  tag,
  link,
  linkText = 'Learn more',
  icon,
  type = 'primary',
  className,
}) => {
  return (
    <div 
      className={`
        rounded-xl overflow-hidden card-hover
        ${type === 'primary' 
          ? 'bg-blockchain-blue border border-blockchain-light-blue/30' 
          : 'bg-blockchain-dark-blue border border-blockchain-light-blue/10'
        }
        ${className}
      `}
    >
      <div className="p-6">
        {tag && (
          <div className="mb-4">
            <span className="text-xs uppercase tracking-wider font-medium text-blockchain-accent">
              {tag}
            </span>
          </div>
        )}
        
        {icon && <div className="mb-4">{icon}</div>}
        
        <h3 className="text-xl font-semibold text-black/60 mb-3">{title}</h3>
        <p className="text-blockchain-gray mb-6">{description}</p>
        
        {link && (
          <Link 
            href={link} 
            className="text-blockchain-accent hover:text-blockchain-accent-hover inline-flex items-center font-medium"
          >
            {linkText}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
};

export default FeatureCard;