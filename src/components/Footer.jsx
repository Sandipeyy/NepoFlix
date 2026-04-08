import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faInstagram } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="bg-[#090a0a] border-t border-white/10 py-8 px-6 mt-12">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">NepoFlix</h2>
          <p className="text-gray-400 mt-1 text-sm">
            All your entertainment. One platform. Free forever.
          </p>
          <a 
            href="mailto:nepoflix.contact@gmail.com" 
            className="block mt-2 text-gray-400 hover:text-white transition"
          >
            nepoflix.contact@gmail.com
          </a>
        </div>

        <div className="flex space-x-6">
          <a 
            href="https://github.com/Sandipeyy" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="GitHub"
            className="text-gray-400 hover:text-white transition"
          >
            <FontAwesomeIcon icon={faGithub} className="w-6 h-6" />
          </a>
          <a 
            href="https://instagram.com/sandip.gg_" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Instagram"
            className="text-gray-400 hover:text-white transition"
          >
            <FontAwesomeIcon icon={faInstagram} className="w-6 h-6" />
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-6 flex flex-col md:flex-row justify-center items-center text-gray-500 text-xs space-y-2 md:space-y-0 md:space-x-4">        
        <span>© {new Date().getFullYear()} NepoFlix. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
